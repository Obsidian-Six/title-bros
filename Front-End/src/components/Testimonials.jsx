"use client";

import React from "react";
import PageHero from "./PageHero";
import Reveal from "./Reveal";
import { useTranslations } from "next-intl";
import NextStep from "./common/NextStep";

function Testimonials() {
  const t = useTranslations("testimonials");
  const testimonials = t.raw("items");

  return (
    <>
      <PageHero pageKey="testimonials" />

      <section className="pt-0">
        <div className="container-x grid gap-5 lg:grid-cols-3">
          {testimonials?.map((item, i) => (
            <Reveal key={item.name} delay={i * 0.06}>
              <article className="card p-8">
                <div className="text-[var(--green)]">
                  ★★★★★
                </div>

                <blockquote className="mt-7 text-xl font-bold leading-8 text-[var(--ink)]">
                  “{item.quote}”
                </blockquote>

                <div className="mt-8 text-sm font-black text-[var(--ink)]">
                  {item.name}
                </div>

                <div className="mt-1 text-xs text-[var(--muted)]">
                  {item.meta}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
      <NextStep />
    </>
  );
}

export default Testimonials;