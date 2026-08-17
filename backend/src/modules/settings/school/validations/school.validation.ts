import { z } from "zod";

export const updateSchoolSchema = z.object({
  name: z.string().min(1).optional(),
  shortName: z.string().optional(),
  logoUrl: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  website: z.string().optional(),
  currency: z.string().length(3).optional(),
  timezone: z.string().optional(),
  schoolTypes: z.array(z.enum(["PRIMARY", "COLLEGE", "LYCEE", "UNIVERSITE"])).optional(),
});
export type UpdateSchoolInput = z.infer<typeof updateSchoolSchema>;

export const createSchoolYearSchema = z.object({
  schoolId: z.string().uuid(),
  label: z.string().min(4, "Libellé requis (ex: 2026-2027)"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});
export type CreateSchoolYearInput = z.infer<typeof createSchoolYearSchema>;

export const createSemesterSchema = z.object({
  schoolYearId: z.string().uuid(),
  label: z.string().min(1, "Libellé requis"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
});
export type CreateSemesterInput = z.infer<typeof createSemesterSchema>;

export const upsertSystemSettingSchema = z.object({
  schoolId: z.string().uuid(),
  key: z.string().min(1),
  value: z.string(),
});
export type UpsertSystemSettingInput = z.infer<typeof upsertSystemSettingSchema>;
