import { z } from "zod";

export const createPaymentSchema = z.object({
  invoiceId: z.string().uuid(),
  amount: z.number().positive("Le montant doit être positif"),
  method: z.enum(["CASH", "MOBILE_MONEY", "BANK_TRANSFER", "CARD", "CHEQUE"]).default("CASH"),
  note: z.string().optional(),
});
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

export const listPaymentsQuerySchema = z.object({
  invoiceId: z.string().uuid().optional(),
  schoolId: z.string().uuid().optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).optional(),
});
export type ListPaymentsQuery = z.infer<typeof listPaymentsQuerySchema>;
export const quickPaymentSchema = z.object({
  schoolId: z.string().uuid(),
  studentId: z.string().uuid(),
  amount: z.number().positive("Le montant doit être positif"),
  method: z.enum(["CASH", "MOBILE_MONEY", "BANK_TRANSFER", "CARD", "CHEQUE"]).default("CASH"),
  motif: z.string().min(1, "Motif requis"),
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().min(2000).optional(),
  note: z.string().optional(),
  invoiceId: z.string().uuid().optional(),
});
export type QuickPaymentInput = z.infer<typeof quickPaymentSchema>;
