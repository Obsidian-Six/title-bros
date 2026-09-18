"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function CustomSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  const selectedOption = options.find((option) => option.value === value);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div ref={selectRef} className="relative">
      {label && <label className="mb-2 block text-sm font-bold text-[#101512]">{label}</label>}

      {/* Selected value */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between rounded-xl border bg-[var(--white)] px-4 py-3 text-left text-[var(--ink)] ${
          isOpen ? "border-[var(--green)] ring-1 ring-[var(--green)]" : "border-[var(--line)]"
        }`}
      >
        <span className={selectedOption ? "text-[var(--ink)]" : "text-[var(--muted)]"}>
          {selectedOption
            ? `${selectedOption.label}${
                selectedOption.description
                  ? ` — ${selectedOption.description}`
                  : ""
              }`
            : placeholder}
        </span>

        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {/* Dropdown options */}
      {isOpen && (
        <div className="absolute left-0 top-full z-[9999] mt-2 w-full rounded-xl border border-[var(--line)] bg-[var(--white)] shadow-xl">
          <div
            className="max-h-[250px] overflow-y-auto overscroll-contain"
            onWheel={(e) => e.stopPropagation()}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option)}
                className={`block w-full px-4 py-3 text-left hover:bg-[var(--paper)] transition ${
                  option.value === value ? "bg-[var(--paper)] font-semibold text-[var(--green)]" : "text-[var(--ink)]"
                }`}
              >
                <div className="text-sm font-medium">{option.label}</div>

                {option.description && (
                  <div className="mt-1 text-xs text-[var(--muted)]">
                    {option.description}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
