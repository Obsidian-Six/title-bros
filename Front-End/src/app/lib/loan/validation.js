import { parseNumber } from "./formatters";
import { LOAN_CONSTANTS } from "./constants";

export function validateStep(step, form) {
  const errors = {};

  if (step === 0) {
    if (!form.year) {
      errors.year =
        "Select your vehicle year.";
    }

    if (!form.make) {
      errors.make =
        "Select your vehicle make.";
    }

    if (!form.model) {
      errors.model =
        "Select your vehicle model.";
    }

    if (!form.mileage) {
      errors.mileage =
        "Enter your current mileage.";
    }
  }

  if (step === 1) {
    const amount =
      parseNumber(form.desiredAmount);

    if (!amount) {
      errors.desiredAmount =
        "Enter an amount you're interested in.";
    } else if (
      amount <
      LOAN_CONSTANTS.MIN_DESIRED_AMOUNT
    ) {
      errors.desiredAmount =
        `Please enter at least $${LOAN_CONSTANTS.MIN_DESIRED_AMOUNT}.`;
    }
  }

  if (step === 2) {
    if (!form.employment) {
      errors.employment =
        "Select your employment status.";
    }

    if (!form.income) {
      errors.income =
        "Enter your approximate monthly income.";
    }

    if (!form.firstName.trim()) {
      errors.firstName =
        "Enter your first name.";
    }

    if (!form.lastName.trim()) {
      errors.lastName =
        "Enter your last name.";
    }

    if (!form.phone.trim()) {
      errors.phone =
        "Enter your phone number.";
    }

    if (!form.email.trim()) {
      errors.email =
        "Enter your email address.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email
      )
    ) {
      errors.email =
        "Enter a valid email address.";
    }

    if (!form.zip.trim()) {
      errors.zip =
        "Enter your ZIP code.";
    }
  }

  return errors;
}