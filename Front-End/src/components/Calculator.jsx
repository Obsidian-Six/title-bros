"use client";

import FullLoanEstimator from "@/components/loan/FullLoanEstimator";
import Reveal from "@/components/Reveal";
import { useTranslations } from "next-intl";
import PageHero from "./PageHero";

const Calculator = () => {
  const t = useTranslations("calculator.page");

  return (
    <>
      <PageHero pageKey="calculator" />

      <FullLoanEstimator />

      <section className="section pt-10">
        <div className="container-x">
          <div className="card p-7 transition duration-500 hover:-translate-y-2 hover:shadow-2xl! md:p-10">
            <h2 className="text-2xl font-black">{t("disclaimerTitle")}</h2>

            <p className="mt-4 max-w-4xl text-sm leading-7">
              {t("disclaimerText")}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

export default Calculator;