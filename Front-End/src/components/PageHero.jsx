"use client";

import React from "react";
import { useTranslations } from "next-intl";
import Reveal from "./Reveal";

function PageHero({ pageKey }) {
  const t = useTranslations("pages");

  return (
    <section className="pb-20 pt-40">
      <div className="container-x">
        <Reveal>
          <div className="eyebrow text-[var(--muted)]">
            {t(`${pageKey}.eyebrow`)}
          </div>

          <h1 className="h2 mt-6 max-w-6xl text-[var(--ink)]">
            {t(`${pageKey}.title`)}
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            {t(`${pageKey}.intro`)}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export default PageHero;
