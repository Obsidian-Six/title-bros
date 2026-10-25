// import mongoose from "mongoose";
// import crypto from "crypto";

// import stripe from "../config/stripe.js";
// import Payment from "../models/Payment.js";
// import RepaymentSchedule from "../models/RepaymentSchedule.js";
// import LoanApplication from "../models/LoanApplication.js";

// import ApiError from "../utils/ApiError.js";
// import ApiResponse from "../utils/ApiResponse.js";
// import asyncHandler from "../utils/asyncHandler.js";

// const generateReceiptNumber = () => {
//     const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");

//     const randomPart = crypto
//         .randomBytes(4)
//         .toString("hex")
//         .toUpperCase();

//     return `TB-RCP-${date}-${randomPart}`;
// };

// /**
//  * Record a manual payment
//  *
//  * POST /api/v1/payments
//  *
//  * ADMIN / SUPER_ADMIN
//  */
// export const recordPayment = asyncHandler(async (req, res) => {
//     const {
//         loanApplication,
//         repaymentSchedule,
//         installmentId,
//         paymentDate,
//         amountReceived,
//         paymentMethod,
//         notes,
//     } = req.body;

//     // --------------------------------------------------
//     // 1. Validate required fields
//     // --------------------------------------------------

//     if (!loanApplication) {
//         throw new ApiError(400, "Loan application is required.");
//     }

//     if (!mongoose.Types.ObjectId.isValid(loanApplication)) {
//         throw new ApiError(400, "Invalid loan application ID.");
//     }

//     if (!amountReceived || Number(amountReceived) <= 0) {
//         throw new ApiError(400, "Amount received must be greater than 0.");
//     }

//     const allowedManualMethods = [
//         "cash",
//         "money_order",
//         "bank_transfer",
//         "other",
//     ];

//     if (!allowedManualMethods.includes(paymentMethod)) {
//         throw new ApiError(
//             400,
//             "Manual payment method must be cash, money_order, bank_transfer, or other."
//         );
//     }

//     // --------------------------------------------------
//     // 2. Verify loan
//     // --------------------------------------------------

//     const loan = await LoanApplication.findById(loanApplication);

//     if (!loan) {
//         throw new ApiError(404, "Loan application not found.");
//     }

//     //   if (loan.status !== "Approved") {
//     //     throw new ApiError(
//     //       400,
//     //       "Payment can only be recorded for an approved loan."
//     //     );
//     //   }
//     const payableStatuses = ["Approved", "Active", "Overdue"];

//     if (!payableStatuses.includes(loan.status)) {
//         throw new ApiError(
//             400,
//             "Payment can only be recorded for an approved or active loan."
//         );
//     }

//     // --------------------------------------------------
//     // 3. Find repayment schedule
//     // --------------------------------------------------

//     const scheduleQuery = {
//         loanApplication: loan._id,
//     };

//     if (
//         repaymentSchedule &&
//         mongoose.Types.ObjectId.isValid(repaymentSchedule)
//     ) {
//         scheduleQuery._id = repaymentSchedule;
//     }

//     const schedule = await RepaymentSchedule.findOne(scheduleQuery);

//     if (!schedule) {
//         throw new ApiError(
//             404,
//             "Repayment schedule not found for this loan."
//         );
//     }

//     if (schedule.status === "completed") {
//         throw new ApiError(400, "This loan has already been fully paid.");
//     }

//     // --------------------------------------------------
//     // 4. Find installment
//     // --------------------------------------------------

//     let installment;

//     if (installmentId) {
//         installment = schedule.installments.id(installmentId);

//         if (!installment) {
//             throw new ApiError(404, "Installment not found.");
//         }
//     } else {
//         // Automatically use the first unpaid installment
//         installment = schedule.installments.find(
//             (item) =>
//                 item.status !== "paid" &&
//                 Number(item.remainingAmount) > 0
//         );

//         if (!installment) {
//             throw new ApiError(
//                 400,
//                 "No unpaid installment is available for this loan."
//             );
//         }
//     }

//     // --------------------------------------------------
//     // 5. Validate payment amount
//     // --------------------------------------------------

//     const receivedAmount = Math.round(Number(amountReceived) * 100) / 100;

//     const installmentRemaining =
//         Math.round(Number(installment.remainingAmount) * 100) / 100;

//     if (receivedAmount > installmentRemaining) {
//         throw new ApiError(
//             400,
//             `Payment amount cannot exceed the installment remaining amount of $${installmentRemaining.toFixed(
//                 2
//             )}.`
//         );
//     }

//     // --------------------------------------------------
//     // 6. Generate receipt number
//     // --------------------------------------------------

//     let receiptNumber;

//     for (let attempt = 0; attempt < 5; attempt++) {
//         const candidate = generateReceiptNumber();

//         const existingReceipt = await Payment.findOne({
//             receiptNumber: candidate,
//         });

//         if (!existingReceipt) {
//             receiptNumber = candidate;
//             break;
//         }
//     }

//     if (!receiptNumber) {
//         throw new ApiError(
//             500,
//             "Unable to generate a unique receipt number."
//         );
//     }

//     // --------------------------------------------------
//     // 7. Create payment
//     // --------------------------------------------------

//     const payment = await Payment.create({
//         loanApplication: loan._id,
//         repaymentSchedule: schedule._id,
//         installmentId: installment._id,

//         paymentDate: paymentDate
//             ? new Date(paymentDate)
//             : new Date(),

//         amountReceived: receivedAmount,
//         paymentMethod,
//         status: "completed",

//         receiptNumber,

//         receivedBy: req.user?._id || null,
//         receivedByName: req.user?.name || "System",

//         notes: notes?.trim() || "",
//     });

//     // --------------------------------------------------
//     // 8. Update installment
//     // --------------------------------------------------

//     installment.amountPaid =
//         Math.round(
//             (Number(installment.amountPaid || 0) + receivedAmount) * 100
//         ) / 100;

//     installment.remainingAmount =
//         Math.round(
//             (Number(installment.amountDue) -
//                 Number(installment.amountPaid)) *
//             100
//         ) / 100;

//     if (installment.remainingAmount <= 0) {
//         installment.remainingAmount = 0;
//         installment.status = "paid";
//         installment.paidAt = payment.paymentDate;
//     } else {
//         installment.status = "partial";
//     }

//     // --------------------------------------------------
//     // 9. Recalculate schedule totals
//     // --------------------------------------------------

//     schedule.totalPaid =
//         Math.round(
//             schedule.installments.reduce(
//                 (total, item) => total + Number(item.amountPaid || 0),
//                 0
//             ) * 100
//         ) / 100;

//     schedule.remainingBalance =
//         Math.round(
//             schedule.installments.reduce(
//                 (total, item) =>
//                     total + Number(item.remainingAmount || 0),
//                 0
//             ) * 100
//         ) / 100;

//     const allPaid = schedule.installments.every(
//         (item) =>
//             item.status === "paid" ||
//             Number(item.remainingAmount) <= 0
//     );

//     schedule.status = allPaid ? "completed" : "active";

//     schedule.updatedBy = req.user?._id || null;

//     await schedule.save();

//     // --------------------------------------------------
//     // 10. Return result
//     // --------------------------------------------------

//     return res.status(201).json(
//         new ApiResponse(
//             201,
//             {
//                 payment,
//                 installment,
//                 schedule,
//             },
//             "Payment recorded successfully."
//         )
//     );
// });

// /**
//  * Get payments for a loan
//  *
//  * GET /api/v1/payments/loan/:loanId
//  */
// export const getLoanPayments = asyncHandler(async (req, res) => {
//     const { loanId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(loanId)) {
//         throw new ApiError(400, "Invalid loan ID.");
//     }

//     const payments = await Payment.find({
//         loanApplication: loanId,
//     })
//         .populate("receivedBy", "name email role")
//         .sort({ paymentDate: -1, createdAt: -1 });

//     return res.status(200).json(
//         new ApiResponse(
//             200,
//             payments,
//             "Loan payments retrieved successfully."
//         )
//     );
// });

// /**
//  * Get single payment / receipt
//  *
//  * GET /api/v1/payments/:id
//  */
// export const getPaymentById = asyncHandler(async (req, res) => {
//     const payment = await Payment.findById(req.params.id)
//         .populate("loanApplication")
//         .populate("repaymentSchedule")
//         .populate("receivedBy", "name email role");

//     if (!payment) {
//         throw new ApiError(404, "Payment not found.");
//     }

//     return res.status(200).json(
//         new ApiResponse(
//             200,
//             payment,
//             "Payment retrieved successfully."
//         )
//     );
// });

// /**
//  * Existing Stripe test
//  */
// export const stripeTest = async (req, res) => {
//     try {
//         const account = await stripe.accounts.retrieve();

//         return res.status(200).json({
//             success: true,
//             message: "Stripe connected successfully",
//             accountId: account.id,
//         });
//     } catch (error) {
//         console.error("Stripe connection error:", error);

//         return res.status(500).json({
//             success: false,
//             message: "Stripe connection failed",
//             error: error.message,
//         });
//     }
// };

// /**
//  * Get complete loan ledger
//  *
//  * GET /api/v1/payments/loan/:loanId/ledger
//  */
// export const getLoanLedger = asyncHandler(async (req, res) => {
//     const { loanId } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(loanId)) {
//         throw new ApiError(400, "Invalid loan ID.");
//     }

