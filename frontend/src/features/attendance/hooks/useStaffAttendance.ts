import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AttendanceStatus } from "./useStudentAttendance";

export interface StaffAttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  status: AttendanceStatus;
  checkIn: string | null;
  checkOut: string | null;
  employee: { user: { firstName: string; lastName: string } };
}

export function useStaffAttendance(params: { schoolId: string; from?: string; to?: string }) {
  return useQuery({
    queryKey: ["staff-attendance", params],
    enabled: Boolean(params.schoolId),
    queryFn: async () => {
      const { data } = await api.get("/attendance/staff", { params });
      return data.data as StaffAttendanceRecord[];
    },
  });
}

export function useStaffCheckin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (employeeId: string) => {
      const { data } = await api.post("/attendance/staff/checkin", { employeeId });
      return data.data as StaffAttendanceRecord;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff-attendance"] }),
  });
}

export function useStaffCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (employeeId: string) => {
      const { data } = await api.post("/attendance/staff/checkout", { employeeId });
      return data.data as StaffAttendanceRecord;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff-attendance"] }),
  });
}
