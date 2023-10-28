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
    super(422, `can't checkout empty cart`, { key: "carts.empty" });
    Object.setPrototypeOf(this, EmptyCartError.prototype);
  }
}

export class NoDefaultAddressSetError extends BaseError {
  constructor() {
    super(422, `can't make and order without a default address`, {
      key: "orders.no-default-address",
    });
    Object.setPrototypeOf(this, NoDefaultAddressSetError.prototype);
  }
}
