// "use client";

// import { useEffect, useRef, useState } from "react";
// import {
//   ChevronDown,
//   Loader2,
//   Search,
//   X,
// } from "lucide-react";

// export default function VehicleSelect({
//   label,
//   value,
//   options = [],
//   loading = false,
//   disabled = false,
//   placeholder = "Select...",
//   error,
//   onChange,
// }) {
//   const [open, setOpen] = useState(false);

//   const [search, setSearch] =
//     useState("");

//   const containerRef =
//     useRef(null);

//   /*
//    * Close dropdown when clicking outside.
//    */
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         containerRef.current &&
//         !containerRef.current.contains(
//           event.target
//         )
//       ) {
//         setOpen(false);
//       }
//     };

//     document.addEventListener(
//       "mousedown",
//       handleClickOutside
//     );

//     return () => {
//       document.removeEventListener(
//         "mousedown",
//         handleClickOutside
//       );
//     };
//   }, []);

//   /*
//    * Filter options.
//    */
//   const filteredOptions =
//     options.filter((option) =>
//       option.name
//         .toLowerCase()
//         .includes(search.toLowerCase())
//     );

//   /*
//    * Selected label.
//    */
//   const selectedOption =
//     options.find(
//       (option) =>
//         option.name === value
//     );

//   const handleSelect = (option) => {
//     onChange(option.name);

//     setSearch("");

//     setOpen(false);
//   };

//   return (
//     <div
//       ref={containerRef}
//       className="relative"
//     >
//       <span className="mb-2.5 block text-sm font-bold tracking-[-0.01em] text-[#101512]">
//         {label}
//       </span>

//       {/* SELECT BUTTON */}

//       <button
//         type="button"
//         disabled={disabled}
//         onClick={() => {
//           if (!disabled) {
//             setOpen((prev) => !prev);
//           }
//         }}
//         className={`flex h-14 w-full items-center justify-between rounded-2xl border bg-white px-4 text-left outline-none transition ${
//           error
//             ? "border-red-400"
//             : "border-black/10"
//         } ${
//           disabled
//             ? "cursor-not-allowed bg-black/[0.03] text-black/30"
//             : "text-[var(--ink)] hover:border-black/20 focus:border-[#087a45]"
//         }`}
//       >
//         <span
//           className={
//             selectedOption
//               ? "text-[var(--ink)]"
//               : "text-black/35"
//           }
//         >
//           {loading
//             ? "Loading..."
//             : selectedOption?.name ||
//               placeholder}
//         </span>

//         {loading ? (
//           <Loader2
//             size={17}
//             className="animate-spin text-[#087a45]"
//           />
//         ) : (
//           <ChevronDown
//             size={18}
//             className={`transition-transform ${
//               open
//                 ? "rotate-180"
//                 : ""
//             }`}
//           />
//         )}
//       </button>

//       {/* ERROR */}

//       {error && (
//         <span className="mt-1 block text-xs text-red-500">
//           {error}
//         </span>
//       )}

//       {/* DROPDOWN */}

//       {open && !disabled && (
//         <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl">

//           {/* SEARCH */}

//           <div className="border-b border-black/10 p-2">

//             <div className="relative">

//               <Search
//                 size={16}
//                 className="absolute left-3 top-1/2 -translate-y-1/2 text-black/35"
//               />

//               <input
//                 type="text"
//                 value={search}
//                 autoFocus
//                 onChange={(e) =>
//                   setSearch(
//                     e.target.value
//                   )
//                 }
//                 placeholder={`Search ${label.toLowerCase()}...`}
//                 className="h-11 w-full rounded-xl pl-9 pr-9 text-sm outline-none focus:bg-black/[0.05]
//                 h-14 w-full rounded-2xl border bg-[var(--white)] text-[var(--ink)] px-4 text-base outline-none transition-all duration-300 placeholder:text-[var(--muted)] focus:border-[var(--green)] focus:ring-4 focus:ring-[var(--green)]/10  border-[var(--line)]"
//               />

