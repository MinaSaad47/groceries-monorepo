import dotenv from "dotenv";
import { z } from "zod";
dotenv.config();

// PORT=
// DATABASE_URL=
// GOOGLE_CLIENT_ID=
// GOOGLE_CLIENT_SECRET=
// JWT_SECRET_DEV=
// STRIPE_SECRET_KEY=
// STRIPE_PUBLISHABLE_KEY=
// STRIPE_WEBHOOK_SECRET=
// CLOUDINARY_API_KEY=
// CLOUDINARY_API_SECRET=
// CLOUDINARY_CLOUD_NAME=
const EnvSchema = z.object({
  PORT: z.string().default("3000"),
  DATABASE_URL: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  JWT_SECRET_DEV: z.string(),
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_PUBLISHABLE_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  CLOUDINARY_CLOUD_NAME: z.string(),
});

const env = EnvSchema.parse(process.env);

console.log(env);

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof EnvSchema> {}
  }
}