//     // ---------------------------------------------
//     // 1. Find loan
//     // ---------------------------------------------

//     const loan = await LoanApplication.findById(loanId)
//         .select(
//             "firstName lastName email phone amountRequested status loanType approvedTerms vehicle"
//         )
//         .lean();

//     if (!loan) {
//         throw new ApiError(404, "Loan application not found.");
//     }

//     // ---------------------------------------------
//     // 2. Find repayment schedule
//     // ---------------------------------------------

//     const schedule = await RepaymentSchedule.findOne({
//         loanApplication: loanId,
//     }).lean();

//     if (!schedule) {
//         throw new ApiError(
//             404,
//             "Repayment schedule not found for this loan."
//         );
//     }

//     // ---------------------------------------------
//     // 3. Get payment history
//     // ---------------------------------------------

//     const payments = await Payment.find({
//         loanApplication: loanId,
//     })
//         .populate("receivedBy", "name email role")
//         .sort({
//             paymentDate: -1,
//             createdAt: -1,
//         })
//         .lean();

//     // ---------------------------------------------
//     // 4. Dates
//     // ---------------------------------------------

//     const now = new Date();

//     const startOfToday = new Date(now);
//     startOfToday.setHours(0, 0, 0, 0);

//     // ---------------------------------------------
//     // 5. Calculate installment information
//     // ---------------------------------------------

//     const installments = schedule.installments || [];

//     const overdueInstallments = installments.filter((item) => {
//         const dueDate = new Date(item.dueDate);

//         return (
//             dueDate < startOfToday &&
//             item.status !== "paid" &&
//             Number(item.remainingAmount) > 0
//         );
//     });

//     const overdueAmount = overdueInstallments.reduce(
//         (total, item) =>
//             total +
//             Number(item.remainingAmount || 0) +
//             Number(item.lateFee || 0),
//         0
//     );

//     const daysOverdue = overdueInstallments.length
//         ? Math.max(
//             0,
//             Math.floor(
//                 (startOfToday -
//                     new Date(
//                         overdueInstallments[0].dueDate
//                     )) /
//                 (1000 * 60 * 60 * 24)
//             )
//         )
//         : 0;

//     // ---------------------------------------------
//     // 6. Next unpaid installment
//     // ---------------------------------------------

//     const nextInstallment = installments
//         .filter(
//             (item) =>
//                 item.status !== "paid" &&
//                 Number(item.remainingAmount) > 0
//         )
//         .sort(
//             (a, b) =>
//                 new Date(a.dueDate) -
//                 new Date(b.dueDate)
//         )[0] || null;

//     // ---------------------------------------------
//     // 7. Interest accrued to date
//     // ---------------------------------------------

//     const interestAccruedToDate = installments
//         .filter(
//             (item) =>
//                 new Date(item.dueDate) <= startOfToday
//         )
//         .reduce(
//             (total, item) =>
//                 total + Number(item.interestAmount || 0),
//             0
//         );

//     // ---------------------------------------------
//     // 8. Scheduled outstanding principal
//     // ---------------------------------------------

//     const outstandingPrincipal = installments
//         .filter((item) => item.status !== "paid")
//         .reduce(
//             (total, item) =>
//                 total + Number(item.principalAmount || 0),
//             0
//         );

//     // ---------------------------------------------
//     // 9. Late fees
//     // ---------------------------------------------

//     const totalLateFees = installments.reduce(
//         (total, item) =>
//             total + Number(item.lateFee || 0),
//         0
//     );

//     const itemizedLateFees = installments
//         .filter((item) => Number(item.lateFee || 0) > 0)
//         .map((item) => ({
//             installmentNumber: item.installmentNumber,
//             dueDate: item.dueDate,
//             lateFee: Number(item.lateFee || 0),
//             status: item.status,
//         }));

//     // ---------------------------------------------
//     // 10. Progress
//     // ---------------------------------------------

//     const totalScheduledAmount =
//         Number(schedule.totalScheduledAmount || 0);

//     const totalPaid =
//         Number(schedule.totalPaid || 0);

//     const remainingBalance =
//         Number(schedule.remainingBalance || 0);

//     const paymentProgress =
//         totalScheduledAmount > 0
//             ? Math.round(
//                 (totalPaid / totalScheduledAmount) *
//                 10000
//             ) / 100
//             : 0;

//     // ---------------------------------------------
//     // 11. Installment progress
//     // ---------------------------------------------

//     const paidInstallments = installments.filter(
//         (item) => item.status === "paid"
//     ).length;

//     const partialInstallments = installments.filter(
//         (item) => item.status === "partial"
//     ).length;

//     const pendingInstallments = installments.filter(
//         (item) => item.status === "pending"
//     ).length;

//     // ---------------------------------------------
//     // 12. Final ledger response
//     // ---------------------------------------------

//     return res.status(200).json(
//         new ApiResponse(
//             200,
//             {
//                 loan: {
//                     id: loan._id,
//                       loanType: loan.loanType,
//                     customer: {
//                         firstName: loan.firstName,
//                         lastName: loan.lastName,
//                         email: loan.email,
//                         phone: loan.phone,
//                     },
//                     status: loan.status,
//                     amountRequested: loan.amountRequested,
//                     vehicle: loan.vehicle,
//                 },

//                 loanTerms: {
//                     loanAmount:
//                         loan.approvedTerms?.loanAmount || 0,

//                     interestRate:
//                         loan.approvedTerms?.interestRate || 0,

//                     repaymentMonths:
//                         loan.approvedTerms?.repaymentMonths || 0,

//                     paymentPlanType:
//                         schedule.paymentPlanType,

//                     frequency:
//                         schedule.frequency,

//                     numberOfPayments:
//                         schedule.numberOfPayments,

//                     firstDueDate:
//                         schedule.firstDueDate,
//                 },

//                 summary: {
//                     totalPrincipal:
//                         Number(schedule.totalPrincipal || 0),

//                     totalInterest:
//                         Number(schedule.totalInterest || 0),

//                     totalScheduledAmount,

//                     totalPaid,

//                     remainingBalance,

//                     outstandingPrincipal,

//                     interestAccruedToDate,

//                     totalLateFees,

//                     paymentProgress,

//                     installmentsPaid: paidInstallments,

//                     installmentsPartial: partialInstallments,

//                     installmentsPending: pendingInstallments,

//                     totalInstallments:
//                         installments.length,
//                 },

//                 nextPayment: nextInstallment
//                     ? {
//                         installmentNumber:
//                             nextInstallment.installmentNumber,

//                         dueDate:
//                             nextInstallment.dueDate,

//                         amountDue:
//                             Number(nextInstallment.amountDue),

//                         amountPaid:
//                             Number(nextInstallment.amountPaid || 0),

//                         remainingAmount:
//                             Number(nextInstallment.remainingAmount || 0),

//                         status:
//                             nextInstallment.status,

//                         isOverdue:
//                             new Date(nextInstallment.dueDate) <
//                             startOfToday &&
//                             nextInstallment.status !== "paid",
//                     }
//                     : null,

//                 overdue: {
//                     isOverdue:
//                         overdueInstallments.length > 0,

//                     installmentCount:
//                         overdueInstallments.length,

//                     amountOverdue:
//                         Math.round(overdueAmount * 100) / 100,

//                     daysOverdue,
//                 },

//                 lateFees: itemizedLateFees,

//                 installments,

//                 payments,
//             },
//             "Loan ledger retrieved successfully."
//         )
//     );
// });

// /**
//  * Get overdue and upcoming payments
//  *
//  * GET /api/v1/payments/overdue
//  */
// export const getOverduePayments = asyncHandler(async (req, res) => {
//     const now = new Date();

//     const startOfToday = new Date(now);
//     startOfToday.setHours(0, 0, 0, 0);

//     const endOfToday = new Date(startOfToday);
//     endOfToday.setDate(endOfToday.getDate() + 1);

//     // Upcoming = tomorrow through 7 days from today
//     const upcomingEnd = new Date(startOfToday);
//     upcomingEnd.setDate(upcomingEnd.getDate() + 8);

//     const schedules = await RepaymentSchedule.find({
//         status: { $in: ["active", "overdue"] },
//     })
//         .populate(
//             "loanApplication",
//             "firstName lastName email phone amountRequested status"
//         )
//         .lean();
//     console.log("========== OVERDUE DEBUG ==========");
//     console.log("Server now:", new Date());
//     console.log("Start of today:", startOfToday);
//     console.log("Schedules found:", schedules.length);

//     for (const schedule of schedules) {
//         console.log("Schedule:", schedule._id);
//         console.log("Schedule status:", schedule.status);

//         for (const installment of schedule.installments || []) {
//             console.log({
//                 installmentNumber: installment.installmentNumber,
//                 dueDate: installment.dueDate,
//                 status: installment.status,
//                 amountPaid: installment.amountPaid,
//                 remainingAmount: installment.remainingAmount,
//                 isOverdue:
//                     new Date(installment.dueDate) < startOfToday,
//             });
//         }
//     }

//     console.log("==================================");

//     const overdue = [];
//     const upcoming = [];

//     for (const schedule of schedules) {
//         const loan = schedule.loanApplication;

