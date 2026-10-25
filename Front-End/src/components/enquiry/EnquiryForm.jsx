"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
  Send,
  User,
} from "lucide-react";

import Field from "@/components/apply/Field";
import Select from "@/components/ui/Select";

const INITIAL_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  interestedIn: "",
  amountNeeded: "",
  preferredContactMethod: "",
  preferredContactTime: "",
  message: "",
};

export default function EnquiryForm() {
  const router = useRouter();
  const { locale } = useParams();

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const update = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [key]: "",
    }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.firstName.trim()) {
      nextErrors.firstName = "First name is required.";
    }

    if (!form.lastName.trim()) {
      nextErrors.lastName = "Last name is required.";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email,
      )
    ) {
      nextErrors.email = "Enter a valid email.";
    }

    const phoneDigits = form.phone.replace(/\D/g, "");

    if (!phoneDigits) {
      nextErrors.phone = "Phone number is required.";
    } else if (phoneDigits.length !== 10) {
      nextErrors.phone =
        "Enter a valid 10-digit US phone number.";
    }

    if (!form.interestedIn) {
      nextErrors.interestedIn =
        "Please select an option.";
    }

    if (!form.message.trim()) {
      nextErrors.message =
        "Please tell us how we can help.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    setSubmitError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/enquiries`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            ...form,
            phone: form.phone.replace(/\D/g, ""),
            amountNeeded: Number(
              String(form.amountNeeded || "")
                .replace(/[$,\s]/g, ""),
            ) || 0,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Unable to submit your enquiry.",
        );
      }

      setSubmitted(true);
    } catch (error) {
      setSubmitError(
        error?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section className="min-h-screen bg-[#f7f8f4] pb-24 pt-36">
        <div className="container-x mx-auto max-w-2xl">
          <div className="glass rounded-[34px] p-8 text-center shadow-xl md:p-12">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#087a45]/10 text-[#087a45]">
              <CheckCircle2 size={32} />
            </div>

            <h1 className="mt-6 text-3xl font-black text-[var(--ink)]">
              Enquiry Received
            </h1>

            <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-black/55">
              Thank you for contacting Title Bros.
              Our team will review your enquiry and
              get back to you using your preferred
              contact method.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/${locale}/pre-approval`,
                )
              }
              className="btn-primary mt-8 inline-flex items-center gap-2"
            >
              Back to Pre-Approval
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#f7f8f4] pb-24 pt-36">
      <div className="container-x mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-7 inline-flex items-center gap-2 text-xs font-black text-black/45 transition hover:text-[#087a45]"
        >
          <ArrowLeft size={15} />
          Back
        </button>

        <div className="glass rounded-[34px] p-6 shadow-xl md:p-10">
          <div>
            <div className="eyebrow text-[#087a45]">
              TITLE BROS
            </div>

            <h1 className="mt-4 text-3xl font-black text-[var(--ink)] md:text-4xl">
              Send an Enquiry
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-black/50">
              Have questions about Title Loans,
              Personal Loans, or your financing
              options? Tell us a little about what
              you need and our team will help.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-9 space-y-6"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="First Name"
                value={form.firstName}
                onChange={(e) =>
                  update(
                    "firstName",
                    e.target.value,
                  )
                }
                error={errors.firstName}
                placeholder="John"
              />

              <Field
                label="Last Name"
                value={form.lastName}
                onChange={(e) =>
                  update(
                    "lastName",
                    e.target.value,
                  )
                }
                error={errors.lastName}
                placeholder="Doe"
              />

              <Field
                label="Email Address"
                value={form.email}
                onChange={(e) =>
                  update(
                    "email",
                    e.target.value,
                  )
                }
                error={errors.email}
                type="email"
                placeholder="john@example.com"
              />

              <Field
                label="Phone Number"
                value={form.phone}
                onChange={(e) =>
                  update(
                    "phone",
                    e.target.value,
                  )
                }
                error={errors.phone}
                type="tel"
                placeholder="(702) 555-0123"
              />

              <Select
                label="What are you interested in?"
                value={form.interestedIn}
                onChange={(e) =>
                  update(
                    "interestedIn",
                    e.target.value,
                  )
                }
                error={errors.interestedIn}
              >
                <option value="">
                  Select an option
                </option>
                <option value="title-loan">
                  Title Loan
                </option>
                <option value="personal-loan">
                  Personal Loan
                </option>
                <option value="general">
                  General Question
                </option>
              </Select>

              <Field
                label="Estimated Amount Needed"
                value={form.amountNeeded}
                onChange={(e) =>
                  update(
                    "amountNeeded",
                    e.target.value,
                  )
                }
                placeholder="$10,000"
              />

              <Select
                label="Preferred Contact Method"
                value={form.preferredContactMethod}
                onChange={(e) =>
                  update(
                    "preferredContactMethod",
                    e.target.value,
                  )
                }
              >
                <option value="">
                  Select contact method
                </option>
                <option value="phone">
                  Phone
                </option>
                <option value="email">
                  Email
                </option>
                <option value="either">
                  Either
                </option>
              </Select>

              <Field
                label="Best Time to Contact"
                value={form.preferredContactTime}
                onChange={(e) =>
                  update(
                    "preferredContactTime",
                    e.target.value,
                  )
                }
                placeholder="Morning / Afternoon"
              />
            </div>

            <Field
              label="How can we help?"
              value={form.message}
              onChange={(e) =>
                update(
                  "message",
                  e.target.value,
                )
              }
              error={errors.message}
              placeholder="Tell us what you would like help with..."
              multiline
              rows={5}
            />

            {submitError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex w-full items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={17} />
                  Send Enquiry
                </>
              )}
            </button>

            <p className="text-center text-xs leading-5 text-black/35">
              Please do not include your Social
              Security Number, ITIN, passwords, or
              other highly sensitive information in
              this enquiry form.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}