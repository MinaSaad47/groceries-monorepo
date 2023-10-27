import { eq } from "drizzle-orm";
import { Database } from "../../db";
import { orders } from "../../db/schema";
import Stripe from "../../stripe";
import { AuthorizationError } from "../../utils/errors/auth.error";
import { NotFoundError } from "../../utils/errors/notfound.error";
import { OrderNotPending } from "./orders.errors";

export class OrdersService {
  public db: Database;
  constructor(db: Database) {
    this.db = db;
  }

  public getAll = async (userId: string) => {
    return await this.db.query.orders.findMany({
      where: eq(orders.userId, userId),
    });
  };

  public getOne = async (userId: string, orderId: string) => {
    const order = await this.db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        items: {
          columns: { itemId: false, orderId: false },
          with: {
            item: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundError("orders", orderId);
    }

    if (order.userId !== userId) {
      throw new AuthorizationError("order", userId, orderId);
    }

    return order;
  };

  public checkout = async (userId: string, orderId: string) => {
    const order = await this.db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        items: {
          columns: { itemId: false, orderId: false },
          with: {
            item: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundError("orders", orderId);
    }

    if (order.userId !== userId) {
      throw new AuthorizationError("order", userId, orderId);
    }

    if (order.status !== "pending") {
      throw new OrderNotPending(orderId);
    }

    const paymentIntent = await Stripe.instant.paymentIntents
      .search({
        query: `metadata[\"order_id\"]:\"${orderId}\"`,
      })
      .then((result) => result.data[0]);

    return {
      cs: paymentIntent.client_secret,
      pk: process.env.STRIPE_PUBLISHABLE_KEY,
      order,
    };
  };

  cancel = async (userId: string, orderId: string) => {
    return this.db.transaction(async (tx) => {
      const order = await tx.query.orders.findFirst({
        where: eq(orders.id, orderId),
      });

      if (!order) {
        throw new NotFoundError("orders", orderId);
      }

      if (order.userId !== userId && userId !== "admin") {
        throw new AuthorizationError("order", userId, orderId);
      }

      if (order.status === "canceled") {
        return order;
      }

      const [canceledOrder] = await tx
        .update(orders)
        .set({ status: "canceled" })
        .where(eq(orders.id, orderId))
        .returning();

      try {
        const paymentIntent = await Stripe.instant.paymentIntents
          .search({
            query: `metadata[\"order_id\"]:\"${orderId}\"`,
          })
          .then((result) => result.data[0]);

        await Stripe.instant.paymentIntents.cancel(paymentIntent.id);
      } catch {}

      return canceledOrder;
    });
  };
}
