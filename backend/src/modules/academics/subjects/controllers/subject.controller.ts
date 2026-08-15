import { Request, Response } from "express";
import { asyncHandler } from "../../../../core/utils/asyncHandler";
import { subjectService } from "../services/subject.service";
import { CreateSubjectInput, ListSubjectsQuery, UpdateSubjectInput } from "../validations/subject.validation";

export const subjectController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const subjects = await subjectService.list(req.query as unknown as ListSubjectsQuery, req.auth!);
    res.json({ success: true, data: subjects });
  }),

  getById: asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    const subject = await subjectService.getById(req.params.id, req.auth!);
    res.json({ success: true, data: subject });
  }),

  create: asyncHandler(async (req: Request<unknown, unknown, CreateSubjectInput>, res: Response) => {
    const subject = await subjectService.create(req.body);
    res.status(201).json({ success: true, data: subject });
  }),

  update: asyncHandler(async (req: Request<{ id: string }, unknown, UpdateSubjectInput>, res: Response) => {
    const subject = await subjectService.update(req.params.id, req.body);
    res.json({ success: true, data: subject });
  }),

  remove: asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    await subjectService.remove(req.params.id);
    res.status(204).send();
  }),
};
