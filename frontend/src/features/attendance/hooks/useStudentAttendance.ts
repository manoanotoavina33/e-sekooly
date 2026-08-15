import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

export interface StudentAttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: AttendanceStatus;
  method: "QR" | "MANUAL";
  checkInTime: string | null;
  student: { firstName: string; lastName: string; registrationNo: string };
}

export function useStudentAttendance(params: { schoolId: string; classRoomId?: string; from?: string; to?: string }) {
  return useQuery({
    queryKey: ["student-attendance", params],
    enabled: Boolean(params.schoolId),
    queryFn: async () => {
      const { data } = await api.get("/attendance/students", { params });
      return data.data as StudentAttendanceRecord[];
    },
  });
}

export function useBulkMarkStudentAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      schoolId: string;
      classRoomId: string;
      date: string;
      entries: { studentId: string; status: AttendanceStatus }[];
    }) => {
      const { data } = await api.post("/attendance/students/bulk", payload);
      return data.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["student-attendance"] }),
  });
}

export function useCheckinByQr() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { schoolId: string; qrCodeToken: string }) => {
      const { data } = await api.post("/attendance/students/checkin", payload);
      return data.data as StudentAttendanceRecord;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["student-attendance"] }),
  });
}