//         if (!loan) continue;

//         for (const installment of schedule.installments || []) {
//             const dueDate = new Date(installment.dueDate);

//             const remainingAmount = Number(
//                 installment.remainingAmount || 0
//             );

//             // Already completely paid
//             if (
//                 installment.status === "paid" ||
//                 remainingAmount <= 0
//             ) {
//                 continue;
//             }

//             // -----------------------------------------
//             // OVERDUE
//             // -----------------------------------------

//             if (dueDate < startOfToday) {
//                 const daysOverdue = Math.max(
//                     0,
//                     Math.floor(
//                         (startOfToday - dueDate) /
//                         (1000 * 60 * 60 * 24)
//                     )
//                 );

//                 overdue.push({
//                     loanApplicationId: loan._id,
//                     customer: {
//                         firstName: loan.firstName,
//                         lastName: loan.lastName,
//                         email: loan.email,
//                         phone: loan.phone,
//                     },

//                     installmentId: installment._id,
//                     installmentNumber:
//                         installment.installmentNumber,

//                     dueDate: installment.dueDate,

//                     amountDue: Number(
//                         installment.amountDue || 0
//                     ),

//                     amountPaid: Number(
//                         installment.amountPaid || 0
//                     ),

//                     amountOverdue:
//                         Math.round(
//                             (remainingAmount +
//                                 Number(installment.lateFee || 0)) *
//                             100
//                         ) / 100,

//                     lateFee: Number(
//                         installment.lateFee || 0
//                     ),

//                     daysOverdue,

//                     status: installment.status,

//                     arrangementMade:
//                         installment.arrangementMade || false,

//                     arrangementNote:
//                         installment.arrangementNote || "",

//                     repaymentScheduleId:
//                         schedule._id,
//                 });

//                 continue;
//             }

//             // -----------------------------------------
//             // UPCOMING THIS WEEK
//             // -----------------------------------------

//             if (
//                 dueDate >= endOfToday &&
//                 dueDate < upcomingEnd
//             ) {
//                 const daysUntilDue = Math.ceil(
//                     (dueDate - startOfToday) /
//                     (1000 * 60 * 60 * 24)
//                 );

//                 upcoming.push({
//                     loanApplicationId: loan._id,
//                     customer: {
//                         firstName: loan.firstName,
//                         lastName: loan.lastName,
//                         email: loan.email,
//                         phone: loan.phone,
//                     },

//                     installmentId: installment._id,
//                     installmentNumber:
//                         installment.installmentNumber,

//                     dueDate: installment.dueDate,

//                     amountDue: Number(
//                         installment.amountDue || 0
//                     ),

//                     amountPaid: Number(
//                         installment.amountPaid || 0
//                     ),

//                     remainingAmount,

//                     daysUntilDue,

//                     status: installment.status,

//                     repaymentScheduleId:
//                         schedule._id,
//                 });
//             }
//         }
//     }

//     // Oldest / most overdue first
//     overdue.sort(
//         (a, b) =>
//             new Date(a.dueDate) -
//             new Date(b.dueDate)
//     );

//     // Soonest due first
//     upcoming.sort(
//         (a, b) =>
//             new Date(a.dueDate) -
//             new Date(b.dueDate)
//     );

//     const totalOverdueAmount = overdue.reduce(
//         (total, item) =>
//             total + Number(item.amountOverdue || 0),
//         0
//     );

//     return res.status(200).json(
//         new ApiResponse(
//             200,
//             {
//                 overdue: {
//                     count: overdue.length,

//                     totalAmount:
//                         Math.round(
//                             totalOverdueAmount * 100
//                         ) / 100,

//                     items: overdue,
//                 },

//                 upcomingThisWeek: {
//                     count: upcoming.length,

//                     items: upcoming,
//                 },

//                 generatedAt: new Date(),
//             },
//             "Overdue and upcoming payments retrieved successfully."
//         )
//     );
// });


// /**
//  * Mark installment as arrangement made
//  *
//  * PATCH /api/v1/payments/loan/:loanId/installment/:installmentId/arrangement
//  */
// export const markArrangementMade = asyncHandler(async (req, res) => {
//     const { loanId, installmentId } = req.params;
//     const { arrangementNote = "" } = req.body;

//     // -----------------------------------------
//     // 1. Validate IDs
//     // -----------------------------------------

//     if (!mongoose.Types.ObjectId.isValid(loanId)) {
//         throw new ApiError(400, "Invalid loan ID.");
//     }

//     if (!mongoose.Types.ObjectId.isValid(installmentId)) {
//         throw new ApiError(400, "Invalid installment ID.");
//     }

//     // -----------------------------------------
//     // 2. Find repayment schedule
//     // -----------------------------------------

//     const schedule = await RepaymentSchedule.findOne({
//         loanApplication: loanId,
//     });

//     if (!schedule) {
//         throw new ApiError(
//             404,
//             "Repayment schedule not found for this loan."
//         );
//     }

//     // -----------------------------------------
//     // 3. Find installment
//     // -----------------------------------------

//     const installment = schedule.installments.id(installmentId);

//     if (!installment) {
//         throw new ApiError(404, "Installment not found.");
//     }

//     // -----------------------------------------
//     // 4. Don't allow arrangement on paid installment
//     // -----------------------------------------

//     if (
//         installment.status === "paid" ||
//         Number(installment.remainingAmount || 0) <= 0
//     ) {
//         throw new ApiError(
//             400,
//             "Arrangement cannot be made for a fully paid installment."
//         );
//     }

//     // -----------------------------------------
//     // 5. Mark arrangement
//     // -----------------------------------------

//     installment.arrangementMade = true;

//     installment.arrangementNote =
//         typeof arrangementNote === "string"
//             ? arrangementNote.trim()
//             : "";

//     installment.arrangementMadeAt = new Date();

//     installment.arrangementMadeBy =
//         req.user?._id || null;

//     schedule.updatedBy =
//         req.user?._id || null;

//     await schedule.save();

//     // -----------------------------------------
//     // 6. Response
//     // -----------------------------------------

//     return res.status(200).json(
//         new ApiResponse(
//             200,
//             {
//                 loanApplicationId: loanId,
//                 repaymentScheduleId: schedule._id,
//                 installment,
//             },
//             "Payment arrangement marked successfully."
//         )
//     );
// });

import mongoose from "mongoose";
import crypto from "crypto";

import stripe from "../config/stripe.js";
import Payment from "../models/Payment.js";
import RepaymentSchedule from "../models/RepaymentSchedule.js";
import LoanApplication from "../models/LoanApplication.js";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendEmail } from "../utils/emailService.js";
import PDFDocument from "pdfkit";
import {
  respondToDuplicateStripeSession,
} from "../utils/stripeDuplicateGuard.js";

/* =========================================================
   HELPERS
========================================================= */

const roundMoney = (value) => {
  return Math.round(Number(value || 0) * 100) / 100;
};

const getLateFeeRemaining = (installment) => {
  return Math.max(
    0,
    roundMoney(installment.lateFee) -
    roundMoney(installment.lateFeePaid)
  );
};

const getInstallmentRemaining = (installment) => {
  return Math.max(
    0,
    roundMoney(installment.remainingAmount)
  );
};

const getTotalInstallmentRemaining = (installment) => {
  return roundMoney(
    getInstallmentRemaining(installment) +
    getLateFeeRemaining(installment)
  );
};

const isInstallmentFullyPaid = (installment) => {
  return (
    getInstallmentRemaining(installment) <= 0 &&
    getLateFeeRemaining(installment) <= 0
  );
};

const getPayableStatuses = () => {
  return ["Approved", "Active", "Overdue"];
};

const getToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

/* =========================================================
   INSTALLMENT STATUS
========================================================= */

const syncInstallmentStatus = (
  installment,
  paymentDate = null
) => {
  const remainingAmount =
    getInstallmentRemaining(installment);

  const lateFeeRemaining =
    getLateFeeRemaining(installment);

  installment.remainingAmount = remainingAmount;

  installment.lateFeePaid = Math.min(
    roundMoney(installment.lateFeePaid),
    roundMoney(installment.lateFee)
  );

  if (
    remainingAmount <= 0 &&
    lateFeeRemaining <= 0
  ) {
    installment.remainingAmount = 0;

    installment.lateFeePaid = roundMoney(
      installment.lateFee
    );

    installment.status = "paid";

    installment.paidAt =
      paymentDate ||
      installment.paidAt ||
      new Date();

    return;
  }

  const today = getToday();
  const dueDate = new Date(installment.dueDate);

  if (dueDate < today) {
    installment.status = "overdue";
  } else if (
    Number(installment.amountPaid || 0) > 0 ||
    Number(installment.lateFeePaid || 0) > 0
  ) {
    installment.status = "partial";
  } else {
    installment.status = "pending";
  }
};

/* =========================================================
   RECALCULATE SCHEDULE
========================================================= */

