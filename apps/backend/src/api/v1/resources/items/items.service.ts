import { Database } from "../../db";
import { and, desc, eq, getTableColumns, sql } from "drizzle-orm";
import {
  CreateItem,
  CreateItemReview,
  QueryItems,
  QueryLang,
  UpdateItem,
} from "./items.validation";

import { ceil } from "lodash";
import { categoriesTrans, images, items, itemsTrans, ordersToItems, reviews } from "../../db/schema";
import { NotFoundError } from "../../utils/errors/notfound.error";
import { ImageUploadService } from "../../services/image_upload.service";

export class ItemsService {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  public async getAll(query?: QueryItems) {
    const orderCountSQ = this.db.$with("order_count_sq").as(
      this.db
        .select({
          itemId: ordersToItems.itemId,
          orderCount: sql<number>`count(${ordersToItems.orderId})`.as(
            "order_count"
          ),
        })
        .from(ordersToItems)
        .groupBy(ordersToItems.itemId)
    );

    const transColumns = Object.values(getTableColumns(itemsTrans));
    const transSQ = this.db.$with("trans_sq").as(
      this.db
        .select()
        .from(itemsTrans)
        .groupBy(...transColumns)
        .where(eq(itemsTrans.lang, query?.lang as string))
    );

    const ratingSQ = this.db.$with("rating_sq").as(
      this.db
        .select({
          itemId: reviews.itemId,
          rating: sql<number>`avg(${reviews.rating})`.as("rating"),
        })
        .from(reviews)
        .groupBy(reviews.itemId)
    );

    let statement = this.db
      .with(transSQ, orderCountSQ, ratingSQ)
      .select({
        ...getTableColumns(items),
        rating: sql`coalesce(${ratingSQ.rating}, 0)::float`.as("rating"),
        orderCount: sql`coalesce(${orderCountSQ.orderCount}, 0)::int`.as(
          "order_count"
        ),
        name: transSQ.name,
        description: transSQ.description,
      })
      .from(items)
      .leftJoin(transSQ, eq(items.id, transSQ.itemId))
      .leftJoin(orderCountSQ, eq(items.id, orderCountSQ.itemId))
      .leftJoin(ratingSQ, eq(items.id, ratingSQ.itemId));

    if (query?.filter) {
      statement = statement.where(query.filter);
    }

    if (query?.category) {
      statement = statement.where(eq(items.categoryId, query.category));
    }

    if (query?.orderBy) {
      let orderBy: any = [];

      query.orderBy.forEach((ob) => {
        switch (ob) {
          case "orderCount":
            orderBy.push(desc(orderCountSQ.orderCount));
            break;
          case "price":
            orderBy.push(desc(items.price));
            break;
          case "qty":
            orderBy.push(desc(items.qty));
            break;
          case "rating":
            orderBy.push(desc(ratingSQ.rating));
          case "offerPrice":
            orderBy.push(desc(items.offerPrice));
            break;

          default:
            break;
        }
      });

      statement = statement.orderBy(...orderBy);
    }

    if (Number(query?.limit) > 0 && Number(query?.offset) >= 0) {
      statement = statement.limit(query?.limit!).offset(query?.offset!);

      const [{ count }] = await this.db
        .select({ count: sql<number>`count(${items.id})::int` })
        .from(items);

      const pagination = {
        perPage: query?.limit!,
        page: ceil((query?.offset! + 1) / query?.limit!),
        totalPages: ceil(count / query?.limit!),
      };
      return { items: await statement, ...pagination };
    }

    return await statement;
  }

  public async createOne(body: CreateItem) {
    return await this.db.transaction(async (tx) => {
      const { name, description, ...insertItem } = body;
      const [item] = await tx.insert(items).values(insertItem).returning();
      const [trans] = await tx
        .insert(itemsTrans)
        .values({ name, description, lang: "en", itemId: item.id })
        .returning();
      return await tx.query.items.findFirst({
        where: eq(items.id, item.id),
        with: {
          category: true,
          images: true,
          reviews: true,
          details: { columns: { itemId: false }, limit: 1 },
        },
      });
    });
  }

  public async getOne(itemId: string, query: QueryLang) {
    const item = await this.db.query.items.findFirst({
      where: eq(items.id, itemId),
      with: {
        category: {
          with: { details: { where: eq(categoriesTrans.lang, query.lang) } },
        },
        images: { columns: { itemId: false } },
        reviews: { with: { user: true }, columns: { userId: false } },
        favoritedUsers: { columns: { userId: true } },
        details: { where: eq(itemsTrans.lang, query.lang) },
      },
    });

    if (!item) {
      throw new NotFoundError("items", itemId);
    }

    const { details, ...rest } = item;
    console.log(details);
    return {
      ...rest,
      name: details[0]?.name,
      description: details[0]?.description,
    };
  }

  public async deleteOne(itemId: string) {
    const item = await this.db
      .delete(items)
      .where(eq(items.id, itemId))
      .returning();
    if (!item) {
      throw new NotFoundError("items", itemId);
    }
    return item;
  }

  public async updateOne(itemId: string, body: UpdateItem) {
    return await this.db.transaction(async (tx) => {
      const { details, ...updateItem } = body;

      const [item] =
        Object.keys(updateItem).length > 0
          ? await tx
              .update(items)
              .set(updateItem)
              .where(eq(items.id, itemId))
              .returning()
          : await this.db.query.items.findMany({ where: eq(items.id, itemId) });

      if (!item) {
        throw new NotFoundError("items", itemId);
      }
      console.log(details);

      details?.forEach(async ({ lang, description, name }) => {
        if (description && name) {
          await tx
            .insert(itemsTrans)
            .values({ lang, description, name, itemId: item.id })
            .onConflictDoUpdate({
              target: [itemsTrans.lang, itemsTrans.itemId],
              set: { description, name },
              where: and(
                eq(itemsTrans.itemId, item.id),
                eq(itemsTrans.lang, lang)
              ),
            });
        } else {
          await tx
            .update(itemsTrans)
            .set({ lang, description, name, itemId: item.id })
            .where(
              and(eq(itemsTrans.itemId, item.id), eq(itemsTrans.lang, lang))
            );
        }
      });

      return await tx.query.items.findFirst({
        where: eq(items.id, item.id),
        with: {
          category: true,
          images: { columns: { itemId: false } },
          reviews: { with: { user: true }, columns: { userId: false } },
          details: true,
        },
      });
    });
  }

  public async addImage(itemId: string, image: string) {
    const url = await ImageUploadService.uploadImage(
      `items/${itemId}/images`,
      image
    );

    const [inserted] = await this.db
      .insert(images)
      .values({ image: url, itemId })
      .returning({ image: images.image });

    if (!inserted) {
      throw new NotFoundError("items", itemId);
    }

    return inserted.image;
  }

  public async addThumbnail(itemId: string, thumbnail: string) {
    const url = await ImageUploadService.uploadImage(
      `items/${itemId}`,
      thumbnail,
      "thumbnail"
    );
    const [inserted] = await this.db
      .update(items)
      .set({ thumbnail: url })
      .where(eq(items.id, itemId))
      .returning({ thumbnail: items.thumbnail });

    if (!inserted) {
      throw new NotFoundError("items", itemId);
    }

    return inserted.thumbnail;
  }

  public async addReview(
    itemId: string,
    userId: string,
    body: CreateItemReview
  ) {
    return await this.db.transaction(async (tx) => {
      const [review] = await tx
        .insert(reviews)
        .values({ itemId, userId, ...body })
        .returning();
      return review;
    });
  }
}
