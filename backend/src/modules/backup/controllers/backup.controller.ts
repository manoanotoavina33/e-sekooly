import { Request, Response } from "express";
import { asyncHandler } from "../../../core/utils/asyncHandler";
import { backupService } from "../services/backup.service";
import { CreateBackupInput, ListBackupsQuery, RestoreBackupInput } from "../validations/backup.validation";

export const backupController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const query = req.query as unknown as ListBackupsQuery;
    const backups = await backupService.list(query.schoolId);
    res.json({ success: true, data: backups });
  }),

  create: asyncHandler(async (req: Request<unknown, unknown, CreateBackupInput>, res: Response) => {
    const { json, fileName } = await backupService.createBackup(req.body.schoolId, req.auth?.userId);
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.send(json);
  }),

  restore: asyncHandler(async (req: Request<unknown, unknown, RestoreBackupInput>, res: Response) => {
    const results = await backupService.restore(req.body);
    res.json({ success: true, data: results });
  }),
};
