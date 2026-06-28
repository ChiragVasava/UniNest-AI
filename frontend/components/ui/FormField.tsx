'use client';

import React from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  required = false,
  error,
  hint,
  children,
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-slate-900">
        {label}
        {required && <span className="text-danger-600 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-danger-600 font-medium">{error}</p>}
      {hint && !error && (
        <p className="text-xs text-slate-500">{hint}</p>
      )}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ error = false, className = '', ...props }: InputProps) {
  return (
    <input
      className={`w-full px-3 py-2 text-sm border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0
        ${
          error
            ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500 bg-danger-50'
            : 'border-slate-300 focus:border-primary-500 focus:ring-primary-500 hover:border-slate-400'
        }
        ${className}`}
      {...props}
    />
  );
}

interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function TextArea({
  error = false,
  className = '',
  ...props
}: TextAreaProps) {
  return (
    <textarea
      className={`w-full px-3 py-2 text-sm border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 resize-vertical
        ${
          error
            ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500 bg-danger-50'
            : 'border-slate-300 focus:border-primary-500 focus:ring-primary-500 hover:border-slate-400'
        }
        ${className}`}
      {...props}
    />
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
}

export function Select({
  error = false,
  placeholder = 'Select an option',
  options,
  className = '',
  ...props
}: SelectProps) {
  return (
    <select
      className={`w-full px-3 py-2 text-sm border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 appearance-none bg-white
        ${
          error
            ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-500 bg-danger-50'
            : 'border-slate-300 focus:border-primary-500 focus:ring-primary-500 hover:border-slate-400'
        }
        ${className}`}
      {...props}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
