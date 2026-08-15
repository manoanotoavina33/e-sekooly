import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import type { Student } from "@/features/students/hooks/useStudents";
import type { Invoice } from "@/features/finance/invoices/hooks/useInvoices";

/** Search students by name or registration number */
export function useStudentSearch(schoolId: string, search: string) {
  return useQuery({
    queryKey: ["students-search", schoolId, search],
    enabled: Boolean(schoolId) && search.length >= 2,
    queryFn: async () => {
      const { data } = await api.get("/students", {
        params: { schoolId, search, pageSize: 10, page: 1 },
      });
      return (data.data ?? []) as Student[];
    },
  });
}

/** Get all pending / partial invoices for a student */
export function useStudentPendingInvoices(studentId?: string, schoolId?: string) {
  return useQuery({
    queryKey: ["student-pending-invoices", studentId],
    enabled: Boolean(studentId) && Boolean(schoolId),
    queryFn: async () => {
      const { data } = await api.get("/finance/invoices", {
        params: { studentId, schoolId, status: "PENDING" },
      });
      const partial = await api.get("/finance/invoices", {
        params: { studentId, schoolId, status: "PARTIAL" },
      });
      return [...(data.data ?? []), ...(partial.data ?? [])] as Invoice[];
    },
  });
}

/** Get all fee categories for the school */
export function useFeeCategories(schoolId?: string) {
  return useQuery({
    queryKey: ["fee-categories", schoolId],
    enabled: Boolean(schoolId),
    queryFn: async () => {
      const { data } = await api.get("/finance/fee-categories", {
        params: { schoolId },
      });
      return (data.data ?? []) as { id: string; name: string }[];
    },
  });
}
