import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRecordCashTransaction } from "../hooks/useCashTransactions";

const schema = z.object({
  type: z.enum(["IN", "OUT"]),
  amount: z.coerce.number().positive("Montant requis"),
  category: z.string().min(1, "Catégorie requise"),
  description: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function CashTransactionFormModal({
  open,
  onClose,
  cashSessionId,
}: {
  open: boolean;
  onClose: () => void;
  cashSessionId: string;
}) {
  const record = useRecordCashTransaction();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { type: "IN" } });

  async function onSubmit(values: FormValues) {
    await record.mutateAsync({ cashSessionId, ...values });
    reset();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Nouveau mouvement de caisse">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Type</label>
          <select className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:bg-ink-800 dark:border-ink-700 dark:text-white" {...register("type")}>
            <option value="IN">Entrée</option>
            <option value="OUT">Sortie</option>
          </select>
        </div>
        <Input label="Montant" type="number" step="0.01" error={errors.amount?.message} {...register("amount")} />
        <Input label="Catégorie" placeholder="Frais scolaires, Fournitures…" error={errors.category?.message} {...register("category")} />
        <Input label="Description (optionnel)" {...register("description")} />

        <p className="text-xs text-slate-400">
          Ce mouvement sera en attente de validation avant d'être compté dans le solde de la caisse.
        </p>

        {record.isError && (
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
