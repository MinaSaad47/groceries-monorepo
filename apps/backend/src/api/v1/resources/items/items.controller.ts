import { Request, RequestHandler, Response, Router } from "express";

import { omit } from "lodash";
import { z } from "zod";
import {
  authorizeRoles,
  requireJwt,
  uploadItemImage,
  uploadItemThumbnail,
  validateRequest,
} from "../../middlewares";
import Controller from "../../utils/interfaces/controller.interface";
import { bearerAuth, registry } from "../../utils/openapi/registery";
import { ItemsService } from "./items.service";
import {
  CreateItem,
  CreateItemReview,
  CreateItemReviewSchema,
  CreateItemSchema,
  QueryItemsSchema,
  QueryLangSchema,
  SelectItem,
  SelectItemSchema,
  UpdateItem,
  UpdateItemSchema,
} from "./items.validation";

export class ItemsController implements Controller {
  public path: string;
  public router: Router;
  private itemService;

  constructor(path: string, itemService: ItemsService) {
    this.path = path;
    this.router = Router();
    this.itemService = itemService;
    this.initializeRoutes();
  }

  private initializeRoutes() {
    registry.registerPath({
      tags: ["items"],
      path: "/items",
      method: "get",
      security: [{ [bearerAuth.name]: [] }],
      summary: "get all items",
      parameters: [
        {
          in: "query",
          schema: {
            type: "string",
          },
          name: "filter",
          description:
            "filter crieteria, for example 'name~ta,offerPrice>0,qty<50,price<20'",
        },
        {
          in: "query",
          schema: {
            type: "integer",
          },
          name: "page",
        },
        {
          in: "query",
          schema: {
            type: "integer",
          },
          name: "perPage",
        },
        {
          in: "query",
          schema: { type: "string" },
          name: "category",
          description: "the category id",
        },
        {
          in: "query",
          schema: {
            type: "string",
          },
          name: "orderBy",
          description:
            'values from "price", "qty", "rating", "orderCount", "offerPrice"',
        },
        {
          in: "query",
          schema: {
            type: "string",
          },
          name: "lang",
          description: 'values from "ar", "en"',
        },
      ],
      responses: {
        200: {
          description: "array of items",
        },
      },
    });

    registry.registerPath({
      tags: ["items"],
      path: "/items",
      method: "post",
      security: [{ [bearerAuth.name]: [] }],
      summary: "create an item",
      request: {
        body: {
          content: { "application/json": { schema: CreateItemSchema } },
        },
      },
      responses: {
        201: {
          description: "created item",
        },
      },
    });

    registry.registerPath({
      tags: ["items"],
      path: "/items/{itemId}",
      method: "get",
      summary: "get an item",
      request: {
        params: SelectItemSchema,
      },
      parameters: [
        {
          in: "query",
          schema: {
            type: "string",
          },
          name: "lang",
          description: "value from 'ar', 'en'",
        },
      ],
      responses: {
        200: {
          description: "item details",
        },
      },
    });

    registry.registerPath({
      tags: ["items"],
      path: "/items/{itemId}",
      method: "patch",
      security: [{ [bearerAuth.name]: [] }],
      summary: "update an item",
      request: {
        params: SelectItemSchema,
        body: { content: { "application/json": { schema: UpdateItemSchema } } },
      },
      responses: {
        200: {
          description: "update item",
        },
      },
    });

    registry.registerPath({
      tags: ["items"],
      path: "/items/{itemId}",
      method: "delete",
      summary: "delete an item",
      request: {
        params: SelectItemSchema,
      },
      responses: {
        200: {
          description: "deleted item",
        },
      },
    });

    registry.registerPath({
      tags: ["items"],
      path: "/items/{itemId}/image",
      method: "post",
      security: [{ [bearerAuth.name]: [] }],
      summary: "upload an item image",
      request: {
        params: SelectItemSchema,
        body: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["image"],
                properties: {
                  image: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "uploaded image",
        },
      },
    });

    registry.registerPath({
      tags: ["items"],
      path: "/items/{itemId}/thumbnail",
      method: "post",
      security: [{ [bearerAuth.name]: [] }],
      summary: "upload an item thumbnail",
      request: {
        params: SelectItemSchema,
        body: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["thumbnail"],
                properties: {
                  thumbnail: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "uploaded thumbnail",
        },
      },
    });

    registry.registerPath({
      tags: ["items"],
      path: "/items/{itemId}/reviews",
      method: "post",
      summary: "review an item",
      request: {
        params: SelectItemSchema,
        body: {
          content: {
            "application/json": {
              schema: CreateItemReviewSchema,
            },
          },
        },
      },
      responses: {
        200: {
          description: "review",
        },
      },
    });

    this.router.use([requireJwt]);

    this.router
      .route("/")
      .post(
        [
          authorizeRoles("admin"),
          validateRequest(z.object({ body: CreateItemSchema })),
        ],
        this.createOne
      )
      .get(validateRequest(z.object({ query: QueryItemsSchema })), this.getAll);

    this.router
      .route("/:itemId")
      .all(
        validateRequest(
          z.object({ params: SelectItemSchema, query: QueryLangSchema })
        )
      )
      .get(this.getOne)
      .patch(
        [
          authorizeRoles("admin"),
          validateRequest(z.object({ body: UpdateItemSchema })),
        ],
        this.updateOne
      )
      .delete(this.deleteOne);

    this.router
      .route("/:itemId/image")
      .all([
        authorizeRoles("admin"),
        validateRequest(z.object({ params: SelectItemSchema })),
      ])
      .post(uploadItemImage, this.addImage);

    this.router
      .route("/:itemId/thumbnail")
      .all([
        authorizeRoles("admin"),
        validateRequest(z.object({ params: SelectItemSchema })),
      ])
      .post(uploadItemThumbnail, this.uploadThumbnail);

    this.router
      .route("/:itemId/reviews")
      .all(
        validateRequest(
          z.object({ params: SelectItemSchema, body: CreateItemReviewSchema })
        )
      )
      .post(this.addReivew);
  }

