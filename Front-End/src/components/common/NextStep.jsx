import { ArrowUpRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import React from "react";

const NextStep = () => {
    const t = useTranslations("next-step");
    const locale = useLocale();
  return (
    <section className="section pt-0">
      <div className="container-x">
        <div className="rounded-[34px] bg-[var(--green)] p-8 md:p-12">
          <div className="eyebrow">{t("eyebrow")}</div>

          <h2 className="mt-5 max-w-3xl text-4xl font-black tracking-[-.05em] md:text-6xl">
            {t("title")}
          </h2>

          <Link href={`/${locale}/apply`} className="btn-dark mt-7">
            {t("button")}
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NextStep;
