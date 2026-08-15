import { z } from "zod";

export const openCashSessionSchema = z.object({
  cashRegisterId: z.string().uuid(),
  openingBalance: z.number().nonnegative(),
});
export type OpenCashSessionInput = z.infer<typeof openCashSessionSchema>;

export const closeCashSessionSchema = z.object({
  declaredClosingBalance: z.number().nonnegative(),
});
export type CloseCashSessionInput = z.infer<typeof closeCashSessionSchema>;

export const listCashSessionsQuerySchema = z.object({
  cashRegisterId: z.string().uuid().optional(),
  status: z.enum(["OPEN", "CLOSED"]).optional(),
});
export type ListCashSessionsQuery = z.infer<typeof listCashSessionsQuerySchema>;
