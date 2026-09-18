export default function Select({
  label,
  value,
  onChange,
  children,
  error,
}) {
  return (
    <div>
      <label className="mb-2.5 block text-sm font-bold tracking-[-0.01em] text-[#101512]">
        {label}
      </label>

      <select
        value={value}
        onChange={onChange}
        className={[
          "h-14 w-full appearance-none rounded-2xl border",
          "bg-[var(--white)] text-[var(--ink)] px-4 text-base outline-none transition-all",
          "focus:border-[var(--green)] focus:ring-4 focus:ring-[var(--green)]/10",
          error
            ? "border-red-400"
            : "border-[var(--line)]",
        ].join(" ")}
      >
        {children}
      </select>

      {error && (
        <p className="mt-2 text-xs font-medium text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}