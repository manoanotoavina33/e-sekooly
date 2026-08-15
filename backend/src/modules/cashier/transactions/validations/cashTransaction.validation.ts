import { z } from "zod";

export const createCashTransactionSchema = z.object({
  cashSessionId: z.string().uuid(),
  type: z.enum(["IN", "OUT"]),
  amount: z.number().positive("Le montant doit être positif"),
  category: z.string().min(1, "Catégorie requise"),
  description: z.string().optional(),
});
export type CreateCashTransactionInput = z.infer<typeof createCashTransactionSchema>;

export const validateCashTransactionSchema = z.object({
  status: z.enum(["VALIDATED", "REJECTED"]),
});
export type ValidateCashTransactionInput = z.infer<typeof validateCashTransactionSchema>;

export const listCashTransactionsQuerySchema = z.object({
  cashSessionId: z.string().uuid().optional(),
  status: z.enum(["PENDING", "VALIDATED", "REJECTED"]).optional(),
});
export type ListCashTransactionsQuery = z.infer<typeof listCashTransactionsQuerySchema>;

export const receiptFormatQuerySchema = z.object({
  format: z.enum(["58mm", "80mm", "A4"]).default("A4"),
});
export type ReceiptFormatQuery = z.infer<typeof receiptFormatQuerySchema>;
