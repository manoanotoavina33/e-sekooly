import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateExamSession } from "../hooks/useExams";

const schema = z.object({
  label: z.string().min(2, "Libellé requis"),
  type: z.enum(["DEVOIR", "COMPOSITION", "EXAM_BLANC", "EXAM_OFFICIEL"]),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
});
type FormValues = z.infer<typeof schema>;

const TYPE_LABELS: Record<FormValues["type"], string> = {
  DEVOIR: "Devoir",
  COMPOSITION: "Composition",
  EXAM_BLANC: "Examen blanc",
  EXAM_OFFICIEL: "Examen officiel",
};

export function ExamSessionFormModal({ open, onClose, schoolId }: { open: boolean; onClose: () => void; schoolId: string }) {
  const createSession = useCreateExamSession();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { type: "DEVOIR" } });

  async function onSubmit(values: FormValues) {
    await createSession.mutateAsync({ ...values, schoolId });
    reset();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Créer une session d'examens">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Libellé" placeholder="Composition du 1er trimestre" error={errors.label?.message} {...register("label")} />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Type</label>
          <select
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:bg-ink-800 dark:border-ink-700 dark:text-white"
            {...register("type")}
          >
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Début" type="date" error={errors.startDate?.message} {...register("startDate")} />
          <Input label="Fin" type="date" error={errors.endDate?.message} {...register("endDate")} />
        </div>

        {createSession.isError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-300">
            Une erreur est survenue.
          </p>
        )}

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>Annuler</Button>
          <Button type="submit" isLoading={isSubmitting}>Créer la session</Button>
        </div>
      </form>
    </Modal>
  );
}
