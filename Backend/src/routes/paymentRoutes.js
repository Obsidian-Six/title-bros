// import { Router } from "express";
// import stripe from "../config/stripe.js";

// import {
//   recordPayment,
//   getLoanPayments,
//   getPaymentById,
//   getLoanLedger,
//   getOverduePayments,
//   markArrangementMade,
// } from "../controllers/paymentController.js";

// const router = Router();

// // Stripe connection test
// router.get("/stripe-test", async (req, res) => {
//   try {
//     const account = await stripe.accounts.retrieve();

//     res.status(200).json({
//       success: true,
//       message: "Stripe connected successfully",
//       accountId: account.id,
//     });
//   } catch (error) {
//     console.error("Stripe connection error:", error);

//     res.status(500).json({
//       success: false,
//       message: "Stripe connection failed",
//       error: error.message,
//     });
//   }
// });

// // Record manual payment
// router.post("/", recordPayment);

// router.get("/overdue", getOverduePayments);

// router.get("/loan/:loanId/ledger", getLoanLedger);

// router.patch(
//   "/loan/:loanId/installment/:installmentId/arrangement",
//   markArrangementMade
// );

// // Get all payments of a loan
// router.get("/loan/:loanId", getLoanPayments);

// // Get single payment
// router.get("/:id", getPaymentById);

// export default router;



import { Router } from "express";

import {
  recordPayment,
  getLoanPayments,
  getPaymentById,
  getLoanLedger,
  getOverduePayments,
  markArrangementMade,
  stripeTest,
  createStripeCheckoutSession,
  stripeWebhook,
  resendPaymentReceipt,
} from "../controllers/paymentController.js";
import { USER_ROLES } from "../models/User.js";
import protect from "../middlewares/authMiddleware.js";

const router = Router();

const requirePaymentAdmin = (req, res, next) => {
  if (
    req.user?.role !== USER_ROLES.ADMIN &&
    req.user?.role !== USER_ROLES.SUPER_ADMIN
  ) {
    return res.status(403).json({
      success: false,
      message: "Admin access required.",
    });
  }

  next();
};

/*
|--------------------------------------------------------------------------
| Stripe Webhook
|--------------------------------------------------------------------------
| IMPORTANT:
| This route must receive the RAW Stripe request body.
|
| Do NOT put express.json() before this route.
|--------------------------------------------------------------------------
*/

router.post(
  "/stripe/webhook",
  // express.raw() will be added at the app/server level.
  stripeWebhook
);

/*
|--------------------------------------------------------------------------
| Stripe
|--------------------------------------------------------------------------
*/

// Stripe connection test
router.get(
  "/stripe-test",
  stripeTest
);

// Create Stripe Checkout Session
router.post(
  "/stripe/checkout",
  protect,
  createStripeCheckoutSession
);


/*
|--------------------------------------------------------------------------
| Overdue / Repayment
|--------------------------------------------------------------------------
*/

// Get overdue and upcoming payments
router.get(
  "/overdue",
  getOverduePayments
);

// Get complete loan ledger
router.get(
  "/loan/:loanId/ledger",
  protect,
  getLoanLedger
);

// Mark payment arrangement
router.patch(
  "/loan/:loanId/installment/:installmentId/arrangement",
  markArrangementMade
);

/*
|--------------------------------------------------------------------------
| Payment History
|--------------------------------------------------------------------------
*/

// Get all payments of a loan
router.get(
  "/loan/:loanId",
  protect,
  getLoanPayments
);


router.post(
  "/",
  protect,
  requirePaymentAdmin,
  recordPayment
);

router.post(
  "/:id/resend-receipt",
  protect,
  requirePaymentAdmin,
  resendPaymentReceipt
);



// Get single payment / receipt
router.get(
  "/:id",
  getPaymentById
);

export default router;