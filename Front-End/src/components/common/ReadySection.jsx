"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
import Button from "./Button";

const ReadySection = () => {
  const t = useTranslations("ready-section");
  const locale = useLocale();

  return (
    <section className="section pt-0">
      <div className="container-x">
        <div className="overflow-hidden rounded-[36px] bg-[#087a45] p-8 text-[var(--white)] md:p-16">
          <div className="grid items-end gap-10 md:grid-cols-[1fr_auto]">
            <div>
              <div className="eyebrow text-white/75 before:bg-[var(--green)]">
                {t("eyebrow")}
              </div>

              <h2 className="text-[var(--white)] mt-6 max-w-3xl text-5xl font-black leading-[.9] tracking-[-.06em] md:text-7xl">
                {t("title")}
              </h2>
            </div>

            <Button href={`/${locale}/apply`} className="btn-dark">
              {t("button")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReadySection;