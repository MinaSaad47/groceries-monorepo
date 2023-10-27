import { RequestHandler, Router } from "express";
import { z } from "zod";
import {
  requireJwt,
  uploadProfilePicture,
  validateRequest,
} from "../../middlewares";
import { ImageUploadService } from "../../services/image_upload.service";
import Controller from "../../utils/interfaces/controller.interface";
import { bearerAuth, registry } from "../../utils/openapi/registery";
import { QueryItemsSchema } from "../items/items.validation";
import { UpdateUser, UpdateUserSchema } from "../users/users.validation";
import { ProfileService } from "./profile.service";
import {
  CreateAddress,
  CreateAddressSchema,
  CreateProfileFavorite,
  CreateProfileFavoriteSchema,
  SelectAddress,
  SelectAddressSchema,
  SelectProfileFavorite,
  SelectProfileFavoriteSchema,
  UpdateAddress,
  UpdateAddressSchema,
} from "./profile.validation";

export class ProfileController implements Controller {
  public path: string;
  public router: Router;
  private profileSerivce: ProfileService;

  constructor(path: string, userService: ProfileService) {
    this.path = path;
    this.router = Router();
    this.profileSerivce = userService;

    this.initializeRoutes();
  }

  private initializeRoutes() {
    registry.registerPath({
      tags: ["profile"],
      path: "/profile",
      method: "get",
      security: [{ [bearerAuth.name]: [] }],
      summary: "get signed user's profile",
      responses: {
        200: {
          description: "signed user's profile",
        },
      },
    });

    registry.registerPath({
      tags: ["profile"],
      path: "/profile",
      method: "patch",
      security: [{ [bearerAuth.name]: [] }],
      summary: "update signed user's profile",
      request: {
        body: {
          content: {
            "application/json": {
              schema: UpdateUserSchema,
            },
          },
        },
      },
      responses: {
        200: {
          description: "updated signed user's profile",
        },
      },
    });

    registry.registerPath({
      tags: ["profile"],
      path: "/profile/favorites",
      method: "get",
      security: [{ [bearerAuth.name]: [] }],
      summary: "get all favorated items",
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
          description: "array of items",
        },
      },
    });

    registry.registerPath({
      tags: ["profile"],
      path: "/profile/favorites",
      method: "post",
      security: [{ [bearerAuth.name]: [] }],
      summary: "add favorated item",
      request: {
        body: {
          content: {
            "application/json": {
              schema: CreateProfileFavoriteSchema,
            },
          },
        },
      },
      responses: {
        200: {
          description: "favorated item",
        },
      },
    });

    registry.registerPath({
      tags: ["profile"],
      path: "/profile/favorites/{itemId}",
      method: "delete",
      security: [{ [bearerAuth.name]: [] }],
      summary: "delete favorated item",
      request: {
        params: SelectProfileFavoriteSchema,
      },
      responses: {
        200: {
          description: "deleted favorated item",
        },
      },
    });

    registry.registerPath({
      tags: ["profile"],
      path: "/profile/addresses",
      method: "post",
      security: [{ [bearerAuth.name]: [] }],
      summary: "add profile address",
      request: {
        body: {
          content: {
            "application/json": {
              schema: CreateAddressSchema,
            },
          },
        },
      },
      responses: {
        201: {
          description: "added address",
        },
      },
    });

    registry.registerPath({
      tags: ["profile"],
      path: "/profile/addresses/{addressId}",
      method: "delete",
      security: [{ [bearerAuth.name]: [] }],
      summary: "delete an address",
      request: {
        params: SelectAddressSchema,
      },
      responses: {
        200: {
          description: "deleted address",
        },
      },
    });

    registry.registerPath({
      tags: ["profile"],
      path: "/profile/addresses/{addressId}",
      method: "patch",
      security: [{ [bearerAuth.name]: [] }],
      summary: "update an address",
      request: {
        params: SelectAddressSchema,
        body: {
          content: {
            "application/json": {
              schema: UpdateAddressSchema,
            },
          },
        },
      },
      responses: {
        200: {
          description: "updated address",
        },
      },
    });

    registry.registerPath({
      tags: ["profile"],
      path: "/profile/picture",
      method: "post",
      security: [{ [bearerAuth.name]: [] }],
      summary: "upload profile picture",
      request: {
        body: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["picture"],
                properties: {
                  picture: {
                    type: "string",
                    format: "binary",
                  },
                },
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "uploaded picture",
        },
      },
    });

    this.router.use([requireJwt]);
    this.router.route("/").get(this.getSigend).patch(this.update);

    this.router
      .route("/favorites")
      .post(this.addFavorite)
      .get(
        validateRequest(z.object({ query: QueryItemsSchema })),
        this.getAllFavorites
      );

    this.router.route("/favorites/:itemId").delete(this.deleteFavorite);

    this.router.route("/picture").post(uploadProfilePicture, this.addPicture);

    this.router
      .route("/addresses")
      .post(
        validateRequest(z.object({ body: CreateAddressSchema })),
        this.addAddress
      );
    this.router
      .route("/addresses/:addressId")
      .all(validateRequest(z.object({ params: SelectAddressSchema })))
      .delete(this.deleteAddress)
      .patch(
        validateRequest(z.object({ body: UpdateAddressSchema })),
        this.updateAddress
      );
  }

  private getSigend: RequestHandler = async (req, res) => {
    const user = await this.profileSerivce.getOne(req.user!.id);
    return res.success({ data: user });
  };

  private update: RequestHandler<{}, UpdateUser> = async (req, res) => {
    const user = await this.profileSerivce.updateOne(req.user!.id, req.body);
    return res.success({ data: user, i18n: { key: "profile.update" } });
  };

  private addFavorite: RequestHandler<{}, CreateProfileFavorite> = async (
    req,
    res
  ) => {
    const favorite = await this.profileSerivce.addFavorite(
      req.user!.id,
      req.body.itemId
    );

    res.success({
      code: 201,
      data: favorite,
      i18n: { key: "profile.favorite" },
    });
  };

  private deleteFavorite: RequestHandler<SelectProfileFavorite> = async (
    req,
    res
  ) => {
    const favorite = await this.profileSerivce.deleteFavorite(
      req.user!.id,
      req.params.itemId
    );
    res.success({
      data: favorite,
      i18n: { key: "profile.favorite.delete" },
    });
  };

  private getAllFavorites: RequestHandler<{}, {}, {}, any> = async (
    req,
    res
  ) => {
    const favorites = await this.profileSerivce.getAllFavorites(
      req.user!.id,
      req.query
    );
    res.success({
      data: favorites,
    });
  };

  private addAddress: RequestHandler<{}, CreateAddress> = async (req, res) => {
    const address = await this.profileSerivce.addAddress(
      req.user?.id!,
      req.body
    );
    return res.success({
      data: address,
      code: 201,
      i18n: { key: "profile.address" },
    });
  };

  private updateAddress: RequestHandler<SelectAddress, {}, UpdateAddress> =
    async (req, res) => {
      const address = await this.profileSerivce.updateAddress(
        req.user!.id,
        req.params.addressId,
        req.body
      );
      return res.success({
        data: address,
        i18n: { key: "profile.address.update" },
      });
    };

  private deleteAddress: RequestHandler<SelectAddress> = async (req, res) => {
    const address = await this.profileSerivce.deleteAddress(
      req.user?.id!,
      req.params.addressId
    );
    return res.success({
      data: address,
      i18n: { key: "profile.address.delete" },
    });
  };

  private addPicture: RequestHandler = async (req, res) => {
    let user = req.user!;
    const path = req.file?.path;

    const url = await ImageUploadService.uploadImage(
      `users/${user.id}`,
      path!,
      "picture"!
    );

    const updatedUser = await this.profileSerivce.updateOne(user.id, {
      profilePicture: url,
    });

    res.success({ data: updatedUser, i18n: { key: "profile.update.picture" } });
  };
}
