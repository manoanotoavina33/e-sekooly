import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useAuthStore } from "@/hooks/useAuthStore";
import { useEffectiveSchoolId } from "@/hooks/useEffectiveSchoolId";
import { useSchools } from "@/hooks/useSchools";
import { School } from "lucide-react";

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const selectSchool = useAuthStore((s) => s.selectSchool);
  const schoolId = useEffectiveSchoolId();
  const { data: schools } = useSchools();

  if (!schoolId && schools && schools.length > 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cloud-50 p-4 dark:bg-ink-900">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-ink-700 dark:bg-ink-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
              <School className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                Sélectionnez un établissement
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Choisissez l'école à gérer.
              </p>
            </div>
          </div>
          <select
            onChange={(e) => {
              if (e.target.value) selectSchool(e.target.value);
            }}
            className="mt-4 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-sky-400 dark:border-ink-700 dark:bg-ink-900 dark:text-white"
            defaultValue=""
          >
            <option value="" disabled>
              -- Choisir un établissement --
            </option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.shortName})
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-cloud-50 dark:bg-ink-900">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
