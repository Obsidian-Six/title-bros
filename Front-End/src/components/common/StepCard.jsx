export default function StepCard({ step }) {
  return (
    <div className="card min-h-[330px] p-7 transition duration-500 hover:-translate-y-2 hover:shadow-2xl!">
      <div className="grid h-11 w-11 place-items-center rounded-full bg-[#eaf6d5] text-sm font-black text-[var(--green-dark)] dark:bg-[#087a45]/25 dark:text-[#b9ef3b]">
        {step.number}
      </div>

      <h2 className="mt-20 text-2xl font-black text-[var(--ink)]">
        {step.title}
      </h2>

      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
        {step.text}
      </p>
    </div>
  );
}