import { BaseError } from "./base.error";

export class NotFoundError extends BaseError {
  name: string = "NotFoundError";

  constructor(
    resource:
      | "users"
      | "items"
      | "carts"
      | "profiles"
      | "reviews"
      | "orders"
      | "categories"
      | "carts_to_items"
      | "addresses",
    id?: string
  ) {
    super(404, `no such ${resource} with id ${id} found`, {
      key: resource,
      args: { id },
    });

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
