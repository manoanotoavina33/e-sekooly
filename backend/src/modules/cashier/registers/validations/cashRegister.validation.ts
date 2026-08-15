import { z } from "zod";

export const createCashRegisterSchema = z.object({
  schoolId: z.string().uuid(),
  name: z.string().min(1, "Nom requis"),
  location: z.string().optional(),
});
export type CreateCashRegisterInput = z.infer<typeof createCashRegisterSchema>;

export const listCashRegistersQuerySchema = z.object({
  schoolId: z.string().uuid(),
});
export type ListCashRegistersQuery = z.infer<typeof listCashRegistersQuerySchema>;
