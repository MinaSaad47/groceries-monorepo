import { NextFunction, Request, Response } from "express";

import * as schema from "../../db/schema";

declare global {
  interface SuccessBody {
    code?: number;
    data?: any;
    i18n?: { key: string; args?: any };
  }

  interface FailBody {
    code?: number;
    i18n: { key: string; args?: any };
    details?: any;
  }

  interface ErrorBody {
    code?: number;
    i18n: { key: string; args?: any };
    details?: any;
  }

  namespace Express {
    interface User extends schema.User {}
    interface Response {
      success(body: SuccessBody): void;
      fail(body: FailBody): void;
      error(body: ErrorBody): void;
    }
  }
}

export default function extendExpressResponse(
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.success = ({ i18n, data, code = 200 }: SuccessBody): void => {
    res.status(code).json({
      code,
      status: "success",
      data,
      message: !i18n
        ? undefined
        : req.t(`success.${code}.${i18n.key}`, i18n.args),
    });
  };
  res.fail = ({ i18n, code = 400, details: data }: FailBody): void => {
    res.status(code).json({
      code,
      status: "fail",
      message: req.t(`fail.${code}.${i18n.key}`, i18n.args),
      data,
    });
  };
  res.error = ({ i18n, details: data, code = 500 }: ErrorBody): void => {
    res.status(code).json({
      code,
      status: "error",
      message: req.t(`error.${code}.${i18n.key}`, i18n.args),
      data,
    });
  };

  next();
}
