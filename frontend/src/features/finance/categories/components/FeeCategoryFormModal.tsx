import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateFeeCategory } from "../hooks/useFeeCategories";

const schema = z.object({
  name: z.string().min(1, "Nom requis"),
  description: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const FEE_SUGGESTIONS: Record<string, string[]> = {
  PRIMARY: ["Frais de scolarité", "Frais d'inscription", "Cantine", "Transport", "Sorties scolaires"],
  COLLEGE: ["Frais de scolarité", "Frais d'inscription", "Cantine", "Transport", "Sorties scolaires", "Options"],
  LYCEE: ["Frais de scolarité", "Frais d'inscription", "Cantine", "Transport", "Sorties scolaires", "Bac", "Options"],
  UNIVERSITE: ["Frais d'inscription", "Frais de scolarité", "Frais de dossier", "Carte d'étudiant", "Mémoire"],
};

export function FeeCategoryFormModal({ open, onClose, schoolId, suggestedNames }: { open: boolean; onClose: () => void; schoolId: string; suggestedNames?: string[] }) {
  const createCategory = useCreateFeeCategory();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    await createCategory.mutateAsync({ ...values, schoolId });
    reset();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Nouvelle catégorie de frais">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Input label="Nom" placeholder="Frais de scolarité" error={errors.name?.message} {...register("name")} list="fee-suggestions" />
          {suggestedNames && suggestedNames.length > 0 && (
            <datalist id="fee-suggestions">
              {suggestedNames.map((n) => (
                <option key={n} value={n} />
              ))}
            </datalist>
          )}
        </div>
        <Input label="Description (optionnel)" {...register("description")} />

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>Annuler</Button>
          <Button type="submit" isLoading={isSubmitting}>Créer</Button>
        </div>
      </form>
    </Modal>
  );
}
