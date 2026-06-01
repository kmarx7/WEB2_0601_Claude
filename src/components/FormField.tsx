"use client";

import React from "react";

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  hint?: string;
}

export function FormField({ id, label, required, error, children, hint }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
        {required ? (
          <span className="ml-1 text-red-500" aria-label="필수">*</span>
        ) : (
          <span className="ml-1 text-gray-400 font-normal text-xs">(선택)</span>
        )}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
      {error && (
        <p className="text-xs text-red-500" role="alert" aria-live="polite">
          {error}
        </p>
      )}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ error, className = "", ...props }: InputProps) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed ${
        error
          ? "border-red-400 bg-red-50 focus:ring-red-400"
          : "border-gray-300 bg-white hover:border-gray-400"
      } ${className}`}
    />
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function Textarea({ error, className = "", ...props }: TextareaProps) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-50 disabled:cursor-not-allowed ${
        error
          ? "border-red-400 bg-red-50 focus:ring-red-400"
          : "border-gray-300 bg-white hover:border-gray-400"
      } ${className}`}
    />
  );
}
