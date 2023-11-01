import { RequestHandler, Router } from "express";
import { z } from "zod";
import { requireJwt, validateRequest } from "../../middlewares";
import Controller from "../../utils/interfaces/controller.interface";
import { bearerAuth, registry } from "../../utils/openapi/registery";
import { QueryLang, QueryLangSchema } from "../items/items.validation";
import { OrdersService } from "./orders.service";
import { OrdersParams, OrdersParamsSchema } from "./orders.validation";

export class OrdersController implements Controller {
  public path: string;
  public router: Router;
  constructor(path: string, private ordersServices: OrdersService) {
    this.path = path;
    this.router = Router();

    this.initializeRoutes();
  }
  private initializeRoutes() {
    registry.registerPath({
      tags: ["orders"],
      path: "/profile/orders",
      method: "get",
      security: [{ [bearerAuth.name]: [] }],
      summary: "get all orders",
      responses: {
        200: {
          description: "array of orders",
        },
      },
    });

    registry.registerPath({
      tags: ["orders"],
      path: "/profile/orders/{orderId}",
      method: "get",
      security: [{ [bearerAuth.name]: [] }],
      summary: "get one order",
      request: {
        params: OrdersParamsSchema,
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
          description: "order",
        },
      },
    });

    registry.registerPath({
      tags: ["orders"],
      path: "/profile/orders/{orderId}/checkout",
      method: "post",
      security: [{ [bearerAuth.name]: [] }],
      summary: "checkout the order",
      request: {
        params: OrdersParamsSchema,
      },
      responses: {
        200: {
          description: "order",
        },
      },
    });

    registry.registerPath({
      tags: ["orders"],
      path: "/profile/orders/{orderId}/cancel",
      method: "post",
      security: [{ [bearerAuth.name]: [] }],
      summary: "cancel the order",
      request: {
        params: OrdersParamsSchema,
      },
      responses: {
        200: {
          description: "order",
        },
      },
    });

    this.router.use(requireJwt);

    this.router.get("/", this.getAll);
    this.router.get(
      "/:orderId",
      validateRequest(
        z.object({ params: OrdersParamsSchema, query: QueryLangSchema })
      ),
      this.getOne
    );
    this.router.post(
      "/:orderId/checkout",
      validateRequest(z.object({ params: OrdersParamsSchema })),
      this.checkout
    );

    this.router.post(
      "/:orderId/cancel",
      validateRequest(z.object({ params: OrdersParamsSchema })),
      this.cancel
    );
  }

  private getAll: RequestHandler = async (req, res) => {
    const orders = await this.ordersServices.getAll(req.user!.id);
    return res.success({ data: orders });
  };

  private getOne: RequestHandler<OrdersParams, {}, {}, QueryLang> = async (
    req,
    res
  ) => {
    console.log(req.params);
    const order = await this.ordersServices.getOne(
      req.user!.id,
      req.params.orderId,
      req.query
    );
    return res.success({ data: order });
  };

  private checkout: RequestHandler<OrdersParams> = async (req, res) => {
    console.log(req.params);
    const order = await this.ordersServices.checkout(
      req.user!.id,
      req.params.orderId
    );
    return res.success({ data: order });
  };

  private cancel: RequestHandler<OrdersParams> = async (req, res) => {
    const order = await this.ordersServices.cancel(
      req.user!.id,
      req.params.orderId
    );
    return res.success({ data: order });
  };
}
