import { CheckCircle2 } from "lucide-react";

export default function DocumentsCard({
  title = "Documents checklist",
  items = [],
}) {
  return (
    <div className="mt-8 rounded-[28px] border border-[var(--line)] bg-[var(--white)] shadow-sm bg-[#101512] p-8 text-[var(--ink)] md:p-12">
      <h2 className="text-3xl font-black text-[var(--ink)]">{title}</h2>

      <div className="mt-7 grid gap-3 md:grid-cols-3">
        {items.map((item) => (
          <div
            key={item}
            className="flex gap-3 rounded-2xl border border-[var(--ink)]/10 p-4 text-sm text-white/70"
          >
            <CheckCircle2
              size={18}
              className="shrink-0 text-[var(--green)]"
            />

            <span className="text-[var(--ink)]">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}