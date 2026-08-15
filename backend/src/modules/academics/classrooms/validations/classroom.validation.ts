import { z } from "zod";

export const createClassRoomSchema = z.object({
  schoolId: z.string().uuid(),
  name: z.string().min(1, "Nom de classe requis"),
  level: z.string().min(1, "Niveau requis"),
  track: z.string().optional(),
  section: z.string().optional(),
  room: z.string().optional(),
  capacity: z.number().int().positive().default(40),
  homeroomTeacherId: z.string().uuid().optional(),
});
export type CreateClassRoomInput = z.infer<typeof createClassRoomSchema>;

export const updateClassRoomSchema = createClassRoomSchema.partial().omit({ schoolId: true });
export type UpdateClassRoomInput = z.infer<typeof updateClassRoomSchema>;

export const listClassRoomsQuerySchema = z.object({
  schoolId: z.string().uuid(),
  search: z.string().optional(),
});
export type ListClassRoomsQuery = z.infer<typeof listClassRoomsQuerySchema>;
