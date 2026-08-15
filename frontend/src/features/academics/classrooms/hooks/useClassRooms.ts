import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface ClassRoom {
  id: string;
  name: string;
  level: string;
  track: string | null;
  section: string | null;
  room: string | null;
  capacity: number;
  homeroomTeacher: { user: { firstName: string; lastName: string } } | null;
  _count?: { students: number };
}

export function useClassRooms(schoolId: string, search?: string) {
  return useQuery({
    queryKey: ["classrooms", schoolId, search],
    enabled: Boolean(schoolId),
    queryFn: async () => {
      const { data } = await api.get("/classrooms", { params: { schoolId, search } });
      return data.data as ClassRoom[];
    },
  });
}

export interface CreateClassRoomPayload {
  schoolId: string;
  name: string;
  level: string;
  track?: string;
  section?: string;
  room?: string;
  capacity?: number;
}

export type UpdateClassRoomPayload = Partial<CreateClassRoomPayload>;

export function useCreateClassRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateClassRoomPayload) => {
      const { data } = await api.post("/classrooms", payload);
      return data.data as ClassRoom;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["classrooms"] }),
  });
}

export function useUpdateClassRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UpdateClassRoomPayload }) => {
      const { data } = await api.patch(`/classrooms/${id}`, payload);
      return data.data as ClassRoom;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["classrooms"] }),
  });
}

export function useDeleteClassRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/classrooms/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["classrooms"] }),
  });
}
