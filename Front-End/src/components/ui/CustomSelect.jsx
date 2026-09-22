// "use client";

// import { useState, useRef, useEffect } from "react";
// import { ChevronDown, ChevronUp } from "lucide-react";

// export default function CustomSelect({
//   label,
//   value,
//   onChange,
//   options,
//   placeholder = "Select an option",
// }) {
//   const [isOpen, setIsOpen] = useState(false);
//   const selectRef = useRef(null);

//   const selectedOption = options.find((option) => option.value === value);

//   // Close when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (selectRef.current && !selectRef.current.contains(event.target)) {
//         setIsOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   const handleSelect = (option) => {
//     onChange(option.value);
//     setIsOpen(false);
//   };

//   return (
//     <div ref={selectRef} className="relative">
//       {label && <label className="mb-2 block text-sm font-bold text-[#101512]">{label}</label>}

//       {/* Selected value */}
//       <button
//         type="button"
//         onClick={() => setIsOpen(!isOpen)}
//         className={`flex w-full items-center justify-between rounded-xl border bg-[var(--white)] px-4 py-3 text-left text-[var(--ink)] ${
//           isOpen ? "border-[var(--green)] ring-1 ring-[var(--green)]" : "border-[var(--line)]"
//         }`}
//       >
//         <span className={selectedOption ? "text-[var(--ink)]" : "text-[var(--muted)]"}>
//           {selectedOption
//             ? `${selectedOption.label}${
//                 selectedOption.description
//                   ? ` — ${selectedOption.description}`
//                   : ""
//               }`
//             : placeholder}
//         </span>

//         {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
//       </button>

//       {/* Dropdown options */}
//       {isOpen && (
//         <div className="absolute left-0 top-full z-[9999] mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--white)] shadow-xl">
//           <div
//             className="max-h-[250px] overflow-y-auto overscroll-contain"
//             onWheel={(e) => e.stopPropagation()}
//           >
//             {options.map((option) => (
//               <button
//                 key={option.value}
//                 type="button"
//                 onClick={() => handleSelect(option)}
//                 className={`block w-full px-4 py-3 text-left hover:bg-[var(--paper)] transition ${
//                   option.value === value ? "bg-[var(--paper)] font-semibold text-[var(--green)]" : "text-[var(--ink)]"
//                 }`}
//               >
//                 <div className="text-sm font-medium">{option.label}</div>

//                 {option.description && (
//                   <div className="mt-1 text-xs text-[var(--muted)]">
//                     {option.description}
//                   </div>
//                 )}
//               </button>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// "use client";

// import {
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from "react";

// import {
//   Check,
//   ChevronDown,
// } from "lucide-react";

// export default function CustomSelect({
//   label,
//   value,
//   onChange,
//   options = [],
//   placeholder = "Select...",
//   error = "",
//   disabled = false,

//   getOptionValue = (option) =>
//     typeof option === "object"
//       ? option.value
//       : option,

//   getOptionLabel = (option) =>
//     typeof option === "object"
//       ? option.label
//       : option,
// }) {
//   const [open, setOpen] =
//     useState(false);

//   const ref = useRef(null);

//   useEffect(() => {
//     const closeDropdown = (event) => {
//       if (
//         !ref.current?.contains(
//           event.target
//         )
//       ) {
//         setOpen(false);
//       }
//     };

//     document.addEventListener(
//       "mousedown",
//       closeDropdown
//     );

//     return () => {
//       document.removeEventListener(
//         "mousedown",
//         closeDropdown
//       );
//     };
//   }, []);

//   const selected = useMemo(
//     () =>
//       options.find(
//         (option) =>
//           getOptionValue(option) ===
//           value
//       ),
//     [options, value, getOptionValue]
//   );

//   return (
//     <div
//       ref={ref}
//       className="relative"
//     >
//       <span className="mb-2.5 block text-sm font-bold tracking-[-0.01em] text-[#101512]">
//         {label}
//       </span>

//       <button
//         type="button"
//         disabled={disabled}
//         onClick={() =>
//           setOpen(
//             (previous) => !previous
//           )
//         }
//         className={`flex h-14 w-full items-center justify-between rounded-2xl border bg-white px-4 text-left outline-none ${
//           error
//             ? "border-red-400"
//             : "border-black/10"
//         } ${
//           disabled
//             ? "cursor-not-allowed bg-black/[0.03] text-black/30"
//             : ""
//         }`}
//       >
//         <span
//           className={
//             selected
//               ? "truncate text-[var(--ink)]"
//               : "truncate text-black/35"
//           }
//         >
//           {selected
//             ? getOptionLabel(selected)
//             : placeholder}
//         </span>

