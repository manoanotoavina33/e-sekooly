import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface CashRegister {
  id: string;
  name: string;
  location: string | null;
}

export function useCashRegisters(schoolId: string) {
  return useQuery({
    queryKey: ["cash-registers", schoolId],
    enabled: Boolean(schoolId),
    queryFn: async () => {
      const { data } = await api.get("/cashier/registers", { params: { schoolId } });
      return data.data as CashRegister[];
    },
  });
}

export function useCreateCashRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { schoolId: string; name: string; location?: string }) => {
      const { data } = await api.post("/cashier/registers", payload);
      return data.data as CashRegister;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cash-registers"] }),
  });
}

export type CashSessionStatus = "OPEN" | "CLOSED";

export interface CashSession {
  id: string;
  cashRegisterId: string;
  openedAt: string;
  openingBalance: number;
  closedAt: string | null;
  declaredClosingBalance: number | null;
  status: CashSessionStatus;
  cashRegister: CashRegister;
  _count?: { transactions: number };
}

export interface CashSessionDetail extends CashSession {
  totalIn: number;
  totalOut: number;
  expectedBalance: number;
  difference?: number;
}

export function useCashSessions(cashRegisterId?: string, status?: CashSessionStatus) {
  return useQuery({
    queryKey: ["cash-sessions", cashRegisterId, status],
    queryFn: async () => {
      const { data } = await api.get("/cashier/sessions", { params: { cashRegisterId, status } });
      return data.data as CashSession[];
    },
  });
}

export function useCashSessionDetail(id?: string) {
  return useQuery({
    queryKey: ["cash-session", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data } = await api.get(`/cashier/sessions/${id}`);
      return data.data as CashSessionDetail;
    },
  });
}

export function useOpenCashSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { cashRegisterId: string; openingBalance: number }) => {
      const { data } = await api.post("/cashier/sessions/open", payload);
      return data.data as CashSession;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cash-sessions"] }),
  });
}

export function useCloseCashSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, declaredClosingBalance }: { id: string; declaredClosingBalance: number }) => {
      const { data } = await api.post(`/cashier/sessions/${id}/close`, { declaredClosingBalance });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cash-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["cash-session"] });
    },
  });
}

// ──────────────────────────────────────────
// Journal enrichi des paiements d'une session
// ──────────────────────────────────────────

export interface JournalEntry {
  id: string;
  receiptNo: string;
  amount: number;
  method: string;
  paidAt: string;
  studentName: string;
  studentRegistrationNo: string;
  className: string | null;
  feeCategoryName: string;
  invoiceNo: string;
  invoiceId: string;
  /** Ex: "Août 2026" si écolage/formation */
  coveredMonth: string | null;
  coveredMonthNum: number | null;
  coveredYear: number | null;
}

export interface JournalFilters {
  category?: string;
  month?: number;
  year?: number;
  limit?: number;
}

export function useCashSessionJournal(sessionId?: string, filters: JournalFilters = {}) {
  return useQuery({
    queryKey: ["cash-session-journal", sessionId, filters],
    enabled: Boolean(sessionId),
    queryFn: async () => {
      const params: Record<string, string | number> = { limit: filters.limit ?? 10 };
      if (filters.category) params.category = filters.category;
      if (filters.month != null) params.month = filters.month;
      if (filters.year != null) params.year = filters.year;
      const { data } = await api.get(`/cashier/sessions/${sessionId}/journal`, { params });
      return data.data as JournalEntry[];
    },
  });
}
