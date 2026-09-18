"use client";
import Reveal from "./Reveal";
import StepCard from "./common/StepCard";
import { useTranslations } from "next-intl";

export default function WhyUsSec() {
  const t = useTranslations("why-us");

  const differentiators = t.raw("differentiators");
  return (
    <section className="section">
      <div className="container-x">
        <Reveal>
          <div className="eyebrow text-[var(--muted)]">{t("eyebrow")}</div>
          <div className="mt-6 flex flex-col justify-between gap-7 md:flex-row md:items-end">
            <h2 className="h2 max-w-3xl text-[var(--ink)]">
              {t("title")}{" "}
              <span className="text-[var(--green)]">{t("titleHighlight")}</span>
            </h2>
            <p className="max-w-sm text-sm leading-6 text-[var(--muted)]">
              {t("description")}
            </p>
          </div>
        </Reveal>

        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {differentiators?.map((item, i) => (
            <Reveal key={item.number} delay={i * 0.04}>
              <StepCard
                step={{
                  number: item.number,
                  title: item.title,
                  text: item.text,
                }}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
