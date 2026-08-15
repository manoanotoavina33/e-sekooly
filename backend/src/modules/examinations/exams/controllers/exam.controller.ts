import { Request, Response } from "express";
import { asyncHandler } from "../../../../core/utils/asyncHandler";
import { examService } from "../services/exam.service";
import {
  CreateExamInput,
  CreateExamSessionInput,
  ListExamSessionsQuery,
  ListExamsQuery,
  ValidateDeliberationInput,
} from "../validations/exam.validation";

export const examController = {
  listSessions: asyncHandler(async (req: Request, res: Response) => {
    const sessions = await examService.listSessions(req.query as unknown as ListExamSessionsQuery);
    res.json({ success: true, data: sessions });
  }),

  getSessionById: asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    const session = await examService.getSessionById(req.params.id);
    res.json({ success: true, data: session });
  }),

  createSession: asyncHandler(async (req: Request<unknown, unknown, CreateExamSessionInput>, res: Response) => {
    const session = await examService.createSession(req.body);
    res.status(201).json({ success: true, data: session });
  }),

  validateDeliberation: asyncHandler(
    async (req: Request<{ id: string }, unknown, ValidateDeliberationInput>, res: Response) => {
      const session = await examService.validateDeliberation(req.params.id, req.body.status);
      res.json({ success: true, data: session });
    }
  ),

  listExams: asyncHandler(async (req: Request, res: Response) => {
    const exams = await examService.listExams(req.query as unknown as ListExamsQuery);
    res.json({ success: true, data: exams });
  }),

  getExamById: asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    const exam = await examService.getExamById(req.params.id);
    res.json({ success: true, data: exam });
  }),

  createExam: asyncHandler(async (req: Request<unknown, unknown, CreateExamInput>, res: Response) => {
    const exam = await examService.createExam(req.body);
    res.status(201).json({ success: true, data: exam });
  }),
};
