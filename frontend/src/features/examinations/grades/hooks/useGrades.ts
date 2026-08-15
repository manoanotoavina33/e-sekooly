import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface Grade {
  id: string;
  studentId: string;
  score: number;
  comment: string | null;
  student: { firstName: string; lastName: string; registrationNo: string };
}

export function useGrades(examId?: string) {
  return useQuery({
    queryKey: ["grades", examId],
    enabled: Boolean(examId),
    queryFn: async () => {
      const { data } = await api.get("/grades", { params: { examId } });
      return data.data as Grade[];
    },
  });
}

export function useSaveGrades() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { examId: string; entries: { studentId: string; score: number }[] }) => {
      const { data } = await api.post("/grades/bulk", payload);
      return data.data as Grade[];
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["grades"] }),
  });
}
