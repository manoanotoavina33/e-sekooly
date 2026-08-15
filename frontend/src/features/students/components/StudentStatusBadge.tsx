import { cn } from "@/lib/utils";
import { Student } from "../hooks/useStudents";

const STYLES: Record<Student["status"], string> = {
  ACTIVE: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300",
  SUSPENDED: "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300",
  EXCLUDED: "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300",
  GRADUATED: "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-300",
  TRANSFERRED: "bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300",
  ARCHIVED: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
};

const LABELS: Record<Student["status"], string> = {
  ACTIVE: "Actif",
  SUSPENDED: "Suspendu",
  EXCLUDED: "Exclu",
  GRADUATED: "Diplômé",
  TRANSFERRED: "Transféré",
  ARCHIVED: "Archivé",
};

export function StudentStatusBadge({ status }: { status: Student["status"] }) {
  return (
    <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", STYLES[status])}>
      {LABELS[status]}
    </span>
  );
}
