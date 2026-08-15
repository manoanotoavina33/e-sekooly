import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Logo } from "@/components/ui/Logo";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { School, useUpdateSchool } from "../hooks/useSchoolSettings";

const schema = z.object({
  name: z.string().min(1, "Nom requis"),
  shortName: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("E-mail invalide").optional().or(z.literal("")),
  website: z.string().optional(),
  currency: z.string().length(3, "Code devise à 3 lettres (ex: EUR)"),
  timezone: z.string().min(1),
});
type FormValues = z.infer<typeof schema>;

export function SchoolInfoForm({ school }: { school: School }) {
  const updateSchool = useUpdateSchool(school.id);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    reset({
      name: school.name,
      shortName: school.shortName ?? "",
      address: school.address ?? "",
      phone: school.phone ?? "",
      email: school.email ?? "",
      website: school.website ?? "",
      currency: school.currency,
      timezone: school.timezone,
    });
  }, [school, reset]);

  async function onSubmit(values: FormValues) {
    await updateSchool.mutateAsync(values);
  }

  return (
    <Card className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Logo withLabel={false} size={56} />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Logo — remplacez{" "}
          <code className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-ink-700">frontend/public/logo.svg</code>{" "}
          pour le mettre à jour partout dans l'application.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Nom de l'établissement" error={errors.name?.message} {...register("name")} />
          <Input label="Nom court / sigle" {...register("shortName")} />
        </div>
        <Input label="Adresse" {...register("address")} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Téléphone" {...register("phone")} />
          <Input label="E-mail" error={errors.email?.message} {...register("email")} />
        </div>
        <Input label="Site web" {...register("website")} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Devise (code ISO)" placeholder="EUR" error={errors.currency?.message} {...register("currency")} />
          <Input label="Fuseau horaire" placeholder="Indian/Antananarivo" {...register("timezone")} />
        </div>

        {updateSchool.isSuccess && !isDirty && (
          <p className="text-xs text-emerald-600">Enregistré ✓</p>
        )}

        <div className="flex justify-end">
          <Button type="submit" isLoading={isSubmitting} disabled={!isDirty}>
            Enregistrer
          </Button>
        </div>
      </form>
    </Card>
  );
}
