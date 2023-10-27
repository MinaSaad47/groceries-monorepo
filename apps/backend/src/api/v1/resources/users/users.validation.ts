import { faker } from "@faker-js/faker";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "../../db/schema";

export const SelectUserSchema = z
  .object({ userId: z.string().uuid() })
  .openapi("SelectUserSchema", { default: { userId: faker.string.uuid() } });
export type SelectUser = z.infer<typeof SelectUserSchema>;

export const CreateUserSchema = createInsertSchema(users, {
  email: (schema) => schema.email.email(),
  role: (schema) => schema.role.default("user"),
})
  .omit({ id: true, profilePicture: true })
  .openapi("CreateUserSchema", {
    default: {
      email: faker.internet.email(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      phoneNumber: faker.phone.number(),
      role: "user",
      dayOfBirth: faker.date.birthdate().toISOString(),
    },
  });
export type CreateUser = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = CreateUserSchema.partial().openapi(
  "UpdateUserSchema",
  { default: { email: faker.internet.email() } }
);
export type UpdateUser = z.infer<typeof UpdateUserSchema>;
