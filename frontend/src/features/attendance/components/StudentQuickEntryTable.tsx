import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { useStudents } from "@/features/students/hooks/useStudents";
import { useMemo, useState } from "react";
import {
  AttendanceStatus,
  useBulkMarkStudentAttendance,
  useStudentAttendance,
} from "../hooks/useStudentAttendance";
import { Check, Edit2, UserCheck, UserX } from "lucide-react";

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; className: string }[] = [
  { value: "PRESENT", label: "Présent", className: "bg-emerald-500" },
  { value: "LATE", label: "Retard", className: "bg-amber-500" },
  { value: "ABSENT", label: "Absent", className: "bg-red-500" },
  { value: "EXCUSED", label: "Excusé", className: "bg-violet-500" },
];

const STATUS_BADGES: Record<AttendanceStatus, { label: string; badgeClass: string }> = {
  PRESENT: { label: "Présent", badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" },
  LATE: { label: "Retard", badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300" },
  ABSENT: { label: "Absent", badgeClass: "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300" },
  EXCUSED: { label: "Excusé", badgeClass: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300" },
};

export function StudentQuickEntryTable({
  schoolId,
  classRoomId,
  date,
}: {
  schoolId: string;
  classRoomId: string;
  date: string;
}) {
  const { data: studentsData } = useStudents({ schoolId, classRoomId, pageSize: 100 });
  const allStudents = studentsData?.data ?? [];

  // Récupérer la liste des pointages enregistrés pour ce jour et cette classe
  const { data: attendanceRecords } = useStudentAttendance({
    schoolId,
    classRoomId,
    from: date,
    to: date,
  });

  const bulkMark = useBulkMarkStudentAttendance();
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Map des pointages existants par ID élève
  const existingAttendanceMap = useMemo(() => {
    const map = new Map<string, AttendanceStatus>();
    (attendanceRecords ?? []).forEach((r) => {
      map.set(r.studentId, r.status);
    });
    return map;
  }, [attendanceRecords]);

  // Élèves non encore pointés aujourd'hui
  const unmarkedStudents = useMemo(() => {
    return allStudents.filter((s) => !existingAttendanceMap.has(s.id));
  }, [allStudents, existingAttendanceMap]);

  // Élèves déjà pointés aujourd'hui
  const markedStudents = useMemo(() => {
    return allStudents.filter((s) => existingAttendanceMap.has(s.id));
  }, [allStudents, existingAttendanceMap]);

  const entriesToSave = useMemo(
    () =>
      unmarkedStudents.map((s) => ({
        studentId: s.id,
        status: statuses[s.id] ?? ("PRESENT" as AttendanceStatus),
      })),
    [unmarkedStudents, statuses]
  );

  async function handleSaveUnmarked() {
    if (entriesToSave.length === 0) return;
    setSaved(false);
    await bulkMark.mutateAsync({ schoolId, classRoomId, date, entries: entriesToSave });
    setSaved(true);
    setStatuses({});
  }

  async function handleUpdateSingle(studentId: string, newStatus: AttendanceStatus) {
    await bulkMark.mutateAsync({
      schoolId,
      classRoomId,
      date,
      entries: [{ studentId, status: newStatus }],
    });
    setEditingStudentId(null);
  }

  if (!classRoomId) {
    return (
      <Card className="text-center text-sm text-slate-400">
        Sélectionnez une classe pour commencer le pointage.
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── SECTION 1: Élèves à pointer (Non encore enregistrés aujourd'hui) ── */}
      <Card className="flex flex-col gap-4 p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 dark:border-ink-700">
          <div>
            <h3 className="font-display text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <UserX className="h-4 w-4 text-amber-500" />
              Élèves à pointer aujourd'hui ({unmarkedStudents.length})
            </h3>
            <p className="text-xs text-slate-400">
              Une fois enregistrés, les élèves passent automatiquement dans la liste des pointés.
            </p>
          </div>
          {unmarkedStudents.length > 0 && (
            <Button size="sm" onClick={handleSaveUnmarked} isLoading={bulkMark.isPending}>
              <Check className="h-4 w-4" /> Enregistrer le pointage ({unmarkedStudents.length})
            </Button>
          )}
        </div>

        {saved && <p className="px-5 text-xs font-medium text-emerald-600">Pointage enregistré avec succès ✓</p>}

        <div className="divide-y divide-slate-50 dark:divide-ink-700">
          {unmarkedStudents.map((student) => {
            const current = statuses[student.id] ?? "PRESENT";
            return (
              <div key={student.id} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50/50 dark:hover:bg-ink-700/20">
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-white">
                    {student.firstName} {student.lastName}
                  </p>
                  <p className="font-mono text-xs text-slate-400">{student.registrationNo}</p>
                </div>
                <div className="flex gap-1.5">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setStatuses((prev) => ({ ...prev, [student.id]: opt.value }))}
                      className={cn(
                        "rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors",
                        current === opt.value
                          ? cn(opt.className, "text-white shadow-sm")
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-ink-800 dark:text-slate-300"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {unmarkedStudents.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-slate-400">
              🎉 Tous les élèves de cette classe ont été pointés pour cette date !
            </div>
          )}
        </div>
      </Card>

      {/* ── SECTION 2: Élèves déjà pointés aujourd'hui (avec bouton Modifier) ── */}
      {markedStudents.length > 0 && (
        <Card className="flex flex-col gap-4 p-0">
          <div className="border-b border-slate-100 px-5 py-4 dark:border-ink-700">
            <h3 className="font-display text-sm font-semibold text-slate-800 dark:text-white flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-emerald-500" />
              Élèves déjà pointés ({markedStudents.length})
            </h3>
            <p className="text-xs text-slate-400">
              Liste des élèves enregistrés pour le {new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}. Utilisez le bouton d'action pour modifier leur statut.
            </p>
          </div>

          <div className="divide-y divide-slate-50 dark:divide-ink-700">
            {markedStudents.map((student) => {
              const currentStatus = existingAttendanceMap.get(student.id) ?? "PRESENT";
              const isEditing = editingStudentId === student.id;

              return (
                <div key={student.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50/50 dark:hover:bg-ink-700/20">
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-white">
                      {student.firstName} {student.lastName}
                    </p>
                    <p className="font-mono text-xs text-slate-400">{student.registrationNo}</p>
                  </div>

                  {!isEditing ? (
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "rounded-full px-3 py-1 text-xs font-semibold",
                          STATUS_BADGES[currentStatus]?.badgeClass
                        )}
                      >
                        {STATUS_BADGES[currentStatus]?.label}
                      </span>
                      <button
                        onClick={() => setEditingStudentId(student.id)}
                        className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-600 hover:border-sky-300 hover:text-sky-600 dark:border-ink-700 dark:bg-ink-800 dark:text-slate-300"
                        title="Modifier la présence"
                      >
                        <Edit2 className="h-3 w-3" /> Modifier
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        {STATUS_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => handleUpdateSingle(student.id, opt.value)}
                            className={cn(
                              "rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors",
                              currentStatus === opt.value
                                ? cn(opt.className, "text-white shadow-sm")
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-ink-800 dark:text-slate-300"
                            )}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setEditingStudentId(null)}
                        className="text-xs text-slate-400 hover:underline"
                      >
                        Annuler
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

