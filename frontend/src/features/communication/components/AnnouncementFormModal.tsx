import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateAnnouncement } from "../hooks/useAnnouncements";

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

export function AnnouncementFormModal({ open, onClose, schoolId }: { open: boolean; onClose: () => void; schoolId: string }) {
  const createAnnouncement = useCreateAnnouncement();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { audience: "ALL" } });

  async function onSubmit(values: FormValues) {
    await createAnnouncement.mutateAsync({ ...values, schoolId });
    reset();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Nouvelle annonce">
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

        <div className="mt-2 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>Annuler</Button>
          <Button type="submit" isLoading={isSubmitting}>Publier</Button>
        </div>
      </form>
    </Modal>
  );
}
