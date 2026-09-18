"use client";

import Reveal from "./Reveal";
import { Star } from "lucide-react";
import { useTranslations } from "next-intl";

export default function TestimonialsSec() {
  const t = useTranslations("testimonials");
  const testimonials = t.raw("items") || [];

  return (
    <section className="section bg-[var(--paper)]">
      <div className="container-x">
        {/* SECTION HEADING */}
        <Reveal>
          <div className="eyebrow text-[var(--muted)]">
            {t("eyebrow")}
          </div>

          <h2 className="h2 mt-6 max-w-4xl text-[var(--ink)]">
            {t("pageTitle")}{" "}
            <span className="text-[var(--green)]">
              {t("titleHighlight")}
            </span>{" "}
            <span>{t("titleEnding")}</span>
          </h2>
        </Reveal>

        {/* TESTIMONIALS */}
        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {testimonials.map((item, i) => (
            <Reveal key={`${item.name}-${i}`} delay={i * 0.07}>
              <article className="card h-full p-7 transition duration-500 hover:-translate-y-2 hover:shadow-2xl! md:p-9">
                {/* STARS */}
                <div
                  className="flex gap-1 text-[var(--green)]"
                  aria-label="5 star rating"
                >
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      size={15}
                      fill="currentColor"
                      aria-hidden="true"
                    />
                  ))}
                </div>

                {/* QUOTE */}
                <blockquote className="mt-8 text-lg font-bold leading-8 tracking-tight text-[var(--ink)] md:text-xl">
                  “{item.quote}”
                </blockquote>

                {/* CUSTOMER */}
                <div className="mt-10 border-t border-[var(--line)] pt-5">
                  <div className="font-black text-[var(--ink)]">
                    {item.name}
                  </div>

                  <div className="mt-1 text-xs text-[var(--muted)]">
                    {item.meta}
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}