//         <ChevronDown
//           size={18}
//           className={
//             open
//               ? "rotate-180 transition"
//               : "transition"
//           }
//         />
//       </button>

//       {error && (
//         <span className="mt-1 block text-xs text-red-500">
//           {error}
//         </span>
//       )}

//       {open && !disabled && (
//         <div className="absolute left-0 right-0 z-[100] mt-2 max-h-72 overflow-y-auto rounded-2xl border border-black/10 bg-white p-1 shadow-2xl">
//           {options.length ? (
//             options.map((option) => {
//               const optionValue =
//                 getOptionValue(option);

//               const optionLabel =
//                 getOptionLabel(option);

//               const active =
//                 optionValue === value;

//               return (
//                 <button
//                   key={optionValue}
//                   type="button"
//                   onClick={() => {
//                     onChange(
//                       optionValue
//                     );

//                     setOpen(false);
//                   }}
//                   className={`flex w-full items-center justify-between rounded-xl px-3 py-3 text-left text-sm hover:bg-[#087a45]/10 ${
//                     active
//                       ? "bg-[#087a45]/10 font-bold text-[#087a45]"
//                       : ""
//                   }`}
//                 >
//                   {optionLabel}

//                   {active && (
//                     <Check size={15} />
//                   )}
//                 </button>
//               );
//             })
//           ) : (
//             <div className="p-6 text-center text-sm text-black/45">
//               No options found.
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }


"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Check,
  ChevronDown,
} from "lucide-react";

export default function CustomSelect({
  label,
  value,
  onChange,
  options = [],
  placeholder = "Select...",
  error = "",
  disabled = false,

  getOptionValue = (option) =>
    typeof option === "object"
      ? option.value
      : option,

  getOptionLabel = (option) =>
    typeof option === "object"
      ? option.label
      : option,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!ref.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  const selected = useMemo(
    () =>
      options.find(
        (option) =>
          getOptionValue(option) === value
      ),
    [options, value, getOptionValue]
  );

  return (
    <div
      ref={ref}
      className="relative"
    >
      {label && (
        // <span className="mb-2.5 block text-sm font-bold tracking-[-0.01em] text-[#101512]">
        <span className="mb-2 block text-xs font-black uppercase tracking-[.1em] text-[var(--ink)]/45">
          {label}
        </span>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          setOpen((previous) => !previous)
        }
        className={[
          "flex h-14 w-full items-center",
          "justify-between rounded-2xl border",
          "bg-white px-4 text-left outline-none text-[#101512]",
          error
            ? "border-red-400"
            : "border-black/10",
          disabled
            ? "cursor-not-allowed bg-black/[0.03] text-black/30"
            : "",
        ].join(" ")}
      >
        <span
          className={
            selected
              ? "truncate text-[#000]"
              : "truncate text-black/35"
          }
        >
          {selected
            ? getOptionLabel(selected)
            : placeholder}
        </span>

        <ChevronDown
          size={18}
          className={
            open
              ? "rotate-180 transition"
              : "transition"
          }
        />
      </button>

      {error && (
        <span className="mt-1 block text-xs text-red-500">
          {error}
        </span>
      )}

      {open && !disabled && (
        // <div className="absolute left-0 right-0 z-[100] mt-2 max-h-72 overflow-y-auto rounded-2xl border border-black/10 bg-white p-1 shadow-2xl">
        <div className="absolute left-0 right-0 z-[100] mt-2 max-h-72 overflow-y-auto rounded-2xl border border-black/10 bg-white p-1 shadow-2xl">
          {options.length ? (
            options.map((option) => {
              const optionValue =
                getOptionValue(option);

              const optionLabel =
                getOptionLabel(option);

              const active =
                optionValue === value;

              return (
                <button
                  key={String(optionValue)}
                  type="button"
                  onClick={() => {
                    onChange(optionValue);
                    setOpen(false);
                  }}
                  className={[
                    "flex w-full items-center",
                    "justify-between rounded-xl",
                    "px-3 py-3 text-left text-sm",
                    "transition hover:bg-[#087a45]/10 text-[#101512]",
                    active
                      ? "bg-[#087a45]/10 font-bold text-[#087a45]"
                      : "",
                  ].join(" ")}
                >
                  {optionLabel}

                  {active && (
                    <Check size={15} />
                  )}
                </button>
              );
            })
          ) : (
            <div className="p-6 text-center text-sm text-black/45">
              No options found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}