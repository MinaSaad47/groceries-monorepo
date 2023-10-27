import { BaseError } from "../../utils/errors/base.error";

export class OrderNotPending extends BaseError {
  name: string = "OrderNotPending";

  constructor(orderId: string) {
    super(400, "can't checkout non pending order", {
      key: "orders.checkout.not-pending",
      args: { orderId },
    });

    Object.setPrototypeOf(this, OrderNotPending.prototype);
  }
}
