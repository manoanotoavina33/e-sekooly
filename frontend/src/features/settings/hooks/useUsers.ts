import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface Role {
  id: string;
  name: string;
  label: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isActive: boolean;
  roles: { role: Role }[];
  createdAt: string;
}

export function useUsers(schoolId?: string, search?: string) {
  return useQuery({
    queryKey: ["users", schoolId, search],
    enabled: Boolean(schoolId),
    queryFn: async () => {
      const { data } = await api.get("/users", { params: { schoolId, search } });
      return data.data as User[];
    },
  });
}

export function useRoles() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const { data } = await api.get("/users/roles");
      return data.data as Role[];
    },
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      schoolId: string;
      firstName: string;
      lastName: string;
      email: string;
      password?: string;
      roleIds: string[];
      isActive?: boolean;
    }) => {
      const { data } = await api.post("/users", payload);
      return data.data as User;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: {
      id: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      roleIds?: string[];
      isActive?: boolean;
    }) => {
      const { data } = await api.patch(`/users/${id}`, payload);
      return data.data as User;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/users/${id}`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
