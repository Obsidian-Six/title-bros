"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Reveal from "./Reveal";
import { useTranslations } from "next-intl";

export default function FAQPreview() {
  const [active, setActive] = useState(0);

  const { locale } = useParams();

  const t = useTranslations("faq");
  const faq = t.raw("items") || [];

  return (
    <section className="section">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">

          {/* Left Content */}
          <Reveal>
            <div className="eyebrow text-[var(--muted)]">
              {t("eyebrow")}
            </div>

            <h2 className="h2 mt-6 text-[var(--ink)]">
              {t("title1")}{" "}
              <span className="text-[var(--green)]">
                {t("titleHighlight")}
              </span>
            </h2>

            <p className="mt-6 max-w-md leading-7 text-[var(--muted)]">
              {t("intro")}
            </p>

            <Link
              href={`/${locale}/faq`}
              className="btn-dark mt-8 inline-flex"
            >
              {t("seeAll")}
            </Link>
          </Reveal>

          {/* FAQ Items */}
          <div className="border-t border-[var(--line)]">
            {faq.slice(0, 5).map((item, i) => (
              <Reveal key={item.question} delay={i * 0.03}>
                <div className="border-b border-[var(--line)]">

                  <button
                    type="button"
                    onClick={() =>
                      setActive(active === i ? -1 : i)
                    }
                    className="flex w-full items-center justify-between gap-5 py-6 text-left"
                  >
                    <span className="text-base font-black text-[var(--ink)] md:text-lg">
                      {item.question}
                    </span>

                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--line)] bg-[var(--white)] text-[var(--ink)] shadow-sm">
                      {active === i ? (
                        <Minus size={16} />
                      ) : (
                        <Plus size={16} />
                      )}
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-500 ${
                      active === i
                        ? "grid-rows-[1fr] pb-6"
                        : "grid-rows-[0fr]"
                    }`}
                  >
                    <div className="overflow-hidden text-sm leading-6 text-[var(--muted)]">
                      {item.answer}
                    </div>
                  </div>

                </div>
              </Reveal>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}