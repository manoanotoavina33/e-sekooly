import { Request, Response } from "express";
import { asyncHandler } from "../../../../core/utils/asyncHandler";
import { classRoomService } from "../services/classroom.service";
import {
  CreateClassRoomInput,
  ListClassRoomsQuery,
  UpdateClassRoomInput,
} from "../validations/classroom.validation";

export const classRoomController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const classRooms = await classRoomService.list(req.query as unknown as ListClassRoomsQuery, req.auth!);
    res.json({ success: true, data: classRooms });
  }),

  getById: asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    const classRoom = await classRoomService.getById(req.params.id, req.auth!);
    res.json({ success: true, data: classRoom });
  }),

  create: asyncHandler(async (req: Request<unknown, unknown, CreateClassRoomInput>, res: Response) => {
    const classRoom = await classRoomService.create(req.body);
    res.status(201).json({ success: true, data: classRoom });
  }),

  update: asyncHandler(async (req: Request<{ id: string }, unknown, UpdateClassRoomInput>, res: Response) => {
    const classRoom = await classRoomService.update(req.params.id, req.body);
    res.json({ success: true, data: classRoom });
  }),

  remove: asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    await classRoomService.remove(req.params.id);
    res.status(204).send();
  }),
};
