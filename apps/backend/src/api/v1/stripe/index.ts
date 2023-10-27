import StripeClass from "stripe";

abstract class Stripe {
  private static _instant: StripeClass;

  public static get instant() {
    if (!Stripe._instant) {
      Stripe._instant = new StripeClass(
        process.env.STRIPE_SECRET_KEY as string,
        {
          apiVersion: "2023-08-16",
        }
      );
    }
    return Stripe._instant;
  }
}

export default Stripe;
