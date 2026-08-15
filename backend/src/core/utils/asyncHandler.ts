import { NextFunction, Request, Response } from "express";

type AsyncFn<Req extends Request = Request> = (req: Req, res: Response, next: NextFunction) => Promise<unknown>;

/**
 * Enveloppe un contrôleur async pour transmettre automatiquement toute
 * exception au middleware d'erreurs global (errorHandler.ts).
 * Générique sur le type de Request pour accepter les contrôleurs qui typent
 * précisément req.params / req.query / req.body (ex: Request<{ id: string }>).
 */
export function asyncHandler<Req extends Request = Request>(fn: AsyncFn<Req>) {
  return (req: Req, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
