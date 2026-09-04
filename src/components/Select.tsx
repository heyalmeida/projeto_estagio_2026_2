"use client";

import { forwardRef, useId, type SelectHTMLAttributes } from "react";
import clsx from "clsx";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  hint?: string;
  errors?: string[];
  options: readonly { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, errors, options, placeholder, className, id, required, ...props },
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
      <select
        ref={ref}
        id={inputId}
        required={required}
        aria-invalid={Boolean(errors?.length)}
        aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
        className="field-input"
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
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