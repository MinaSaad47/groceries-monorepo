import "./config";

// validation and openapi
import {
  OpenApiGeneratorV31,
  extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

import express from "express";

import "express-async-errors";
import swaggerUi from "swagger-ui-express";

import expressPlayground from "graphql-playground-middleware-express";

import schema from "./api/v1/graphql/schema";

// common middlewares
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";

// internationalization
import i18next from "i18next";
import Backend from "i18next-fs-backend";
import i18nextHttpMiddleware from "i18next-http-middleware";

// extensions
import extendExpressResponse from "./api/v1/utils/extensions/express.ext";

// utilities
import logger from "./api/v1/utils/logger";

import { applyMigrations, db } from "./api/v1/db";

import { registry } from "./api/v1/utils/openapi/registery";

import { UserController } from "./api/v1/resources/users/users.controller";
import { UsersService } from "./api/v1/resources/users/users.service";

import { createHandler } from "graphql-http/lib/use/express";
import path from "path";
import { authorizeRoles, requireJwt } from "./api/v1/middlewares";
import { handleErrorMiddleware } from "./api/v1/middlewares/error.middleware";
import { CartsController } from "./api/v1/resources/carts/carts.controller";
import { CartsService } from "./api/v1/resources/carts/carts.service";
import { CategoriesController } from "./api/v1/resources/categories/categories.controller";
import { CategoriesService } from "./api/v1/resources/categories/categories.serivce";
import { ItemsController } from "./api/v1/resources/items/items.controller";
import { ItemsService } from "./api/v1/resources/items/items.service";
import { OauthController } from "./api/v1/resources/oauth/oauth.controller";
import { OrdersController } from "./api/v1/resources/orders/orders.controller";
import { OrdersService } from "./api/v1/resources/orders/orders.service";
import { ProfileController } from "./api/v1/resources/profile/profile.controller";
import { ProfileService } from "./api/v1/resources/profile/profile.service";
import { WebhooksControoler } from "./api/v1/resources/webhooks/webhooks.controller";

const isProduction = process.env.NODE_ENV === "production";
const secretOrKey = isProduction
  ? process.env.JWT_SECRET_PROD
  : process.env.JWT_SECRET_DEV;

i18next
  .use(Backend)
  .use(i18nextHttpMiddleware.LanguageDetector)
  .init({
    fallbackLng: "en",
    backend: {
      loadPath: "./locales/{{lng}}.json",
    },
  });

const app = express();

app.use(morgan(isProduction ? "tiny" : "dev"));
app.use(cors());
app.use("/public", express.static("public"));
app.use(i18nextHttpMiddleware.handle(i18next));
app.use((req, res, next) => {
  if (req.originalUrl === "/api/v1/webhooks/stripe") {
    return next();
  } else {
    return express.json()(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(secretOrKey));
app.use(extendExpressResponse);

async function main() {
  await applyMigrations();

  app.listen(process.env.PORT, () =>
    logger.info(`App is listening on port ${process.env.PORT}`)
  );

  const usersService = new UsersService(db);
  const profileService = new ProfileService(db);
  const itemsServices = new ItemsService(db);
  const cartsService = new CartsService(db);
  const categoriesService = new CategoriesService(db);
  const ordersService = new OrdersService(db);

  const controllers = [
    new UserController("/api/v1/users", usersService),
    new ProfileController("/api/v1/profile", profileService),
    new ItemsController("/api/v1/items", itemsServices),
    new CartsController("/api/v1/profile/cart", cartsService),
    new OrdersController("/api/v1/profile/orders", ordersService),
    new CategoriesController("/api/v1/categories", categoriesService),
    new WebhooksControoler("/api/v1/webhooks"),
    new OauthController("/api/v1/oauth"),
  ];

  app.use(
    "/graphql",
    requireJwt,
    authorizeRoles("admin"),
    createHandler({ schema })
  );
  app.use("/graphql", createHandler({ schema }));
  app.get("/playground", expressPlayground({ endpoint: "/graphql" }));

  controllers.forEach((ctrl) => app.use(ctrl.path, ctrl.router));
  const openapi = new OpenApiGeneratorV31(registry.definitions);
  const docs = openapi.generateDocument({
    info: {
      version: "1.0.0",
      title: "groceries-backend",
      description: "api docs",
    },
    servers: [{ url: "/api/v1" }],
    openapi: "3.0.1",
  });

  app.use("/api/v1/docs", swaggerUi.serve);
  app.use("/api/v1/docs", (req, res, next) => {
    return swaggerUi.setup(docs)(req, res, next);
  });

  app.use(handleErrorMiddleware);

  app.use("/", express.static(path.join(__dirname, "../../dashboard/dist")));

  app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../dashboard/dist/index.html"));
  });
}

main();
