import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  schoolId: string | null;
  roles: string[];
  permissions: string[];
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
  selectedSchoolId: string | null;
  setSession: (accessToken: string, user: AuthUser) => void;
  setAccessToken: (accessToken: string) => void;
  selectSchool: (schoolId: string) => void;
  clear: () => void;
  hasPermission: (code: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      selectedSchoolId: null,
      setSession: (accessToken, user) => set({ accessToken, user, selectedSchoolId: user.schoolId }),
      setAccessToken: (accessToken) => set({ accessToken }),
      selectSchool: (schoolId) => set({ selectedSchoolId: schoolId }),
      clear: () => set({ accessToken: null, user: null, selectedSchoolId: null }),
      hasPermission: (code) => {
        const user = get().user;
        if (!user) return false;
        return user.roles.includes("SUPER_ADMIN") || user.permissions.includes(code);
      },
    }),
    { name: "e-sekooly-auth" }
  )
);
