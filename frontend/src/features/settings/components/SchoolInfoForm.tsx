import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Logo } from "@/components/ui/Logo";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { School, useUpdateSchool, useUploadLogo } from "../hooks/useSchoolSettings";
import { Upload } from "lucide-react";

const SCHOOL_TYPES = [
  { code: "PRIMARY", label: "Primaires" },
  { code: "COLLEGE", label: "Collège" },
  { code: "LYCEE", label: "Lycée" },
  { code: "UNIVERSITE", label: "Université" },
] as const;

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
  const uploadLogo = useUploadLogo(school.id);
  const [logoPreview, setLogoPreview] = useState<string | null>(school.logoUrl);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    school.schoolTypes.map((st) => st.schoolType.code)
  );
  const logoInputRef = useRef<HTMLInputElement>(null);

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
    setLogoPreview(school.logoUrl);
    setSelectedTypes(school.schoolTypes.map((st) => st.schoolType.code));
  }, [school, reset]);

  async function onSubmit(values: FormValues) {
    await updateSchool.mutateAsync({ ...values, schoolTypes: selectedTypes });
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
    try {
      await uploadLogo.mutateAsync(file);
    } catch {
      setLogoPreview(school.logoUrl);
      setLogoFile(null);
    }
  }

  return (
    <Card className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Logo withLabel={false} size={56} src={logoPreview ?? undefined} />
        <div className="flex flex-col gap-2">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Logo de l'établissement
          </p>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoUpload}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            isLoading={uploadLogo.isPending}
            onClick={() => logoInputRef.current?.click()}
          >
            <Upload className="h-4 w-4" /> Importer un logo
          </Button>
          {logoPreview && (
            <img src={logoPreview} alt="Logo" className="h-12 w-12 rounded-lg object-cover border border-slate-200" />
          )}
        </div>
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
          <Input label="Fuseau horaire" placeholder="Indian/Antananarivo" error={errors.timezone?.message} {...register("timezone")} />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Types d'établissement</p>
          <div className="flex flex-wrap gap-3">
            {SCHOOL_TYPES.map((type) => (
              <label key={type.code} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  checked={selectedTypes.includes(type.code)}
                  onChange={(e) => {
                    setSelectedTypes((prev) =>
                      e.target.checked
                        ? [...prev, type.code]
                        : prev.filter((t) => t !== type.code)
                    );
                  }}
                />
                {type.label}
              </label>
            ))}
          </div>
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
