"use client";

import Reveal from "./Reveal";
import CountUp from "./CountUp";
import { useTranslations } from "next-intl";

export default function Stats() {
  const t = useTranslations();

  const stats = t.raw("stats");

  return (
    <section className="border-y border-[var(--line)] bg-[var(--white)]">
      <div className="container-x grid grid-cols-2 md:grid-cols-4">
        {stats.map((item, i) => (
          <Reveal
            key={item.label}
            className={`px-5 py-12 md:px-8 ${
              i ? "border-l border-[var(--line)]" : ""
            }`}
          >
            <div className="text-5xl font-black tracking-[-.06em] text-[var(--green)] md:text-6xl">
              <CountUp value={item.value} />
            </div>

            <div className="mt-3 max-w-[170px] text-sm font-semibold leading-5 text-[var(--muted)]">
              {item.label}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}