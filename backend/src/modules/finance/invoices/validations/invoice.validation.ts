import { z } from "zod";

export const createInvoiceSchema = z.object({
  schoolId: z.string().uuid(),
  studentId: z.string().uuid(),
  feeCategoryId: z.string().uuid(),
  schoolYearId: z.string().uuid().optional(),
  amount: z.number().positive("Le montant doit être positif"),
  dueDate: z.coerce.date().optional(),
});
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;

export const listInvoicesQuerySchema = z.object({
  schoolId: z.string().uuid(),
  studentId: z.string().uuid().optional(),
  status: z.enum(["PENDING", "PARTIAL", "PAID", "OVERDUE", "CANCELLED"]).optional(),
});
export type ListInvoicesQuery = z.infer<typeof listInvoicesQuerySchema>;
