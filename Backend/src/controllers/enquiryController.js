import Enquiry from "../models/Enquiry.js";

import User from "../models/User.js";

import CommunicationLog from "../models/CommunicationLog.js";

import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { sendEmail } from "../utils/emailService.js";

export const createEnquiry = asyncHandler(
  async (req, res) => {
    const {
      firstName,
      lastName,
      email,
      phone,
      interestedIn,
      amountNeeded,
      preferredContactMethod,
      preferredContactTime,
      message,
    } = req.body;

    const cleanFirstName =
      String(firstName || "").trim();

    const cleanLastName =
      String(lastName || "").trim();

    const cleanEmail =
      String(email || "")
        .trim()
        .toLowerCase();

    const cleanPhone =
      String(phone || "")
        .replace(/\D/g, "");

    const cleanMessage =
      String(message || "").trim();

    if (
      !cleanFirstName ||
      !cleanLastName ||
      !cleanEmail ||
      !cleanPhone ||
      !interestedIn ||
      !cleanMessage
    ) {
      throw new ApiError(
        400,
        "Please complete all required enquiry fields.",
      );
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(
        cleanEmail,
      )
    ) {
      throw new ApiError(
        400,
        "Please enter a valid email address.",
      );
    }

    if (cleanPhone.length !== 10) {
      throw new ApiError(
        400,
        "Please enter a valid 10-digit US phone number.",
      );
    }

    let customer = null;

    if (req.user?._id) {
      customer = req.user._id;
    } else {
      const existingUser = await User.findOne({
        email: cleanEmail,
      }).select("_id");

      customer = existingUser?._id || null;
    }

    const enquiry = await Enquiry.create({
      customer,

      firstName: cleanFirstName,

      lastName: cleanLastName,

      email: cleanEmail,

      phone: cleanPhone,

      interestedIn,

      amountNeeded:
        Number(amountNeeded) || 0,

      preferredContactMethod:
        preferredContactMethod || "",

      preferredContactTime:
        preferredContactTime || "",

      message: cleanMessage,

      source: "WEBSITE",
    });

    /*
     * Communication log
     */
    await CommunicationLog.create({
      customer,

      channel: "EMAIL",

      recipient: cleanEmail,

      subject:
        "Title Bros Enquiry Received",

      message:
        `Your enquiry has been received. ` +
        `A Title Bros specialist will contact you shortly.`,

      type: "AUTOMATED",

      sentByName: "Title Bros Auto-Bot",

      sentAt: new Date(),
    });

    /*
     * Customer confirmation email
     */
    try {
      await sendEmail({
        email: cleanEmail,

        subject:
          "Title Bros — Enquiry Received",

        html: `
          <h3>Thank you for contacting Title Bros.</h3>

          <p>
            Hi ${cleanFirstName},
          </p>

          <p>
            We received your enquiry and a member
            of our team will contact you soon.
          </p>

          <p>
            Thank you,<br />
            Title Bros
          </p>
        `,

        text:
          `Hi ${cleanFirstName}, ` +
          `we received your enquiry. ` +
          `A Title Bros specialist will contact you soon.`,
      });
    } catch (error) {
      console.error(
        "Enquiry confirmation email failed:",
        error,
      );
    }

    /*
     * Admin notification
     */
    try {
      const adminEmail =
        process.env.SMTP_USER ||
        "admin@titlebros.com";

      await sendEmail({
        email: adminEmail,

        subject:
          `New Title Bros Enquiry — ${cleanFirstName} ${cleanLastName}`,

        html: `
          <h3>New Enquiry Received</h3>

          <p>
            <strong>Name:</strong>
            ${cleanFirstName} ${cleanLastName}
          </p>

          <p>
            <strong>Email:</strong>
            ${cleanEmail}
          </p>

          <p>
            <strong>Phone:</strong>
            ${cleanPhone}
          </p>

          <p>
            <strong>Interested In:</strong>
            ${interestedIn}
          </p>

          <p>
            <strong>Amount Needed:</strong>
            $${Number(amountNeeded || 0).toLocaleString()}
          </p>

          <p>
            <strong>Message:</strong>
            ${cleanMessage}
          </p>
        `,
      });
    } catch (error) {
      console.error(
        "Admin enquiry email failed:",
        error,
      );
    }

    return res.status(201).json(
      new ApiResponse(
        201,
        {
          enquiryId: enquiry._id,
          enquiry,
        },
        "Enquiry submitted successfully.",
      ),
    );
  },
);