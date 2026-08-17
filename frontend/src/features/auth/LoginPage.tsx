import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Logo } from "@/components/ui/Logo";
import { useAuthStore } from "@/hooks/useAuthStore";
import { api } from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { LoginFormValues, loginFormSchema } from "./login.schema";

export default function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginFormSchema) });

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);
    try {
      const { data } = await api.post("/auth/login", values);
      if (data.requiresTwoFactor) {
        setRequiresOtp(true);
        return;
      }
      setSession(data.data.accessToken, data.data.user);
      navigate("/dashboard");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Identifiants incorrects";
      setServerError(message);
    }
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      {/* Panneau signature — horizon ciel dégradé, visible seulement en desktop */}
      <div className="relative hidden overflow-hidden bg-sky-horizon lg:flex lg:flex-col lg:justify-between lg:p-12">
        <Logo withLabel size={40} className="[&_span]:text-white" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-md"
        >
          <h1 className="font-display text-4xl font-bold leading-tight text-white">
            La gestion scolaire, simplifiée.
          </h1>
          <p className="mt-4 text-sky-50/90">
            Élèves, enseignants, finances, présences et bulletins — tout votre établissement,
            en ligne ou hors connexion.
          </p>
          <div className="mt-8 flex items-center gap-2 text-sm text-sky-50/80">
            <ShieldCheck className="h-4 w-4" />
            Authentification sécurisée · 2FA · Rôles &amp; permissions
          </div>
        </motion.div>
        <div className="text-xs text-sky-50/60">© {new Date().getFullYear()} e-sekooly</div>
      </div>

      {/* Formulaire */}
      <div className="flex flex-col items-center justify-center bg-cloud-50 px-6 py-12 dark:bg-ink-900">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo size={36} />
          </div>

          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            Connexion
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Accédez à votre espace e-sekooly.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-4">
            <Input
              label="Adresse e-mail"
              type="email"
              placeholder="prenom.nom@ecole.com"
              error={errors.email?.message}
              {...register("email")}
            />
            <div className="relative">
              <Input
                label="Mot de passe"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                error={errors.password?.message}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {requiresOtp && (
              <Input
                label="Code de vérification (2FA)"
                placeholder="123456"
                maxLength={6}
                {...register("otpCode")}
              />
            )}

            {serverError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950/40 dark:text-red-300">
                {serverError}
              </p>
            )}

            <Button type="submit" size="lg" isLoading={isSubmitting} className="mt-2 w-full">
              Se connecter
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
