"use client";

import { useTranslations } from "next-intl";

import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";

import {
  VEHICLE_YEARS,
  MAKES,
  MODELS,
  CONDITIONS,
  TITLE_STATUSES,
} from "@/data/vehicles";

import CustomSelect from "../ui/CustomSelect";

export default function VehicleStep({ form, errors, updateForm }) {
  const t = useTranslations("calculator.vehicleStep");

  const availableModels = MODELS[form.make] || [];

  const translatedTitleStatuses = TITLE_STATUSES.map((item) => ({
    ...item,
    label: t(`titleStatus.${item.value}`),
    description: t(`titleStatus.${item.value}Description`),
  }));

  return (
    <div className="animate-[fadeUp_.5s_ease-out]">
      <div className="eyebrow text-[var(--ink)]/35">{t("eyebrow")}</div>

      <h2 className="mt-4 text-3xl font-black tracking-[-0.05em] text-[var(--black)] md:text-4xl">
        {t("title")}
      </h2>

      <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--ink)]/35">
        {t("description")}
      </p>

      <div className="mt-9 grid gap-5 md:grid-cols-2">
        <Select
          label={t("vehicleYear")}
          value={form.year}
          error={errors.year}
          onChange={(e) => updateForm("year", e.target.value)}
        >
          <option value="">{t("selectYear")}</option>

          {VEHICLE_YEARS.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </Select>

        <Select
          label={t("vehicleMake")}
          value={form.make}
          error={errors.make}
          onChange={(e) => {
            updateForm("make", e.target.value);
            updateForm("model", "");
          }}
        >
          <option value="">{t("selectMake")}</option>

          {MAKES.map((make) => (
            <option key={make} value={make}>
              {make}
            </option>
          ))}
        </Select>

        <Select
          label={t("vehicleModel")}
          value={form.model}
          error={errors.model}
          onChange={(e) => updateForm("model", e.target.value)}
        >
          <option value="">
            {form.make ? t("selectModel") : t("selectMakeFirst")}
          </option>

          {availableModels.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}

          {form.make && availableModels.length === 0 && (
            <option value="Other">{t("other")}</option>
          )}
        </Select>

        <Input
          label={t("currentMileage")}
          type="number"
          value={form.mileage}
          error={errors.mileage}
          placeholder={t("mileagePlaceholder")}
          onChange={(e) => updateForm("mileage", e.target.value)}
        />
      </div>

      {/* CONDITION */}

      <div className="mt-8">
        <label className="mb-3 block text-sm uppercase font-bold text-[var(--ink)]/35">
          {t("vehicleCondition")}
        </label>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {CONDITIONS.map((item) => {
            const selected = form.condition === item.value;

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => updateForm("condition", item.value)}
                className={[
                  "rounded-2xl border p-4 text-left",
                  "transition-all duration-300",
                  "hover:-translate-y-0.5 bg-white",
                  selected
                    ? "border-[#087a45] bg-[#087a45]/[0.05]"
                    : "border-black/[0.08] bg-white hover:border-black/20",
                ].join(" ")}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#101512]">
                    {t(`condition.${item.value}`)}
                  </span>

                  <span
                    className={[
                      "h-4 w-4 rounded-full border-2",
                      selected
                        ? "border-[#087a45] bg-[#087a45] ring-2 ring-[#087a45]/15"
                        : "border-black/15 ",
                    ].join(" ")}
                  />
                </div>

                <p className="mt-1 text-xs text-black/35">
                  {t(`condition.${item.value}Description`)}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* TITLE */}

      <div className="mt-8">
        <div className="mt-8">
          <CustomSelect
            label={t("vehicleTitle")}
            value={form.titleStatus}
            onChange={(value) => updateForm("titleStatus", value)}
            options={translatedTitleStatuses}
            placeholder={t("selectTitleStatus")}
          />
        </div>
      </div>
    </div>
  );
}
