"use client";

import { formatCurrency, formatNumber } from "@/app/lib/loan/formatters";
import { submitLoanApplication } from "@/services/loanService";
import { useState } from "react";
import { useTranslations } from "next-intl";

export default function SubmitModal({
  open,
  onClose,
  form,
  estimate,
  onReset,
}) {
  const t = useTranslations("calculator.submitModal");

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    try {
      setLoading(true);

      await submitLoanApplication({
        ...form,
        estimate,
      });

      setSubmitted(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-999 flex items-center justify-center bg-black/40 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-[28px] bg-white p-7 shadow-2xl md:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        {!submitted ? (
          <>
            <button
              type="button"
              onClick={onClose}
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-black/5 text-lg text-[#101512] transition hover:bg-black/10"
            >
              ×
            </button>

            <div className="mb-6">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#087a45]/10 text-2xl">
                🚗
              </div>

              <div className="text-sm font-bold uppercase tracking-[0.18em] text-[#087a45]">
                {t("almostThere")}
              </div>

              <h3 className="mt-3 text-3xl font-black tracking-tight text-black">
                {t("title")}
              </h3>

              <p className="mt-3 text-sm leading-6 text-black/55">
                {t("description")}
              </p>
            </div>

            <div className="space-y-3 rounded-2xl bg-black/[0.03] p-5">
              <div className="flex justify-between gap-4 text-sm">
                <span className="text-black/50">
                  {t("vehicle")}
                </span>

                <span className="font-semibold text-[#101512]">
                  {form.year} {form.make} {form.model}
                </span>
              </div>

              <div className="flex justify-between gap-4 text-sm">
                <span className="text-black/50">
                  {t("mileage")}
                </span>

                <span className="font-semibold text-[#101512]">
                  {formatNumber(form.mileage)} {t("miles")}
                </span>
              </div>

              <div className="mt-3 border-t border-black/10 pt-3">
                <div className="flex justify-between gap-4">
                  <span className="text-black/50">
                    {t("potentialRange")}
                  </span>

                  <span className="font-black text-[#087a45]">
                    {formatCurrency(estimate.low)} –{" "}
                    {formatCurrency(estimate.high)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-2xl border border-black/10 px-5 py-4 font-bold text-[#101512] transition hover:bg-black/[0.03]"
              >
                {t("goBack")}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleSubmit}
                className="flex-1 rounded-2xl bg-[#087a45] px-5 py-4 font-bold text-white transition hover:bg-[#066b3c] disabled:opacity-50"
              >
                {loading
                  ? t("submitting")
                  : t("submitRequest")}
              </button>
            </div>
          </>
        ) : (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#087a45]/10 text-4xl">
              ✓
            </div>

            <h3 className="mt-6 text-3xl font-black text-[#101512]">
              {t("requestSubmitted")}
            </h3>

            <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-black/55">
              {t("thanks", {
                firstName: form.firstName,
              })}
            </p>

            <button
              type="button"
              onClick={onReset}
              className="mt-7 w-full rounded-2xl bg-[#087a45] px-6 py-4 font-bold text-white transition hover:bg-[#066b3c]"
            >
              {t("done")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}