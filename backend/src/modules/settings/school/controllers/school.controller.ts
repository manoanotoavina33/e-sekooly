import { Request, Response } from "express";
import { asyncHandler } from "../../../../core/utils/asyncHandler";
import { schoolService } from "../services/school.service";
import {
  CreateSchoolYearInput,
  CreateSemesterInput,
  UpdateSchoolInput,
  UpsertSystemSettingInput,
} from "../validations/school.validation";

export const schoolController = {
  getById: asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    const school = await schoolService.getById(req.params.id);
    res.json({ success: true, data: school });
  }),

  update: asyncHandler(async (req: Request<{ id: string }, unknown, UpdateSchoolInput>, res: Response) => {
    const school = await schoolService.update(req.params.id, req.body);
    res.json({ success: true, data: school });
  }),

  createSchoolYear: asyncHandler(async (req: Request<unknown, unknown, CreateSchoolYearInput>, res: Response) => {
    const year = await schoolService.createSchoolYear(req.body);
    res.status(201).json({ success: true, data: year });
  }),

  setCurrentSchoolYear: asyncHandler(async (req: Request<{ id: string; yearId: string }>, res: Response) => {
    await schoolService.setCurrentSchoolYear(req.params.id, req.params.yearId);
    res.json({ success: true });
  }),

  createSemester: asyncHandler(async (req: Request<unknown, unknown, CreateSemesterInput>, res: Response) => {
    const semester = await schoolService.createSemester(req.body);
    res.status(201).json({ success: true, data: semester });
  }),

  listSettings: asyncHandler(async (req: Request<{ id: string }>, res: Response) => {
    const settings = await schoolService.listSettings(req.params.id);
    res.json({ success: true, data: settings });
  }),

  upsertSetting: asyncHandler(async (req: Request<unknown, unknown, UpsertSystemSettingInput>, res: Response) => {
    const setting = await schoolService.upsertSetting(req.body.schoolId, req.body.key, req.body.value);
    res.json({ success: true, data: setting });
  }),
};
