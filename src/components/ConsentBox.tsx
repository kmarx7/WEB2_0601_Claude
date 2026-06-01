"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface ConsentBoxProps {
  badge: "필수" | "선택";
  title: string;
  children: React.ReactNode;
  checkboxId: string;
  checkboxLabel: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
}

export function ConsentBox({
  badge,
  title,
  children,
  checkboxId,
  checkboxLabel,
  checked,
  onChange,
  error,
}: ConsentBoxProps) {
  const [open, setOpen] = useState(false);
  const isRequired = badge === "필수";

  return (
    <div
      className={`rounded-xl border ${
        error ? "border-red-400" : isRequired ? "border-blue-200" : "border-gray-200"
      } overflow-hidden`}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={`w-full flex items-center justify-between px-4 py-3 text-left transition ${
          isRequired ? "bg-blue-50 hover:bg-blue-100" : "bg-gray-50 hover:bg-gray-100"
        }`}
        aria-expanded={open}
      >
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              isRequired
                ? "bg-blue-600 text-white"
                : "bg-gray-400 text-white"
            }`}
          >
            {badge}
          </span>
          <span className="text-sm font-medium text-gray-800">{title}</span>
        </div>
        <ChevronDown
          size={16}
          className={`text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Accordion body */}
      <div
        className={`transition-all duration-200 overflow-hidden ${
          open ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 py-3 bg-white text-xs text-gray-600 leading-relaxed border-t border-gray-100">
          {children}
        </div>
      </div>

      {/* Checkbox */}
      <div className={`px-4 py-3 bg-white border-t border-gray-100 flex items-center gap-2`}>
        <input
          type="checkbox"
          id={checkboxId}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
        />
        <label htmlFor={checkboxId} className="text-sm text-gray-700 cursor-pointer select-none">
          {checkboxLabel}
        </label>
      </div>

      {error && (
        <p className="px-4 pb-3 text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
