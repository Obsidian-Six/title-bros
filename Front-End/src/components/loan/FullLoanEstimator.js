"use client";

import { useMemo, useState } from "react";

import StepNumber from "@/components/ui/StepNumber";
import LoanSteps from "./LoanSteps";
import SubmitModal from "./SubmitModal";

import { calculateLoanEstimate } from "@/app/lib/loan/calculator";
import { validateStep } from "@/app/lib/loan/validation";
import { useTranslations } from "next-intl";

// const STEPS = [
//   "Vehicle",
//   "Loan",
//   "About You",
//   "Estimate",
// ];


const INITIAL_FORM = {
  year: "",
  make: "",
  model: "",
  mileage: "",

  condition: "good",
  titleStatus: "clear-title",

  desiredAmount: "5000",

  employment: "",
  income: "",

  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  zip: "",
};

export default function FullLoanEstimator() {
  const t = useTranslations("calculator");

  const [step, setStep] = useState(0);

  const [form, setForm] = useState(INITIAL_FORM);

  const [errors, setErrors] = useState({});

  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const estimate = useMemo(() => calculateLoanEstimate(form), [form]
  );

  const STEPS = [
    {
      key: "vehicle",
      title: t("steps.vehicle.title"),
      description: t("steps.vehicle.description"),
    },
    {
      key: "loan",
      title: t("steps.loan.title"),
      description: t("steps.loan.description"),
    },
    {
      key: "aboutYou",
      title: t("steps.aboutYou.title"),
      description: t("steps.aboutYou.description"),
    },
    {
      key: "estimate",
      title: t("steps.estimate.title"),
      description: t("steps.estimate.description"),
    },
  ];

  const updateForm = (
    field,
    value
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  const nextStep = () => {
    const validationErrors =
      validateStep(step, form);

    setErrors(validationErrors);

    if (
      Object.keys(validationErrors)
        .length > 0
    ) {
      return;
    }

    setStep((prev) =>
      Math.min(
        prev + 1,
        STEPS.length - 1
      )
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const previousStep = () => {
    setErrors({});

    setStep((prev) =>
      Math.max(prev - 1, 0)
    );
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    setStep(0);
    setShowSubmitModal(false);
  };

  return (
    <section
      data-loan-estimator
      className="relative overflow-hidden pb-24"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-20 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#087a45]/[0.035] blur-3xl" />
      </div>

      <div className="container-x relative">
        <div className="grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">

          {/* LEFT */}

          <aside className="lg:sticky lg:top-28">
            <div className="rounded-[2rem] border border-black/[0.07] bg-white p-6 shadow-[0_20px_80px_rgba(0,0,0,0.06)] md:p-8">

              <div className="eyebrow text-[#101512]">
                {t("application.eyebrow")}
              </div>

              <h2 className="mt-5 text-2xl font-black tracking-[-0.04em] md:text-3xl text-[#101512]">
                {t("application.title")}
              </h2>

              <p className="mt-4 text-sm leading-6 text-black/45">
                {t("application.description")}
              </p>

              <div className="mt-8 space-y-5">
                {STEPS.map((item, index) => {
                  const active = index === step;
                  const complete = index < step;

                  return (
                    <div
                      key={item.key}
                      className="flex items-center gap-4"
                    >
                      <StepNumber
                        number={index + 1}
                        active={active}
                        complete={complete}
                      />

                      <div>
                        <p
                          className={[
                            "text-sm font-bold",
                            active
                              ? "text-black"
                              : complete
                                ? "text-[#087a45]"
                                : "text-black/30",
                          ].join(" ")}
                        >
                          {item.title}
                        </p>

                        <p className="mt-0.5 text-xs text-black/30">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 rounded-2xl bg-[#087a45]/[0.06] p-4">
                <p className="text-xs font-bold text-[#101512]">
                  {t("application.secureTitle")}
                </p>

                <p className="mt-1 text-xs leading-5 text-black/40">
                  {t("application.secureDescription")}
                </p>
              </div>
            </div>
          </aside>

          {/* MAIN */}

          <div className="glass rounded-[2rem] border border-black/[0.07] bg-white shadow-[0_25px_100px_rgba(0,0,0,0.07)] overflow-hidden">

            <div className="h-1.5 overflow-hidden rounded-t-[2rem] bg-black/[0.04]">
              <div
                className="h-full rounded-full bg-[#087a45] transition-all duration-700"
                style={{
                  width: `${((step + 1) /
                    STEPS.length) *
                    100
                    }%`,
                }}
              />
            </div>

            <div className="p-6 md:p-10 lg:p-12">

              <LoanSteps
                step={step}
                form={form}
                errors={errors}
                updateForm={updateForm}
                estimate={estimate}
                onEdit={() => setStep(0)}
                onSubmit={() =>
                  setShowSubmitModal(true)
                }
              />

              {/* NAVIGATION */}

              {step < 3 && (
                <div className="mt-10 flex items-center justify-between border-t border-black/[0.07] pt-7">

                  <button
                    type="button"
                    onClick={previousStep}
                    disabled={step === 0}
                    className={[
                      "rounded-full px-5 py-3 text-sm font-bold",
                      step === 0
                        ? "pointer-events-none opacity-0"
                        : "text-black/50 hover:bg-black/[0.04]",
                    ].join(" ")}
                  >
                    {/* ← Back */}
                    ← {t("navigation.back")}
                  </button>

                  <button
                    type="button"
                    onClick={nextStep}
                    className="group inline-flex h-14 items-center gap-3 rounded-full bg-[#087a45] px-7 text-sm font-black text-white shadow-lg shadow-[#087a45]/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    {step === 2
                      ? t("navigation.seeEstimate")
                      : t("navigation.continue")}

                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </button>
                </div>
              )}

              {step === 3 && (
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="mt-6 text-sm font-bold text-[var(--ink)]/35 transition-colors hover:text-[var(--ink)]"
                >
                  ← {t("navigation.backToInformation")}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <SubmitModal
        open={showSubmitModal}
        onClose={() =>
          setShowSubmitModal(false)
        }
        form={form}
        estimate={estimate}
        onReset={resetForm}
      />

      <style jsx>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}