const recalculateSchedule = (schedule) => {
  const installments =
    schedule.installments || [];

  // Total amount received:
  // normal installment payments + late fee payments
  schedule.totalPaid = roundMoney(
    installments.reduce(
      (total, item) => {
        return (
          total +
          roundMoney(item.amountPaid) +
          roundMoney(item.lateFeePaid)
        );
      },
      0
    )
  );

  // Remaining balance:
  // normal remaining + unpaid late fees
  schedule.remainingBalance = roundMoney(
    installments.reduce(
      (total, item) => {
        return (
          total +
          getTotalInstallmentRemaining(item)
        );
      },
      0
    )
  );

  const allPaid =
    installments.length > 0 &&
    installments.every(
      isInstallmentFullyPaid
    );

  if (allPaid) {
    schedule.status = "completed";
    return;
  }

  const today = getToday();

  const hasOverdue =
    installments.some((item) => {
      const dueDate = new Date(item.dueDate);

      return (
        dueDate < today &&
        !isInstallmentFullyPaid(item)
      );
    });

  schedule.status = hasOverdue
    ? "overdue"
    : "active";
};

/* =========================================================
   PAYMENT ALLOCATION
========================================================= */

/*
  Payment allocation order:

  1. Normal installment amount
     Principal + Interest

  2. Late fee

  Example:

  amountDue       = 500
  amountPaid      = 400
  remainingAmount = 100

  lateFee         = 25
  lateFeePaid     = 0

  Customer pays $115

  $100 -> normal installment
  $15  -> late fee

  Result:

  amountPaid       = 500
  remainingAmount  = 0

  lateFeePaid      = 15
  remainingLateFee = 10
*/

const applyPaymentToInstallment = (
  installment,
  receivedAmount,
  paymentDate
) => {
  let remainingPayment =
    roundMoney(receivedAmount);

  /* -----------------------------
     NORMAL INSTALLMENT
  ----------------------------- */

  const normalRemaining =
    getInstallmentRemaining(installment);

  const normalApplied = Math.min(
    remainingPayment,
    normalRemaining
  );

  installment.amountPaid = roundMoney(
    Number(installment.amountPaid || 0) +
    normalApplied
  );

  installment.remainingAmount = roundMoney(
    Number(installment.amountDue || 0) -
    Number(installment.amountPaid || 0)
  );

  remainingPayment = roundMoney(
    remainingPayment - normalApplied
  );

  /* -----------------------------
     LATE FEE
  ----------------------------- */

  const lateFeeRemaining =
    getLateFeeRemaining(installment);

  const lateFeeApplied = Math.min(
    remainingPayment,
    lateFeeRemaining
  );

  installment.lateFeePaid = roundMoney(
    Number(installment.lateFeePaid || 0) +
    lateFeeApplied
  );

  remainingPayment = roundMoney(
    remainingPayment - lateFeeApplied
  );

  /* -----------------------------
     STATUS
  ----------------------------- */

  syncInstallmentStatus(
    installment,
    paymentDate
  );

  return {
    normalApplied: roundMoney(normalApplied),
    lateFeeApplied: roundMoney(lateFeeApplied),
    unappliedAmount: roundMoney(
      remainingPayment
    ),
  };
};

/* =========================================================
   RECEIPT
========================================================= */

const generateReceiptNumber = () => {
  const date = new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, "");

  const randomPart = crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase();

  return `TB-RCP-${date}-${randomPart}`;
};



const generateReceiptPdfBuffer = ({
  payment,
  loan,
  installment,
  schedule,
}) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      info: {
        Title: `Title Bros Receipt ${payment.receiptNumber}`,
        Author: "Title Bros Loans",
      },
    });

    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("error", reject);
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    // Format customer name without changing the stored database value.
    const formatName = (value) =>
      String(value || "")
        .trim()
        .toLowerCase()
        .replace(/\b\p{L}/gu, (letter) => letter.toUpperCase());

    const customerName =
      formatName(
        `${loan.firstName || ""} ${loan.lastName || ""}`
      ) || "Customer";

    const formatLabel = (value) => {
      const labels = {
        "title-loan": "Title Loan",
        "personal-loan": "Personal Loan",
        cash: "Cash",
        money_order: "Money Order",
        bank_transfer: "Bank Transfer",
        stripe: "Stripe",
        other: "Other",
        completed: "Completed",
        pending: "Pending",
        failed: "Failed",
        cancelled: "Cancelled",
        overdue: "Overdue",
      };

      const key = String(value || "").trim().toLowerCase();

      return (
        labels[key] ||
        key.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ||
        "N/A"
      );
    };

    const money = (value) =>
      `$${Number(value || 0).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;

    // Use the actual receiver name when the controller provides one.
   const receivedBy =
  payment.receivedBy?.name ||
  (payment.receivedByName &&
  payment.receivedByName !== "System"
    ? payment.receivedByName
    : null) ||
  (payment.paymentMethod === "stripe"
    ? "Stripe"
    : "Title Bros");
    
    // Header
    doc.rect(0, 0, 595, 115).fill("#087a45");

    doc
      .fillColor("#ffffff")
      .fontSize(23)
      .font("Helvetica-Bold")
      .text("TITLE BROS LOANS", 50, 40);

    doc
      .fontSize(11)
      .font("Helvetica")
      .text("PAYMENT RECEIPT", 50, 73);

    // Receipt details
    const rows = [
      ["Receipt Number", payment.receiptNumber || "N/A"],
      ["Customer", customerName],
      ["Customer Email", loan.email || "N/A"],
      ["Loan Application ID", String(loan._id || "N/A")],
      ["Loan Type", formatLabel(loan.loanType)],
      [
        "Installment",
        installment?.installmentNumber != null
          ? `#${installment.installmentNumber}`
          : "N/A",
      ],
      [
        "Payment Date",
        new Date(payment.paymentDate || Date.now()).toLocaleDateString(
          "en-US"
        ),
      ],
      ["Payment Method", formatLabel(payment.paymentMethod)],
      ["Payment Status", formatLabel(payment.status || "completed")],
      ["Amount Received", money(payment.amountReceived)],
      ["Remaining Loan Balance", money(schedule?.remainingBalance)],
      [
        "Payment Reference",
        payment.stripePaymentIntentId ||
        payment.stripeCheckoutSessionId ||
        String(payment._id),
      ],
      ["Received By", receivedBy],
    ];

    let y = 155;

    rows.forEach(([label, value]) => {
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor("#404642")
        .text(label, 50, y, { width: 190 });

      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor("#101512")
        .text(String(value), 245, y, { width: 300 });

      y += 29;
    });

    // Divider
    y += 15;

    doc
      .moveTo(50, y)
      .lineTo(545, y)
      .strokeColor("#dce4de")
      .stroke();

    // Customer acknowledgement
    y += 25;

    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor("#087a45")
      .text("Customer Acknowledgement", 50, y);

    y += 20;

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#404642")
      .text("Please retain this receipt for your records.", 50, y);

    // Signature lines
    y += 45;

    doc
      .moveTo(50, y)
      .lineTo(245, y)
      .strokeColor("#9ca7a0")
      .stroke();

    doc
      .moveTo(320, y)
      .lineTo(545, y)
      .strokeColor("#9ca7a0")
      .stroke();

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#404642")
      .text("Customer Signature", 50, y + 8);

    doc.text("Authorized Representative", 320, y + 8);

    doc.end();
  });
};



const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (char) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });

