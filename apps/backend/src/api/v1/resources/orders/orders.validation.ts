import { z } from "zod";

export const OrdersParamsSchema = z.object({
  orderId: z.string(),
});
export type OrdersParams = z.infer<typeof OrdersParamsSchema>;
