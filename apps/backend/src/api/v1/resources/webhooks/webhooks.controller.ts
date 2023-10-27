import { eq } from "drizzle-orm";
import express, { Request, Response, Router } from "express";
import StripeClass from "stripe";
import { db } from "../../db";
import { items, orders } from "../../db/schema";
import Stripe from "../../stripe";
import Controller from "../../utils/interfaces/controller.interface";

export class WebhooksControoler implements Controller {
  public path: string;
  public router: Router;

  constructor(path: string) {
    this.path = path;
    this.router = Router();

    this.initializeRoutes();
  }

  private initializeRoutes = () => {
    this.router.post(
      "/stripe",
      express.raw({ type: "application/json" }),
      this.stripe
    );
  };

  private stripe = async (req: Request, res: Response) => {
    let event: StripeClass.Event;

    try {
      const sig = req.headers["stripe-signature"];
      event = Stripe.instant.webhooks.constructEvent(
        req.body,
        sig as any,
        process.env.STRIPE_WEBHOOK_SECRET as string
      );
    } catch (err: any) {
      console.log(err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    const type = event.type;
    if (
      type !== "payment_intent.succeeded" &&
      type !== "payment_intent.canceled"
    ) {
      return res.send();
    }

    const orderId = (event.data.object as StripeClass.PaymentIntent).metadata
      ?.order_id;
    if (!orderId) {
      return res.send();
    }

    const order = await db.query.orders.findFirst({
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

    if (type === "payment_intent.succeeded") {
      await db
        .update(orders)
        .set({ status: "success" })
        .where(eq(orders.id, orderId));
      return res.send();
    }

    await db.transaction(async (tx) => {
      if (order?.status !== "canceled") {
        await tx
          .update(orders)
          .set({ status: "canceled" })
          .where(eq(orders.id, orderId));
      }

      order?.items.forEach(async ({ item, qty }) => {
        await tx
          .update(items)
          .set({ qty: qty + item.qty })
          .where(eq(items.id, item.id));
      });
    });

    return res.send();
  };
}
