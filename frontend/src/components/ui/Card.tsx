import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-100 bg-white p-5 shadow-soft transition-shadow hover:shadow-glow",
        "dark:border-ink-700 dark:bg-ink-800 dark:shadow-soft-dark",
        className
      )}
      {...props}
    />
  );
}
