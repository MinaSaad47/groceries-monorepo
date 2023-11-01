import { BaseError } from "./base.error";

export class AuthorizationError extends BaseError {
  name: string = "AuthorizationError";

  constructor(resource: "carts" | "items" | "orders", userId: string, resourceId: string) {
    super(
      401,
      `${resource}(${resourceId}) can't be accessed by user(${userId})`,
      { key: resource, args: { userId, resourceId } }
    );

    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

export class JwtExpiredError extends BaseError {
  name: string = "JwtExpiredError";
  constructor() {
    super(401, "token expired", { key: "token.expired" });

    Object.setPrototypeOf(this, JwtExpiredError.prototype);
  }
}