const sendPaymentReceiptEmail = async ({
  payment,
  loan,
  installment,
  schedule,
}) => {
  const recipient = String(loan?.email || "").trim();

  if (!recipient) {
    console.warn(
      `[Receipt Email] No customer email for payment ${payment._id}`
    );

    return {
      skipped: true,
      reason: "Customer email unavailable",
    };
  }

  const receiptNumber =
    payment.receiptNumber || String(payment._id);

  const amount = Number(payment.amountReceived || 0).toLocaleString(
    "en-US",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );

  const customerName =
    [loan.firstName, loan.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() || "Customer";

  const safeName = escapeHtml(customerName);
  const safeReceipt = escapeHtml(receiptNumber);
  const safeAmount = `$${amount}`;

  const pdfBuffer = await generateReceiptPdfBuffer({
    payment,
    loan,
    installment,
    schedule,
  });

  const subject = `Title Bros payment receipt - ${receiptNumber}`;

  const text = [
    `Hello ${customerName},`,
    "",
    "Your payment has been recorded successfully.",
    `Amount received: ${safeAmount}`,
    `Receipt number: ${receiptNumber}`,
    `Payment date: ${new Date(
      payment.paymentDate || Date.now()
    ).toLocaleDateString("en-US")}`,
    "",
    "Your payment receipt is attached as a PDF.",
    "",
    "If you have questions about this payment, please contact Title Bros support.",
    "",
    "Thank you,",
    "Title Bros Loans",
  ].join("\n");

  const html = `
    <!doctype html>
    <html lang="en">
      <body style="margin:0;padding:24px;background:#f5f7f5;font-family:Arial,Helvetica,sans-serif;color:#101512;">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e1e7e2;border-radius:12px;overflow:hidden;">
          <div style="padding:24px;background:#087a45;color:#ffffff;">
            <h1 style="margin:0;font-size:22px;">Title Bros Loans</h1>
            <p style="margin:8px 0 0;">Payment receipt</p>
          </div>

          <div style="padding:24px;line-height:1.6;">
            <p>Hello ${safeName},</p>

            <p>Your payment has been recorded successfully.</p>

            <p><strong>Amount received:</strong> ${safeAmount}</p>
            <p><strong>Receipt number:</strong> ${safeReceipt}</p>

            <p>Your payment receipt is attached as a PDF for your records.</p>

            <p>If you have questions about this payment, please contact Title Bros support.</p>

            <p>Thank you,<br />Title Bros Loans</p>
          </div>
        </div>
      </body>
    </html>
  `;


    // TEMPORARY TEST: plain-text email with the same PDF
  if (process.env.RECEIPT_EMAIL_TEST_MODE === "true") {
    return sendEmail({
      email: process.env.SMTP_TEST_RECIPIENT,
      subject: "Title Bros - PDF Attachment Delivery Test",
      text: [
        "Hello,",
        "",
        "This is a plain-text email delivery test from Title Bros.",
        "The payment receipt PDF is attached.",
        "",
        "Thank you,",
        "Title Bros Loans",
      ].join("\n"),
      attachments: [
        {
          filename: `Title-Bros-Receipt-${receiptNumber}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });
  }

  console.log("[Receipt Debug]", {
  recipient,
  subject,
  hasHtml: Boolean(html),
  hasText: Boolean(text),
  pdfSize: pdfBuffer.length,
});

  return sendEmail({
    email: recipient,
    subject,
    text,
    html,
    attachments: [
      {
        filename: `Title-Bros-Receipt-${receiptNumber}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ],
  });
};




const createUniqueReceiptNumber = async (
  session = null
) => {
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate =
      generateReceiptNumber();

    const query = Payment.findOne({
      receiptNumber: candidate,
    });

    if (session) {
      query.session(session);
    }

    const existing = await query;

    if (!existing) {
      return candidate;
    }
  }

  throw new ApiError(
    500,
    "Unable to generate a unique receipt number."
  );
};

/* =========================================================
   FIND TARGET INSTALLMENT
========================================================= */

const findTargetInstallment = (
  schedule,
  installmentId
) => {
  if (installmentId) {
    const installment =
      schedule.installments.id(
        installmentId
      );

    if (!installment) {
      throw new ApiError(
        404,
        "Installment not found."
      );
    }

    if (
      isInstallmentFullyPaid(
        installment
      )
    ) {
      throw new ApiError(
        400,
        "This installment has already been fully paid."
      );
    }

    return installment;
  }

  const installment =
    schedule.installments.find(
      (item) =>
        !isInstallmentFullyPaid(item)
    );

  if (!installment) {
    throw new ApiError(
      400,
      "No unpaid installment is available for this loan."
    );
  }

  return installment;
};



const assertSequentialInstallmentPayment = (schedule, selectedInstallment) => {
  const installments = [...schedule.installments].sort(
    (a, b) =>
      Number(a.installmentNumber) - Number(b.installmentNumber)
  );

  const firstUnpaidInstallment = installments.find(
    (item) => !isInstallmentFullyPaid(item)
  );

  if (!firstUnpaidInstallment) {
    throw new ApiError(400, "All installments are already paid.");
  }

  if (
    String(firstUnpaidInstallment._id) !==
    String(selectedInstallment._id)
  ) {
    throw new ApiError(
      400,
      `Please pay Installment ${firstUnpaidInstallment.installmentNumber} first.`
    );
  }
};

/* =========================================================
   RECORD MANUAL PAYMENT
========================================================= */

/**
 * POST /api/v1/payments
 *
 * ADMIN / SUPER_ADMIN
 */
export const recordPayment = asyncHandler(
  async (req, res) => {
    const session =
      await mongoose.startSession();

    try {
      session.startTransaction();

      const {
        loanApplication,
        repaymentSchedule,
        installmentId,
        paymentDate,
        amountReceived,
        paymentMethod,
        notes,
      } = req.body;

      /* -----------------------------
         VALIDATION
      ----------------------------- */

      if (!loanApplication) {
        throw new ApiError(
          400,
          "Loan application is required."
        );
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          loanApplication
        )
      ) {
        throw new ApiError(
          400,
          "Invalid loan application ID."
        );
      }

      const receivedAmount =
        roundMoney(amountReceived);

      if (receivedAmount <= 0) {
        throw new ApiError(
          400,
          "Amount received must be greater than 0."
        );
      }

      const allowedManualMethods = [
        "cash",
        "money_order",
        "bank_transfer",
        "other",
      ];

      if (
        !allowedManualMethods.includes(
          paymentMethod
        )
      ) {
        throw new ApiError(
          400,
          "Manual payment method must be cash, money_order, bank_transfer, or other."
        );
      }

      /* -----------------------------
         LOAN
      ----------------------------- */

      const loan =
        await LoanApplication.findById(
          loanApplication
        ).session(session);

      if (!loan) {
        throw new ApiError(
          404,
          "Loan application not found."
        );
      }

      if (
        !getPayableStatuses().includes(
          loan.status
        )
      ) {
        throw new ApiError(
          400,
          "Payment can only be recorded for an approved, active, or overdue loan."
        );
      }

      /* -----------------------------
         SCHEDULE
      ----------------------------- */

      const scheduleQuery = {
        loanApplication: loan._id,
      };

      if (repaymentSchedule) {
        if (
          !mongoose.Types.ObjectId.isValid(
            repaymentSchedule
          )
        ) {
          throw new ApiError(
            400,
            "Invalid repayment schedule ID."
          );
        }

        scheduleQuery._id =
          repaymentSchedule;
      }

      const schedule =
        await RepaymentSchedule.findOne(
          scheduleQuery
        ).session(session);

      if (!schedule) {
        throw new ApiError(
          404,
          "Repayment schedule not found for this loan."
        );
      }

      if (
        schedule.status === "completed"
      ) {
        throw new ApiError(
          400,
          "This loan has already been fully paid."
        );
      }

      /* -----------------------------
         INSTALLMENT
      ----------------------------- */

      const installment =
        findTargetInstallment(
          schedule,
          installmentId
        );

      const installmentRemaining =
        getTotalInstallmentRemaining(
          installment
        );

      if (
        receivedAmount >
        installmentRemaining
      ) {
        throw new ApiError(
          400,
          `Payment amount cannot exceed the installment total remaining amount of $${installmentRemaining.toFixed(
            2
          )}.`
        );
      }

      /* -----------------------------
         PAYMENT DATE
      ----------------------------- */

      const paymentDateValue =
        paymentDate
          ? new Date(paymentDate)
          : new Date();

      if (
        Number.isNaN(
          paymentDateValue.getTime()
        )
      ) {
        throw new ApiError(
          400,
          "Invalid payment date."
        );
      }

      /* -----------------------------
         RECEIPT
      ----------------------------- */

      const receiptNumber =
        await createUniqueReceiptNumber(
          session
        );

      /* -----------------------------
         CREATE PAYMENT
      ----------------------------- */
      console.log("[Payment Admin Check]", {
        userId: req.user?._id,
        name: req.user?.name,
        email: req.user?.email,
      });

      const payment = new Payment({
        loanApplication: loan._id,

        repaymentSchedule:
          schedule._id,

        installmentId:
          installment._id,

        paymentDate:
          paymentDateValue,

        amountReceived:
          receivedAmount,

        paymentMethod,

        status: "completed",

        receiptNumber,

        receivedBy:
          req.user?._id || null,

        receivedByName:
          req.user?.name ||
          "System",

        notes:
          typeof notes === "string"
            ? notes.trim()
            : "",
      });

      await payment.save({
        session,
      });

      /* -----------------------------
         APPLY PAYMENT
      ----------------------------- */

      const allocation =
        applyPaymentToInstallment(
          installment,
          receivedAmount,
          paymentDateValue
        );

      if (
        allocation.unappliedAmount > 0
      ) {
        throw new ApiError(
          400,
          "Payment could not be fully allocated."
        );
      }

      /* -----------------------------
         RECALCULATE SCHEDULE
      ----------------------------- */

      recalculateSchedule(schedule);

      schedule.updatedBy =
        req.user?._id || null;

      await schedule.save({
        session,
      });

      /* -----------------------------
         COMMIT
      ----------------------------- */

      await session.commitTransaction();


      try {
        await sendPaymentReceiptEmail({
          payment,
          loan,
          installment,
          schedule,
        });
      } catch (emailError) {
        console.error(
          `[Receipt Email] Failed for payment ${payment._id}:`,
          emailError.message
        );
      }


      return res.status(201).json(
        new ApiResponse(
          201,
          {
            payment,
            installment,
            schedule,
            allocation,
          },
          "Payment recorded successfully."
        )
      );
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }
);

/* =========================================================
   GET LOAN PAYMENTS
========================================================= */

/**
 * GET /api/v1/payments/loan/:loanId
 */
export const getLoanPayments =
  asyncHandler(async (req, res) => {
    const { loanId } =
      req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        loanId
      )
    ) {
      throw new ApiError(
        400,
        "Invalid loan ID."
      );
    }

    const payments =
      await Payment.find({
        loanApplication: loanId,
      })
        .populate(
          "receivedBy",
          "name email role"
        )
        .sort({
          paymentDate: -1,
          createdAt: -1,
        });

    return res.status(200).json(
      new ApiResponse(
        200,
        payments,
        "Loan payments retrieved successfully."
      )
    );
  });

/* =========================================================
   GET SINGLE PAYMENT
========================================================= */

/**
 * GET /api/v1/payments/:id
 */
