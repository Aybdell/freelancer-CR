"use client";

import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map(({ id, title, description, variant }) => (
        <div
          key={id}
          className={cn(
            "pointer-events-auto relative flex w-full max-w-sm items-center justify-between space-x-4 overflow-hidden rounded-lg border p-4 shadow-lg transition-all animate-in slide-in-from-bottom-5",
            variant === "destructive"
              ? "border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-900/90 dark:text-red-100"
              : "border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          )}
        >
          <div className="flex-1">
            {title && <p className="text-sm font-semibold">{title}</p>}
            {description && (
              <p className="mt-1 text-sm opacity-80">{description}</p>
            )}
          </div>
          <button
            onClick={() => dismiss(id)}
            className="rounded-md p-1 opacity-50 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
