"use client";

import { useTranslations } from "next-intl";
import {
  formatCurrency,
  formatNumber,
} from "@/app/lib/loan/formatters";

export default function EstimateStep({
  form,
  estimate,
  onEdit,
  onSubmit,
}) {
  const t = useTranslations("calculator.estimateStep");

  const progress =
    estimate.high > 0
      ? Math.min(
          100,
          (estimate.desired / estimate.high) * 100
        )
      : 0;

  return (
    <div className="animate-[fadeUp_.5s_ease-out]">
      <div className="eyebrow text-[#101512]">
        {t("eyebrow")}
      </div>

      <div className="mt-7 overflow-hidden rounded-[2rem] bg-[#087a45] p-7 text-white md:p-10">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">
              {t("potentialLoanRange")}
            </p>

            <div className="mt-3 text-4xl font-black tracking-[-0.06em] md:text-6xl">
              {formatCurrency(estimate.low)}

              <span className="mx-2 text-white/40">
                –
              </span>

              {formatCurrency(estimate.high)}
            </div>
          </div>

          <div className="rounded-2xl bg-white/10 px-5 py-4">
            <p className="text-xs text-white/60">
              {t("estimatedVehicleValue")}
            </p>

            <p className="mt-1 text-xl font-black">
              {formatCurrency(estimate.vehicleValue)}
            </p>
          </div>
        </div>

        <div className="relative mt-10 h-2 overflow-hidden rounded-full bg-white/15">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-white transition-all duration-1000"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <p className="mt-5 max-w-xl text-xs leading-5 text-white/55">
          {t("disclaimer")}
        </p>
      </div>

      <div className="mt-7 rounded-3xl border border-black/[0.07] p-6 md:p-7">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-[#101512]">
            {t("vehicleDetails")}
          </h3>

          <button
            type="button"
            onClick={onEdit}
            className="text-xs font-bold text-[#087a45] hover:underline"
          >
            {t("edit")}
          </button>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-xs text-black/35">
              {t("vehicle")}
            </p>

            <p className="mt-1 font-bold text-[#101512]">
              {form.year} {form.make} {form.model}
            </p>
          </div>

          <div>
            <p className="text-xs text-black/35">
              {t("mileage")}
            </p>

            <p className="mt-1 font-bold text-[#101512]">
              {formatNumber(form.mileage)} {t("miles")}
            </p>
          </div>

          <div>
            <p className="text-xs text-black/35">
              {t("condition")}
            </p>

            <p className="mt-1 font-bold capitalize text-[#101512]">
              {form.condition}
            </p>
          </div>

          <div>
            <p className="text-xs text-black/35">
              {t("amountRequested")}
            </p>

            <p className="mt-1 font-bold text-[#101512]">
              {formatCurrency(form.desiredAmount)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-7 rounded-3xl border border-[#087a45]/15 bg-[#087a45]/[0.035] p-6 md:p-7">
        <h3 className="text-xl font-black tracking-[-0.03em] text-[#101512]">
          {t("readyTitle")}
        </h3>

        <p className="mt-2 max-w-xl text-sm leading-6 text-black/45">
          {t("readyDescription")}
        </p>

        <button
          onClick={onSubmit}
          type="button"
          className="group mt-6 inline-flex h-14 items-center justify-center gap-3 rounded-full bg-[#087a45] px-7 text-sm font-black text-white shadow-lg shadow-[#087a45]/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          {t("continueApplication")}

          <span className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </button>
      </div>
    </div>
  );
}