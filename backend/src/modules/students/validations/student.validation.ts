import { z } from "zod";

export const createStudentSchema = z.object({
  schoolId: z.string().uuid(),
  classRoomId: z.string().uuid().optional(),
  firstName: z.string().min(2, "Prénom requis"),
  lastName: z.string().min(2, "Nom requis"),
  gender: z.enum(["MALE", "FEMALE"]),
  dateOfBirth: z.coerce.date(),
  placeOfBirth: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
});
export type CreateStudentInput = z.infer<typeof createStudentSchema>;

export const updateStudentSchema = createStudentSchema.partial().extend({
  status: z.enum(["ACTIVE", "SUSPENDED", "EXCLUDED", "GRADUATED", "TRANSFERRED", "ARCHIVED"]).optional(),
});
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;

export const changeClassSchema = z.object({
  classRoomId: z.string().uuid(),
  reason: z.string().optional(),
});
export type ChangeClassInput = z.infer<typeof changeClassSchema>;

export const suspendStudentSchema = z.object({
  reason: z.string().min(3, "Motif requis"),
  type: z.enum(["SUSPENSION", "EXCLUSION"]),
});
export type SuspendStudentInput = z.infer<typeof suspendStudentSchema>;

export const listStudentsQuerySchema = z.object({
  schoolId: z.string().uuid().optional(),
  classRoomId: z.string().uuid().optional(),
  status: z.enum(["ACTIVE", "SUSPENDED", "EXCLUDED", "GRADUATED", "TRANSFERRED", "ARCHIVED"]).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type ListStudentsQuery = z.infer<typeof listStudentsQuerySchema>;
