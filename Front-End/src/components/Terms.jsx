"use client";

import React from 'react'
import PageHero from './PageHero';
import { useTranslations } from 'next-intl';
import NextStep from './common/NextStep';

const Terms = () => {
    const t = useTranslations("legal");
  return (
    <>
    <PageHero pageKey="terms" />
    <section className="section pt-0">
      <div className="container-x max-w-4xl">
        <div className="card p-8 md:p-12">
          <p className="text-sm leading-8 text-[var(--muted)]">
            {t("placeholder")}
          </p>
        </div>
      </div>
    </section>
    <NextStep />
    </>
  )
}

export default Terms;