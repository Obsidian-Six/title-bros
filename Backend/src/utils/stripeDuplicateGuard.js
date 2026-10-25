
export async function respondToDuplicateStripeSession({
  Payment,
  checkoutSessionId,
  res,
  logger = console,
}) {
  const existingPayment = await Payment.findOne({
    stripeCheckoutSessionId: checkoutSessionId,
  });

  if (!existingPayment) {
    return false;
  }

  logger.log("[Stripe Webhook] Duplicate payment already exists", {
    sessionId: checkoutSessionId,
    paymentId: existingPayment._id,
  });

  res.status(200).json({
    received: true,
    duplicate: true,
  });

  return true;
}
