
import test from "node:test";
import assert from "node:assert/strict";
import esmock from "esmock";

test("actual stripeWebhook acknowledges duplicate session without starting a transaction", async () => {
  const previousSecret = process.env.STRIPE_WEBHOOK_SECRET;
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_test_secret";

  const checkoutSessionId = "cs_test_duplicate_integration";
  let findOneCalls = 0;
  let startSessionCalls = 0;
  let paymentCreationCalls = 0;

  const event = {
    id: "evt_test_duplicate",
    type: "checkout.session.completed",
    data: {
      object: {
        id: checkoutSessionId,
        payment_status: "paid",
        amount_total: 919181,
        payment_intent: "pi_test_duplicate",
        metadata: {
          loanApplicationId: "loan_test_123",
          repaymentScheduleId: "schedule_test_123",
          installmentId: "installment_test_123",
        },
      },
    },
  };

  function MockPayment() {
    paymentCreationCalls++;
  }

  MockPayment.findOne = async (query) => {
    findOneCalls++;

    assert.deepEqual(query, {
      stripeCheckoutSessionId: checkoutSessionId,
    });

    return {
      _id: "existing-payment-id",
      stripeCheckoutSessionId: checkoutSessionId,
      status: "completed",
      receiptNumber: "TB-RCP-EXISTING",
    };
  };

  class MockApiError extends Error {
    constructor(statusCode, message) {
      super(message);
      this.statusCode = statusCode;
    }
  }

  class MockApiResponse {
    constructor(statusCode, data, message) {
      this.statusCode = statusCode;
      this.data = data;
      this.message = message;
    }
  }

  try {
   
const stripeMock = {
  default: {
    webhooks: {
      constructEvent: () => event,
    },
  },
};

const { stripeWebhook } = await esmock(
  "../controllers/paymentController.js",
  {
    "../config/stripe.js": stripeMock,
    "../models/Payment.js": {
      default: MockPayment,
    },
    "../models/RepaymentSchedule.js": {
      default: {},
    },
    "../models/LoanApplication.js": {
      default: {},
    },
    "../utils/ApiError.js": {
      default: MockApiError,
    },
    "../utils/ApiResponse.js": {
      default: MockApiResponse,
    },
    "../utils/emailService.js": {
      sendEmail: async () => {},
    },
    "mongoose": {
      default: {
        startSession: async () => {
          startSessionCalls++;
          throw new Error(
            "Transaction must not start for a duplicate session"
          );
        },
      },
    },
    "pdfkit": {
      default: class MockPDFDocument {},
    },
  },
  {
    "../config/stripe.js": stripeMock,
  }
);

    const req = {
      method: "POST",
      headers: {
        "stripe-signature": "test_signature",
      },
      body: Buffer.from("{}"),
    };

    const res = {
      statusCode: 200,
      body: null,

      status(code) {
        this.statusCode = code;
        return this;
      },

      json(body) {
        this.body = body;
        return this;
      },

      send(body) {
        this.body = body;
        return this;
      },
    };

    let nextError;

    await new Promise((resolve, reject) => {
      const originalJson = res.json.bind(res);

      res.json = (body) => {
        originalJson(body);
        resolve();
        return res;
      };

      res.send = (body) => {
        res.body = body;
        resolve();
        return res;
      };

      const next = (error) => {
        nextError = error;
        reject(error);
      };

      stripeWebhook(req, res, next);
    });

    if (nextError) throw nextError;

    assert.equal(res.statusCode, 200);
    assert.deepEqual(res.body, {
      received: true,
      duplicate: true,
    });

    assert.equal(findOneCalls, 1);
    assert.equal(startSessionCalls, 0);
    assert.equal(paymentCreationCalls, 0);
  } finally {
    if (previousSecret === undefined) {
      delete process.env.STRIPE_WEBHOOK_SECRET;
    } else {
      process.env.STRIPE_WEBHOOK_SECRET = previousSecret;
    }
  }
});
