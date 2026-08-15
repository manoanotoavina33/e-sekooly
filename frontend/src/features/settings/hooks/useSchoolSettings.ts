import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface Semester {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
}

export interface SchoolYear {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  semesters: Semester[];
}

export interface School {
  id: string;
  name: string;
  shortName: string | null;
  logoUrl: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  currency: string;
  timezone: string;
  schoolYears: SchoolYear[];
}

export function useSchool(schoolId: string) {
  return useQuery({
    queryKey: ["school", schoolId],
    enabled: Boolean(schoolId),
    queryFn: async () => {
      const { data } = await api.get(`/schools/${schoolId}`);
      return data.data as School;
    },
  });
}

export function useUpdateSchool(schoolId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Pick<School, "name" | "shortName" | "address" | "phone" | "email" | "website" | "currency" | "timezone">>) => {
      const { data } = await api.patch(`/schools/${schoolId}`, payload);
      return data.data as School;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["school", schoolId] }),
  });
}

export function useCreateSchoolYear(schoolId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { label: string; startDate: string; endDate: string }) => {
      const { data } = await api.post("/schools/school-years", { schoolId, ...payload });
      return data.data as SchoolYear;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["school", schoolId] }),
  });
}

export function useSetCurrentSchoolYear(schoolId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (yearId: string) => {
      await api.post(`/schools/${schoolId}/school-years/${yearId}/set-current`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["school", schoolId] }),
  });
}

export function useCreateSemester(schoolId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { schoolYearId: string; label: string; startDate: string; endDate: string }) => {
      const { data } = await api.post("/schools/semesters", payload);
      return data.data as Semester;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["school", schoolId] }),
  });
}
