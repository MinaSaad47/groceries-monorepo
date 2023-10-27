import { faker } from "@faker-js/faker";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { categories } from "../../db/schema";

export const CreateCategorySchema = createInsertSchema(categories)
  .omit({
    id: true,
    image: true,
  })
  .extend({ name: z.string() })
  .openapi("CreateCategoryShema", {
    default: { name: faker.commerce.department() },
  });
export type CreateCategory = z.infer<typeof CreateCategorySchema>;

export const UpdateCategorySchema = z
  .object({
    details: z.array(
      z.object({
        lang: z.enum(["en", "ar"]),
        name: z.string().optional(),
      })
    ).optional(),
  })
  .openapi("UpdateCategory", {
    default: {
      details: [
        {
          lang: "ar",
          name: "اسم",
        },
      ],
    },
  });
export type UpdateCategory = z.infer<typeof UpdateCategorySchema>;

export const SelectCategorySchema = z
  .object({ categoryId: z.string().uuid() })
  .openapi("SelectCategorySchema", {
    default: { categoryId: faker.string.uuid() },
  });
export type SelectCategory = z.infer<typeof SelectCategorySchema>;
