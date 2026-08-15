import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type PaymentMethod = "CASH" | "MOBILE_MONEY" | "BANK_TRANSFER" | "CARD" | "CHEQUE";

export interface PaymentRecord {
  id: string;
  receiptNo: string;
  amount: number;
  method: PaymentMethod;
  note?: string | null;
  paidAt: string;
  invoice: {
    invoiceNo: string;
    student: { firstName: string; lastName: string; registrationNo: string };
    feeCategory: { name: string };
  };
}

export interface StudentPaymentStatusItem {
  id: string;
  firstName: string;
  lastName: string;
  registrationNo: string;
  classRoom: { name: string } | null;
  hasPaid: boolean;
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      invoiceId: string;
      amount: number;
      method: PaymentMethod;
      note?: string;
    }) => {
      const { data } = await api.post("/finance/payments", payload);
      return data.data as PaymentRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["finance-summary"] });
      queryClient.invalidateQueries({ queryKey: ["cash-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["cash-session"] });
      queryClient.invalidateQueries({ queryKey: ["all-payments"] });
      queryClient.invalidateQueries({ queryKey: ["student-payment-status"] });
    },
  });
}

export function useRecordQuickPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      schoolId: string;
      studentId: string;
      amount: number;
      method: PaymentMethod;
      motif: string;
      month?: number;
      year?: number;
      note?: string;
      invoiceId?: string;
    }) => {
      const { data } = await api.post("/finance/payments/quick", payload);
      return data.data as PaymentRecord;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["finance-summary"] });
      queryClient.invalidateQueries({ queryKey: ["cash-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["cash-session"] });
      queryClient.invalidateQueries({ queryKey: ["cash-session-journal"] });
      queryClient.invalidateQueries({ queryKey: ["all-payments"] });
      queryClient.invalidateQueries({ queryKey: ["student-payment-status"] });
    },
  });
}

export async function downloadReceiptPdf(paymentId: string) {
  const { data } = await api.get(`/finance/payments/${paymentId}/receipt`, { responseType: "blob" });
  const url = window.URL.createObjectURL(new Blob([data], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `recu-${paymentId}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export function useStudentPaymentHistory(studentId?: string) {
  return useQuery({
    queryKey: ["student-payments", studentId],
    enabled: Boolean(studentId),
    queryFn: async () => {
      const { data } = await api.get(`/finance/payments`, { params: { studentId } });
      return data.data as PaymentRecord[];
    },
  });
}

/** Liste de tous les paiements d'une école (avec filtres optionnels mois/année) */
export function useAllPayments(schoolId: string, month?: number, year?: number) {
  return useQuery({
    queryKey: ["all-payments", schoolId, month, year],
    enabled: Boolean(schoolId),
    queryFn: async () => {
      const { data } = await api.get("/finance/payments", {
        params: { schoolId, month, year },
      });
      return data.data as PaymentRecord[];
    },
  });
}

/** Suivi élèves payés / non payés pour un mois donné */
export function useStudentPaymentStatus(schoolId: string, month: number, year: number) {
  return useQuery({
    queryKey: ["student-payment-status", schoolId, month, year],
    enabled: Boolean(schoolId),
    queryFn: async () => {
      const { data } = await api.get("/finance/payments/students-status", {
        params: { schoolId, month, year },
      });
      return data.data as StudentPaymentStatusItem[];
    },
  });
}