export const getPaymentById =
  asyncHandler(async (req, res) => {
    const payment =
      await Payment.findById(
        req.params.id
      )
        .populate("loanApplication")
        .populate("repaymentSchedule")
        .populate(
          "receivedBy",
          "name email role"
        );

    if (!payment) {
      throw new ApiError(
        404,
        "Payment not found."
      );
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        payment,
        "Payment retrieved successfully."
      )
    );
  });



/**
 * POST /api/v1/payments/:id/resend-receipt
 * Resend receipt for an existing payment without creating a new payment.
 */
export const resendPaymentReceipt = asyncHandler(
  async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid payment ID.");
    }

    const payment = await Payment.findById(id);

    if (!payment) {
      throw new ApiError(404, "Payment not found.");
    }

    const loan = await LoanApplication.findById(
      payment.loanApplication
    );

    if (!loan) {
      throw new ApiError(404, "Loan application not found.");
    }

    const schedule = await RepaymentSchedule.findById(
      payment.repaymentSchedule
    );

    if (!schedule) {
      throw new ApiError(404, "Repayment schedule not found.");
    }

    const installment = schedule.installments.id(
      payment.installmentId
    );

    if (!installment) {
      throw new ApiError(404, "Installment not found.");
    }

    console.log(
      `[Receipt Email] Resending receipt for payment ${payment._id}`
    );

    const result = await sendPaymentReceiptEmail({
      payment,
      loan,
      installment,
      schedule,
    });

    if (result?.skipped) {
      throw new ApiError(
        400,
        result.reason || "Receipt email was skipped."
      );
    }

    console.log(
      `[Receipt Email] Resend completed for payment ${payment._id}`
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          paymentId: payment._id,
          receiptNumber: payment.receiptNumber,
        },
        "Receipt email sent successfully."
      )
    );
  }
);


/* =========================================================
   STRIPE TEST
========================================================= */

export const stripeTest =
  async (req, res) => {
    try {
      const account =
        await stripe.accounts.retrieve();

      return res.status(200).json({
        success: true,
        message:
          "Stripe connected successfully",
        accountId: account.id,
      });
    } catch (error) {
      console.error(
        "Stripe connection error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Stripe connection failed",
        error: error.message,
      });
    }
  };

/* =========================================================
   STRIPE CHECKOUT
========================================================= */

/**
 * POST /api/v1/payments/stripe/checkout
 *
 * Body:
 * {
 *   loanApplication,
 *   repaymentSchedule?,
 *   installmentId?
 * }
 */
export const createStripeCheckoutSession =
  asyncHandler(async (req, res) => {
    const {
      loanApplication,
      repaymentSchedule,
      installmentId,
    } = req.body;

    const locale = req.body.locale === "es" ? "es" : "en";

    if (
      !loanApplication ||
      !mongoose.Types.ObjectId.isValid(
        loanApplication
      )
    ) {
      throw new ApiError(
        400,
        "Valid loan application is required."
      );
    }

    const loan =
      await LoanApplication.findById(
        loanApplication
      );

    if (!loan) {
      throw new ApiError(
        404,
        "Loan application not found."
      );
    }

    if (
      !getPayableStatuses().includes(
        loan.status
      )
    ) {
      throw new ApiError(
        400,
        "This loan is not currently payable."
      );
    }

    const scheduleQuery = {
      loanApplication: loan._id,
    };

    if (repaymentSchedule) {
      if (
        !mongoose.Types.ObjectId.isValid(
          repaymentSchedule
        )
      ) {
        throw new ApiError(
          400,
          "Invalid repayment schedule ID."
        );
      }

      scheduleQuery._id =
        repaymentSchedule;
    }

    const schedule =
      await RepaymentSchedule.findOne(
        scheduleQuery
      );

    if (!schedule) {
      throw new ApiError(
        404,
        "Repayment schedule not found."
      );
    }

    if (
      schedule.status === "completed"
    ) {
      throw new ApiError(
        400,
        "This loan has already been fully paid."
      );
    }

    
const installment = findTargetInstallment(schedule, installmentId);

// Enforce payment order on the server
assertSequentialInstallmentPayment(schedule, installment);

const payableAmount = getTotalInstallmentRemaining(installment);


    if (payableAmount <= 0) {
      throw new ApiError(
        400,
        "This installment has no outstanding balance."
      );
    }

    const frontendUrl =
      process.env.FRONTEND_URL ||
      process.env.CLIENT_URL;

    if (!frontendUrl) {
      throw new ApiError(
        500,
        "FRONTEND_URL is not configured."
      );
    }

    const checkoutSession =
      await stripe.checkout.sessions.create(
        {
          mode: "payment",

          customer_email:
            loan.email || undefined,

          line_items: [
            {
              price_data: {
                currency: "usd",

                product_data: {
                  name: `Title Bros Loan Payment - Installment ${installment.installmentNumber}`,
                },

                unit_amount:
                  Math.round(
                    payableAmount * 100
                  ),
              },

              quantity: 1,
            },
          ],

          metadata: {
            loanApplicationId:
              String(loan._id),

            repaymentScheduleId:
              String(schedule._id),

            installmentId:
              String(installment._id),
          },

          success_url:
            `${frontendUrl}/${locale}/payment/success?session_id={CHECKOUT_SESSION_ID}`,

          cancel_url:
            `${frontendUrl}/${locale}/payment/cancelled`,
        }
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          checkoutUrl:
            checkoutSession.url,

          sessionId:
            checkoutSession.id,

          amount:
            payableAmount,

          installmentId:
            installment._id,
        },
        "Stripe checkout session created successfully."
      )
    );
  });

/* =========================================================
   STRIPE WEBHOOK
========================================================= */

/**
 * POST /api/v1/payments/stripe/webhook
 *
 * IMPORTANT:
 * This route must receive RAW body.
 *
 * Do NOT run express.json() before this route.
 */

export const stripeWebhook = asyncHandler(async (req, res) => {
  console.log("[Stripe Webhook] Request received", {
    method: req.method,
    hasSignature: Boolean(req.headers["stripe-signature"]),
    bodyIsBuffer: Buffer.isBuffer(req.body),
  });

  const signature = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return res.status(500).json({
      error: "STRIPE_WEBHOOK_SECRET is not configured.",
    });
  }

  // 1. Verify Stripe webhook signature
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      webhookSecret
    );
  } catch (error) {
    console.error("[Stripe Webhook] Signature error:", error.message);

    return res.status(400).send(
      `Webhook Error: ${error.message}`
    );
  }

  // 2. Process only completed Checkout Sessions
  if (event.type !== "checkout.session.completed") {
    return res.status(200).json({ received: true });
  }

  const checkoutSession = event.data.object;

  console.log("[Stripe Webhook] Event received", {
    eventId: event.id,
    eventType: event.type,
    paymentStatus: checkoutSession.payment_status,
    sessionId: checkoutSession.id,
    metadata: checkoutSession.metadata,
  });

  if (checkoutSession.payment_status !== "paid") {
    return res.status(200).json({ received: true });
  }

  // 3. Validate metadata
  const {
    loanApplicationId,
    repaymentScheduleId,
    installmentId,
  } = checkoutSession.metadata || {};

  if (
    !loanApplicationId ||
    !repaymentScheduleId ||
    !installmentId
  ) {
    console.error(
      "[Stripe Webhook] Missing payment metadata:",
      checkoutSession.id
    );

    return res.status(400).json({
      error: "Missing payment metadata.",
    });
  }

  
  // 4. Fast duplicate check
  const isDuplicate = await respondToDuplicateStripeSession({
    Payment,
    checkoutSessionId: checkoutSession.id,
    res,
  });

  if (isDuplicate) {
    return;
  }

  const session = await mongoose.startSession();


  try {
    session.startTransaction();

    console.log("[Stripe Webhook] Transaction started", {
      loanApplicationId,
      repaymentScheduleId,
      installmentId,
    });

    // 5. Find loan
    const loan = await LoanApplication.findById(
      loanApplicationId
    ).session(session);

    if (!loan) {
      throw new ApiError(404, "Loan application not found.");
    }

    // 6. Find repayment schedule
    const schedule = await RepaymentSchedule.findOne({
      _id: repaymentScheduleId,
      loanApplication: loan._id,
    }).session(session);

    if (!schedule) {
      throw new ApiError(404, "Repayment schedule not found.");
    }

    // 7. Find installment
    const installment = schedule.installments.id(installmentId);

    if (!installment) {
      throw new ApiError(404, "Installment not found.");
    }

    // 8. Validate Stripe amount
    const receivedAmount = roundMoney(
      Number(checkoutSession.amount_total || 0) / 100
    );

    if (!Number.isFinite(receivedAmount) || receivedAmount <= 0) {
      throw new ApiError(400, "Stripe payment amount is invalid.");
    }

    const installmentRemaining =
      getTotalInstallmentRemaining(installment);

    if (receivedAmount > installmentRemaining) {
      throw new ApiError(
        400,
        "Stripe payment exceeds the installment balance."
      );
    }

    // 9. Generate receipt number
    const receiptNumber = await createUniqueReceiptNumber(session);

    // 10. Get Stripe Payment Intent ID
    const paymentIntentId =
      typeof checkoutSession.payment_intent === "string"
        ? checkoutSession.payment_intent
        : checkoutSession.payment_intent?.id || "";

    // 11. Create payment record
    const payment = new Payment({
      loanApplication: loan._id,
      repaymentSchedule: schedule._id,
      installmentId: installment._id,
      paymentDate: new Date(),
      amountReceived: receivedAmount,
      paymentMethod: "stripe",
      stripePaymentIntentId: paymentIntentId || undefined,
      stripeCheckoutSessionId: checkoutSession.id,
      status: "completed",
      receiptNumber,
      receivedBy: null,
      receivedByName: "Stripe",
      notes: "Online payment via Stripe Checkout.",
    });

    await payment.save({ session });

    // 12. Apply payment to installment
    const allocation = applyPaymentToInstallment(
      installment,
      receivedAmount,
      payment.paymentDate
    );

    if (allocation.unappliedAmount > 0) {
      throw new ApiError(
        400,
        "Stripe payment could not be fully allocated."
      );
    }

    // 13. Recalculate and save repayment schedule
    recalculateSchedule(schedule);
    schedule.updatedBy = null;

    await schedule.save({ session });

    // 14. Commit all database changes
    await session.commitTransaction();

    console.log("[Stripe Webhook] Transaction committed", {
      eventId: event.id,
      paymentId: payment._id,
      receiptNumber: payment.receiptNumber,
      sessionId: checkoutSession.id,
    });

    // 15. Send receipt only after successful commit
    try {
      await sendPaymentReceiptEmail({
        payment,
        loan,
        installment,
        schedule,
      });
    } catch (emailError) {
      console.error(
        `[Receipt Email] Failed for Stripe payment ${payment._id}:`,
        emailError.message
      );
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    // Abort transaction before checking whether payment already exists
    if (session.inTransaction()) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        console.error(
          "[Stripe Webhook] Transaction abort failed:",
          abortError.message
        );
      }
    }

    // 16. Handle MongoDB duplicate-key errors safely
    if (error?.code === 11000) {
      console.warn(
        "[Stripe Webhook] Duplicate-key error detected",
        {
          sessionId: checkoutSession.id,
          keyPattern: error.keyPattern,
          keyValue: error.keyValue,
        }
      );

      // Confirm the same Checkout Session was already recorded
      const duplicatePayment = await Payment.findOne({
        stripeCheckoutSessionId: checkoutSession.id,
      });

      if (duplicatePayment) {
        console.log(
          "[Stripe Webhook] Existing payment confirmed after duplicate-key error",
          {
            paymentId: duplicatePayment._id,
            receiptNumber: duplicatePayment.receiptNumber,
          }
        );

        return res.status(200).json({
          received: true,
          duplicate: true,
        });
      }

      // A different unique field may have caused the conflict.
      // Do not acknowledge success unless this Checkout Session exists.
      console.error(
        "[Stripe Webhook] Duplicate key occurred, but this Checkout Session has no saved payment."
      );

      return res.status(500).json({
        error: "Unable to confirm Stripe payment processing.",
      });
    }

    console.error("[Stripe Webhook] Processing failed:", error);

    return res.status(500).json({
      error: "Unable to process Stripe payment.",
    });
  } finally {
    await session.endSession();
  }
});


