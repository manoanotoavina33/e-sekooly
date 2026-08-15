import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface Subject {
  id: string;
  name: string;
  coefficient: number;
  hoursPerWeek: number;
  program: string | null;
}

export function useSubjects(schoolId: string, search?: string) {
  return useQuery({
    queryKey: ["subjects", schoolId, search],
    enabled: Boolean(schoolId),
    queryFn: async () => {
      const { data } = await api.get("/subjects", { params: { schoolId, search } });
      return data.data as Subject[];
    },
  });
}

export interface CreateSubjectPayload {
  schoolId: string;
  name: string;
  coefficient?: number;
  hoursPerWeek?: number;
  program?: string;
}

export type UpdateSubjectPayload = Partial<CreateSubjectPayload>;

export function useCreateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateSubjectPayload) => {
      const { data } = await api.post("/subjects", payload);
      return data.data as Subject;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["subjects"] }),
  });
}

export function useUpdateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateSubjectPayload }) => {
      const { data } = await api.patch(`/subjects/${id}`, payload);
      return data.data as Subject;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["subjects"] }),
  });
}

export function useDeleteSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/subjects/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["subjects"] }),
  });
}
