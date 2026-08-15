import { z } from "zod";

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const createTimetableSlotSchema = z
  .object({
    schoolId: z.string().uuid(),
    classRoomId: z.string().uuid(),
    subjectId: z.string().uuid(),
    teacherId: z.string().uuid(),
    dayOfWeek: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]),
    startTime: z.string().regex(timeRegex, "Format attendu HH:mm"),
    endTime: z.string().regex(timeRegex, "Format attendu HH:mm"),
    room: z.string().optional(),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "L'heure de fin doit être après l'heure de début",
    path: ["endTime"],
  });
export type CreateTimetableSlotInput = z.infer<typeof createTimetableSlotSchema>;

export const updateTimetableSlotSchema = z.object({
  dayOfWeek: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]).optional(),
  startTime: z.string().regex(timeRegex).optional(),
  endTime: z.string().regex(timeRegex).optional(),
  room: z.string().optional(),
  teacherId: z.string().uuid().optional(),
});
export type UpdateTimetableSlotInput = z.infer<typeof updateTimetableSlotSchema>;

export const listTimetableQuerySchema = z.object({
  schoolId: z.string().uuid(),
  classRoomId: z.string().uuid().optional(),
  teacherId: z.string().uuid().optional(),
});
export type ListTimetableQuery = z.infer<typeof listTimetableQuerySchema>;
