import { BaseError } from "../../utils/errors/base.error";

export class ItemAvailabilityError extends BaseError {
  constructor(requestdQty: number, stockQty: number) {
    super(
      422,
      `the requested quantiy '${requestdQty}' exceeds the stock quantity '${stockQty}'`,
      {
        key: "items.availability",
        args: { quantity: requestdQty, stock: stockQty },
      }
    );

    Object.setPrototypeOf(this, ItemAvailabilityError.prototype);
  }
}

export class EmptyCartError extends BaseError {
  constructor() {
    super(422, `can't checkout empty cart`, { key: "carts.emty" });
    Object.setPrototypeOf(this, EmptyCartError.prototype);
  }
}
