"use client";

import { forwardRef, useId, type TextareaHTMLAttributes } from "react";
import clsx from "clsx";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
  errors?: string[];
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, hint, errors, className, id, required, ...props }, ref) {
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
        <textarea
          ref={ref}
          id={inputId}
          required={required}
          aria-invalid={Boolean(errors?.length)}
          aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
          className="field-input min-h-[6rem] resize-y"
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
  },
);