//               {search && (
//                 <button
//                   type="button"
//                   onClick={() =>
//                     setSearch("")
//                   }
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-black/35 hover:text-black"
//                 >
//                   <X size={15} />
//                 </button>
//               )}

//             </div>

//           </div>

//           {/* OPTIONS */}

//           <div className="max-h-64 overflow-y-auto p-1">

//             {loading ? (
//               <div className="flex items-center justify-center gap-2 px-4 py-8 text-sm text-black/45">
//                 <Loader2
//                   size={16}
//                   className="animate-spin text-[#087a45]"
//                 />

//                 Loading...
//               </div>
//             ) : filteredOptions.length === 0 ? (
//               <div className="px-4 py-8 text-center text-sm text-black/45">
//                 No {label.toLowerCase()} found.
//               </div>
//             ) : (
//               filteredOptions.map(
//                 (option) => (
//                   <button
//                     key={
//                       option.id ||
//                       option.name
//                     }
//                     type="button"
//                     onClick={() =>
//                       handleSelect(
//                         option
//                       )
//                     }
//                     className={`flex w-full items-center rounded-xl px-3 py-3 text-left text-sm transition hover:bg-[#087a45]/10 ${
//                       value ===
//                       option.name
//                         ? "bg-[#087a45]/10 font-bold text-[#087a45]"
//                         : "text-[var(--ink)]"
//                     }`}
//                   >
//                     {option.name}
//                   </button>
//                 )
//               )
//             )}

//           </div>

//         </div>
//       )}
//     </div>
//   );
// }

// "use client";

// import {
//   useMemo,
//   useState,
// } from "react";

// import {
//   ChevronDown,
//   Loader2,
//   Search,
//   X,
// } from "lucide-react";

// export default function VehicleSelect({
//   label,
//   value,
//   options = [],
//   loading = false,
//   disabled = false,
//   placeholder = "Select...",
//   error = "",
//   onChange,
// }) {
//   const [open, setOpen] =
//     useState(false);

//   const [search, setSearch] =
//     useState("");

//   const filteredOptions = useMemo(() => {
//     const query =
//       search.trim().toLowerCase();

//     if (!query) {
//       return options;
//     }

//     return options.filter((option) =>
//       String(option.name)
//         .toLowerCase()
//         .includes(query)
//     );
//   }, [options, search]);

//   const selected = options.find(
//     (option) =>
//       option.name === value
//   );

//   const close = () => {
//     setOpen(false);
//     setSearch("");
//   };

//   return (
//     <div className="relative">
//       <span className="mb-2.5 block text-sm font-bold tracking-[-0.01em] text-[#101512]">
//         {label}
//       </span>

//       <button
//         type="button"
//         disabled={disabled}
//         onClick={() =>
//           !disabled &&
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
//           {loading
//             ? "Loading..."
//             : selected?.name ||
//               placeholder}
//         </span>

//         {loading ? (
//           <Loader2
//             size={17}
//             className="animate-spin text-[#087a45]"
//           />
//         ) : (
//           <ChevronDown
//             size={18}
//             className={
//               open
//                 ? "rotate-180 transition"
//                 : "transition"
//             }
//           />
//         )}
//       </button>

//       {error && (
//         <span className="mt-1 block text-xs text-red-500">
//           {error}
//         </span>
//       )}

//       {open && !disabled && (
//         <>
//           <div
//             className="fixed inset-0 z-[90]"
//             onClick={close}
//           />

//           <div className="absolute left-0 right-0 z-[100] mt-2 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl">
//             <div className="border-b border-black/10 p-2">
//               <div className="relative">
//                 <Search
//                   size={16}
//                   className="absolute left-3 top-1/2 -translate-y-1/2 text-black/35"
//                 />

//                 <input
//                   autoFocus
//                   value={search}
//                   onChange={(event) =>
//                     setSearch(
//                       event.target.value
//                     )
//                   }
//                   placeholder={`Search ${label.toLowerCase()}...`}
//                   className="h-11 w-full rounded-xl bg-black/[0.03] pl-9 pr-9 text-sm outline-none"
//                 />

