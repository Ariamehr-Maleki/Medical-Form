import {
  cloneElement,
  isValidElement,
  useId,
  type AriaAttributes,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
} from "react";

export function Button({
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    />
  );
}
export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-950 shadow-sm transition outline-none placeholder:text-slate-400 focus:border-teal-600 focus:ring-3 focus:ring-teal-100 disabled:bg-slate-100 ${className}`}
      {...props}
    />
  );
}
export function Select({
  className = "",
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-slate-950 shadow-sm transition outline-none focus:border-teal-600 focus:ring-3 focus:ring-teal-100 ${className}`}
      {...props}
    />
  );
}
type DescribedControlProps = {
  id?: string;
  name?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: AriaAttributes["aria-invalid"];
  "aria-required"?: AriaAttributes["aria-required"];
};
export function Field({
  label,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  const generatedId = useId();
  const control = isValidElement<DescribedControlProps>(children)
    ? children
    : null;
  const fieldId = control?.props.id || control?.props.name || generatedId;
  const descriptionId = error
    ? `${fieldId}-error`
    : hint
      ? `${fieldId}-hint`
      : undefined;
  const describedControl = control
    ? cloneElement(control, {
        id: fieldId,
        "aria-describedby": descriptionId,
        "aria-invalid": error ? true : undefined,
        "aria-required": required || undefined,
      })
    : children;
  return (
    <label
      htmlFor={fieldId}
      className="grid gap-1.5 text-sm font-medium text-slate-800"
    >
      <span>
        {label}
        {required && (
          <span className="text-coral-700 ml-1" aria-hidden="true">
            *
          </span>
        )}
      </span>
      {describedControl}
      {error ? (
        <span id={descriptionId} className="text-sm text-red-700" role="alert">
          {error}
        </span>
      ) : hint ? (
        <span id={descriptionId} className="text-xs font-normal text-slate-500">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
