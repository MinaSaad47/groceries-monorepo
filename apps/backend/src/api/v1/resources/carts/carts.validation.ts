import { cartsToItems } from "../../db/schema";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const SelectCartSchema = z.object({ cartId: z.string().uuid() });
export type SelectCart = z.infer<typeof SelectCartSchema>;

const CartToItemSchema = createInsertSchema(cartsToItems, {
  cartId: (schema) => schema.cartId.uuid(),
  itemId: (schema) => schema.itemId.uuid(),
  qty: (_) => z.number().min(0),
});

export const CreateCartToItemSchema = CartToItemSchema.omit({
  cartId: true,
});
export type CreateCartToItem = z.infer<typeof CreateCartToItemSchema>;

export const SelectCartToItemSchema = CartToItemSchema.omit({
  qty: true,
});
export type SelectCartToItem = z.infer<typeof SelectCartToItemSchema>;

export const UpdateCartToItemSchema = CartToItemSchema.omit({
  itemId: true,
  cartId: true,
});

export type UpdateCartToItem = z.infer<typeof UpdateCartToItemSchema>;
