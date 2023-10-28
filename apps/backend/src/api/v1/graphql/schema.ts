import { and, eq } from "drizzle-orm";
import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from "graphql";
import { db } from "../db";
import {
  categories,
  categoriesTrans,
  images,
  items,
  itemsTrans,
  users,
} from "../db/schema";

const UserType = new GraphQLObjectType({
  name: "UserType",
  fields: () => ({
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    phoneNumber: { type: GraphQLString },
    dayOfBirth: { type: GraphQLString },
    profilePicture: { type: GraphQLString },
    role: { type: GraphQLString },
    addresses: {
      type: new GraphQLList(AddressType),
    },
  }),
});

const AddressType = new GraphQLObjectType({
  name: "AddressType",
  fields: () => ({
    id: { type: GraphQLString },
    buildingNumber: { type: GraphQLString },
    apartmentNumber: { type: GraphQLString },
    floorNumber: { type: GraphQLString },
    lat: { type: GraphQLFloat },
    lng: { type: GraphQLFloat },
    isDefault: { type: GraphQLBoolean },
  }),
});

const ItemType = new GraphQLObjectType({
  name: "ItemType",
  fields: () => ({
    id: { type: GraphQLString },
    price: { type: GraphQLFloat },
    offerPrice: { type: GraphQLFloat },
    qty: { type: GraphQLInt },
    qtyType: { type: GraphQLString },
    thumbnail: { type: GraphQLString },
    name: {
      type: GraphQLString,
      resolve: async (parent, args) => {
        const { name } =
          parent.details?.filter(({ lang }: any) => lang === "en")[0] ??
          (await db.query.itemsTrans.findFirst({
            where: and(
              eq(itemsTrans.itemId, parent.id),
              eq(itemsTrans.lang, "en")
            ),
          }));

        return name;
      },
    },
    description: {
      type: GraphQLString,
      resolve: async (parent, args) => {
        const { description } =
          parent.details?.filter(({ lang }: any) => lang === "en")[0] ??
          (await db.query.itemsTrans.findFirst({
            where: and(
              eq(itemsTrans.itemId, parent.id),
              eq(itemsTrans.lang, "en")
            ),
          }));

        return description;
      },
    },
    category: {
      type: CategoryType,
      resolve: async (parent, args) => {
        return parent.category !== undefined
          ? parent.category
          : await db.query.categories.findFirst({
              where: eq(categories.id, parent.categoryId),
              with: { details: true },
            });
      },
    },
    details: {
      type: new GraphQLList(ItemTransType),
      resolve: async (parent, args) => {
        return parent.details !== undefined
          ? parent.details
          : await db.query.itemsTrans.findMany({
              where: eq(itemsTrans.itemId, parent.id),
            });
      },
    },
    images: {
      type: new GraphQLList(GraphQLString),
      resolve: async (parent, args) => {
        const itemImages =
          parent.images ??
          (await db.query.images.findMany({
            where: eq(images.itemId, parent.id),
            columns: { image: true },
          }));
        return itemImages.map(({ image }: any) => image);
      },
    },
  }),
});

const ItemTransType = new GraphQLObjectType({
  name: "ItemTransType",
  fields: () => ({
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    lang: { type: GraphQLString },
  }),
});

const CategoryType = new GraphQLObjectType({
  name: "CategoryType",
  fields: () => ({
    id: { type: GraphQLString },
    details: {
      type: new GraphQLList(CategoryTransType),
      resolve: async (parent, args) => {
        return parent.details !== undefined
          ? parent.details
          : await db.query.categoriesTrans.findMany({
              where: eq(categoriesTrans.categoryId, parent.id),
            });
      },
    },
    name: {
      type: GraphQLString,
      resolve: async (parent, args) => {
        const { name } =
          parent.details?.filter(({ lang }: any) => lang === "en")[0] ??
          (
            await db
              .select()
              .from(categoriesTrans)
              .where(
                and(
                  eq(categoriesTrans.categoryId, parent.id),
                  eq(categoriesTrans.lang, "en")
                )
              )
          )[0];
        return name;
      },
    },
    image: { type: GraphQLString },
  }),
});

