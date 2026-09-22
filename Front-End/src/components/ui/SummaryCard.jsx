import { Edit3 } from "lucide-react";

export default function SummaryCard({
  icon,
  title,
  onEdit,
  children,
}) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between border-b border-[var(--line)] pb-3">
        <div className="flex items-center gap-2 text-sm font-black">
          <span className="text-[#087a45]">
            {icon}
          </span>

          {title}
        </div>

        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1 text-xs font-bold text-[#087a45]"
        >
          <Edit3 size={12} />
          Edit
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {children}
      </div>
    </div>
  );
}