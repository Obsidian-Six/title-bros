export default function StepNumber({
  number,
  active,
  complete,
}) {
  return (
    <div
      className={[
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
        "text-xs font-black transition-all duration-500",

        active
          ? "bg-[#087a45] text-white shadow-lg shadow-[#087a45]/20"
          : complete
            ? "bg-[#087a45]/10 text-[#087a45]"
            : "bg-black/[0.05] text-black/30",
      ].join(" ")}
    >
      {complete ? "✓" : number}
    </div>
  );
}