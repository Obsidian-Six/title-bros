"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

export default function LoanEstimator() {
  const [value, setValue] = useState(15000);
  const { locale } = useParams();
  const t = useTranslations("loanEstimator");

  const range = useMemo(() => {
    return {
      low: Math.round(value * 0.6),
      high: Math.round(value * 0.8),
    };
  }, [value]);

  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString("en-US")}`;
  };

  return (
    <section className="section bg-[var(--ink)] text-[var(--paper)]">
      <div className="container-x">
        <div className="grid items-center gap-12 lg:grid-cols-[.9fr_1.1fr]">
          <div>
            <div className="eyebrow text-[var(--paper)]/70 before:bg-[var(--green-dark)]">
              {t("eyebrow")}
            </div>

            <h2 className="h2 mt-6">{t("title")}</h2>

            <p className="mt-6 max-w-lg leading-7 text-[var(--paper)]/60">
              {t("description")}
            </p>

            <Link
              href={`/${locale}/calculator`}
              className="btn-primary mt-8 inline-flex items-center gap-2"
            >
              {t("calculatorButton")}
              <ArrowUpRight size={17} />
            </Link>
          </div>

          <div className="glass rounded-[34px] p-6 text-[var(--ink)] md:p-10">
            <div className="flex items-end justify-between gap-5">
              <div>
                <div className="text-xs font-black uppercase tracking-[.15em] text-[var(--muted)]">
                  {t("vehicleValue")}
                </div>

                <div className="mt-2 text-3xl font-black tracking-[-.06em] text-[var(--ink)] md:text-5xl">
                  {formatCurrency(value)}
                </div>
              </div>

              <div className="rounded-full bg-[var(--green-dark)] px-3 py-2 text-xs font-black text-white">
                {t("indicative")}
              </div>
            </div>

            <input
              type="range"
              min={3000}
              max={60000}
              step={500}
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="loan-slider mt-9 w-full accent-[var(--green)]"
              aria-label={t("vehicleValue")}
            />

            <div className="mt-9 rounded-[26px] bg-[var(--paper)] p-6">
              <div className="text-xs font-black uppercase tracking-[.15em] text-[var(--muted)]">
                {t("loanRange")}
              </div>

              <div className="mt-2 text-4xl font-black tracking-[-.05em] text-[var(--green)]">
                {formatCurrency(range.low)}
                {" — "}
                {formatCurrency(range.high)}
              </div>

              <p className="mt-3 text-xs leading-5 text-[var(--muted)]">
                {t("disclaimer")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
