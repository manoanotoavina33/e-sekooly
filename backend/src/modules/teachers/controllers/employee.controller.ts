import { Request, Response } from "express";
import { asyncHandler } from "../../../core/utils/asyncHandler";
import { employeeService } from "../services/employee.service";
import {
  AssignSubjectInput,
  CreateEmployeeInput,
  CreateLeaveInput,
  CreateSalaryPaymentInput,
  DecideLeaveInput,
  ListEmployeesQuery,
  UpdateEmployeeInput,
} from "../validations/employee.validation";

export const employeeController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await employeeService.list(req.query as unknown as ListEmployeesQuery);
    res.json({ success: true, data: result.items, meta: { total: result.total, page: result.page, pageSize: result.pageSize } });
  }),

  getById: asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    const employee = await employeeService.getById(req.params.id);
    res.json({ success: true, data: employee });
  }),

  countActive: asyncHandler(async (req: Request, res: Response) => {
    const { schoolId } = req.query as Record<string, string>;
    if (!schoolId) {
      res.status(400).json({ success: false, message: "schoolId est requis" });
      return;
    }
    const count = await employeeService.countActiveTeachers(schoolId);
    res.json({ success: true, data: { count } });
  }),

  create: asyncHandler(async (req: Request<unknown, unknown, CreateEmployeeInput>, res: Response) => {
    const employee = await employeeService.create(req.body);
    res.status(201).json({ success: true, data: employee });
  }),

  update: asyncHandler(async (req: Request<{ id: string }, unknown, UpdateEmployeeInput>, res: Response) => {
    const employee = await employeeService.update(req.params.id, req.body);
    res.json({ success: true, data: employee });
  }),

  delete: asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    await employeeService.delete(req.params.id);
    res.json({ success: true });
  }),

  requestLeave: asyncHandler(async (req: Request<{ id: string }, unknown, CreateLeaveInput>, res: Response) => {
    const leave = await employeeService.requestLeave(req.params.id, req.body);
    res.status(201).json({ success: true, data: leave });
  }),

  decideLeave: asyncHandler(
    async (req: Request<{ id: string; leaveId: string }, unknown, DecideLeaveInput>, res: Response) => {
      const leave = await employeeService.decideLeave(req.params.leaveId, req.body.status, req.auth!.userId);
      res.json({ success: true, data: leave });
    }
  ),

  assignSubject: asyncHandler(async (req: Request<{ id: string }, unknown, AssignSubjectInput>, res: Response) => {
    const assignment = await employeeService.assignSubject(req.params.id, req.body.subjectId, req.body.classRoomId);
    res.status(201).json({ success: true, data: assignment });
  }),

  recordSalaryPayment: asyncHandler(
    async (req: Request<{ id: string }, unknown, CreateSalaryPaymentInput>, res: Response) => {
      const payment = await employeeService.recordSalaryPayment(req.params.id, req.body);
      res.status(201).json({ success: true, data: payment });
    }
  ),
};
