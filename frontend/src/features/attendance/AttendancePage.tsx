import { Card } from "@/components/ui/Card";
import { useClassRooms } from "@/features/academics/classrooms/hooks/useClassRooms";
import { useEffectiveSchoolId } from "@/hooks/useEffectiveSchoolId";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { QrCheckinCard } from "./components/QrCheckinCard";
import { StaffAttendanceTable } from "./components/StaffAttendanceTable";
import { StudentQuickEntryTable } from "./components/StudentQuickEntryTable";

export default function AttendancePage() {
  const schoolId = useEffectiveSchoolId();
  const [tab, setTab] = useState<"students" | "staff">("students");
  const { data: classRooms } = useClassRooms(schoolId);
  const [classRoomId, setClassRoomId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Présence</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Pointage par QR code ou saisie rapide, pour les élèves et le personnel.
        </p>
      </div>

      <div className="flex gap-2 border-b border-slate-100 dark:border-ink-700">
        {(["students", "staff"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              tab === t
                ? "border-sky-500 text-sky-600 dark:text-sky-400"
                : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            )}
          >
            {t === "students" ? "Élèves" : "Personnel"}
          </button>
        ))}
      </div>

      {tab === "students" && (
        <div className="flex flex-col gap-4">
          <QrCheckinCard schoolId={schoolId} />

          <Card className="flex flex-wrap items-end gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Classe</label>
              <select
                value={classRoomId}
                onChange={(e) => setClassRoomId(e.target.value)}
                className="h-11 min-w-[200px] rounded-xl border border-slate-200 bg-white px-3 text-sm dark:bg-ink-800 dark:border-ink-700 dark:text-white"
              >
                <option value="">Sélectionner une classe…</option>
                {classRooms?.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:bg-ink-800 dark:border-ink-700 dark:text-white"
              />
            </div>
          </Card>

          <StudentQuickEntryTable schoolId={schoolId} classRoomId={classRoomId} date={date} />
        </div>
      )}

      {tab === "staff" && <StaffAttendanceTable schoolId={schoolId} />}
    </div>
  );
}