//                 {search && (
//                   <button
//                     type="button"
//                     onClick={() =>
//                       setSearch("")
//                     }
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-black/35"
//                   >
//                     <X size={15} />
//                   </button>
//                 )}
//               </div>
//             </div>

//             <div className="max-h-72 overflow-y-auto p-1">
//               {loading ? (
//                 <div className="flex items-center justify-center gap-2 p-8 text-sm text-black/45">
//                   <Loader2
//                     size={16}
//                     className="animate-spin"
//                   />

//                   Loading...
//                 </div>
//               ) : filteredOptions.length ===
//                 0 ? (
//                 <div className="p-8 text-center text-sm text-black/45">
//                   No results found.
//                 </div>
//               ) : (
//                 filteredOptions.map(
//                   (option) => (
//                     <button
//                       key={
//                         option.id ||
//                         option.name
//                       }
//                       type="button"
//                       onClick={() => {
//                         onChange(
//                           option.name
//                         );

//                         close();
//                       }}
//                       className={`flex w-full rounded-xl px-3 py-3 text-left text-sm transition hover:bg-[#087a45]/10 ${
//                         value === option.name
//                           ? "bg-[#087a45]/10 font-bold text-[#087a45]"
//                           : ""
//                       }`}
//                     >
//                       {option.name}
//                     </button>
//                   )
//                 )
//               )}
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

"use client";

import {
  useMemo,
  useState,
} from "react";

import {
  ChevronDown,
  Loader2,
  Search,
  X,
} from "lucide-react";

export default function VehicleSelect({
  label,
  value,
  options = [],
  loading = false,
  disabled = false,
  placeholder = "Select...",
  error = "",
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredOptions = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) return options;

    return options.filter((option) =>
      String(option.name)
        .toLowerCase()
        .includes(query)
    );
  }, [options, search]);

  const selected = options.find(
    (option) =>
      option.name === value
  );

  const close = () => {
    setOpen(false);
    setSearch("");
  };

  return (
    <div className="relative">
      <span className="mb-2 block text-xs font-black uppercase tracking-[.1em] text-[var(--ink)]/45">
        {label}
      </span>

      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          !disabled &&
          setOpen((previous) => !previous)
        }
        className={[
          "flex h-14 w-full items-center",
          "justify-between rounded-2xl border",
          "bg-white px-4 text-left outline-none",
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
          {loading
            ? "Loading..."
            : selected?.name || placeholder}
        </span>

        {loading ? (
          <Loader2
            size={17}
            className="animate-spin text-[#087a45]"
          />
        ) : (
          <ChevronDown
            size={18}
            className={
              open
                ? "rotate-180 transition text-[#000]"
                : "transition text-[#000]"
            }
          />
        )}
      </button>

      {error && (
        <span className="mt-1 block text-xs text-red-500">
          {error}
        </span>
      )}

      {open && !disabled && (
        <>
          <div
            className="fixed inset-0 z-[90]"
            onClick={close}
          />

          <div className="absolute left-0 right-0 z-[100] mt-2 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl">
            <div className="border-b border-black/10 p-2">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-black/35"
                />

                <input
                  autoFocus
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder={`Search ${label.toLowerCase()}...`}
                  className="h-11 w-full rounded-xl bg-black/[0.03] pl-9 pr-9 text-sm outline-none text-[#000]"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearch("")
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/35"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto p-1">
              {loading ? (
                <div className="flex items-center justify-center gap-2 p-8 text-sm text-black/45">
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                  Loading...
                </div>
              ) : filteredOptions.length === 0 ? (
                <div className="p-8 text-center text-sm text-black/45">
                  No results found.
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={
                      option.id ||
                      option.name
                    }
                    type="button"
                    onClick={() => {
                      onChange(option.name);
                      close();
                    }}
                    className={[
                      "flex w-full rounded-xl",
                      "px-3 py-3 text-left text-sm",
                      "transition hover:bg-[#087a45]/10 text-[#000]",
                      value === option.name
                        ? "bg-[#087a45]/10 font-bold text-[#087a45]"
                        : "",
                    ].join(" ")}
                  >
                    {option.name}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}