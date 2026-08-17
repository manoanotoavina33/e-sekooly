import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type ExamType = "DEVOIR" | "COMPOSITION" | "EXAM_BLANC" | "EXAM_OFFICIEL";

export interface ExamSession {
  id: string;
  label: string;
  type: ExamType;
  startDate: string;
  endDate: string;
  deliberationStatus: "PENDING" | "VALIDATED";
  _count?: { exams: number };
}

export function useExamSessions(schoolId: string) {
  return useQuery({
    queryKey: ["exam-sessions", schoolId],
    enabled: Boolean(schoolId),
    queryFn: async () => {
      const { data } = await api.get("/exams/sessions", { params: { schoolId } });
      return data.data as ExamSession[];
    },
  });
}

export function useCreateExamSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { schoolId: string; label: string; semesterId: string; type: ExamType; startDate: string; endDate: string }) => {
      const { data } = await api.post("/exams/sessions", payload);
      return data.data as ExamSession;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exam-sessions"] }),
  });
}

export interface Exam {
  id: string;
  date: string;
  room: string | null;
  maxScore: number;
  subject: { id: string; name: string; coefficient: number };
  classRoom: { id: string; name: string };
  _count?: { grades: number };
}

export function useExams(examSessionId?: string) {
  return useQuery({
    queryKey: ["exams", examSessionId],
    enabled: Boolean(examSessionId),
    queryFn: async () => {
      const { data } = await api.get("/exams", { params: { examSessionId } });
      return data.data as Exam[];
    },
  });
}

export function useCreateExam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      examSessionId: string;
      subjectId: string;
      classRoomId: string;
      date: string;
      room?: string;
      maxScore?: number;
    }) => {
      const { data } = await api.post("/exams", payload);
      return data.data as Exam;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["exams"] }),
  });
}
