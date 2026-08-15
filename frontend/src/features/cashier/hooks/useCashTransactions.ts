import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type CashTransactionType = "IN" | "OUT";
export type CashTransactionStatus = "PENDING" | "VALIDATED" | "REJECTED";

export interface CashTransaction {
  id: string;
  type: CashTransactionType;
  amount: number;
  category: string;
  description: string | null;
  status: CashTransactionStatus;
  receiptNo: string;
  createdAt: string;
}

export function useCashTransactions(cashSessionId?: string) {
  return useQuery({
    queryKey: ["cash-transactions", cashSessionId],
    enabled: Boolean(cashSessionId),
    queryFn: async () => {
      const { data } = await api.get("/cashier/transactions", { params: { cashSessionId } });
      return data.data as CashTransaction[];
    },
  });
}

export function useRecordCashTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      cashSessionId: string;
      type: CashTransactionType;
      amount: number;
      category: string;
      description?: string;
    }) => {
      const { data } = await api.post("/cashier/transactions", payload);
      return data.data as CashTransaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["cash-session"] });
    },
  });
}

export function useValidateCashTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "VALIDATED" | "REJECTED" }) => {
      const { data } = await api.patch(`/cashier/transactions/${id}/validate`, { status });
      return data.data as CashTransaction;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["cash-session"] });
    },
  });
}

export async function downloadCashReceiptPdf(id: string, format: "58mm" | "80mm" | "A4") {
  const { data } = await api.get(`/cashier/transactions/${id}/receipt`, {
    params: { format },
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([data], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `recu-caisse-${format}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
