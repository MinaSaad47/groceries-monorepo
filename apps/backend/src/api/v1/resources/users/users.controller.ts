import { RequestHandler, Router } from "express";

import { z } from "zod";
import { authorizeRoles, requireJwt, validateRequest } from "../../middlewares";
import { NotFoundError } from "../../utils/errors/notfound.error";
import Controller from "../../utils/interfaces/controller.interface";
import { bearerAuth, registry } from "../../utils/openapi/registery";
import { UsersService } from "./users.service";
import {
  CreateUser,
  CreateUserSchema,
  SelectUser,
  SelectUserSchema,
  UpdateUserSchema,
} from "./users.validation";

export class UserController implements Controller {
  public path: string;
  public router: Router;
  private userService;

  constructor(path: string, userService: UsersService) {
    this.path = path;
    this.router = Router();
    this.userService = userService;
    this.initializeRoutes();
  }

  private initializeRoutes() {
    registry.registerPath({
      tags: ["users"],
      path: "/users",
      method: "post",
      summary: "create an user",
      security: [{ [bearerAuth.name]: [] }],
      request: {
        body: {
          content: { "application/json": { schema: CreateUserSchema } },
        },
      },
      responses: {
        201: {
          description: "created user",
        },
      },
    });

    registry.registerPath({
      tags: ["users"],
      method: "get",
      summary: "get all users",
      path: "/users",
      responses: { 200: { description: "array of users" } },
    });

    registry.registerPath({
      tags: ["users"],
      method: "get",
      summary: "get user by id",
      path: "/users/{userId}",
      security: [{ [bearerAuth.name]: [] }],
      request: {
        params: SelectUserSchema,
      },
      responses: {
        200: {
          description: "requested user",
        },
      },
    });

    registry.registerPath({
      tags: ["users"],
      path: "/users/{userId}",
      security: [{ [bearerAuth.name]: [] }],
      method: "patch",
      summary: "update specific user",
      request: {
        params: SelectUserSchema,
        body: {
          content: { "application/json": { schema: UpdateUserSchema } },
        },
      },
      responses: {
        200: {
          description: "updated user",
        },
      },
    });

    registry.registerPath({
      tags: ["users"],
      path: "/users/{userId}",
      security: [{ [bearerAuth.name]: [] }],
      method: "delete",
      summary: "delete specific user",
      request: {
        params: SelectUserSchema,
      },
      responses: {
        200: {
          description: "deleted user",
        },
      },
    });

    this.router.use(requireJwt);

    this.router
      .route("/")
      .post(
        [
          authorizeRoles("admin"),
          validateRequest(z.object({ body: CreateUserSchema })),
        ],
        this.createOne
      )
      .get(this.getAll);

    this.router
      .route("/:userId")
      .all(validateRequest(z.object({ params: SelectUserSchema })))
      .get(this.getOne)
      .patch(
        [
          authorizeRoles("admin"),
          validateRequest(z.object({ body: UpdateUserSchema })),
        ],
        this.updateOne
      )
      .delete(authorizeRoles("admin"), this.deleteOne);
  }

  private createOne: RequestHandler<{}, {}, CreateUser> = async (req, res) => {
    const user = await this.userService.createOne(req.body);
    return res.success({ code: 201, data: user, i18n: { key: "user" } });
  };

  private getAll: RequestHandler = async (req, res) => {
    const users = await this.userService.getAll();
    return res.success({ data: users });
  };

  private getOne: RequestHandler<SelectUser> = async (req, res) => {
    const user = await this.userService.getOne(req.params.userId);
    if (user) {
      return res.success({ data: user });
    } else {
      throw new NotFoundError("users", req.params.userId);
    }
  };

  private deleteOne: RequestHandler<SelectUser> = async (req, res) => {
    const user = await this.userService.deleteOne(req.params.userId);
    if (user) {
      return res.success({ data: user, i18n: { key: "user.delete" } });
    } else {
      return res.fail({
        code: 404,
        i18n: { key: "user", args: { id: req.params.userId } },
      });
    }
  };

  private updateOne: RequestHandler<SelectUser> = async (req, res) => {
    const user = await this.userService.updateOne(req.params.userId, req.body);
    if (user) {
      return res.success({ data: user, i18n: { key: "user.update" } });
    } else {
      return res.fail({
        code: 404,
        i18n: { key: "user", args: { id: req.params.userId } },
      });
    }
  };
}
