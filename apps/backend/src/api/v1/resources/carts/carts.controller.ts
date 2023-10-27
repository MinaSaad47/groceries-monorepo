import { RequestHandler, Router } from "express";
import { z } from "zod";
import { requireJwt, validateRequest } from "../../middlewares";
import Controller from "../../utils/interfaces/controller.interface";
import { bearerAuth, registry } from "../../utils/openapi/registery";
import { QueryLang, QueryLangSchema } from "../items/items.validation";
import { CartsService } from "./carts.service";
import {
  CreateCartToItemSchema as ChangeCartItemSchema,
  CreateCartToItem,
  SelectCart,
  SelectCartSchema,
} from "./carts.validation";

export class CartsController implements Controller {
  public path: string;
  public router: Router;
  private cartsService: CartsService;

  constructor(path: string, cartsService: CartsService) {
    this.path = path;
    this.router = Router();
    this.cartsService = cartsService;

    this.initializeRoutes();
  }

  private initializeRoutes() {
    registry.registerPath({
      tags: ["cart"],
      path: "/profile/cart",
      method: "get",
      security: [{ [bearerAuth.name]: [] }],
      summary: "get details about user's cart",
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
          description: "created cart",
        },
      },
    });

    registry.registerPath({
      tags: ["cart"],
      path: "/profile/cart/checkout",
      method: "post",
      security: [{ [bearerAuth.name]: [] }],
      summary: "checkout the cart and create order",
      request: {
        params: SelectCartSchema,
      },
      responses: {
        200: {
          description:
            "stripe publishable key, client secret and order details",
        },
      },
    });

    registry.registerPath({
      tags: ["cart"],
      path: "/profile/cart/empty",
      method: "post",
      security: [{ [bearerAuth.name]: [] }],
      summary: "empty cart",
      responses: {
        200: {
          description: "empty cart",
        },
      },
    });

    registry.registerPath({
      tags: ["cart"],
      path: "/profile/cart/items",
      method: "post",
      security: [{ [bearerAuth.name]: [] }],
      summary: "change item in cart",
      request: {
        params: SelectCartSchema,
        body: {
          content: {
            "application/json": {
              schema: ChangeCartItemSchema,
            },
          },
        },
      },
      responses: {
        201: {
          description: "added item",
        },
      },
    });

    this.router.use(requireJwt);

    this.router
      .route("/")
      .get(validateRequest(z.object({ query: QueryLangSchema })), this.getOne);

    this.router.route("/checkout").post(this.checkout);

    this.router
      .route("/items")
      .all(validateRequest(z.object({ body: ChangeCartItemSchema })))
      .post(this.addOrUpdateItem);

    this.router.route("/empty").post(this.empty);
  }

  private getOne: RequestHandler<SelectCart, {}, {}, QueryLang> = async (
    req,
    res
  ) => {
    const cart = await this.cartsService.getOne(req.user!.id, req.query);
    res.success({ data: cart });
  };

  private addOrUpdateItem: RequestHandler<SelectCart, {}, CreateCartToItem> =
    async (req, res) => {
      const item = await this.cartsService.addOrUpdateItem(
        req.user!.id,
        req.body.itemId,
        req.body.qty
      );

      res.success({
        code: 200,
        data: item,
        i18n: { key: req.body.qty === 0 ? "cart.item.delete" : "cart.item" },
      });
    };

  private checkout: RequestHandler<SelectCart> = async (req, res) => {
    const order = await this.cartsService.checkout(req.user!.id);
    res.success({ data: order, i18n: { key: "carts.checkout" } });
  };

  private empty: RequestHandler = async (req, res) => {
    const cart = await this.cartsService.empty(req.user!.id);
    return res.success({ data: cart, i18n: { key: "carts.empty" } });
  };
}
