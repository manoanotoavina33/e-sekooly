import { Card } from "@/components/ui/Card";
import { BackupPanel } from "@/features/backup/components/BackupPanel";
import { useAuthStore } from "@/hooks/useAuthStore";
import { useEffectiveSchoolId } from "@/hooks/useEffectiveSchoolId";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { SchoolInfoForm } from "./components/SchoolInfoForm";
import { SchoolYearsPanel } from "./components/SchoolYearsPanel";
import { SyncPanel } from "./components/SyncPanel";
import { UsersManagementPanel } from "./components/UsersManagementPanel";
import { useSchool } from "./hooks/useSchoolSettings";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const schoolId = useEffectiveSchoolId();
  const canManageUsers = (user?.permissions ?? []).includes("users.manage");
  const [tab, setTab] = useState<"general" | "years" | "backup" | "sync" | "users">("general");

  const { data: school, isLoading } = useSchool(schoolId);

  const tabs: { key: "general" | "years" | "backup" | "sync" | "users"; label: string }[] = [
    { key: "general", label: "Général" },
    { key: "years", label: "Années scolaires" },
    { key: "backup", label: "Sauvegarde" },
    { key: "sync", label: "Synchronisation" },
  ];
  if (canManageUsers) {
    tabs.push({ key: "users", label: "Utilisateurs" });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Paramètres</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Informations de l'établissement, années scolaires, sauvegarde et synchronisation.
        </p>
      </div>

      <div className="flex gap-2 border-b border-slate-100 dark:border-ink-700">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              tab === t.key
                ? "border-sky-500 text-sky-600 dark:text-sky-400"
                : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading && <Card className="text-center text-sm text-slate-400">Chargement…</Card>}

      {!isLoading && school && (
        <>
          {tab === "general" && <SchoolInfoForm school={school} />}
          {tab === "years" && <SchoolYearsPanel school={school} />}
          {tab === "backup" && <BackupPanel schoolId={schoolId} />}
          {tab === "sync" && <SyncPanel schoolId={schoolId} />}
          {tab === "users" && canManageUsers && <UsersManagementPanel />}
        </>
      )}
    </div>
  );
}
