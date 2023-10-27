import { NextFunction, Request, Response } from "express";
import { BaseError } from "../utils/errors/base.error";
import log from "../utils/logger";
import { PostgresError } from "postgres";

export const handleErrorMiddleware = async (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  log.trace(error);

  if (error instanceof BaseError) {
    const obj = {
      code: error.code,
      details: error.details,
      i18n: error.i18n,
    };
    log.error(obj);
    if (error.code >= 500) {
      return res.error(obj);
    } else {
      return res.fail(obj);
    }
  } else if (error instanceof PostgresError) {
    let code = 409;
    let i18n: any = { key: `duplication.${error.table_name}` };
    const re = /Key \([\w-]+\)=\(([\w-]+)\) is not present in table "(\w+)"/;
    const match = error.detail?.match(re);
    if (match) {
      const [_, resourceId, resource] = match;
      code = 404;
      i18n = { key: resource, args: { id: resourceId } };
    }
    const obj = {
      code,
      details: {
        name: "DatabaseError",
        message: error.message,
        details: error.detail,
      },
      i18n,
    };
    log.error(obj);
    return res.fail(obj);
  }

  const obj = {
    code: 500,
    details: { name: error.name, message: error.message },
    i18n: { key: "internal" },
  };
  log.error(obj);
  return res.error(obj);
};
