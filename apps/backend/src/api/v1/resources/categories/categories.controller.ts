import { ImageUploadService } from "../../services/image_upload.service";
import { bearerAuth, registry } from "../../utils/openapi/registery";
import { RequestHandler, Router } from "express";
import { z } from "zod";
import {
  authorizeRoles,
  requireJwt,
  uploadCategoryImage,
  validateRequest,
} from "../../middlewares";
import Controller from "../../utils/interfaces/controller.interface";
import { QueryLang, QueryLangSchema } from "../items/items.validation";
import { CategoriesService } from "./categories.serivce";
import {
  CreateCategory,
  CreateCategorySchema,
  SelectCategory,
  SelectCategorySchema,
  UpdateCategory,
  UpdateCategorySchema,
} from "./categories.validation";

export class CategoriesController implements Controller {
  path: string;
  router: Router;

  constructor(path: string, private categoriesService: CategoriesService) {
    this.path = path;
    this.router = Router();
    this.intiailizeRoutes();
  }

  private intiailizeRoutes(): void {
    registry.registerPath({
      tags: ["categories"],
      path: "/categories",
      method: "post",
      security: [{ [bearerAuth.name]: [] }],
      summary: "create a category",
      request: {
        body: {
          content: { "application/json": { schema: CreateCategorySchema } },
        },
      },
      responses: {
        201: {
          description: "created category",
        },
      },
    });

    registry.registerPath({
      tags: ["categories"],
      method: "get",
      summary: "get all categories",
      path: "/categories",
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
      responses: { 200: { description: "array of categories" } },
    });

    registry.registerPath({
      tags: ["categories"],
      path: "/categories/{categoryId}",
      method: "patch",
      security: [{ [bearerAuth.name]: [] }],
      summary: "update specific category",
      request: {
        params: SelectCategorySchema,
        body: {
          content: { "application/json": { schema: UpdateCategorySchema } },
        },
      },
      responses: {
        200: {
          description: "updated category",
        },
      },
    });

    registry.registerPath({
      tags: ["categories"],
      path: "/categories/{categoryId}",
      method: "delete",
      security: [{ [bearerAuth.name]: [] }],
      summary: "delete specific category",
      request: {
        params: SelectCategorySchema,
      },
      responses: {
        200: {
          description: "deleted category",
        },
      },
    });

    registry.registerPath({
      tags: ["categories"],
      path: "/categories/{categoryId}/image",
      method: "post",
      summary: "upload category image",
      security: [{ [bearerAuth.name]: [] }],
      request: {
        params: SelectCategorySchema,
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
          description: "deleted category",
        },
      },
    });

    this.router.use(requireJwt);

    this.router
      .route("/")
      .get([validateRequest(z.object({ query: QueryLangSchema }))], this.getAll)
      .post(
        [
          authorizeRoles("admin"),
          validateRequest(z.object({ body: CreateCategorySchema })),
        ],
        this.addOne
      );

    this.router
      .route("/:categoryId")
      .all(validateRequest(z.object({ params: SelectCategorySchema })))
      .delete(authorizeRoles("admin"), this.deleteOne)
      .patch(
        [
          authorizeRoles("admin"),
          validateRequest(z.object({ body: UpdateCategorySchema })),
        ],
        this.updateOne
      );

    this.router
      .route("/:categoryId/image")
      .all([
        authorizeRoles("admin"),
        validateRequest(z.object({ params: SelectCategorySchema })),
      ])
      .post(uploadCategoryImage, this.uploadImage);
  }

  private addOne: RequestHandler<{}, CreateCategory> = async (req, res) => {
    const category = await this.categoriesService.addOne(req.body);
    return res.success({
      code: 201,
      data: category,
      i18n: { key: "categories" },
    });
  };

  private getAll: RequestHandler<{}, {}, {}, QueryLang> = async (req, res) => {
    const categories = await this.categoriesService.getAll(req.query);
    return res.success({ data: categories });
  };

  private deleteOne: RequestHandler<SelectCategory> = async (req, res) => {
    const category = await this.categoriesService.deleteOne(
      req.params.categoryId
    );
    return res.success({ data: category, i18n: { key: "categories.delete" } });
  };

  private updateOne: RequestHandler<SelectCategory, UpdateCategory> = async (
    req,
    res
  ) => {
    console.log(req.body);
    const category = await this.categoriesService.updateOne(
      req.params.categoryId,
      req.body
    );
    res.success({ data: category, i18n: { key: "categories.update" } });
  };

  private uploadImage: RequestHandler<SelectCategory> = async (req, res) => {
    const image = req.file?.path;
    const url = await ImageUploadService.uploadImage(
      `categories/${req.params.categoryId}`,
      image!,
      "image"
    );
    const category = await this.categoriesService.updateOne(
      req.params.categoryId,
      { image: url }
    );
    return res.success({ data: category, i18n: { key: "categories.update" } });
  };
}
