import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type Weekday = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY";

export interface TimetableSlot {
  id: string;
  dayOfWeek: Weekday;
  startTime: string;
  endTime: string;
  room: string | null;
  classRoom: { id: string; name: string };
  subject: { id: string; name: string };
  teacher: { id: string; user: { firstName: string; lastName: string } };
}

export function useTimetable(schoolId: string, classRoomId?: string) {
  return useQuery({
    queryKey: ["timetable", schoolId, classRoomId],
    enabled: Boolean(schoolId),
    queryFn: async () => {
      const { data } = await api.get("/timetable", { params: { schoolId, classRoomId } });
      return data.data as TimetableSlot[];
    },
  });
}

export interface CreateSlotPayload {
  schoolId: string;
  classRoomId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: Weekday;
  startTime: string;
  endTime: string;
  room?: string;
}

export function useCreateTimetableSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateSlotPayload) => {
      const { data } = await api.post("/timetable", payload);
      return data.data as TimetableSlot;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["timetable"] }),
  });
}

export function useDeleteTimetableSlot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/timetable/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["timetable"] }),
  });
}

/**
 * Télécharge le PDF de l'emploi du temps via le client API authentifié
 * (le endpoint étant protégé par JWT, un simple lien <a href> ne suffirait
 * pas à transmettre le token) puis déclenche le téléchargement navigateur.
 */
export async function downloadTimetablePdf(schoolId: string, classRoomId?: string) {
  const { data } = await api.get("/timetable/export/pdf", {
    params: { schoolId, classRoomId },
    responseType: "blob",
  });
  const url = window.URL.createObjectURL(new Blob([data], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "emploi-du-temps.pdf";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
