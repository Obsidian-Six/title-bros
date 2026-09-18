"use client"
import React from "react";
import Reveal from "./Reveal";
import StepCard from "./common/StepCard";
import PageHero from "./PageHero";
import { useTranslations } from "next-intl";
import NextStep from "./common/NextStep";

function HowItWorks() {
  const t = useTranslations("process");

  // Get the complete steps array from en.json / es.json
  const steps = t.raw("steps");

  return (
    <>
      <PageHero pageKey="how-it-works" />

      <section className="pt-0">
        <div className="container-x grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {steps?.map((step, i) => (
            <Reveal key={step.number} delay={i * 0.04}>
              <StepCard
                step={{
                  number: step.number,
                  title: step.title,
                  text: step.text,
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

export default HowItWorks;