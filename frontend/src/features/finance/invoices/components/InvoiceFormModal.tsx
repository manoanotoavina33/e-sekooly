import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useStudents } from "@/features/students/hooks/useStudents";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useFeeCategories } from "../../categories/hooks/useFeeCategories";
import { useCreateInvoice } from "../hooks/useInvoices";

const schema = z.object({
  studentId: z.string().uuid("Sélectionnez un élève"),
  feeCategoryId: z.string().uuid("Sélectionnez une catégorie"),
  amount: z.coerce.number().positive("Montant requis"),
  dueDate: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function InvoiceFormModal({ open, onClose, schoolId }: { open: boolean; onClose: () => void; schoolId: string }) {
  const { data: studentsData } = useStudents({ schoolId, pageSize: 100 });
  const { data: categories } = useFeeCategories(schoolId);
  const createInvoice = useCreateInvoice();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    await createInvoice.mutateAsync({ ...values, schoolId });
    reset();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Émettre une facture">
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
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Catégorie de frais</label>
          <select className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:bg-ink-800 dark:border-ink-700 dark:text-white" {...register("feeCategoryId")}>
            <option value="">Sélectionner…</option>
            {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {errors.feeCategoryId && <span className="text-xs font-medium text-red-500">{errors.feeCategoryId.message}</span>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input label="Montant" type="number" step="0.01" error={errors.amount?.message} {...register("amount")} />
          <Input label="Échéance (optionnel)" type="date" {...register("dueDate")} />
        </div>

        <p className="text-xs text-slate-400">
          Les bourses/réductions actives de l'élève seront appliquées automatiquement.
        </p>

        {createInvoice.isError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-300">
            Une erreur est survenue.
          </p>
        )}

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>Annuler</Button>
          <Button type="submit" isLoading={isSubmitting}>Émettre la facture</Button>
        </div>
      </form>
    </Modal>
  );
}
