import { and, eq, getTableColumns } from "drizzle-orm";
import { Database } from "../../db";
import { categories, categoriesTrans } from "../../db/schema";
import { NotFoundError } from "../../utils/errors/notfound.error";
import { QueryLang } from "../items/items.validation";
import { CreateCategory, UpdateCategory } from "./categories.validation";

export class CategoriesService {
  constructor(private db: Database) {}

  public async addOne(values: CreateCategory) {
    return await this.db.transaction(async (tx) => {
      const [category] = await tx.insert(categories).values({}).returning();
      const [{ name }] = await tx
        .insert(categoriesTrans)
        .values({ lang: "en", name: values.name, categoryId: category.id })
        .returning();
      return { ...category, name };
    });
  }

  public async deleteOne(categoryId: string) {
    const [category] = await this.db
      .delete(categories)
      .where(eq(categories.id, categoryId))
      .returning();
    if (!category) {
      throw new NotFoundError("categories", categoryId);
    }
    return category;
  }

  public async getAll(query: QueryLang) {
    return await this.db
      .select({ ...getTableColumns(categories), name: categoriesTrans.name })
      .from(categories)
      .leftJoin(categoriesTrans, eq(categories.id, categoriesTrans.categoryId))
      .where(eq(categoriesTrans.lang, query.lang));
  }

  public async updateOne(
    categoryId: string,
    { image, details }: UpdateCategory & { image?: string }
  ) {
    return await this.db.transaction(async (tx) => {
      let category;

      if (image) {
        [category] = await this.db
          .update(categories)
          .set({ image })
          .where(eq(categories.id, categoryId))
          .returning();
      } else {
        [category] = await this.db
          .select()
          .from(categories)
          .where(eq(categories.id, categoryId));
      }

      if (!category) {
        throw new NotFoundError("categories", categoryId);
      }

      if (details) {
        for (const { lang, name } of details) {
          if (lang && name) {
            console.log(name, lang);
            await tx
              .insert(categoriesTrans)
              .values({ lang, name, categoryId })
              .onConflictDoUpdate({
                target: [categoriesTrans.categoryId, categoriesTrans.lang],
                set: { name, lang, categoryId },
                where: and(
                  eq(categoriesTrans.categoryId, categoryId),
                  eq(categoriesTrans.lang, lang)
                ),
              });
          }
        }
      }

      return category;
    });
  }
}