const CategoryTransType = new GraphQLObjectType({
  name: "CategoryTransType",
  fields: () => ({
    name: { type: GraphQLString },
    lang: { type: GraphQLString },
  }),
});
const CategoryTransInputType = new GraphQLInputObjectType({
  name: "CategoryTransInputType",
  fields: () => ({
    name: { type: new GraphQLNonNull(GraphQLString) },
    lang: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

const RootQueryType = new GraphQLObjectType({
  name: "RootQueryType",
  fields: () => ({
    // Users CRUD
    user: {
      type: UserType,
      args: {
        id: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        const user = await db.query.users.findFirst({
          where: eq(users.id, args.id),
          with: { addresses: true },
        });
        return user;
      },
    },
    users: {
      type: new GraphQLList(UserType),
      resolve: async () => {
        const users = await db.query.users.findMany({
          with: { addresses: true },
        });
        return users;
      },
    },
    // Items CRUD
    item: {
      type: ItemType,
      args: {
        id: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        return await db.query.items.findFirst({
          where: eq(items.id, args.id),
          with: {
            details: true,
            category: { with: { details: true } },
            images: true,
          },
        });
      },
    },
    items: {
      type: new GraphQLList(ItemType),
      resolve: async () => {
        const items = await db.query.items.findMany({
          with: {
            details: true,
            category: { with: { details: true } },
            images: true,
          },
        });
        return items;
      },
    },
    // Categories CRUD
    categories: {
      type: new GraphQLList(CategoryType),
      resolve: async () => {
        const categories = await db.query.categories.findMany({
          with: { details: true },
        });
        return categories;
      },
    },
  }),
});

const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: () => ({
    addItem: {
      type: ItemType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: new GraphQLNonNull(GraphQLString) },
        price: { type: new GraphQLNonNull(GraphQLFloat) },
        offerPrice: { type: new GraphQLNonNull(GraphQLFloat) },
        qty: { type: new GraphQLNonNull(GraphQLInt) },
        qtyType: { type: new GraphQLNonNull(GraphQLString) },
        thumbnail: { type: GraphQLString },
        categoryId: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        const { name, description, ...rest } = args;
        return await db.transaction(async (tx) => {
          const [item] = await tx.insert(items).values(rest).returning();
          await tx.insert(itemsTrans).values({
            name,
            description,
            lang: "en",
            itemId: item.id,
          });
          return item;
        });
      },
    },
    deleteUser: {
      type: UserType,
      args: {
        id: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        const [user] = await db
          .delete(users)
          .where(eq(users.id, args.id))
          .returning();
        return user;
      },
    },
    updateItem: {
      type: ItemType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        name: { type: GraphQLString },
        description: { type: GraphQLString },
        price: { type: GraphQLFloat },
        offerPrice: { type: GraphQLFloat },
        qty: { type: GraphQLInt },
        qtyType: { type: GraphQLString },
        thumbnail: { type: GraphQLString },
        categoryId: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        return await db.transaction(async (tx) => {
          const { id, name, description, ...rest } = args;
          if (name || description) {
            await tx
              .update(itemsTrans)
              .set({ name, description })
              .where(eq(itemsTrans.itemId, id));
          }
          const [item] = rest
            ? await tx
                .update(items)
                .set(rest)
                .where(eq(items.id, id))
                .returning()
            : await tx.select().from(items);
          return item;
        });
      },
    },
    deleteItem: {
      type: ItemType,
      args: {
        id: { type: GraphQLString },
      },
      resolve: async (parent, args) => {
        const [item] = await db
          .delete(items)
          .where(eq(items.id, args.id))
          .returning();
        return item;
      },
    },
    addCategory: {
      type: CategoryType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args) => {
        return await db.transaction(async (tx) => {
          const [category] = await tx.insert(categories).values({}).returning();

          await tx.insert(categoriesTrans).values({
            lang: "en",
            name: args.name,
            categoryId: category.id,
          });

          return category;
        });
      },
    },
    addOrUpdateCategory: {
      type: CategoryType,
      args: {
        id: { type: GraphQLString },
        details: {
          type: new GraphQLNonNull(new GraphQLList(CategoryTransInputType)),
        },
      },
      resolve: async (parent, args) => {
        return await db.transaction(async (tx) => {
          const [category] = await tx
            .insert(categories)
            .values({ id: args.id })
            .onConflictDoNothing({
              target: [categories.id],
            })
            .returning();

          const id = category?.id ?? args.id;

          args.details.forEach(async ({ lang, name }: any) => {
            const values = { lang, name, categoryId: id };
            await tx
              .insert(categoriesTrans)
              .values(values)
              .onConflictDoUpdate({
                set: values,
                target: [categoriesTrans.lang, categoriesTrans.categoryId],
                where: and(
                  eq(categoriesTrans.categoryId, id),
                  eq(categoriesTrans.lang, lang)
                ),
              });
          });
          return category ?? await tx.query.categories.findFirst({
            where: eq(categories.id, id),
          })
        });
      },
    },
    deleteCategory: {
      type: CategoryType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve: async (parent, args) => {
        const [category] = await db
          .delete(categories)
          .where(eq(categories.id, args.id))
          .returning();
        return category;
      },
    },
  }),
});

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation,
});

export default schema;
