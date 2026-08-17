import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  withLabel?: boolean;
  size?: number;
  src?: string;
}

/**
 * Logo e-sekooly. L'image pointe vers /public/logo.svg — remplacez ce
 * fichier par votre propre logo, aucun changement de code n'est nécessaire.
 */
export function Logo({ className, withLabel = true, size = 36, src }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <img src={src ?? "/logo.svg"} alt="e-sekooly" width={size} height={size} className="rounded-xl shadow-soft" />
      {withLabel && (
        <span className="font-display text-lg font-bold tracking-tight text-sky-900 dark:text-white">
          e-sekooly
        </span>
      )}
    </div>
  );
}
