import jwt from "jsonwebtoken";
import { User } from "../db/schema";

const isProduction = process.env.NODE_ENV === "production";

const secretOrKey = isProduction
  ? process.env.JWT_SECRET_PROD
  : process.env.JWT_SECRET_DEV;

const expiresIn = 60 * 60 * 24 * 7;

export const signJwt = (user: User) => {
  const token = jwt.sign(
    {
      id: user.id,
    },
    secretOrKey!,
    { expiresIn }
  );
  return { token, expirationDate: Date.now() + expiresIn * 1000 };
};

export const verifyJwt = (
  token: string
): { id: string; iat: number; exp: number } | undefined => {
  try {
    const decoded = jwt.verify(token, secretOrKey!);
    return decoded as any;
  } catch {}
};
