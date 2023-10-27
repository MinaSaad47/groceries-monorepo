import jwt from "jsonwebtoken";
import { User } from "../db/schema";



const expiresIn = 60 * 60 * 24 * 7;

export const signJwt = (user: User) => {
  const token = jwt.sign(
    {
      id: user.id,
    },
    process.env.JWT_SECRET,
    { expiresIn }
  );
  return { token, expirationDate: Date.now() + expiresIn * 1000 };
};

export const verifyJwt = (
  token: string
): { id: string; iat: number; exp: number } | undefined => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded as any;
  } catch {}
};
