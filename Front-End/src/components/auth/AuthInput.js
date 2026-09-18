"use client";

/**
 * ==============================================================================
 * Reusable Form Input Component (AuthInput)
 * ==============================================================================
 * Standardized input component designed for authentication forms:
 * - Left icon support from Lucide React
 * - Toggleable password visibility (Eye / EyeOff)
 * - Validation error messaging and highlight
 * - Styled with Title Bros design tokens (--green, --line, --paper, --ink)
 */

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function AuthInput({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder = "",
  icon: Icon,
  error = "",
  required = false,
  autoComplete,
  disabled = false,
}) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const actualType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label
          htmlFor={name}
          className="block text-xs font-semibold tracking-wide text-[var(--muted)]"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="pointer-events-none absolute left-3.5 text-[var(--muted)]">
            <Icon size={18} />
          </div>
        )}

        <input
          id={name}
          name={name}
          type={actualType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          disabled={disabled}
          className={`
            w-full rounded-xl border bg-[var(--paper)] py-3 text-sm font-medium text-[var(--ink)]
            transition-all duration-200 outline-none
            placeholder:text-[var(--muted)]/60
            ${Icon ? "pl-11" : "pl-4"}
            ${isPassword ? "pr-11" : "pr-4"}
            ${
              error
                ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                : "border-[var(--line)] focus:border-[var(--green)] focus:ring-2 focus:ring-[var(--green)]/20"
            }
            disabled:cursor-not-allowed disabled:opacity-60
          `}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs font-medium text-red-500 transition-opacity">
          {error}
        </p>
      )}
    </div>
  );
}
