import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useStudents } from "@/features/students/hooks/useStudents";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateFinancialAid } from "../hooks/useFinancialAid";

const schema = z.object({
  studentId: z.string().uuid("Sélectionnez un élève"),
  type: z.enum(["SCHOLARSHIP", "DISCOUNT"]),
  label: z.string().min(2, "Libellé requis"),
  mode: z.enum(["percentage", "fixed"]),
  value: z.coerce.number().positive("Valeur requise"),
});
type FormValues = z.infer<typeof schema>;

export function FinancialAidFormModal({ open, onClose, schoolId }: { open: boolean; onClose: () => void; schoolId: string }) {
  const { data: studentsData } = useStudents({ schoolId, pageSize: 100 });
  const createAid = useCreateFinancialAid();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { type: "SCHOLARSHIP", mode: "percentage" } });

  async function onSubmit(values: FormValues) {
    await createAid.mutateAsync({
      schoolId,
      studentId: values.studentId,
      type: values.type,
      label: values.label,
      percentage: values.mode === "percentage" ? values.value : undefined,
      fixedAmount: values.mode === "fixed" ? values.value : undefined,
    });
    reset();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Attribuer une bourse ou réduction">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Élève</label>
          <select className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:bg-ink-800 dark:border-ink-700 dark:text-white" {...register("studentId")}>
            <option value="">Sélectionner…</option>
            {studentsData?.data.map((s) => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
          </select>
          {errors.studentId && <span className="text-xs font-medium text-red-500">{errors.studentId.message}</span>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Type</label>
          <select className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:bg-ink-800 dark:border-ink-700 dark:text-white" {...register("type")}>
            <option value="SCHOLARSHIP">Bourse</option>
            <option value="DISCOUNT">Réduction</option>
          </select>
        </div>

        <Input label="Libellé" placeholder="Bourse d'excellence" error={errors.label?.message} {...register("label")} />

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Mode</label>
            <select className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:bg-ink-800 dark:border-ink-700 dark:text-white" {...register("mode")}>
              <option value="percentage">Pourcentage (%)</option>
              <option value="fixed">Montant fixe</option>
            </select>
          </div>
          <Input label="Valeur" type="number" step="0.01" error={errors.value?.message} {...register("value")} />
        </div>

        {createAid.isError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-300">
            Une erreur est survenue.
          </p>
        )}

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>Annuler</Button>
          <Button type="submit" isLoading={isSubmitting}>Attribuer</Button>
        </div>
      </form>
    </Modal>
  );
}
