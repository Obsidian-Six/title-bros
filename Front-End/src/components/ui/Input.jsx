export default function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  prefix,
  error,
}) {
  return (
    <div>
      <label className="mb-2.5 block text-sm font-bold tracking-[-0.01em] text-[#101512]">
        {label}
      </label>

      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]">
            {prefix}
          </span>
        )}

        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={[
            "h-14 w-full rounded-2xl border bg-[var(--white)] text-[var(--ink)] px-4",
            "text-base outline-none transition-all duration-300",
            "placeholder:text-[var(--muted)]",
            "focus:border-[var(--green)] focus:ring-4 focus:ring-[var(--green)]/10",
            prefix ? "pl-9" : "",
            error
              ? "border-red-400 focus:border-red-500"
              : "border-[var(--line)]",
          ].join(" ")}
        />
      </div>

      {error && (
        <p className="mt-2 text-xs font-medium text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}