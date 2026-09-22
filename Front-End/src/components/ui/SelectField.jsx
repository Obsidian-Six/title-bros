"use client";

export default function SelectField({
  label,
  value,
  onChange,
  options = [],
  error = "",
  placeholder = "Select...",
  className = "",
}) {
  return (
    <label className={`block ${className}`}>
      {/* <span className="mb-2.5 block text-sm font-bold tracking-[-0.01em] text-[#101512]"> */}
      <span className="mb-2.5 block text-sm font-bold tracking-[-0.01em] text-[#101512]">
        {label}
      </span>

      <select
        value={value || ""}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className={`h-14 w-full rounded-2xl border bg-white px-4 outline-none focus:border-[#087a45] ${
          error
            ? "border-red-400"
            : "border-black/10"
        }`}
      >
        <option value="">
          {placeholder}
        </option>

        {options.map((option) => {
          const item =
            typeof option === "object"
              ? option
              : {
                  value: option,
                  label: option,
                };

          return (
            <option
              key={item.value}
              value={item.value}
            >
              {item.label}
            </option>
          );
        })}
      </select>

      {error && (
        <span className="mt-1 block text-xs text-red-500">
          {error}
        </span>
      )}
    </label>
  );
}