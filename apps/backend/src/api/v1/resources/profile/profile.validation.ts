import { faker } from "@faker-js/faker";
import { addresses } from "../../db/schema";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const CreateProfileFavoriteSchema = z
  .object({ itemId: z.string().uuid() })
  .openapi("CreateProfileFavoriteSchema", {
    default: { itemId: faker.string.uuid() },
  });
export type CreateProfileFavorite = z.infer<typeof CreateProfileFavoriteSchema>;

export const SelectProfileFavoriteSchema = z
  .object({ itemId: z.string().uuid() })
  .openapi("SelectProfileFavoriteSchema", {
    default: { itemId: faker.string.uuid() },
  });
export type SelectProfileFavorite = z.infer<typeof SelectProfileFavoriteSchema>;

export const CreateAddressSchema = createSelectSchema(addresses, {
  lat: ({ lat }) => lat.min(-85).max(+85),
  lng: ({ lng }) => lng.min(-180).max(+180),
})
  .omit({ id: true, userId: true, isDefault: true })
  .openapi("CreateAddress", {
    default: {
      lat: 32,
      lng: 32,
      apartmentNumber: "4a",
      floorNumber: "1b",
      buildingNumber: "c4",
    },
  });

export type CreateAddress = z.infer<typeof CreateAddressSchema>;

export const SelectAddressSchema = z
  .object({ addressId: z.string().uuid() })
  .openapi("SelectAddress");
export type SelectAddress = z.infer<typeof SelectAddressSchema>;

export const UpdateAddressSchema = createSelectSchema(addresses, {
  lat: ({ lat }) => lat.min(-85).max(+85),
  lng: ({ lng }) => lng.min(-180).max(+180),
})
  .omit({ id: true, userId: true })
  .openapi("CreateAddress", {
    default: {
      lat: 32,
      lng: 32,
      apartmentNumber: "4a",
      floorNumber: "1b",
      buildingNumber: "c4",
      isDefault: true,
    },
  })
  .partial();

export type UpdateAddress = z.infer<typeof UpdateAddressSchema>;

export const SelectOrderSchema = z.object({ orderId: z.string().uuid() });
export type SelectOrder = z.infer<typeof SelectOrderSchema>;
