import { useAuthStore } from "./useAuthStore";

export function useEffectiveSchoolId(): string {
  const user = useAuthStore((s) => s.user);
  const selectedSchoolId = useAuthStore((s) => s.selectedSchoolId);
  return user?.schoolId ?? selectedSchoolId ?? "";
}
