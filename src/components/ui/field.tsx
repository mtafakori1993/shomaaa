import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

const control =
  "w-full rounded-sm border bg-ivory-50 px-4 text-base text-ink-900 placeholder:text-ink-500 transition-colors " +
  "hover:border-ink-600 focus:border-ink-900 disabled:cursor-not-allowed disabled:opacity-50";

interface FieldShellProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: (p: { id: string; describedBy?: string; invalid: boolean }) => ReactNode;
  className?: string;
}

/** Label + control + hint/error wiring (aria-describedby / aria-invalid), after Spectrum's Field pattern. */
export function Field({ label, error, hint, required, children, className }: FieldShellProps) {
  const id = useId();
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-ink-800">
        {label}
        {required && <span className="mr-1 text-danger-600" aria-hidden>*</span>}
      </label>
      {children({ id, describedBy, invalid: !!error })}
      {error ? (
        <p id={`${id}-err`} role="alert" className="text-sm text-danger-600">{error}</p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-ink-600">{hint}</p>
      ) : null}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ className, invalid, ...p }, ref) {
  return <input ref={ref} aria-invalid={invalid || undefined} className={cn(control, "h-12", invalid ? "border-danger-600" : "border-ink-500/50", className)} {...p} />;
});

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean };
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ className, invalid, ...p }, ref) {
  return <textarea ref={ref} aria-invalid={invalid || undefined} className={cn(control, "min-h-28 py-3", invalid ? "border-danger-600" : "border-ink-500/50", className)} {...p} />;
});

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean };
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select({ className, invalid, children, ...p }, ref) {
  return (
    <div className="relative">
      <select ref={ref} aria-invalid={invalid || undefined} className={cn(control, "h-12 cursor-pointer appearance-none pl-10", invalid ? "border-danger-600" : "border-ink-500/50", className)} {...p}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-600" aria-hidden />
    </div>
  );
});
