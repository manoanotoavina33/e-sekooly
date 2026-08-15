import { z } from "zod";

export const createFinancialAidSchema = z
  .object({
    schoolId: z.string().uuid(),
    studentId: z.string().uuid(),
    type: z.enum(["SCHOLARSHIP", "DISCOUNT"]),
    label: z.string().min(2, "Libellé requis"),
    percentage: z.number().min(0).max(100).optional(),
    fixedAmount: z.number().positive().optional(),
  })
  .refine((data) => data.percentage !== undefined || data.fixedAmount !== undefined, {
    message: "Indiquez un pourcentage ou un montant fixe",
    path: ["percentage"],
  });
export type CreateFinancialAidInput = z.infer<typeof createFinancialAidSchema>;

export const listFinancialAidQuerySchema = z.object({
  schoolId: z.string().uuid(),
  studentId: z.string().uuid().optional(),
});
export type ListFinancialAidQuery = z.infer<typeof listFinancialAidQuerySchema>;