/* =========================================================
   LOAN LEDGER
========================================================= */

/**
 * GET /api/v1/payments/loan/:loanId/ledger
 */
export const getLoanLedger =
  asyncHandler(async (req, res) => {
    const { loanId } =
      req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        loanId
      )
    ) {
      throw new ApiError(
        400,
        "Invalid loan ID."
      );
    }

    /* -----------------------------
       LOAN
    ----------------------------- */

    const loan =
      await LoanApplication.findById(
        loanId
      )
        .select(
          "firstName lastName email phone amountRequested status loanType approvedTerms vehicle"
        )
        .lean();

    if (!loan) {
      throw new ApiError(
        404,
        "Loan application not found."
      );
    }

    /* -----------------------------
       SCHEDULE
    ----------------------------- */

    const schedule =
      await RepaymentSchedule.findOne({
        loanApplication: loanId,
      }).lean();

    if (!schedule) {
      throw new ApiError(
        404,
        "Repayment schedule not found for this loan."
      );
    }

    /* -----------------------------
       PAYMENTS
    ----------------------------- */

    const payments =
      await Payment.find({
        loanApplication: loanId,
      })
        .populate(
          "receivedBy",
          "name email role"
        )
        .sort({
          paymentDate: -1,
          createdAt: -1,
        })
        .lean();

    const installments =
      schedule.installments || [];

    const startOfToday =
      getToday();

    /* -----------------------------
       OVERDUE
    ----------------------------- */

    const overdueInstallments =
      installments.filter((item) => {
        const dueDate =
          new Date(item.dueDate);

        return (
          dueDate < startOfToday &&
          !isInstallmentFullyPaid(item)
        );
      });

    const overdueAmount =
      overdueInstallments.reduce(
        (total, item) => {
          return (
            total +
            getTotalInstallmentRemaining(
              item
            )
          );
        },
        0
      );

    const daysOverdue =
      overdueInstallments.length
        ? Math.max(
          0,
          Math.floor(
            (startOfToday -
              new Date(
                overdueInstallments[0]
                  .dueDate
              )) /
            (1000 *
              60 *
              60 *
              24)
          )
        )
        : 0;

    /* -----------------------------
       NEXT PAYMENT
    ----------------------------- */

    const nextInstallment =
      installments
        .filter(
          (item) =>
            !isInstallmentFullyPaid(item)
        )
        .sort(
          (a, b) =>
            new Date(a.dueDate) -
            new Date(b.dueDate)
        )[0] || null;

    /* -----------------------------
       INTEREST
    ----------------------------- */

    const interestAccruedToDate =
      installments
        .filter(
          (item) =>
            new Date(item.dueDate) <=
            startOfToday
        )
        .reduce(
          (total, item) =>
            total +
            Number(
              item.interestAmount || 0
            ),
          0
        );

    /* -----------------------------
       OUTSTANDING PRINCIPAL
    ----------------------------- */

    const outstandingPrincipal =
      installments.reduce(
        (total, item) => {
          const principal =
            Number(
              item.principalAmount || 0
            );

          const amountPaid =
            Number(
              item.amountPaid || 0
            );

          const amountDue =
            Number(
              item.amountDue || 0
            );

          if (amountDue <= 0) {
            return total;
          }

          const principalShare =
            principal / amountDue;

          const normalRemaining =
            getInstallmentRemaining(
              item
            );

          return (
            total +
            Math.max(
              0,
              normalRemaining *
              principalShare
            )
          );
        },
        0
      );

    /* -----------------------------
       LATE FEES
    ----------------------------- */

    const totalLateFees =
      installments.reduce(
        (total, item) =>
          total +
          Number(item.lateFee || 0),
        0
      );

    const lateFeesPaid =
      installments.reduce(
        (total, item) =>
          total +
          Number(
            item.lateFeePaid || 0
          ),
        0
      );

    const remainingLateFees =
      installments.reduce(
        (total, item) =>
          total +
          getLateFeeRemaining(item),
        0
      );

    /* -----------------------------
       TOTALS
    ----------------------------- */

    const totalScheduledAmount =
      Number(
        schedule.totalScheduledAmount ||
        0
      );

    const totalPaid =
      Number(
        schedule.totalPaid || 0
      );

    const remainingBalance =
      Number(
        schedule.remainingBalance || 0
      );

    const totalContractualAmount =
      roundMoney(
        totalScheduledAmount +
        totalLateFees
      );

    const paymentProgress =
      totalContractualAmount > 0
        ? Math.min(
          100,
          roundMoney(
            (totalPaid /
              totalContractualAmount) *
            100
          )
        )
        : 0;

    /* -----------------------------
       INSTALLMENT COUNTS
    ----------------------------- */

    const paidInstallments =
      installments.filter(
        (item) =>
          item.status === "paid"
      ).length;

    const partialInstallments =
      installments.filter(
        (item) =>
          item.status === "partial"
      ).length;

    const pendingInstallments =
      installments.filter(
        (item) =>
          item.status === "pending"
      ).length;

    const overdueInstallmentsCount =
      installments.filter(
        (item) =>
          item.status === "overdue"
      ).length;

    /* -----------------------------
       ITEMIZED LATE FEES
    ----------------------------- */

    const itemizedLateFees =
      installments
        .filter(
          (item) =>
            Number(item.lateFee || 0) >
            0
        )
        .map((item) => ({
          installmentId:
            item._id,

          installmentNumber:
            item.installmentNumber,

          dueDate:
            item.dueDate,

          lateFee:
            Number(
              item.lateFee || 0
            ),

          lateFeePaid:
            Number(
              item.lateFeePaid || 0
            ),

          remainingLateFee:
            getLateFeeRemaining(
              item
            ),

          status:
            item.status,
        }));

    /* -----------------------------
       RESPONSE
    ----------------------------- */

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          loan: {
            id: loan._id,

            loanType:
              loan.loanType,

            customer: {
              firstName:
                loan.firstName,

              lastName:
                loan.lastName,

              email:
                loan.email,

              phone:
                loan.phone,
            },

            status:
              loan.status,

            amountRequested:
              loan.amountRequested,

            vehicle:
              loan.vehicle,
          },
          repaymentScheduleId: schedule._id,

          loanTerms: {
            loanAmount:
              loan.approvedTerms
                ?.loanAmount || 0,

            interestRate:
              loan.approvedTerms
                ?.interestRate || 0,

            repaymentMonths:
              loan.approvedTerms
                ?.repaymentMonths || 0,

            paymentPlanType:
              schedule.paymentPlanType,

            frequency:
              schedule.frequency,

            numberOfPayments:
              schedule.numberOfPayments,

            firstDueDate:
              schedule.firstDueDate,
          },

          summary: {
            totalPrincipal:
              Number(
                schedule.totalPrincipal ||
                0
              ),

            totalInterest:
              Number(
                schedule.totalInterest ||
                0
              ),

            totalScheduledAmount,

            totalContractualAmount,

            totalPaid,

            remainingBalance,

            outstandingPrincipal,

            interestAccruedToDate,

            totalLateFees,

            lateFeesPaid,

            remainingLateFees,

            paymentProgress,

            installmentsPaid:
              paidInstallments,

            installmentsPartial:
              partialInstallments,

            installmentsPending:
              pendingInstallments,

            installmentsOverdue:
              overdueInstallmentsCount,

            totalInstallments:
              installments.length,
          },

          nextPayment:
            nextInstallment
              ? {
                installmentNumber:
                  nextInstallment.installmentNumber,

                dueDate:
                  nextInstallment.dueDate,

                amountDue:
                  Number(
                    nextInstallment.amountDue ||
                    0
                  ),

                amountPaid:
                  Number(
                    nextInstallment.amountPaid ||
                    0
                  ),

                remainingAmount:
                  Number(
                    nextInstallment.remainingAmount ||
                    0
                  ),

                lateFee:
                  Number(
                    nextInstallment.lateFee ||
                    0
                  ),

                lateFeePaid:
                  Number(
                    nextInstallment.lateFeePaid ||
                    0
                  ),

                remainingLateFee:
                  getLateFeeRemaining(
                    nextInstallment
                  ),

                totalRemaining:
                  getTotalInstallmentRemaining(
                    nextInstallment
                  ),

                status:
                  nextInstallment.status,

                isOverdue:
                  new Date(
                    nextInstallment.dueDate
                  ) < startOfToday &&
                  !isInstallmentFullyPaid(
                    nextInstallment
                  ),
              }
              : null,

          overdue: {
            isOverdue:
              overdueInstallments.length >
              0,

            installmentCount:
              overdueInstallments.length,

            amountOverdue:
              roundMoney(
                overdueAmount
              ),

            daysOverdue,
          },

          lateFees:
            itemizedLateFees,

          installments,

          payments,
        },

        "Loan ledger retrieved successfully."
      )
    );
  });

