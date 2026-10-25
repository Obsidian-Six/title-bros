"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";

import {
  VEHICLE_YEARS,
  CONDITIONS,
  TITLE_STATUSES,
} from "@/data/vehicles";

import CustomSelect from "../ui/CustomSelect";
import { getVehicleMakes, getVehicleModels } from "@/services/vehicleService";

export default function VehicleStep({ form, errors, updateForm }) {
  const t = useTranslations("calculator.vehicleStep");

  const [makes, setMakes] = useState([]);
  const [models, setModels] = useState([]);
  const [loadingMakes, setLoadingMakes] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [vinError, setVinError] = useState("");

  useEffect(() => {
    let active = true;
    const fetchMakes = async () => {
      setLoadingMakes(true);
      try {
        const fetchedMakes = await getVehicleMakes();
        if (active) setMakes(fetchedMakes);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoadingMakes(false);
      }
    };
    fetchMakes();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    const fetchModels = async () => {
      if (!form.year || !form.make) {
        setModels([]);
        return;
      }
      setLoadingModels(true);
      try {
        const fetchedModels = await getVehicleModels({ year: form.year, make: form.make });
        if (active) setModels(fetchedModels);
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoadingModels(false);
      }
    };
    fetchModels();
    return () => { active = false; };
  }, [form.year, form.make]);

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
          onChange={(e) => {
            updateForm("year", e.target.value);
            updateForm("model", "");
          }}
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
          <option value="">{loadingMakes ? "Loading..." : t("selectMake")}</option>

          {makes.map((make) => (
            <option key={make.id} value={make.name}>
              {make.name}
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
            {loadingModels ? "Loading..." : form.make ? t("selectModel") : t("selectMakeFirst")}
          </option>

          {models.map((model) => (
            <option key={model.id} value={model.name}>
              {model.name}
            </option>
          ))}

          {form.make && models.length === 0 && !loadingModels && (
            <option value="Other">{t("other")}</option>
          )}
        </Select>

        <div className="sm:col-span-2 space-y-2">
          <label className="text-[13px] font-bold text-[#101512]">
            VIN
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={form.vin || ""}
              onChange={async (e) => {
                const val = e.target.value.toUpperCase().replace(/[IOQ\s]/g, "").slice(0, 17);
                updateForm("vin", val);
                if (val.length === 17 && !loadingMakes) {
                  setVinError("");
                  try {
                    const { decodeVin } = await import("@/services/vehicleService");
                    const data = await decodeVin(val);
                    if (data && data.Results) {
                      const year = data.Results.find(r => r.Variable === "Model Year")?.Value;
                      const make = data.Results.find(r => r.Variable === "Make")?.Value;
                      const model = data.Results.find(r => r.Variable === "Model")?.Value;
                      const errorCode = data.Results.find(r => r.Variable === "Error Code")?.Value;
                      
                      if (!make || !model) {
                        setVinError(`Invalid VIN: ${errorCode || 'Vehicle details not found.'}`);
                      } else {
                        if (year) updateForm("year", year);
                        if (make) updateForm("make", make);
                        if (model) updateForm("model", model);
                      }
                    }
                  } catch (err) {
                    console.error(err);
                    setVinError("Failed to decode VIN. Please enter details manually.");
                  }
                } else if (val.length < 17) {
                  setVinError("");
                }
              }}
              placeholder="Enter 17-character VIN"
              className={`h-14 w-full rounded-2xl border px-5 text-sm transition-all focus:outline-none ${
                errors.vin || vinError
                  ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                  : "border-black/[0.08] bg-[#f9faf8] hover:border-black/20 focus:border-[#087a45] focus:bg-white focus:ring-4 focus:ring-[#087a45]/10"
              }`}
            />
            <button
              type="button"
              disabled={(form.vin || "").length !== 17 || loadingMakes}
              onClick={async () => {
                setVinError("");
                try {
                  const { decodeVin } = await import("@/services/vehicleService");
                  const data = await decodeVin(form.vin);
                  if (data && data.Results) {
                    const year = data.Results.find(r => r.Variable === "Model Year")?.Value;
                    const make = data.Results.find(r => r.Variable === "Make")?.Value;
                    const model = data.Results.find(r => r.Variable === "Model")?.Value;
                    const errorCode = data.Results.find(r => r.Variable === "Error Code")?.Value;
                    
                    if (!make || !model) {
                      setVinError(`Invalid VIN: ${errorCode || 'Vehicle details not found.'}`);
                    } else {
                      if (year) updateForm("year", year);
                      if (make) updateForm("make", make);
                      if (model) updateForm("model", model);
                    }
                  }
                } catch (err) {
                  console.error(err);
                  setVinError("Failed to decode VIN. Please enter details manually.");
                }
              }}
              className="h-14 shrink-0 rounded-2xl bg-[#087a45] px-6 text-sm font-bold text-white transition hover:bg-[#066b3c] disabled:opacity-50"
            >
              Decode
            </button>
          </div>
          {vinError && (
            <div className="mt-1 text-[13px] font-medium text-red-600">
              {vinError}
            </div>
          )}
        </div>

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
