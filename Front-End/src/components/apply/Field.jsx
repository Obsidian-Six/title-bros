// "use client";

// import Input from "@/components/ui/Input";

// export default function Field({
//   label,
//   value,
//   onChange,
//   error,
//   type = "text",
//   placeholder = "",
//   optional = false,
//   className = "",
//   prefix = "",
//   inputMode,
//   ...props
// }) {
//   return (
//     <label className={`block ${className}`}>
//       <span className="mb-2 block text-xs font-black uppercase tracking-[.1em] text-[var(--ink)]/45">
//         {label}

//         {optional && (
//           <span className="ml-2 normal-case tracking-normal text-black/30">
//             Optional
//           </span>
//         )}
//       </span>

//       <div className="relative">
//         {prefix && (
//           <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-bold text-black/40">
//             {prefix}
//           </span>
//         )}

//         <Input
//           {...props}
//           type={type}
//           value={value || ""}
//           inputMode={inputMode}
//           onChange={(event) =>
//             onChange(event.target.value)
//           }
//           placeholder={placeholder}
//           className={`h-14 w-full rounded-2xl border bg-white px-4 text-[var(--ink)] outline-none transition focus:border-[#087a45] ${
//             prefix ? "pl-8" : ""
//           } ${
//             error
//               ? "border-red-400"
//               : "border-black/10"
//           }`}
//         />
//       </div>

//       {error && (
//         <span className="mt-1 block text-xs text-red-500">
//           {error}
//         </span>
//       )}
//     </label>
//   );
// }


"use client";

import Input from "../ui/Input";

export default function Field({
  label,
  value,
  onChange,
  error,
  type = "text",
  placeholder,
  optional = false,
  icon,
  className = "",
  inputClassName = "",
}) {
  return (
    <Input
      label={label}
      value={value}
      onChange={onChange}
      type={type}
      placeholder={placeholder}
      optional={optional}
      icon={icon}
      error={error}
      className={className}
      inputClassName={inputClassName}
    />
  );
}