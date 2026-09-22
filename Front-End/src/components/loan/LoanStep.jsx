import Input from "@/components/ui/Input";
import { formatCurrency } from "@/app/lib/loan/formatters";
import { LOAN_CONSTANTS } from "@/app/lib/loan/constants";
import { useTranslations } from "next-intl";

export default function LoanStep({
  form,
  errors,
  updateForm,
  estimate,
}) {

  const t = useTranslations("calculator.loanStep");
  const progress =
    estimate.high > 0
      ? Math.min(
          100,
          (estimate.desired /
            estimate.high) *
            100
        )
      : 0;

  return (
    <div className="animate-[fadeUp_.5s_ease-out]">
      <div className="eyebrow text-[var(--ink)]/35">
        {t("eyebrow")}
      </div>

      <h2 className="mt-4 text-3xl font-black tracking-[-0.05em] md:text-4xl text-[var(--ink)]">
        {t("title")}
      </h2>

      <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--ink)]/35">
        {t("description")}
      </p>

      <div className="mt-10">
        <Input
          label="Desired loan amount"
          prefix="$"
          type="number"
          value={form.desiredAmount}
          error={errors.desiredAmount}
          placeholder="5,000"
          onChange={(e) =>
            updateForm(
              "desiredAmount",
              e.target.value
            )
          }
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {LOAN_CONSTANTS.QUICK_AMOUNTS.map(
          (amount) => {
            const selected =
              Number(form.desiredAmount) ===
              amount;

            return (
              <button
                type="button"
                key={amount}
                onClick={() =>
                  updateForm(
                    "desiredAmount",
                    String(amount)
                  )
                }
                className={[
                  "rounded-full border border-[var(--ink)] px-4 py-2.5",
                  "text-sm font-bold transition-all text-[var(--ink)]",

                  selected
                    ? "border-[#087a45] bg-[#087a45] text-white"
                    : "border-[#087a45] hover:border-[var(--ink)]",
                ].join(" ")}
              >
                {formatCurrency(amount)}
              </button>
            );
          }
        )}
      </div>

      <div className="mt-10 rounded-3xl bg-black/[0.025] p-6 md:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink)]/35">
              {t("potentialRange")}
            </p>

            <p className="mt-2 text-3xl font-black tracking-[-0.04em] text-[var(--ink)]">
              {formatCurrency(
                estimate.low
              )}

              {" - "}

              {formatCurrency(
                estimate.high
              )}
            </p>
          </div>

          <div className="rounded-2xl bg-white px-5 py-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-black/35">
              {t("requestedAmount")}
            </p>

            <p className="mt-1 text-xl font-black text-[#087a45]">
              {formatCurrency(
                estimate.desired
              )}
            </p>
          </div>

          <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-black/35">
               {t("vehicleEstimate")}
            </p>

            <p className="mt-1 font-black text-[#087a45]">
              {formatCurrency(
                estimate.vehicleValue
              )}
            </p>
          </div>
        </div>

        <div className="mt-7 h-2 overflow-hidden rounded-full bg-black/10">
          <div
            className="h-full rounded-full bg-[#087a45] transition-all duration-700"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        <p className="mt-4 text-xs leading-5 text-[var(--ink)]/35">
          {t("disclaimer")}
        </p>
      </div>
    </div>
  );
}