import { eq } from "drizzle-orm";
import { Database } from "../../db";
import { users } from "../../db/schema";
import { CreateUser, UpdateUser } from "./users.validation";

export class UsersService {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  public async getAll() {
    return await this.db.query.users.findMany();
  }

  public async createOne(body: CreateUser) {
    return await this.db.transaction(async (tx) => {
      const [user] = await tx.insert(users).values(body).returning();
      return await tx.query.users.findFirst({
        where: eq(users.id, user.id),
        with: { addresses: true, reviews: true, cart: true },
      });
    });
  }

  public async getOne(userId: string) {
    return await this.db.query.users.findFirst({
      where: eq(users.id, userId),
      with: { addresses: true, reviews: true, cart: true },
    });
  }

  public async getByEmail(email: string) {
    return await this.db.query.users.findFirst({
      where: eq(users.email, email),
    });
  }

  public async deleteOne(userId: string) {
    return await this.db.delete(users).where(eq(users.id, userId)).returning();
  }

  public async updateOne(userId: string, body: UpdateUser) {
    return await this.db.transaction(async (tx) => {
      const [user] = await tx
        .update(users)
        .set(body)
        .where(eq(users.id, userId))
        .returning();
      return await tx.query.users.findFirst({
        where: eq(users.id, user.id),
        with: { addresses: true, reviews: true, cart: true },
      });
    });
  }
}
