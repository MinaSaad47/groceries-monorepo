import { Database } from "../../db";
import {
  addresses,
  favorites,
  items,
  itemsTrans,
  users,
} from "../../db/schema";
import { NotFoundError } from "../../utils/errors/notfound.error";
import { and, eq, getTableColumns } from "drizzle-orm";
import { QueryItems } from "../items/items.validation";
import { UpdateUser } from "../users/users.validation";
import { CreateAddress, UpdateAddress } from "./profile.validation";

export class ProfileService {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  public async getOne(userId: string) {
    const user = await this.db.query.users.findFirst({
      where: eq(users.id, userId),
      with: { addresses: true, reviews: true, cart: true },
    });

    if (!user) {
    }

    return user;
  }

  public async updateOne(
    userId: string,
    body: UpdateUser & { profilePicture?: string }
  ) {
    return await this.db.transaction(async (tx) => {
      const [user] = await tx
        .update(users)
        .set(body)
        .where(eq(users.id, userId))
        .returning();

      if (!user) {
        throw new NotFoundError("users", userId);
      }

      return await tx.query.users.findFirst({
        where: eq(users.id, user.id),
        with: { addresses: true, reviews: true, cart: true },
      });
    });
  }

  public async addFavorite(userId: string, itemId: string) {
    const [favorite] = await this.db
      .insert(favorites)
      .values({ userId, itemId })
      .returning();
    return favorite;
  }

  public async deleteFavorite(userId: string, itemId: string) {
    const [favorite] = await this.db
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.itemId, itemId)))
      .returning();
    return favorite;
  }

  public async getAllFavorites(userId: string, query: QueryItems) {
    const transColumns = Object.values(getTableColumns(itemsTrans));
    const transSQ = this.db.$with("trans_sq").as(
      this.db
        .select()
        .from(itemsTrans)
        .groupBy(...transColumns)
        .where(eq(itemsTrans.lang, query?.lang ?? ("en" as string)))
    );

    return await this.db
      .with(transSQ)
      .select({
        ...getTableColumns(items),
        name: transSQ.name,
        description: transSQ.description,
      })
      .from(items)
      .leftJoin(transSQ, eq(items.id, transSQ.itemId))
      .leftJoin(favorites, eq(items.id, favorites.itemId))
      .where(eq(favorites.userId, userId));
  }

  public async addAddress(userId: string, address: CreateAddress) {
    return await this.db
      .insert(addresses)
      .values({ ...address, userId })
      .returning();
  }

  public async deleteAddress(userId: string, addressId: string) {
    const address = await this.db
      .delete(addresses)
      .where(and(eq(addresses.userId, userId), eq(addresses.id, addressId)))
      .returning();
    if (!address) {
      throw new NotFoundError("addresses", addressId);
    }
    return address;
  }

  public async updateAddress(
    userId: string,
    addressId: string,
    updateAddress: UpdateAddress
  ) {
    return await this.db.transaction(async (tx) => {
      if (updateAddress.isDefault === true) {
        await tx
          .update(addresses)
          .set({ isDefault: false })
          .where(eq(addresses.userId, userId));
      }

      return await tx
        .update(addresses)
        .set(updateAddress)
        .where(and(eq(addresses.userId, userId), eq(addresses.id, addressId)))
        .returning();
    });
  }
}
