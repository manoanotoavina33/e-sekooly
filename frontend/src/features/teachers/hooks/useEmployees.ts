import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface Employee {
  id: string;
  employeeNo: string;
  position: string;
  department: string | null;
  hireDate: string;
  degrees?: string | null;
  isActive: boolean;
  user: { firstName: string; lastName: string; email: string };
  contracts: { type: string; baseSalary: number; status: string }[];
}

interface EmployeeListParams {
  schoolId: string;
  search?: string;
  department?: string;
  page?: number;
  pageSize?: number;
}

export function useEmployees(params: EmployeeListParams) {
  return useQuery({
    queryKey: ["employees", params],
    enabled: Boolean(params.schoolId),
    queryFn: async () => {
      const { data } = await api.get("/employees", { params });
      return data as { data: Employee[]; meta: { total: number; page: number; pageSize: number } };
    },
  });
}

export interface CreateEmployeePayload {
  schoolId: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  position: string;
  department?: string;
  hireDate: string;
  degrees?: string;
  isTeacher: boolean;
}

export interface UpdateEmployeePayload {
  position?: string;
  department?: string;
  hireDate?: string;
  degrees?: string;
  isActive?: boolean;
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateEmployeePayload) => {
      const { data } = await api.post("/employees", payload);
      return data.data as Employee;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateEmployeePayload }) => {
      const { data } = await api.patch(`/employees/${id}`, payload);
      return data.data as Employee;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/employees/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });
}

export function useTeacherCount(schoolId: string) {
  return useQuery({
    queryKey: ["teacher-count", schoolId],
    enabled: Boolean(schoolId),
    staleTime: 1000 * 60, // 1 minute cache — dynamic refresh
    queryFn: async () => {
      const { data } = await api.get("/employees/count/active", { params: { schoolId } });
      return data.data.count as number;
    },
  });
}
