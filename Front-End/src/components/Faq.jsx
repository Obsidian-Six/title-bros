"use client";

import React from "react";
import Reveal from "./Reveal";
import PageHero from "./PageHero";
import { useTranslations } from "next-intl";
import NextStep from "./common/NextStep";

const Faq = () => {
  const t = useTranslations("faq");

  const faq = t.raw("items");

  return (
    <>
      <PageHero pageKey="faq" />

      <section className="pt-0">
        <div className="container-x max-w-5xl">
          <div className="space-y-3">
            {faq?.map((item, i) => (
              <Reveal key={item.question} delay={i * 0.015}>
                <details className="card group p-6 transition duration-500 hover:-translate-y-2 hover:shadow-2xl! md:p-7">
                  <summary className="cursor-pointer list-none pr-7 text-lg font-black text-[var(--ink)]">
                    {item.question}
                  </summary>

                  <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted)]">
                    {item.answer}
                  </p>
                </details>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <NextStep />
    </>
  );
};

export default Faq;
