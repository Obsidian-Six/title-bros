/**
 * ==============================================================================
 * Repayment Schedule Generator
 * ==============================================================================
 *
 * Generates repayment installments for:
 * - Single / Balloon payment
 * - Weekly installments
 * - Bi-weekly installments
 * - Monthly installments
 *
 * This utility does NOT save anything to MongoDB.
 * It only calculates and returns the repayment schedule.
 */

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const roundMoney = (value) => {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
};

const getPeriodsPerYear = (frequency) => {
  switch (frequency) {
    case "weekly":
      return 52;

    case "bi-weekly":
      return 26;

    case "monthly":
      return 12;

    default:
      return 1;
  }
};

/**
 * Add months while handling dates such as January 31.
 *
 * Example:
 * Jan 31 + 1 month -> Feb 28/29
 */
const addMonths = (date, months) => {
  const result = new Date(date);

  const originalDay = result.getDate();

  result.setDate(1);
  result.setMonth(result.getMonth() + months);

  const lastDayOfMonth = new Date(
    result.getFullYear(),
    result.getMonth() + 1,
    0
  ).getDate();

  result.setDate(Math.min(originalDay, lastDayOfMonth));

  return result;
};

const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const getDueDate = (firstDueDate, frequency, installmentNumber) => {
  const index = installmentNumber - 1;

  switch (frequency) {
    case "weekly":
      return addDays(firstDueDate, index * 7);

    case "bi-weekly":
      return addDays(firstDueDate, index * 14);

    case "monthly":
      return addMonths(firstDueDate, index);

    case "single":
      return new Date(firstDueDate);

    default:
      throw new Error(`Unsupported repayment frequency: ${frequency}`);
  }
};

// -----------------------------------------------------------------------------
// Main Generator
// -----------------------------------------------------------------------------

export const generateRepaymentSchedule = ({
  loanAmount,
  interestRate,
  paymentPlanType,
  frequency,
  numberOfPayments,
  firstDueDate,
  repaymentMonths,
}) => {
  const principal = Number(loanAmount);
  const annualInterestRate = Number(interestRate || 0);

  if (!principal || principal <= 0) {
    throw new Error("Loan amount must be greater than zero.");
  }

  if (annualInterestRate < 0) {
    throw new Error("Interest rate cannot be negative.");
  }

  if (!firstDueDate || Number.isNaN(new Date(firstDueDate).getTime())) {
    throw new Error("A valid first due date is required.");
  }

  if (!["single", "installment"].includes(paymentPlanType)) {
    throw new Error(
      "Payment plan type must be either 'single' or 'installment'."
    );
  }

  // ===========================================================================
  // SINGLE / BALLOON PAYMENT
  // ===========================================================================

  if (paymentPlanType === "single") {
    const termMonths = Number(repaymentMonths || 1);

    if (termMonths <= 0) {
      throw new Error("Repayment term must be greater than zero.");
    }

    /**
     * Single / balloon calculation:
     *
     * Principal remains due until the balloon due date.
     *
     * Interest is calculated using simple annual interest
     * over the approved loan term.
     *
     * Example:
     * $5,000 × 18% × 12/12 = $900 interest
     */

    const interest =
      principal * (annualInterestRate / 100) * (termMonths / 12);

    const totalAmount = roundMoney(principal + interest);

    const installment = {
      installmentNumber: 1,

      dueDate: new Date(firstDueDate),

      amountDue: totalAmount,

      principalAmount: roundMoney(principal),

      interestAmount: roundMoney(interest),

      lateFee: 0,

      amountPaid: 0,

      remainingAmount: totalAmount,

      status: "pending",

      paidAt: null,
    };

    return {
      paymentPlanType: "single",

      frequency: "single",

      numberOfPayments: 1,

      firstDueDate: new Date(firstDueDate),

      totalPrincipal: roundMoney(principal),

      totalInterest: roundMoney(interest),

      totalScheduledAmount: totalAmount,

      totalPaid: 0,

      remainingBalance: totalAmount,

      installments: [installment],
    };
  }

  // ===========================================================================
  // INSTALLMENT PAYMENT
  // ===========================================================================

  if (!["weekly", "bi-weekly", "monthly"].includes(frequency)) {
    throw new Error(
      "Installment frequency must be weekly, bi-weekly, or monthly."
    );
  }

  const payments = Number(numberOfPayments);

  if (!Number.isInteger(payments) || payments <= 0) {
    throw new Error("Number of payments must be a positive integer.");
  }

  const periodsPerYear = getPeriodsPerYear(frequency);

  /**
   * Convert annual interest rate to periodic interest rate.
   *
   * Example monthly:
   *
   * 18% / 100 / 12
   * = 0.015
   */
  const periodicRate =
    annualInterestRate / 100 / periodsPerYear;

  let regularPayment;

  // ---------------------------------------------------------------------------
  // Amortized payment calculation
  // ---------------------------------------------------------------------------

  if (periodicRate > 0) {
    regularPayment =
      (principal *
        periodicRate *
        Math.pow(1 + periodicRate, payments)) /
      (Math.pow(1 + periodicRate, payments) - 1);
  } else {
    regularPayment = principal / payments;
  }

  regularPayment = roundMoney(regularPayment);

  // ---------------------------------------------------------------------------
  // Generate installments
  // ---------------------------------------------------------------------------

  const installments = [];

  let remainingPrincipal = roundMoney(principal);
  let totalInterest = 0;
  let totalScheduledAmount = 0;

  for (let i = 1; i <= payments; i++) {
    const dueDate = getDueDate(
      firstDueDate,
      frequency,
      i
    );

    // Interest for this period
    const interestAmount =
      periodicRate > 0
        ? roundMoney(remainingPrincipal * periodicRate)
        : 0;

    let principalAmount = roundMoney(
      regularPayment - interestAmount
    );

    let amountDue = regularPayment;

    // -------------------------------------------------------------------------
    // Final payment adjustment
    // -------------------------------------------------------------------------

    if (i === payments) {
      principalAmount = roundMoney(remainingPrincipal);

      amountDue = roundMoney(
        principalAmount + interestAmount
      );
    }

    // Protect against floating-point rounding
    if (principalAmount > remainingPrincipal) {
      principalAmount = remainingPrincipal;

      amountDue = roundMoney(
        principalAmount + interestAmount
      );
    }

    remainingPrincipal = roundMoney(
      remainingPrincipal - principalAmount
    );

    totalInterest = roundMoney(
      totalInterest + interestAmount
    );

    totalScheduledAmount = roundMoney(
      totalScheduledAmount + amountDue
    );

    installments.push({
      installmentNumber: i,

      dueDate,

      amountDue,

      principalAmount,

      interestAmount,

      lateFee: 0,

      amountPaid: 0,

      remainingAmount: amountDue,

      status: "pending",

      paidAt: null,
    });
  }

  return {
    paymentPlanType: "installment",

    frequency,

    numberOfPayments: payments,

    firstDueDate: new Date(firstDueDate),

    totalPrincipal: roundMoney(principal),

    totalInterest: roundMoney(totalInterest),

    totalScheduledAmount: roundMoney(
      totalScheduledAmount
    ),

    totalPaid: 0,

    remainingBalance: roundMoney(
      totalScheduledAmount
    ),

    installments,
  };
};

export default generateRepaymentSchedule;