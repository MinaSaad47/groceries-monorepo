import { faker } from "@faker-js/faker";
import { z } from "zod";

export const CreateCartToItemSchema = z
  .object({
    itemId: z.string().uuid(),
    qty: z.number().min(0),
    operator: z.enum(["+", "-"]).optional(),
  })
  .openapi("CreateCartToItemSchema", {
    example: {
      itemId: faker.string.uuid(),
      qty: 1,
      operator: "+",
    },
  });

export type CreateCartToItem = z.infer<typeof CreateCartToItemSchema>;
