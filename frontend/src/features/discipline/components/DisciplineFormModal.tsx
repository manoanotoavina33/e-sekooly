import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useStudents } from "@/features/students/hooks/useStudents";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateDisciplineRecord } from "../hooks/useDiscipline";

const schema = z.object({
  studentId: z.string().uuid("Sélectionnez un élève"),
  type: z.enum(["SANCTION", "REWARD", "LATENESS", "OBSERVATION"]),
  severity: z.enum(["LOW", "MEDIUM", "HIGH"]),
  title: z.string().min(2, "Titre requis"),
  description: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const TYPE_LABELS: Record<FormValues["type"], string> = {
  SANCTION: "Sanction",
  REWARD: "Récompense",
  LATENESS: "Retard",
  OBSERVATION: "Observation",
};

export function DisciplineFormModal({ open, onClose, schoolId }: { open: boolean; onClose: () => void; schoolId: string }) {
  const { data: studentsData } = useStudents({ schoolId, pageSize: 100 });
  const createRecord = useCreateDisciplineRecord();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { type: "OBSERVATION", severity: "LOW" } });

  async function onSubmit(values: FormValues) {
    await createRecord.mutateAsync({ ...values, schoolId });
    reset();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Ajouter une entrée disciplinaire">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Élève</label>
          <select className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:bg-ink-800 dark:border-ink-700 dark:text-white" {...register("studentId")}>
            <option value="">Sélectionner…</option>
            {studentsData?.data.map((s) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
          </select>
          {errors.studentId && <span className="text-xs font-medium text-red-500">{errors.studentId.message}</span>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Type</label>
            <select className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:bg-ink-800 dark:border-ink-700 dark:text-white" {...register("type")}>
              {Object.entries(TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Gravité</label>
            <select className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:bg-ink-800 dark:border-ink-700 dark:text-white" {...register("severity")}>
              <option value="LOW">Faible</option>
              <option value="MEDIUM">Moyenne</option>
              <option value="HIGH">Élevée</option>
            </select>
          </div>
        </div>

        <Input label="Titre" placeholder="Ex : Bavardage en classe" error={errors.title?.message} {...register("title")} />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Description (optionnel)</label>
          <textarea
            rows={3}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm dark:bg-ink-800 dark:border-ink-700 dark:text-white"
            {...register("description")}
          />
        </div>

        {createRecord.isError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-300">
            Une erreur est survenue.
          </p>
        )}

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>Annuler</Button>
          <Button type="submit" isLoading={isSubmitting}>Enregistrer</Button>
        </div>
      </form>
    </Modal>
  );
}
