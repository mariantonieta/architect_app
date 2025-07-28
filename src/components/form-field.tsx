import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";

export function FormField({
  label,
  id,
  error,
  children,
  required,
  className = "",
}: {
  label: string;
  id: string;
  error?: string;
  children: ReactNode;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {children}
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
}