  private createOne: RequestHandler<{}, {}, CreateItem> = async (req, res) => {
    const item = await this.itemService.createOne(req.body);
    return res.success({ code: 201, data: item, i18n: { key: "items" } });
  };

  private getAll: RequestHandler<{}, {}, {}, any> = async (req, res) => {
    const items = await this.itemService.getAll(req.query);
    return res.success({ data: items });
  };

  private getOne: RequestHandler<SelectItem, {}, {}, any> = async (
    req,
    res
  ) => {
    const result = await this.itemService.getOne(req.params.itemId, req.query);
    const isFavorite = result.favoritedUsers
      .map(({ userId }) => userId)
      .includes(req.user?.id!);

    const item = {
      ...omit(result, "favoritedUsers"),
      isFavorite,
    };

    return res.success({ data: item });
  };

  private deleteOne: RequestHandler<SelectItem> = async (req, res) => {
    const item = await this.itemService.deleteOne(req.params.itemId);
    return res.success({ data: item, i18n: { key: "items.delete" } });
  };

  private updateOne: RequestHandler<SelectItem, UpdateItem> = async (
    req: Request,
    res: Response
  ) => {
    const item = await this.itemService.updateOne(req.params.itemId, req.body);
    return res.success({ data: item, i18n: { key: "items.update" } });
  };

  private addImage: RequestHandler<SelectItem> = async (req, res) => {
    let image = req.file?.path;
    image = await this.itemService.addImage(req.params.itemId, image!);
    return res.success({
      code: 201,
      data: image,
      i18n: { key: "items.image" },
    });
  };

  private addReivew: RequestHandler<SelectItem, CreateItemReview> = async (
    req,
    res
  ) => {
    const reivew = await this.itemService.addReview(
      req.params.itemId,
      req.user!.id,
      req.body
    );
    return res.success({ code: 201, data: reivew, i18n: { key: "reviews" } });
  };

  private uploadThumbnail: RequestHandler<SelectItem> = async (req, res) => {
    let thumbnail = req.file?.path ?? null;

    thumbnail = await this.itemService.addThumbnail(
      req.params.itemId,
      thumbnail!
    );

    return res.success({
      data: thumbnail,
      i18n: { key: "items.update" },
    });
  };
}
