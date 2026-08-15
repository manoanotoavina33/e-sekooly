import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type DisciplineType = "SANCTION" | "REWARD" | "LATENESS" | "OBSERVATION";
export type DisciplineSeverity = "LOW" | "MEDIUM" | "HIGH";

export interface DisciplineRecord {
  id: string;
  type: DisciplineType;
  severity: DisciplineSeverity;
  title: string;
  description: string | null;
  date: string;
  student: { firstName: string; lastName: string; registrationNo: string };
}

export function useDisciplineRecords(schoolId: string, studentId?: string) {
  return useQuery({
    queryKey: ["discipline", schoolId, studentId],
    enabled: Boolean(schoolId),
    queryFn: async () => {
      const { data } = await api.get("/discipline", { params: { schoolId, studentId } });
      return data.data as DisciplineRecord[];
    },
  });
}

export function useCreateDisciplineRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      schoolId: string;
      studentId: string;
      type: DisciplineType;
      severity: DisciplineSeverity;
      title: string;
      description?: string;
    }) => {
      const { data } = await api.post("/discipline", payload);
      return data.data as DisciplineRecord;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["discipline"] }),
  });
}
