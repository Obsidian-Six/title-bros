"use client";

import React from "react";
import Reveal from "./Reveal";
import StepCard from "./common/StepCard";
import PageHero from "./PageHero";
import { useTranslations } from "next-intl";
import NextStep from "./common/NextStep";

function Requirements() {
  const t = useTranslations("requirements");

  // Get the complete steps array from en.json / es.json
  const cards = t.raw("cards");

  return (
    <>
      <PageHero pageKey="requirements" />

      <section className="pt-0">
        <div className="container-x grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {cards?.map((card, i) => (
            <Reveal key={card.title} delay={i * 0.04}>
              <StepCard
                step={{
                  number: `0${i + 1}`,
                  title: card.title,
                  text: card.text,
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

export default Requirements;
