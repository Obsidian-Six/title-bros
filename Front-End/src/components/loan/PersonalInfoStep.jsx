"use client";

import { useTranslations } from "next-intl";

import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { EMPLOYMENT } from "@/data/vehicles";

export default function PersonalInfoStep({
  form,
  errors,
  updateForm,
}) {
  const t = useTranslations(
    "calculator.personalInfoStep"
  );

  return (
    <div className="animate-[fadeUp_.5s_ease-out]">
      <div className="eyebrow text-[var(--ink)]/35">
        {t("eyebrow")}
      </div>

      <h2 className="mt-4 text-3xl font-black tracking-[-0.05em] md:text-4xl">
        {t("title")}
      </h2>

      <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--ink)]/35">
        {t("description")}
      </p>

      <div className="mt-9 grid gap-5 md:grid-cols-2">
        <Input
          label={t("firstName")}
          value={form.firstName}
          error={errors.firstName}
          placeholder={t("firstNamePlaceholder")}
          onChange={(e) =>
            updateForm(
              "firstName",
              e.target.value
            )
          }
        />

        <Input
          label={t("lastName")}
          value={form.lastName}
          error={errors.lastName}
          placeholder={t("lastNamePlaceholder")}
          onChange={(e) =>
            updateForm(
              "lastName",
              e.target.value
            )
          }
        />

        <Input
          label={t("phone")}
          type="tel"
          value={form.phone}
          error={errors.phone}
          placeholder={t("phonePlaceholder")}
          onChange={(e) =>
            updateForm(
              "phone",
              e.target.value
            )
          }
        />

        <Input
          label={t("email")}
          type="email"
          value={form.email}
          error={errors.email}
          placeholder={t("emailPlaceholder")}
          onChange={(e) =>
            updateForm(
              "email",
              e.target.value
            )
          }
        />

        <Input
          label={t("zip")}
          value={form.zip}
          error={errors.zip}
          placeholder={t("zipPlaceholder")}
          onChange={(e) =>
            updateForm(
              "zip",
              e.target.value
            )
          }
        />

        <Select
          label={t("employment")}
          value={form.employment}
          error={errors.employment}
          onChange={(e) =>
            updateForm(
              "employment",
              e.target.value
            )
          }
        >
          <option value="">
            {t("selectStatus")}
          </option>

          {EMPLOYMENT.map((item) => (
            <option key={item} value={item}>
              {t(`employmentOptions.${item}`)}
            </option>
          ))}
        </Select>

        <div className="md:col-span-2">
          <Input
            label={t("monthlyIncome")}
            prefix="$"
            type="number"
            value={form.income}
            error={errors.income}
            placeholder={t(
              "monthlyIncomePlaceholder"
            )}
            onChange={(e) =>
              updateForm(
                "income",
                e.target.value
              )
            }
          />
        </div>
      </div>
    </div>
  );
}