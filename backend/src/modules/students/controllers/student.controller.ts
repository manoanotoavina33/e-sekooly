import { Request, Response } from "express";
import { asyncHandler } from "../../../core/utils/asyncHandler";
import { studentService } from "../services/student.service";
import {
  ChangeClassInput,
  CreateStudentInput,
  ListStudentsQuery,
  SuspendStudentInput,
  UpdateStudentInput,
} from "../validations/student.validation";

export const studentController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await studentService.list(req.query as unknown as ListStudentsQuery, req.auth!);
    res.json({ success: true, data: result.items, meta: { total: result.total, page: result.page, pageSize: result.pageSize } });
  }),

  getById: asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    const student = await studentService.getById(req.params.id, req.auth!);
    res.json({ success: true, data: student });
  }),

  create: asyncHandler(async (req: Request<unknown, unknown, CreateStudentInput>, res: Response) => {
    const student = await studentService.create(req.body);
    res.status(201).json({ success: true, data: student });
  }),

  update: asyncHandler(async (req: Request<{ id: string }, unknown, UpdateStudentInput>, res: Response) => {
    const student = await studentService.update(req.params.id, req.body);
    res.json({ success: true, data: student });
  }),

  changeClass: asyncHandler(async (req: Request<{ id: string }, unknown, ChangeClassInput>, res: Response) => {
    await studentService.changeClass(req.params.id, req.body);
    res.json({ success: true });
  }),

  suspend: asyncHandler(async (req: Request<{ id: string }, unknown, SuspendStudentInput>, res: Response) => {
    await studentService.suspendOrExclude(req.params.id, req.body);
    res.json({ success: true });
  }),

  reactivate: asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    await studentService.reactivate(req.params.id);
    res.json({ success: true });
  }),

  delete: asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    await studentService.delete(req.params.id);
    res.json({ success: true });
  }),
};
