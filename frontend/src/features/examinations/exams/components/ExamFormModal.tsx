import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useClassRooms } from "@/features/academics/classrooms/hooks/useClassRooms";
import { useSubjects } from "@/features/academics/subjects/hooks/useSubjects";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateExam } from "../hooks/useExams";

const schema = z.object({
  subjectId: z.string().uuid("Sélectionnez une matière"),
  classRoomId: z.string().uuid("Sélectionnez une classe"),
  date: z.string().min(1),
  room: z.string().optional(),
  maxScore: z.coerce.number().positive(),
});
type FormValues = z.infer<typeof schema>;

export function ExamFormModal({
  open,
  onClose,
  schoolId,
  examSessionId,
}: {
  open: boolean;
  onClose: () => void;
  schoolId: string;
  examSessionId: string;
}) {
  const { data: subjects } = useSubjects(schoolId);
  const { data: classRooms } = useClassRooms(schoolId);
  const createExam = useCreateExam();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { maxScore: 20 } });

  async function onSubmit(values: FormValues) {
    await createExam.mutateAsync({ ...values, examSessionId });
    reset();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Ajouter une épreuve">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Matière</label>
          <select className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:bg-ink-800 dark:border-ink-700 dark:text-white" {...register("subjectId")}>
            <option value="">Sélectionner…</option>
            {subjects?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          {errors.subjectId && <span className="text-xs font-medium text-red-500">{errors.subjectId.message}</span>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Classe</label>
          <select className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:bg-ink-800 dark:border-ink-700 dark:text-white" {...register("classRoomId")}>
            <option value="">Sélectionner…</option>
            {classRooms?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {errors.classRoomId && <span className="text-xs font-medium text-red-500">{errors.classRoomId.message}</span>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Date" type="date" error={errors.date?.message} {...register("date")} />
          <Input label="Barème" type="number" error={errors.maxScore?.message} {...register("maxScore")} />
        </div>
        <Input label="Salle (optionnel)" {...register("room")} />

        {createExam.isError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-300">
            Une erreur est survenue.
          </p>
        )}

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>Annuler</Button>
          <Button type="submit" isLoading={isSubmitting}>Ajouter l'épreuve</Button>
        </div>
      </form>
    </Modal>
  );
}
