import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface Student {
  id: string;
  registrationNo: string;
  firstName: string;
  lastName: string;
  gender: "MALE" | "FEMALE";
  dateOfBirth: string;
  placeOfBirth?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  status: "ACTIVE" | "SUSPENDED" | "EXCLUDED" | "GRADUATED" | "TRANSFERRED" | "ARCHIVED";
  classRoom: { id: string; name: string } | null;
  photoUrl: string | null;
}

interface StudentListParams {
  schoolId: string;
  search?: string;
  classRoomId?: string;
  status?: Student["status"];
  page?: number;
  pageSize?: number;
}

export function useStudents(params: StudentListParams) {
  return useQuery({
    queryKey: ["students", params],
    enabled: Boolean(params.schoolId),
    queryFn: async () => {
      const queryParams = { ...params };
      if (!queryParams.classRoomId) {
        delete queryParams.classRoomId;
      }
      if (!queryParams.search) {
        delete queryParams.search;
      }
      const { data } = await api.get("/students", { params: queryParams });
      return data as { data: Student[]; meta: { total: number; page: number; pageSize: number } };
    },
  });
}

export interface CreateStudentPayload {
  schoolId: string;
  classRoomId?: string;
  firstName: string;
  lastName: string;
  gender: "MALE" | "FEMALE";
  dateOfBirth: string;
  placeOfBirth?: string;
  address?: string;
  phone?: string;
}

export interface UpdateStudentPayload extends Partial<CreateStudentPayload> {
  email?: string;
  status?: Student["status"];
}

export function useCreateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateStudentPayload) => {
      const { data } = await api.post("/students", payload);
      return data.data as Student;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateStudentPayload }) => {
      const { data } = await api.patch(`/students/${id}`, payload);
      return data.data as Student;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/students/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}
