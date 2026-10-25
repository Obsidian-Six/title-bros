
import "dotenv/config";
import nodemailer from "nodemailer";

const {
  SMTP_HOST,
  SMTP_PORT = "587",
  SMTP_USER,
  SMTP_PASS,
  EMAIL_FROM_NAME = "Title Bros Loans",
  EMAIL_FROM_ADDRESS,
  SMTP_TEST_RECIPIENT,
} = process.env;

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !SMTP_TEST_RECIPIENT) {
  throw new Error(
    "Missing SMTP configuration or SMTP_TEST_RECIPIENT in .env"
  );
}

const port = Number(SMTP_PORT);

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port,
  secure: port === 465,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

try {
  await transporter.verify();
  console.log("SMTP authentication successful.");

  const info = await transporter.sendMail({
    from: `"${EMAIL_FROM_NAME}" <${EMAIL_FROM_ADDRESS || SMTP_USER}>`,
    to: SMTP_TEST_RECIPIENT,
    subject: "Title Bros - Simple Email Delivery Test",
    text: [
      "Hello,",
      "",
      "This is a simple plain-text email from Title Bros.",
      "There is no HTML template and no attachment.",
      "",
      "This message is being used to test email delivery.",
      "",
      "Thank you,",
      "Title Bros Loans",
    ].join("\n"),
  });

  console.log("Email accepted by SMTP.");
  console.log("Message ID:", info.messageId);
  console.log("Recipient:", SMTP_TEST_RECIPIENT);
} catch (error) {
  console.error("Email test failed:", error.message);
  process.exitCode = 1;
} finally {
  transporter.close();
}
