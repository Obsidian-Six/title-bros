import { CONDITIONS, TITLE_STATUSES } from "@/data/vehicles";
import { LOAN_CONSTANTS } from "./constants";
import { parseNumber } from "./formatters";

export function calculateVehicleValue(form) {
  const currentYear = new Date().getFullYear();

  const year =
    Number(form.year) || currentYear;

  const mileage = parseNumber(form.mileage);

  const age = Math.max(
    0,
    currentYear - year
  );

  // -----------------------------
  // 1. Base vehicle value
  // -----------------------------

  let vehicleValue =
    LOAN_CONSTANTS.DEFAULT_VEHICLE_VALUE;

  // -----------------------------
  // 2. Age adjustment
  // -----------------------------

  vehicleValue -=
    age *
    LOAN_CONSTANTS.VALUE_DEPRECIATION_PER_YEAR;

  // -----------------------------
  // 3. Mileage adjustment
  // -----------------------------

  if (
    mileage >
    LOAN_CONSTANTS.MILEAGE_START
  ) {
    const mileageDeduction = Math.min(
      LOAN_CONSTANTS.MAX_MILEAGE_DEDUCTION,
      (mileage -
        LOAN_CONSTANTS.MILEAGE_START) *
        LOAN_CONSTANTS.MILEAGE_DEDUCTION_RATE
    );

    vehicleValue -= mileageDeduction;
  }

  // -----------------------------
  // 4. Condition adjustment
  // -----------------------------

  const condition = CONDITIONS.find(
    (item) =>
      item.value === form.condition
  );

  if (condition) {
    vehicleValue *= condition.multiplier;
  }

  // -----------------------------
  // 5. Title adjustment
  // -----------------------------

  const titleStatus = TITLE_STATUSES.find(
    (item) =>
      item.value === form.titleStatus
  );

  if (titleStatus) {
    vehicleValue *= titleStatus.multiplier;
  }

  // -----------------------------
  // 6. Minimum value
  // -----------------------------

  vehicleValue = Math.max(
    LOAN_CONSTANTS.MIN_VEHICLE_VALUE,
    vehicleValue
  );

  return Math.round(vehicleValue);
}

export function calculateLoanEstimate(form) {
  const vehicleValue =
    calculateVehicleValue(form);

  // -----------------------------
  // 60% - 80% of vehicle value
  // -----------------------------

  const low =
    Math.round(
      (vehicleValue *
        LOAN_CONSTANTS.MIN_LOAN_TO_VALUE) /
        100
    ) * 100;

  const high =
    Math.round(
      (vehicleValue *
        LOAN_CONSTANTS.MAX_LOAN_TO_VALUE) /
        100
    ) * 100;

  // -----------------------------
  // Desired amount
  // -----------------------------

  const desired =
    parseNumber(form.desiredAmount);

  // -----------------------------
  // Suggested amount
  // -----------------------------

  const suggested =
    desired > 0
      ? Math.min(
          Math.max(desired, low),
          high
        )
      : Math.round(
          ((low + high) / 2) / 100
        ) * 100;

  // -----------------------------
  // Desired amount status
  // -----------------------------

  let desiredStatus =
    "within-range";

  if (desired < low) {
    desiredStatus = "below-range";
  }

  if (desired > high) {
    desiredStatus = "above-range";
  }

  return {
    vehicleValue,
    low,
    high,
    desired,
    suggested,
    desiredStatus,
  };
}