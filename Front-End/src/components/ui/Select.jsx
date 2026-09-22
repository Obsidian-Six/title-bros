// export default function Select({
//   label,
//   value,
//   onChange,
//   children,
//   error,
// }) {
//   return (
//     <div>
//       <label className="mb-2.5 block text-sm font-bold tracking-[-0.01em] text-[#101512]">
//         {label}
//       </label>

//       <select
//         value={value}
//         onChange={onChange}
//         className={[
//           "h-14 w-full appearance-none rounded-2xl border",
//           "bg-[var(--white)] text-[var(--ink)] px-4 text-base outline-none transition-all",
//           "focus:border-[var(--green)] focus:ring-4 focus:ring-[var(--green)]/10",
//           error
//             ? "border-red-400"
//             : "border-[var(--line)]",
//         ].join(" ")}
//       >
//         {children}
//       </select>

//       {error && (
//         <p className="mt-2 text-xs font-medium text-red-500">
//           {error}
//         </p>
//       )}
//     </div>
//   );
// }

"use client";

export default function Select({
  label,
  value = "",
  onChange,
  children,
  error = "",
  optional = false,
  disabled = false,
  className = "",
  selectClassName = "",
}) {
  return (
    <div className={className}>
      {label && (
        // <label className="mb-2.5 block text-sm font-bold tracking-[-0.01em] text-[#101512]">
        <label className="mb-2 block text-xs font-black uppercase tracking-[.1em] text-[var(--ink)]/45">
          {label}

          {optional && (
            <span className="ml-2 font-medium normal-case tracking-normal text-black/30">
              Optional
            </span>
          )}
        </label>
      )}

      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={[
          "h-14 w-full appearance-none rounded-2xl border",
          "bg-white px-4 text-base",
          "outline-none transition",
          "focus:border-[#087a45] text-[#000]",
          error
            ? "border-red-400"
            : "border-black/10",
          disabled
            ? "cursor-not-allowed bg-black/[0.03] opacity-60"
            : "",
          selectClassName,
        ].join(" ")}
      >
        {children}
      </select>

      {error && (
        <span className="mt-1 block text-xs text-red-500">
          {error}
        </span>
      )}
    </div>
  );
}