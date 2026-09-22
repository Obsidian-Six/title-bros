export default function SummaryItem({
  label,
  value,
}) {
  return (
    <div className="min-w-0">
      <span className="block text-[11px] font-medium text-[var(--muted)]">
        {label}
      </span>

      <p className="mt-1 truncate text-xs font-black text-[var(--ink)]">
        {value || "—"}
      </p>
    </div>
  );
}