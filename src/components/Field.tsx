"use client";

import { forwardRef, useId, type InputHTMLAttributes } from "react";
import clsx from "clsx";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  errors?: string[];
}

/**
 * Lightweight labeled input that wires its label to the input via
 * `useId` and reports validation errors through `aria-invalid` +
 * `aria-describedby` for assistive tech.
 */
export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, hint, errors, className, id, required, ...props },
  ref,
) {
  const reactId = useId();
  const inputId = id ?? `field-${reactId}`;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = errors?.length ? `${inputId}-error` : undefined;

  return (
    <div className={clsx("flex flex-col", className)}>
      <label htmlFor={inputId} className="field-label">
        {label}
        {required && (
          <span aria-hidden className="ml-0.5 text-red-600">
            *
          </span>
        )}
      </label>
      <input
        ref={ref}
        id={inputId}
        required={required}
        aria-invalid={Boolean(errors?.length)}
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
        className="field-input"
        {...props}
      />
      {hint && (
        <p id={hintId} className="field-hint">
          {hint}
        </p>
      )}
      {errors?.map((error, idx) => (
        <p id={idx === 0 ? errorId : undefined} key={idx} className="field-error" role="alert">
          {error}
        </p>
      ))}
    </div>
  );
});