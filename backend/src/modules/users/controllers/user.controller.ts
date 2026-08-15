import { Request, Response } from "express";
import { asyncHandler } from "../../../core/utils/asyncHandler";
import { userRepository } from "../repositories/user.repository";
import { prisma } from "../../../config/prisma";
import { CreateUserInput, ListUsersQuery, UpdateUserInput } from "../validations/user.validation";

export const userController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as ListUsersQuery;
    const users = await userRepository.list(query);
    res.json({ success: true, data: users });
  }),

  create: asyncHandler(async (req: Request<unknown, unknown, CreateUserInput>, res: Response) => {
    const user = await userRepository.create(req.body);
    res.status(201).json({ success: true, data: user });
  }),

  update: asyncHandler(async (req: Request<{ id: string }, unknown, UpdateUserInput>, res: Response) => {
    const user = await userRepository.update(req.params.id, req.body);
    res.json({ success: true, data: user });
  }),

  delete: asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    await userRepository.delete(req.params.id);
    res.json({ success: true });
  }),

  roles: asyncHandler(async (_req: Request, res: Response) => {
    const roles = await prisma.role.findMany({ orderBy: { label: "asc" } });
    res.json({ success: true, data: roles });
  }),
};
