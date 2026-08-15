import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type InvoiceStatus = "PENDING" | "PARTIAL" | "PAID" | "OVERDUE" | "CANCELLED";

export interface Invoice {
  id: string;
  invoiceNo: string;
  amount: number;
  discountAmount: number;
  dueDate: string | null;
  status: InvoiceStatus;
  student: { firstName: string; lastName: string; registrationNo: string };
  feeCategory: { id: string; name: string };
  payments: { id: string; amount: number }[];
}

export function useInvoices(schoolId: string, studentId?: string, status?: InvoiceStatus) {
  return useQuery({
    queryKey: ["invoices", schoolId, studentId, status],
    enabled: Boolean(schoolId),
    queryFn: async () => {
      const { data } = await api.get("/finance/invoices", { params: { schoolId, studentId, status } });
      return data.data as Invoice[];
    },
  });
}

export interface FinanceSummary {
  totalInvoiced: number;
  totalCollected: number;
  totalOutstanding: number;
  invoiceCount: number;
}

export function useFinanceSummary(schoolId: string) {
  return useQuery({
    queryKey: ["finance-summary", schoolId],
    enabled: Boolean(schoolId),
    queryFn: async () => {
      const { data } = await api.get("/finance/invoices/summary", { params: { schoolId } });
      return data.data as FinanceSummary;
    },
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      schoolId: string;
      studentId: string;
      feeCategoryId: string;
      amount: number;
      dueDate?: string;
    }) => {
      const { data } = await api.post("/finance/invoices", payload);
      return data.data as Invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["finance-summary"] });
    },
  });
}
