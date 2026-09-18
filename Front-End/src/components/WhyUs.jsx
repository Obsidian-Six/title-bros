"use client";

import React from "react";
import Reveal from "./Reveal";
import StepCard from "./common/StepCard";
import PageHero from "./PageHero";
import { useTranslations } from "next-intl";
import NextStep from "./common/NextStep";

function WhyUs() {
  const t = useTranslations("why-us");

  const differentiators = t.raw("differentiators");

  return (
    <>
      <PageHero pageKey="why-us" />

      <section className="pt-0">
        <div className="container-x grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {differentiators?.map((item, i) => (
            <Reveal key={item.number} delay={i * 0.04}>
              <StepCard
                step={{
                  number: item.number,
                  title: item.title,
                  text: item.text,
                }}
              />
            </Reveal>
          ))}
        </div>
      </section>

      <NextStep />
    </>
  );
}

export default WhyUs;