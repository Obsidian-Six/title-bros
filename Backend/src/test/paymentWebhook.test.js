
import test from "node:test";
import assert from "node:assert/strict";

import {
  respondToDuplicateStripeSession,
} from "../utils/stripeDuplicateGuard.js";

test("duplicate Checkout Session returns 200 and does not start payment processing", async () => {
  const checkoutSessionId =
    "cs_test_a1ftzcSsxdXQADeKt0BxAgQUGLM8afbwOKMPsgo6gCpXodFuV3QnA3sCiE";

  let findOneCalls = 0;
  let transactionStarted = false;

  const Payment = {
    async findOne(query) {
      findOneCalls++;

      assert.deepEqual(query, {
        stripeCheckoutSessionId: checkoutSessionId,
      });

      return {
        _id: "existing-payment-id",
        stripeCheckoutSessionId: checkoutSessionId,
        status: "completed",
        receiptNumber: "TB-RCP-20261012-EFF81F25",
      };
    },
  };

  const res = {
    statusCode: null,
    body: null,

    status(code) {
      this.statusCode = code;
      return this;
    },

    json(body) {
      this.body = body;
      return this;
    },
  };

  const duplicate = await respondToDuplicateStripeSession({
    Payment,
    checkoutSessionId,
    res,
    logger: { log() {} },
  });

  // The controller returns immediately when duplicate is true.
  if (!duplicate) {
    transactionStarted = true;
  }

  assert.equal(duplicate, true);
  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, {
    received: true,
    duplicate: true,
  });
  assert.equal(findOneCalls, 1);
  assert.equal(transactionStarted, false);
});
