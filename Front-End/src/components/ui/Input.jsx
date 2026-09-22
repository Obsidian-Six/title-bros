// export default function Input({
//   label,
//   value,
//   onChange,
//   placeholder,
//   type = "text",
//   prefix,
//   error,
// }) {
//   return (
//     <div>
//       <label className="mb-2.5 block text-sm font-bold tracking-[-0.01em] text-[#101512]">
//         {label}
//       </label>

//       <div className="relative">
//         {prefix && (
//           <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]">
//             {prefix}
//           </span>
//         )}

//         <input
//           type={type}
//           value={value}
//           onChange={onChange}
//           placeholder={placeholder}
//           className={[
//             "h-14 w-full rounded-2xl border bg-[var(--white)] text-[var(--ink)] px-4",
//             "text-base outline-none transition-all duration-300",
//             "placeholder:text-[var(--muted)]",
//             "focus:border-[var(--green)] focus:ring-4 focus:ring-[var(--green)]/10",
//             prefix ? "pl-9" : "",
//             error
//               ? "border-red-400 focus:border-red-500"
//               : "border-[var(--line)]",
//           ].join(" ")}
//         />
//       </div>

//       {error && (
//         <p className="mt-2 text-xs font-medium text-red-500">
//           {error}
//         </p>
//       )}
//     </div>
//   );
// }


"use client";

export default function Input({
  label,
  value = "",
  onChange,
  placeholder = "",
  type = "text",
  prefix,
  icon,
  error = "",
  optional = false,
  disabled = false,
  className = "",
  inputClassName = "",
  ...props
}) {
  return (
    <div className={className}>
      {label && (
        <label className="mb-2 block text-xs font-black uppercase tracking-[.1em] text-[var(--ink)]/45">
          {label}

          {optional && (
            // <span className="ml-2 font-medium normal-case tracking-normal text-black/30">
            <span className="ml-2 text-xs font-medium normal-case tracking-normal text-[var(--ink)]/45">
              Optional
            </span>
          )}
        </label>
      )}

      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]">
            {prefix}
          </span>
        )}

        {icon && (
          <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-[#087a45]">
            {icon}
          </span>
        )}

        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={[
            "h-14 w-full rounded-2xl border bg-white px-4",
            "text-[#000] outline-none transition",
            "placeholder:text-black/35",
            "focus:border-[#087a45]",
            icon ? "pl-11" : "",
            prefix ? "pl-9" : "",
            error
              ? "border-red-400"
              : "border-black/10",
            disabled
              ? "cursor-not-allowed bg-black/[0.03] opacity-60"
              : "",
            inputClassName,
          ].join(" ")}
          {...props}
        />
      </div>

      {error && (
        <span className="mt-1 block text-xs text-red-500">
          {error}
        </span>
      )}
    </div>
  );
}