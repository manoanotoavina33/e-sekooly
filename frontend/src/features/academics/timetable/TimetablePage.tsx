import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useClassRooms } from "@/features/academics/classrooms/hooks/useClassRooms";
import { useEffectiveSchoolId } from "@/hooks/useEffectiveSchoolId";
import { Download, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { TimetableSlotFormModal } from "./components/TimetableSlotFormModal";
import { downloadTimetablePdf, useDeleteTimetableSlot, useTimetable } from "./hooks/useTimetable";

const DAYS = [
  { value: "MONDAY", label: "Lundi" },
  { value: "TUESDAY", label: "Mardi" },
  { value: "WEDNESDAY", label: "Mercredi" },
  { value: "THURSDAY", label: "Jeudi" },
  { value: "FRIDAY", label: "Vendredi" },
  { value: "SATURDAY", label: "Samedi" },
] as const;

export default function TimetablePage() {
  const schoolId = useEffectiveSchoolId();
  const { data: classRooms } = useClassRooms(schoolId);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [formOpen, setFormOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const { data: slots, isLoading } = useTimetable(schoolId, selectedClassId || undefined);
  const deleteSlot = useDeleteTimetableSlot();

  async function handleDownload() {
    setDownloading(true);
    try {
      await downloadTimetablePdf(schoolId, selectedClassId || undefined);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Emploi du temps</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Planning manuel avec détection automatique des conflits (enseignant, classe, salle).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={handleDownload} isLoading={downloading}>
            <Download className="h-4 w-4" /> Export PDF
          </Button>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4" /> Ajouter un créneau
          </Button>
        </div>
      </div>

      <select
        value={selectedClassId}
        onChange={(e) => setSelectedClassId(e.target.value)}
        className="h-11 max-w-xs rounded-xl border border-slate-200 bg-white px-3 text-sm dark:bg-ink-800 dark:border-ink-700 dark:text-white"
      >
        <option value="">Toutes les classes</option>
        {classRooms?.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {DAYS.map((day) => {
          const daySlots = (slots ?? [])
            .filter((s) => s.dayOfWeek === day.value)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          return (
            <Card key={day.value} className="flex flex-col gap-3">
              <h3 className="font-display text-sm font-semibold text-sky-700 dark:text-sky-300">{day.label}</h3>
              {isLoading && <p className="text-xs text-slate-400">Chargement…</p>}
              {!isLoading && daySlots.length === 0 && (
                <p className="text-xs text-slate-400">Aucun cours planifié</p>
              )}
              {daySlots.map((slot) => (
                <div
                  key={slot.id}
                  className="group flex items-start justify-between rounded-xl bg-sky-50 px-3 py-2 text-xs dark:bg-ink-700"
                >
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-white">
                      {slot.startTime} – {slot.endTime} · {slot.subject.name}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">
                      {slot.classRoom.name} · {slot.teacher.user.firstName} {slot.teacher.user.lastName}
                      {slot.room ? ` · Salle ${slot.room}` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteSlot.mutate(slot.id)}
                    className="ml-2 hidden text-slate-400 hover:text-red-500 group-hover:block"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </Card>
          );
        })}
      </div>

      <TimetableSlotFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        schoolId={schoolId}
        defaultClassRoomId={selectedClassId || undefined}
      />
    </div>
  );
}
