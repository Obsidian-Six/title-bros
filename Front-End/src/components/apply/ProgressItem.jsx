"use client";

import { Check } from "lucide-react";

export default function ProgressItem({
  number,
  title,
  description,
  active,
  completed,
}) {
  return (
    <div
      className={`flex items-center gap-4 ${
        completed || active
          ? "text-[#087a45]"
          : "text-black/35"
      }`}
    >
      <div
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border text-xs font-black ${
          completed
            ? "border-[#087a45] bg-[#087a45] text-white"
            : active
            ? "border-[#087a45] bg-white text-[#087a45] ring-2 ring-[#087a45]/30"
            : "border-black/10"
        }`}
      >
        {completed ? (
          <Check size={16} />
        ) : (
          number
        )}
      </div>

      <div>
        <div className="text-sm font-black">
          {title}
        </div>

        <div className="text-xs">
          {description}
        </div>
      </div>
    </div>
  );
}