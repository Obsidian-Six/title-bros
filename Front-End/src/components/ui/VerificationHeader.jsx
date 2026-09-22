export default function VerificationHeader({
  icon,
  title,
  children,
  description,
}) {
  return (
    <div className="mb-6 rounded-2xl border border-[#087a45]/10 bg-[#087a45]/5 p-5">
      <div className="flex items-start gap-4">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#087a45] text-white">
          {icon}
        </div>

        <div>
          <h3 className="font-black text-[var(--ink)]">
            {title}
          </h3>

          <p className="mt-1 text-sm leading-6 text-black/55">
            {children || description}
          </p>
        </div>
      </div>
    </div>
  );
}