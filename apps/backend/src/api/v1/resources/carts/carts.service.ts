import { and, eq } from "drizzle-orm";
import { Database } from "../../db";
import {
  carts,
  cartsToItems,
  items,
  itemsTrans,
  orders,
  ordersToItems,
} from "../../db/schema";
import Stripe from "../../stripe";
import { NotFoundError } from "../../utils/errors/notfound.error";
import { QueryLang } from "../items/items.validation";
import { EmptyCartError, ItemAvailabilityError } from "./carts.errors";

export class CartsService {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  public async getOne(userId: string, queryLang: QueryLang) {
    return await this.db.transaction(async (tx) => {
      let exists = await tx.query.carts.findFirst({
        where: eq(carts.id, userId),
        columns: { id: true },
      });

      if (!exists) {
        await tx.insert(carts).values({ id: userId });
      }

      const cart = await tx.query.carts.findFirst({
        where: eq(carts.id, userId),
        with: {
          items: {
            columns: { cartId: false, itemId: false },
            with: {
              item: {
                with: {
                  details: { where: eq(itemsTrans.lang, queryLang.lang) },
                },
              },
            },
          },
        },
      });

      return {
        ...cart,
        items: cart?.items.map((item) => ({
          ...item,
          item: {
            ...item.item,
            name: item.item.details?.[0]?.name,
            description: item.item.details?.[0]?.description,
            details: undefined,
          },
        })),
      };
    });
  }

  public async addOrUpdateItem(userId: string, itemId: string, qty: number) {
    return this.db.transaction(async (tx) => {
      let exists = await tx.query.carts.findFirst({
        where: eq(carts.id, userId),
        columns: { id: true },
      });
      if (!exists) {
        await tx.insert(carts).values({ id: userId });
      }

      const item = await tx.query.items.findFirst({
        where: eq(items.id, itemId),
      });

      if (!item) {
        throw new NotFoundError("items", itemId);
      }

      if (qty === 0) {
        const [cartItem] = await tx
          .delete(cartsToItems)
          .where(
            and(
              eq(cartsToItems.cartId, userId),
              eq(cartsToItems.itemId, itemId)
            )
          )
          .returning();
        if (!cartItem) {
          throw new NotFoundError("carts_to_items");
        }
        return cartItem;
      }

      const [cartItem] = await tx
        .insert(cartsToItems)
        .values({ cartId: userId, itemId, qty })
        .onConflictDoUpdate({
          set: { qty },
          target: [cartsToItems.cartId, cartsToItems.itemId],
        })
        .returning();
      if (!cartItem) {
        throw new NotFoundError("carts_to_items");
      }
      return cartItem;
    });
  }

  public async checkout(userId: string) {
    return await this.db.transaction(async (tx) => {
      let exists = await tx.query.carts.findFirst({
        where: eq(carts.id, userId),
        columns: { id: true },
      });
      if (!exists) {
        await tx.insert(carts).values({ id: userId });
      }

      const cart = await tx.query.carts
        .findFirst({
          where: eq(carts.id, userId),
          with: {
            items: {
              columns: { cartId: false, itemId: false },
              with: {
                item: true,
              },
            },
          },
        })
        .then((cart) => cart!);

      if (cart.items.length === 0) {
        throw new EmptyCartError();
      }

      let amount = 0;

      cart.items.map(async ({ qty, item: cartItem }) => {
        const item = await tx.query.items.findFirst({
          where: eq(items.id, cartItem.id),
        });

        if (!item) {
          throw new NotFoundError("items", cartItem.id);
        }

        if (item.qty < qty) {
          throw new ItemAvailabilityError(qty, item.qty);
        }

        await tx
          .update(items)
          .set({ qty: item.qty - qty })
          .where(eq(items.id, item.id));

        amount += qty * item.price;
      });

      const [insertedOrder] = await tx
        .insert(orders)
        .values({ userId })
        .returning();

      const orderItemsValues = cart.items.map(({ item, qty }) => ({
        orderId: insertedOrder.id,
        itemId: item.id,
        qty,
      }));

      await tx.insert(ordersToItems).values(orderItemsValues);

      const order = await tx.query.orders.findFirst({
        where: eq(orders.id, insertedOrder.id),
        columns: { userId: false },
        with: {
          items: {
            columns: { orderId: false, itemId: false },
            with: { item: true },
          },
        },
      });

      const paymentIntent = await Stripe.instant.paymentIntents.create({
        amount: amount * 100,
        currency: "usd",
        payment_method_types: ["card"],
        metadata: {
          order_id: order?.id!,
        },
      });

      return {
        order,
        cs: paymentIntent.client_secret,
        pk: process.env.STRIPE_PUBLISHABLE_KEY,
      };
    });
  }

  public async empty(userId: string) {
    return this.db.transaction(async (tx) => {
      const exists = await tx.query.carts.findFirst({
        where: eq(carts.id, userId),
      });
      if (!exists) {
        await tx.insert(carts).values({ id: userId });
      }

      await tx.delete(cartsToItems).where(eq(cartsToItems.cartId, userId));

      return tx.query.carts.findFirst({
        where: eq(carts.id, userId),
        with: {
          items: {
            columns: { cartId: false, itemId: false },
            with: {
              item: true,
            },
          },
        },
      });
    });
  }
}
