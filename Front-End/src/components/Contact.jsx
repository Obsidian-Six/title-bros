"use client";

import React from "react";
import Reveal from "./Reveal";
import { ArrowUpRight, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import PageHero from "./PageHero";
import NextStep from "./common/NextStep";

const Contact = () => {
  const t = useTranslations("contact");
  const { locale } = useParams();

  return (
    <>
    <PageHero pageKey="contact" />
    <section className="pt-0">
      <div className="container-x grid gap-5 lg:grid-cols-[.8fr_1.2fr]">
        <Reveal>
          <div className="rounded-[24px] border border-[var(--line)] bg-[var(--ink)] p-8 text-[var(--paper)] shadow-sm md:p-10">
            <div className="eyebrow text-[var(--muted)] before:bg-[var(--green-dark)]">
              {t("location")}
            </div>

            <h2 className="mt-6 text-4xl font-black tracking-tight text-[var(--white)]">
              {t("title")}
            </h2>

            <div className="mt-9 space-y-5 text-sm text-[var(--paper)]/80">
              <div className="flex gap-3">
                <Phone
                  size={18}
                  className="text-[var(--green-dark)]"
                />
                {t("phone")}
              </div>

              <div className="flex gap-3">
                <MapPin
                  size={18}
                  className="text-[var(--green-dark)]"
                />
                {t("city")}
              </div>
            </div>

            <Link
              href={`/${locale}/apply`}
              className="btn-primary mt-9"
            >
              {t("applyOnline")}
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="min-h-[430px] rounded-[24px] border border-[var(--line)] bg-[var(--paper)] p-8 md:p-10">
            <div className="text-xs font-black uppercase tracking-[.18em] text-[var(--muted)]">
              {t("mapPlaceholder")}
            </div>

            <div className="mt-8 grid h-[330px] place-items-center rounded-[26px] border border-[var(--line)] bg-[var(--white)] text-center">
              <div>
                <MapPin
                  className="mx-auto text-[var(--green)]"
                  size={34}
                />

                <div className="mt-3 font-black text-[var(--ink)]">
                  {t("addressPlaceholder")}
                </div>

                <div className="mt-1 text-sm text-[var(--muted)]">
                  {t("mapDescription")}
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
    <NextStep />
    </>
  );
};

export default Contact;