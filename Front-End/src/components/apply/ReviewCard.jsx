"use client";

import { Edit3 } from "lucide-react";

export function ReviewCard({
  icon,
  title,
  onEdit,
  children,
}) {
  return (
    <div className="mt-4 rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between border-b border-[#dadada] pb-3">
        <div className="flex items-center gap-2 text-sm font-black text-[var(--ink)]">
          <span className="text-[var(--green)]">
            {icon}
          </span>

          <span className="block text-sm font-bold tracking-[-0.01em] text-[#101512]">{title}</span>
        </div>

        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1 text-xs font-bold text-[var(--green)] hover:underline"
          >
            <Edit3 size={12} />
            Edit
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </div>
  );
}

export function ReviewItem({
  label,
  value,
}) {
  return (
    <div>
      <span className="block font-medium text-[var(--muted)]">
        {label}
      </span>

      <p className="mt-0.5 break-words font-black text-[#000]">
        {value || "—"}
      </p>
    </div>
  );
}