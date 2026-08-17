import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateAnnouncement, useUpdateAnnouncement, useDeleteAnnouncement } from "../hooks/useAnnouncements";
import { Download } from "lucide-react";

const schema = z.object({
  title: z.string().min(2, "Titre requis"),
  body: z.string().min(1, "Contenu requis"),
  audience: z.enum(["ALL", "STUDENTS", "PARENTS", "TEACHERS", "STAFF"]),
});
type FormValues = z.infer<typeof schema>;

const AUDIENCE_LABELS: Record<FormValues["audience"], string> = {
  ALL: "Tout le monde",
  STUDENTS: "Élèves",
  PARENTS: "Parents",
  TEACHERS: "Enseignants",
  STAFF: "Personnel",
};

export function AnnouncementFormModal({
  open,
  onClose,
  schoolId,
  announcement,
  onPdf,
}: {
  open: boolean;
  onClose: () => void;
  schoolId: string;
  announcement?: { id: string; title: string; body: string; audience: FormValues["audience"] } | null;
  onPdf?: (id: string) => void;
}) {
  const createAnnouncement = useCreateAnnouncement();
  const updateAnnouncement = useUpdateAnnouncement();
  const deleteAnnouncement = useDeleteAnnouncement();
  const isEditing = Boolean(announcement);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: announcement ?? { title: "", body: "", audience: "ALL" },
  });

  async function onSubmit(values: FormValues) {
    if (isEditing && announcement) {
      await updateAnnouncement.mutateAsync({ id: announcement.id, ...values });
    } else {
      await createAnnouncement.mutateAsync({ ...values, schoolId });
    }
    reset();
    onClose();
  }

  async function handleDelete() {
    if (!announcement) return;
    await deleteAnnouncement.mutateAsync(announcement.id);
    reset();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? "Modifier l'annonce" : "Nouvelle annonce"}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Titre" error={errors.title?.message} {...register("title")} />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Public cible</label>
          <select className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:bg-ink-800 dark:border-ink-700 dark:text-white" {...register("audience")}>
            {Object.entries(AUDIENCE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Contenu</label>
          <textarea
            rows={5}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm dark:bg-ink-800 dark:border-ink-700 dark:text-white"
            {...register("body")}
          />
          {errors.body && <span className="text-xs font-medium text-red-500">{errors.body.message}</span>}
        </div>

        <div className="mt-2 flex justify-between gap-3">
          <div className="flex gap-2">
            {isEditing && (
              <>
                {onPdf && announcement && (
                  <Button type="button" variant="secondary" size="sm" onClick={() => onPdf(announcement.id)}>
                    <Download className="h-4 w-4" /> PDF
                  </Button>
                )}
                <Button type="button" variant="danger" size="sm" onClick={handleDelete} isLoading={deleteAnnouncement.isPending}>
                  Supprimer
                </Button>
              </>
            )}
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={onClose}>Annuler</Button>
            <Button type="submit" isLoading={isSubmitting}>{isEditing ? "Enregistrer" : "Publier"}</Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
