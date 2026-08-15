import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useClassRooms } from "@/features/academics/classrooms/hooks/useClassRooms";
import { useSubjects } from "@/features/academics/subjects/hooks/useSubjects";
import { useEmployees } from "@/features/teachers/hooks/useEmployees";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateTimetableSlot } from "../hooks/useTimetable";

const DAYS = [
  { value: "MONDAY", label: "Lundi" },
  { value: "TUESDAY", label: "Mardi" },
  { value: "WEDNESDAY", label: "Mercredi" },
  { value: "THURSDAY", label: "Jeudi" },
  { value: "FRIDAY", label: "Vendredi" },
  { value: "SATURDAY", label: "Samedi" },
] as const;

const schema = z.object({
  classRoomId: z.string().uuid("Sélectionnez une classe"),
  subjectId: z.string().uuid("Sélectionnez une matière"),
  teacherId: z.string().uuid("Sélectionnez un enseignant"),
  dayOfWeek: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  room: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function TimetableSlotFormModal({
  open,
  onClose,
  schoolId,
  defaultClassRoomId,
}: {
  open: boolean;
  onClose: () => void;
  schoolId: string;
  defaultClassRoomId?: string;
}) {
  const { data: classRooms } = useClassRooms(schoolId);
  const { data: subjects } = useSubjects(schoolId);
  const { data: employeesData } = useEmployees({ schoolId, pageSize: 100 });
  const createSlot = useCreateTimetableSlot();
  const [conflictError, setConflictError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { dayOfWeek: "MONDAY", classRoomId: defaultClassRoomId },
  });

  async function onSubmit(values: FormValues) {
    setConflictError(null);
    try {
      await createSlot.mutateAsync({ ...values, schoolId });
      reset();
      onClose();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Impossible de créer ce créneau.";
      setConflictError(message);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Ajouter un créneau">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Classe</label>
          <select
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:bg-ink-800 dark:border-ink-700 dark:text-white"
            {...register("classRoomId")}
          >
            <option value="">Sélectionner…</option>
            {classRooms?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.classRoomId && <span className="text-xs font-medium text-red-500">{errors.classRoomId.message}</span>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Matière</label>
          <select
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:bg-ink-800 dark:border-ink-700 dark:text-white"
            {...register("subjectId")}
          >
            <option value="">Sélectionner…</option>
            {subjects?.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          {errors.subjectId && <span className="text-xs font-medium text-red-500">{errors.subjectId.message}</span>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Enseignant</label>
          <select
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:bg-ink-800 dark:border-ink-700 dark:text-white"
            {...register("teacherId")}
          >
            <option value="">Sélectionner…</option>
            {employeesData?.data.map((e) => (
              <option key={e.id} value={e.id}>{e.user.firstName} {e.user.lastName}</option>
            ))}
          </select>
          {errors.teacherId && <span className="text-xs font-medium text-red-500">{errors.teacherId.message}</span>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Jour</label>
          <select
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:bg-ink-800 dark:border-ink-700 dark:text-white"
            {...register("dayOfWeek")}
          >
            {DAYS.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Début" type="time" error={errors.startTime?.message} {...register("startTime")} />
          <Input label="Fin" type="time" error={errors.endTime?.message} {...register("endTime")} />
        </div>

        <Input label="Salle (optionnel)" {...register("room")} />

        {conflictError && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
            {conflictError}
          </p>
        )}

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Ajouter au planning
          </Button>
        </div>
      </form>
    </Modal>
  );
}
