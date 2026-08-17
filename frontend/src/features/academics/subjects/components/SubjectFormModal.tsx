import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Subject, useCreateSubject, useUpdateSubject } from "../hooks/useSubjects";

const schema = z.object({
  name: z.string().min(1, "Nom requis"),
  coefficient: z.coerce.number().positive(),
  hoursPerWeek: z.coerce.number().int().positive(),
  program: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

const SUBJECT_SUGGESTIONS: Record<string, string[]> = {
  PRIMARY: ["Français", "Mathématiques", "Découverte du monde", "Arts plastiques", "EPS", "Musique"],
  COLLEGE: ["Français", "Mathématiques", "Histoire-Géographie", "SVT", "Physique-Chimie", "Arts plastiques", "EPS", "Musique", "Technologie"],
  LYCEE: ["Français", "Mathématiques", "Histoire-Géographie", "Physique-Chimie", "SVT", "Philosophie", "Arts plastiques", "EPS", "NSI", "SES", "HGGSP"],
  UNIVERSITE: ["Mathématiques", "Physique", "Informatique", "Droit", "Économie", "Médecine", "Langues", "Lettres"],
};

export function SubjectFormModal({
  open,
  onClose,
  schoolId,
  subject,
  suggestedSubjects,
}: {
  open: boolean;
  onClose: () => void;
  schoolId: string;
  subject?: Subject | null;
  suggestedSubjects?: string[];
}) {
  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();

  const isEditing = Boolean(subject);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { coefficient: 1, hoursPerWeek: 2 } });

  useEffect(() => {
    if (!open) return;
    reset({
      name: subject?.name ?? "",
      coefficient: subject?.coefficient ?? 1,
      hoursPerWeek: subject?.hoursPerWeek ?? 2,
      program: subject?.program ?? "",
    });
  }, [subject, open, reset]);

  async function onSubmit(values: FormValues) {
    if (subject) {
      await updateSubject.mutateAsync({ id: subject.id, payload: values });
    } else {
      await createSubject.mutateAsync({ ...values, schoolId });
    }
    reset();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? `Modifier la matière ${subject?.name}` : "Créer une matière"}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Input label="Nom de la matière" placeholder="Mathématiques" error={errors.name?.message} {...register("name")} list="subject-suggestions" />
          {suggestedSubjects && suggestedSubjects.length > 0 && (
            <datalist id="subject-suggestions">
              {suggestedSubjects.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Coefficient" type="number" step="0.5" error={errors.coefficient?.message} {...register("coefficient")} />
          <Input label="Heures / semaine" type="number" error={errors.hoursPerWeek?.message} {...register("hoursPerWeek")} />
        </div>
        <Input label="Programme (optionnel)" placeholder="Résumé du programme" {...register("program")} />

        {(createSubject.isError || updateSubject.isError) && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-300">
            Une erreur est survenue. Cette matière existe peut-être déjà.
          </p>
        )}

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Annuler
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEditing ? "Enregistrer les modifications" : "Créer la matière"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