/* =========================================================
   OVERDUE + UPCOMING
========================================================= */

/**
 * GET /api/v1/payments/overdue
 */
export const getOverduePayments =
  asyncHandler(async (req, res) => {
    const now = new Date();

    const startOfToday =
      new Date(now);

    startOfToday.setHours(
      0,
      0,
      0,
      0
    );

    const endOfToday =
      new Date(startOfToday);

    endOfToday.setDate(
      endOfToday.getDate() + 1
    );

    const upcomingEnd =
      new Date(startOfToday);

    upcomingEnd.setDate(
      upcomingEnd.getDate() + 8
    );

    const schedules =
      await RepaymentSchedule.find({
        status: {
          $in: [
            "active",
            "overdue",
          ],
        },
      })
        .populate(
          "loanApplication",
          "firstName lastName email phone amountRequested status loanType"
        )
        .lean();

    const overdue = [];
    const upcoming = [];

    for (const schedule of schedules) {
      const loan =
        schedule.loanApplication;

      if (!loan) continue;

      for (const installment of
        schedule.installments || []) {
        const dueDate =
          new Date(
            installment.dueDate
          );

        const remainingAmount =
          getInstallmentRemaining(
            installment
          );

        const remainingLateFee =
          getLateFeeRemaining(
            installment
          );

        const totalRemaining =
          roundMoney(
            remainingAmount +
            remainingLateFee
          );

        /* Fully paid */
        if (totalRemaining <= 0) {
          continue;
        }

        /* -------------------------
           OVERDUE
        ------------------------- */

        if (
          dueDate <
          startOfToday
        ) {
          const daysOverdue =
            Math.max(
              0,
              Math.floor(
                (startOfToday -
                  dueDate) /
                (1000 *
                  60 *
                  60 *
                  24)
              )
            );

          overdue.push({
            loanApplicationId:
              loan._id,

            loanType:
              loan.loanType,

            customer: {
              firstName:
                loan.firstName,

              lastName:
                loan.lastName,

              email:
                loan.email,

              phone:
                loan.phone,
            },

            installmentId:
              installment._id,

            installmentNumber:
              installment.installmentNumber,

            dueDate:
              installment.dueDate,

            amountDue:
              Number(
                installment.amountDue ||
                0
              ),

            amountPaid:
              Number(
                installment.amountPaid ||
                0
              ),

            remainingAmount,

            lateFee:
              Number(
                installment.lateFee ||
                0
              ),

            lateFeePaid:
              Number(
                installment.lateFeePaid ||
                0
              ),

            remainingLateFee,

            amountOverdue:
              totalRemaining,

            daysOverdue,

            status:
              installment.status,

            arrangementMade:
              installment.arrangementMade ||
              false,

            arrangementNote:
              installment.arrangementNote ||
              "",

            repaymentScheduleId:
              schedule._id,
          });

          continue;
        }

        /* -------------------------
           UPCOMING
        ------------------------- */

        if (
          dueDate >=
          endOfToday &&
          dueDate <
          upcomingEnd
        ) {
          const daysUntilDue =
            Math.ceil(
              (dueDate -
                startOfToday) /
              (1000 *
                60 *
                60 *
                24)
            );

          upcoming.push({
            loanApplicationId:
              loan._id,

            loanType:
              loan.loanType,

            customer: {
              firstName:
                loan.firstName,

              lastName:
                loan.lastName,

              email:
                loan.email,

              phone:
                loan.phone,
            },

            installmentId:
              installment._id,

            installmentNumber:
              installment.installmentNumber,

            dueDate:
              installment.dueDate,

            amountDue:
              Number(
                installment.amountDue ||
                0
              ),

            amountPaid:
              Number(
                installment.amountPaid ||
                0
              ),

            remainingAmount,

            lateFee:
              Number(
                installment.lateFee ||
                0
              ),

            lateFeePaid:
              Number(
                installment.lateFeePaid ||
                0
              ),

            remainingLateFee,

            totalRemaining,

            daysUntilDue,

            status:
              installment.status,

            repaymentScheduleId:
              schedule._id,
          });
        }
      }
    }

    /* -----------------------------
       SORT
    ----------------------------- */

    overdue.sort(
      (a, b) =>
        new Date(a.dueDate) -
        new Date(b.dueDate)
    );

    upcoming.sort(
      (a, b) =>
        new Date(a.dueDate) -
        new Date(b.dueDate)
    );

    const totalOverdueAmount =
      roundMoney(
        overdue.reduce(
          (total, item) =>
            total +
            Number(
              item.amountOverdue || 0
            ),
          0
        )
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          overdue: {
            count:
              overdue.length,

            totalAmount:
              totalOverdueAmount,

            items:
              overdue,
          },

          upcomingThisWeek: {
            count:
              upcoming.length,

            items:
              upcoming,
          },

          generatedAt:
            new Date(),
        },

        "Overdue and upcoming payments retrieved successfully."
      )
    );
  });

/* =========================================================
   PAYMENT ARRANGEMENT
========================================================= */

/**
 * PATCH
 * /api/v1/payments/loan/:loanId/installment/:installmentId/arrangement
 */
export const markArrangementMade =
  asyncHandler(async (req, res) => {
    const {
      loanId,
      installmentId,
    } = req.params;

    const {
      arrangementNote = "",
    } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(
        loanId
      )
    ) {
      throw new ApiError(
        400,
        "Invalid loan ID."
      );
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        installmentId
      )
    ) {
      throw new ApiError(
        400,
        "Invalid installment ID."
      );
    }

    const schedule =
      await RepaymentSchedule.findOne({
        loanApplication: loanId,
      });

    if (!schedule) {
      throw new ApiError(
        404,
        "Repayment schedule not found for this loan."
      );
    }

    const installment =
      schedule.installments.id(
        installmentId
      );

    if (!installment) {
      throw new ApiError(
        404,
        "Installment not found."
      );
    }

    if (
      isInstallmentFullyPaid(
        installment
      )
    ) {
      throw new ApiError(
        400,
        "Arrangement cannot be made for a fully paid installment."
      );
    }

    installment.arrangementMade =
      true;

    installment.arrangementNote =
      typeof arrangementNote ===
        "string"
        ? arrangementNote.trim()
        : "";

    installment.arrangementMadeAt =
      new Date();

    installment.arrangementMadeBy =
      req.user?._id || null;

    schedule.updatedBy =
      req.user?._id || null;

    await schedule.save();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          loanApplicationId:
            loanId,

          repaymentScheduleId:
            schedule._id,

          installment,
        },
        "Payment arrangement marked successfully."
      )
    );
  });