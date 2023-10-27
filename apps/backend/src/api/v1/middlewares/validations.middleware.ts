import { NextFunction, Request, Response } from "express";
import { AnyZodObject } from "zod";

export const validateRequest =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const { body, params, query } = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      req.body = body || req.body;
      req.params = params || req.params;
      req.query = query || req.query;
      next();
    } catch (e: any) {
      res.status(400).send(e.errors);
    }
  };
