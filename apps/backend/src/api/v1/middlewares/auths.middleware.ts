import { eq } from "drizzle-orm";
import { NextFunction, Request, Response } from "express";
import { db } from "../db";
import { UserRole, users } from "../db/schema";
import { verifyJwt } from "../utils/auth.utils";
import log from "../utils/logger";

export const authorizeRoles =
  (...roles: UserRole[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user!;
    if (!roles.includes(user.role || "user")) {
      return res.fail({
        code: 401,
        i18n: { key: "authorization.role", args: { role: user.role } },
      });
    }
    return next();
  };

export const requireJwt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split("Bearer ")[1];

  if (!token) {
    return res.fail({
      code: 401,
      i18n: { key: "authorization.token" },
    });
  }

  const claims = verifyJwt(token);

  if (!claims) {
    return res.fail({
      code: 401,
      i18n: { key: "authorization.token" },
    });
  }

  log.debug(`authorizing user with id:`);
  log.debug(claims.id);

  const user = await db.query.users.findFirst({
    where: eq(users.id, claims.id),
  });

  if (!user) {
    return res.fail({
      code: 401,
      i18n: { key: "authorization.user" },
    });
  }

  req.user = user;

  return next();
};
