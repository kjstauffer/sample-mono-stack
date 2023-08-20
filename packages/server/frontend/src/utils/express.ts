import type { Response, Request, NextFunction } from 'express';
import type { Params, ParamsDictionary } from 'express-serve-static-core';

type RequestHandler<ReqParams, ResBody, ReqBody> = (
  req: Request<ReqParams, ResBody, ReqBody>,
  res: Response,
  next: NextFunction,
) => Promise<void>;

/**
 * Express does not natively support async functions. Meaning that errors need to be caught
 * within the route. This helper will wrap the async function with a Promise that will catch
 * any errors and pass them along to Express' error handling via `next(err)`;
 *
 * This is only needed if the route function is not already handling its own errors.
 * For example: this is not needed if it already has try/catch blocks.
 *
 * @see http://expressjs.com/en/advanced/best-practice-performance.html#use-promises
 * and
 * @see https://strongloop.com/strongblog/async-error-handling-expressjs-es7-promises-generators/
 *
 * @param fn The async function to call.
 */
export const asyncRoute =
  <
    ReqParams extends Params = ParamsDictionary,
    ResBody = Record<string, unknown>,
    ReqBody = Record<string, unknown>,
  >(
    fn: RequestHandler<ReqParams, ResBody, ReqBody>,
  ) =>
  (req: Request<ReqParams, ResBody, ReqBody>, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
