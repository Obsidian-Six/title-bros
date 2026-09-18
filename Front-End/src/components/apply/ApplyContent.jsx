"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Check,
  Clock,
  Loader2,
  Lock,
  UserPlus,
  LogIn,
  Car,
  User,
  DollarSign,
  Edit3,
} from "lucide-react";
import Reveal from "@/components/Reveal";
import { submitLoanApplication } from "@/services/loanService";
import Input from "@/components/ui/Input";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";

const INITIAL_FORM = {
  year: "",
  make: "",
  model: "",
  estimatedValue: "",
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  amountRequested: "",
  reasonForFunds: "",
  employmentStatus: "",
  zipCode: "",
};

function ApplyContent() {
  const t = useTranslations("apply");
  const { locale } = useParams();
  const router = useRouter();
  const { user, isAuthenticated, openAuthModal } = useAuth();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedLoan, setSubmittedLoan] = useState(null);
  const [submitError, setSubmitError] = useState("");

  // Pre-fill personal information from authenticated user account
  useEffect(() => {
    if (user) {
      const nameParts = (user.name || "").trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      setForm((prev) => ({
        ...prev,
        firstName: prev.firstName || firstName,
        lastName: prev.lastName || lastName,
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
      }));
    }
  }, [user]);

  /*
   * IMPORTANT:
   * Keep these keys in English.
   * They are internal form keys, not translations.
   */
  const STEPS = [
    {
      key: "vehicle",
      title: t("steps.vehicle.title"),
      description: t("steps.vehicle.description"),
      fields: [
        {
          key: "year",
          label: t("steps.vehicle.fields.year"),
        },
        {
          key: "make",
          label: t("steps.vehicle.fields.make"),
        },
        {
          key: "model",
          label: t("steps.vehicle.fields.model"),
        },
        {
          key: "estimatedValue",
          label: t("steps.vehicle.fields.estimatedValue"),
        },
      ],
    },

    {
      key: "personal",
      title: t("steps.personal.title"),
      description: t("steps.personal.description"),
      fields: [
        {
          key: "firstName",
          label: t("steps.personal.fields.firstName"),
        },
        {
          key: "lastName",
          label: t("steps.personal.fields.lastName"),
        },
        {
          key: "phone",
          label: t("steps.personal.fields.phone"),
          type: "tel",
        },
        {
          key: "email",
          label: t("steps.personal.fields.email"),
          type: "email",
        },
      ],
    },

    {
      key: "loan",
      title: t("steps.loan.title"),
      description: t("steps.loan.description"),
      fields: [
        {
          key: "amountRequested",
          label: t("steps.loan.fields.amountRequested"),
        },
        {
          key: "reasonForFunds",
          label: t("steps.loan.fields.reasonForFunds"),
        },
        {
          key: "employmentStatus",
          label: t("steps.loan.fields.employmentStatus"),
        },
        {
          key: "zipCode",
          label: t("steps.loan.fields.zipCode"),
        },
      ],
    },
  ];

  const reviewStep = {
    key: "submit",
    title: t("steps.submit.title"),
    description: t("steps.submit.description"),
  };

  const currentStep = STEPS[step];

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

  const validateStep = () => {
    const newErrors = {};

    currentStep.fields.forEach(({ key }) => {
      if (!String(form[key] || "").trim()) {
        newErrors[key] = t("validation.required");
      }
    });

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) return;

    setStep((prev) => Math.min(prev + 1, STEPS.length));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    setSubmitError("");
    setIsSubmitting(true);

    try {
      const response = await submitLoanApplication(form);

      console.log("Application submitted successfully:", response);

      if (response?.data?.loan) {
        setSubmittedLoan(response.data.loan);
      }
      setIsSubmitted(true);
    } catch (error) {
      console.error("Application submission error:", error);

      setSubmitError(
        error?.message || t("error.somethingWentWrong")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sign-in Gate: User must be signed in before filling application details
  if (!isAuthenticated) {
    return (
      <section className="min-h-screen bg-[#f7f8f4] pb-24 pt-36">
        <div className="container-x max-w-xl mx-auto">
          <div className="glass rounded-[34px] p-8 md:p-12 text-center shadow-xl">
            <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-[var(--green)]/10 text-[var(--green)]">
              <Lock size={32} />
            </div>
            <h1 className="h3 text-[var(--ink)]">Sign In Required to Apply</h1>
            <p className="mt-3 text-sm leading-6 text-black/60">
              To apply for an auto title loan, please sign in to your Title Bros account or create a new one. Your application and approval status will be securely linked to your account so you can upload documents and track progress.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => openAuthModal("login")}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <LogIn size={16} />
                <span>Sign In to Account</span>
              </button>
              <button
                type="button"
                onClick={() => openAuthModal("register")}
                className="flex-1 flex items-center justify-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--white)] py-3.5 text-xs font-bold text-[var(--ink)] hover:bg-[var(--paper)] transition"
              >
                <UserPlus size={16} className="text-[var(--green)]" />
                <span>Create New Account</span>
              </button>
            </div>

            <div className="mt-6 border-t border-[var(--line)] pt-4 text-xs text-[var(--muted)]">
              <span>Title Bros Staff? </span>
              <Link href={`/${locale}/admin/login`} className="font-bold text-[var(--green)] hover:underline">
                Staff Operations Login
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#f7f8f4] pb-24 pt-36">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr]">

          {/* LEFT SIDE */}
          <Reveal>
            <div className="eyebrow text-[#101512]">
              {t("eyebrow")}
            </div>

            <h1 className="h2 mt-6 text-[#101512]">
              {t("title")}
            </h1>

            <p className="mt-7 max-w-md leading-7 text-black/50">
              {t("description")}
            </p>

            <div className="mt-10 flex flex-col gap-4">

              {[
                ...STEPS,
                reviewStep,
              ].map((item, index) => {
                const isCompleted = isSubmitted || index < step;
                const isCurrent = !isSubmitted && index === step;
                return (
                  <div
                    key={item.key}
                    className={`flex items-center gap-4 ${
                      isCompleted || isCurrent
                        ? "text-[#087a45]"
                        : "text-black/35"
                    }`}
                  >
                    <div
                      className={`grid h-10 w-10 place-items-center rounded-full border text-xs font-black ${
                        isCompleted
                          ? "border-[#087a45] bg-[#087a45] text-white"
                          : isCurrent
                          ? "border-[#087a45] bg-white text-[#087a45] ring-2 ring-[#087a45]/30"
                          : "border-black/10"
                      }`}
                    >
                      {isCompleted ? <Check size={16} /> : index + 1}
                    </div>

                    <div>
                      <div className="text-sm font-black">
                        {item.title}
                      </div>

                      <div className="text-xs">
                        {isSubmitted ? "Recorded & Received" : item.description}
                      </div>
                    </div>
                  </div>
                );
              })}

            </div>
          </Reveal>

          {/* RIGHT SIDE */}
          <Reveal delay={0.08}>
            <div className="glass rounded-[34px] p-6 md:p-10">

              <div className="text-xs font-black uppercase tracking-[.16em] text-[var(--ink)]/35">
                {t("stepOf", {
                  step: step + 1,
                  total: 4,
                })}
              </div>

              <h2 className="mt-3 text-3xl font-black tracking-tight">
                {step < 3
                  ? currentStep.title
                  : t("review.title")}
              </h2>

              {/* FORM STEPS */}
              {step < 3 && !isSubmitted ? (
                <div className="mt-8 grid gap-4 sm:grid-cols-2">

                  {currentStep.fields.map(
                    ({ key, label, type = "text" }) => (
                      <label
                        key={key}
                        className="sm:col-span-1"
                      >
                        <span className="mb-2 block text-xs font-black uppercase tracking-[.1em] text-[var(--ink)]/45">
                          {label}
                        </span>

                        <Input
                          type={type}
                          value={form[key]}
                          onChange={(e) =>
                            update(key, e.target.value)
                          }
                          placeholder={t(
                            "placeholders.enter",
                            {
                              field: label.toLowerCase(),
                            }
                          )}
                          className={`h-14 w-full rounded-2xl border bg-white px-4 outline-none transition focus:border-[#087a45] text-[var(--ink)] ${
                            errors[key]
                              ? "border-red-400"
                              : "border-black/10"
                          }`}
                        />

                        {errors[key] && (
                          <span className="mt-1 block text-xs text-red-500">
                            {errors[key]}
                          </span>
                        )}
                      </label>
                    )
                  )}

                </div>
              ) : isSubmitted ? (

                /* SUCCESS - DYNAMIC 4-STEP SUMMARY VIEW */
                <div className="mt-8 space-y-4">
                  {/* Top Success Banner */}
                  <div className="rounded-[26px] bg-[#eef7df] p-6 border border-emerald-500/20">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-300/40">
                      <div className="flex items-center gap-3">
                        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#087a45] text-white shadow-sm">
                          <CheckCircle2 size={26} />
                        </div>
                        <div>
                          <span className="text-[10px] font-black tracking-widest text-[#087a45] uppercase">
                            Application Submitted Successfully
                          </span>
                          <h3 className="text-xl font-black text-[#101512]">
                            {form.firstName}&apos;s Auto Title Loan Application
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-blue-100 text-blue-800 px-3 py-1 text-xs font-black">
                          ● Under Review
                        </span>
                        <span className="font-mono text-xs font-bold text-[#087a45] bg-white px-2.5 py-1 rounded-xl border border-emerald-200">
                          #{submittedLoan?._id ? submittedLoan._id.slice(-6).toUpperCase() : "SUBMITTED"}
                        </span>
                      </div>
                    </div>

                    <p className="mt-3 text-xs leading-relaxed text-black/65">
                      Your loan application has been received and verified by the Title Bros underwriting team. All 4 application steps have been recorded dynamically and permanently added to <strong>My Applications</strong>.
                    </p>
                  </div>

                  {/* ALL 4 STEPS DYNAMIC CARDS */}
                  <div className="space-y-3.5 text-xs">
                    {/* Step 1: Vehicle Specifications */}
                    <div className="rounded-2xl bg-white p-4 border border-[var(--line)] shadow-sm">
                      <div className="flex items-center justify-between pb-2 border-b border-[var(--line)] mb-3">
                        <div className="flex items-center gap-2 font-black text-sm text-[var(--ink)]">
                          <span className="grid h-5 w-5 place-items-center rounded-full bg-[var(--green)] text-white text-[10px]">1</span>
                          <Car size={15} className="text-[var(--green)]" />
                          <span>Step 1: Vehicle Specifications</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          ✓ Verified
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <span className="text-[var(--muted)] block font-medium">Year</span>
                          <p className="font-black text-[var(--ink)] mt-0.5">{form.year || "—"}</p>
                        </div>
                        <div>
                          <span className="text-[var(--muted)] block font-medium">Make</span>
                          <p className="font-black text-[var(--ink)] mt-0.5">{form.make || "—"}</p>
                        </div>
                        <div>
                          <span className="text-[var(--muted)] block font-medium">Model</span>
                          <p className="font-black text-[var(--ink)] mt-0.5">{form.model || "—"}</p>
                        </div>
                        <div>
                          <span className="text-[var(--muted)] block font-medium">Est. Value</span>
                          <p className="font-black text-[var(--green)] mt-0.5">${Number(form.estimatedValue || 0).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* Step 2: Personal Information */}
                    <div className="rounded-2xl bg-white p-4 border border-[var(--line)] shadow-sm">
                      <div className="flex items-center justify-between pb-2 border-b border-[var(--line)] mb-3">
                        <div className="flex items-center gap-2 font-black text-sm text-[var(--ink)]">
                          <span className="grid h-5 w-5 place-items-center rounded-full bg-[var(--green)] text-white text-[10px]">2</span>
                          <User size={15} className="text-[var(--green)]" />
                          <span>Step 2: Personal & Contact Information</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          ✓ Recorded
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <span className="text-[var(--muted)] block font-medium">Applicant Name</span>
                          <p className="font-black text-[var(--ink)] mt-0.5">{form.firstName} {form.lastName}</p>
                        </div>
                        <div>
                          <span className="text-[var(--muted)] block font-medium">Phone Number</span>
                          <p className="font-black text-[var(--ink)] mt-0.5">{form.phone || "—"}</p>
                        </div>
                        <div>
                          <span className="text-[var(--muted)] block font-medium">Email Address</span>
                          <p className="font-black text-[var(--ink)] mt-0.5 truncate">{form.email || "—"}</p>
                        </div>
                        <div>
                          <span className="text-[var(--muted)] block font-medium">ZIP Code</span>
                          <p className="font-black text-[var(--ink)] mt-0.5">{form.zipCode || "—"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Step 3: Loan Request Specifications */}
                    <div className="rounded-2xl bg-white p-4 border border-[var(--line)] shadow-sm">
                      <div className="flex items-center justify-between pb-2 border-b border-[var(--line)] mb-3">
                        <div className="flex items-center gap-2 font-black text-sm text-[var(--ink)]">
                          <span className="grid h-5 w-5 place-items-center rounded-full bg-[var(--green)] text-white text-[10px]">3</span>
                          <DollarSign size={15} className="text-[var(--green)]" />
                          <span>Step 3: Loan Request Specifications</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          ✓ Requested
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <span className="text-[var(--muted)] block font-medium">Requested Amount</span>
                          <p className="font-black text-[var(--green)] mt-0.5 text-sm">${Number(form.amountRequested || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-[var(--muted)] block font-medium">Purpose of Funds</span>
                          <p className="font-black text-[var(--ink)] mt-0.5">{form.reasonForFunds || "Personal"}</p>
                        </div>
                        <div>
                          <span className="text-[var(--muted)] block font-medium">Employment Status</span>
                          <p className="font-black text-[var(--ink)] mt-0.5">{form.employmentStatus || "Employed"}</p>
                        </div>
                        <div>
                          <span className="text-[var(--muted)] block font-medium">Est. Monthly Payment</span>
                          <p className="font-black text-[var(--ink)] mt-0.5">
                            ~${(Number(form.amountRequested || 0) * 0.05).toFixed(0)}/mo
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Step 4: Underwriting & Review Timeline */}
                    <div className="rounded-2xl bg-white p-4 border border-[var(--line)] shadow-sm">
                      <div className="flex items-center justify-between pb-2 border-b border-[var(--line)] mb-3">
                        <div className="flex items-center gap-2 font-black text-sm text-[var(--ink)]">
                          <span className="grid h-5 w-5 place-items-center rounded-full bg-[var(--green)] text-white text-[10px]">4</span>
                          <Clock size={15} className="text-[var(--green)]" />
                          <span>Step 4: Underwriting Status & Timeline</span>
                        </div>
                        <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                          Stage: Under Review
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center py-1">
                        <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                          <span className="text-[10px] font-bold text-emerald-800 block">1. Submitted</span>
                          <p className="font-black text-emerald-900 text-xs mt-0.5">✓ Received</p>
                        </div>
                        <div className="p-2 rounded-xl bg-blue-50 border border-blue-300">
                          <span className="text-[10px] font-bold text-blue-800 block">2. Under Review</span>
                          <p className="font-black text-blue-900 text-xs mt-0.5">Active</p>
                        </div>
                        <div className="p-2 rounded-xl bg-[var(--paper)] border border-[var(--line)] text-[var(--muted)]">
                          <span className="text-[10px] font-medium block">3. Documents</span>
                          <p className="font-bold text-xs mt-0.5">Awaiting Request</p>
                        </div>
                        <div className="p-2 rounded-xl bg-[var(--paper)] border border-[var(--line)] text-[var(--muted)]">
                          <span className="text-[10px] font-medium block">4. Final Decision</span>
                          <p className="font-bold text-xs mt-0.5">Pending</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions to Portal or New Application */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <Link
                      href={`/${locale}/portal`}
                      className="btn-primary flex-1 flex items-center justify-center gap-2 text-center"
                    >
                      <span>View in My Applications (Customer Portal)</span>
                      <ArrowRight size={16} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setForm(INITIAL_FORM);
                        setStep(0);
                        setIsSubmitted(false);
                        setSubmittedLoan(null);
                      }}
                      className="rounded-2xl border border-[var(--line)] bg-white px-5 py-3.5 text-xs font-bold text-[var(--ink)] hover:bg-[var(--paper)] transition"
                    >
                      Submit Another Vehicle
                    </button>
                  </div>
                </div>

              ) : (

                /* REVIEW */
                <div className="mt-9 rounded-[26px] bg-[#eef7df] p-7">

                  <CheckCircle2
                    className="text-[#087a45]"
                    size={32}
                  />

                  <h3 className="mt-5 text-2xl font-black text-[#101512]">
                    {t("ready.title")}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-black/55">
                    {t("ready.description")}
                  </p>

                  {/* COMPLETE REVIEW DATA */}
                  <div className="mt-6 space-y-4 text-xs">
                    {/* 1. Vehicle Details */}
                    <div className="rounded-2xl bg-white p-4 border border-[var(--line)] shadow-sm">
                      <div className="flex items-center justify-between pb-2 border-b border-[var(--line)] mb-3">
                        <div className="flex items-center gap-1.5 font-black text-sm text-[var(--ink)]">
                          <Car size={16} className="text-[var(--green)]" />
                          <span>Vehicle Specifications</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setStep(0)}
                          className="flex items-center gap-1 font-bold text-[var(--green)] hover:underline"
                        >
                          <Edit3 size={12} />
                          <span>Edit</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <span className="text-[var(--muted)] block font-medium">Year</span>
                          <p className="font-black text-[var(--ink)] mt-0.5">{form.year || "—"}</p>
                        </div>
                        <div>
                          <span className="text-[var(--muted)] block font-medium">Make</span>
                          <p className="font-black text-[var(--ink)] mt-0.5">{form.make || "—"}</p>
                        </div>
                        <div>
                          <span className="text-[var(--muted)] block font-medium">Model</span>
                          <p className="font-black text-[var(--ink)] mt-0.5">{form.model || "—"}</p>
                        </div>
                        <div>
                          <span className="text-[var(--muted)] block font-medium">Estimated Value</span>
                          <p className="font-black text-[var(--green)] mt-0.5">
                            ${form.estimatedValue ? Number(form.estimatedValue).toLocaleString() : "0"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 2. Applicant Details */}
                    <div className="rounded-2xl bg-white p-4 border border-[var(--line)] shadow-sm">
                      <div className="flex items-center justify-between pb-2 border-b border-[var(--line)] mb-3">
                        <div className="flex items-center gap-1.5 font-black text-sm text-[var(--ink)]">
                          <User size={16} className="text-[var(--green)]" />
                          <span>Personal & Contact Information</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="flex items-center gap-1 font-bold text-[var(--green)] hover:underline"
                        >
                          <Edit3 size={12} />
                          <span>Edit</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <span className="text-[var(--muted)] block font-medium">Full Name</span>
                          <p className="font-black text-[var(--ink)] mt-0.5">{form.firstName} {form.lastName}</p>
                        </div>
                        <div>
                          <span className="text-[var(--muted)] block font-medium">Primary Phone</span>
                          <p className="font-black text-[var(--ink)] mt-0.5">{form.phone || "—"}</p>
                        </div>
                        <div>
                          <span className="text-[var(--muted)] block font-medium">Email Address</span>
                          <p className="font-black text-[var(--ink)] mt-0.5 truncate">{form.email || "—"}</p>
                        </div>
                      </div>
                    </div>

                    {/* 3. Loan Request Details */}
                    <div className="rounded-2xl bg-white p-4 border border-[var(--line)] shadow-sm">
                      <div className="flex items-center justify-between pb-2 border-b border-[var(--line)] mb-3">
                        <div className="flex items-center gap-1.5 font-black text-sm text-[var(--ink)]">
                          <DollarSign size={16} className="text-[var(--green)]" />
                          <span>Loan Request Specifications</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          className="flex items-center gap-1 font-bold text-[var(--green)] hover:underline"
                        >
                          <Edit3 size={12} />
                          <span>Edit</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <span className="text-[var(--muted)] block font-medium">Amount Requested</span>
                          <p className="text-sm font-black text-[var(--green)] mt-0.5">
                            ${form.amountRequested ? Number(form.amountRequested).toLocaleString() : "0"}
                          </p>
                        </div>
                        <div>
                          <span className="text-[var(--muted)] block font-medium">Reason for Funds</span>
                          <p className="font-bold text-[var(--ink)] mt-0.5">{form.reasonForFunds || "Personal"}</p>
                        </div>
                        <div>
                          <span className="text-[var(--muted)] block font-medium">Employment Status</span>
                          <p className="font-bold text-[var(--ink)] mt-0.5">{form.employmentStatus || "Employed"}</p>
                        </div>
                        <div>
                          <span className="text-[var(--muted)] block font-medium">Residential ZIP</span>
                          <p className="font-bold text-[var(--ink)] mt-0.5">{form.zipCode || "—"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ERROR */}
              {submitError && (
                <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-600">
                  {submitError}
                </div>
              )}

              {/* BUTTONS */}
              {!isSubmitted && (
                <div className="mt-9 flex justify-between gap-3">

                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={
                      step === 0 || isSubmitting
                    }
                    className="btn-ghost disabled:opacity-30"
                  >
                    <ArrowLeft size={16} />
                    {t("buttons.back")}
                  </button>

                  {step < 3 ? (

                    <button
                      type="button"
                      onClick={handleNext}
                      className="btn-primary"
                    >
                      {t("buttons.continue")}
                      <ArrowRight size={16} />
                    </button>

                  ) : (

                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="btn-primary disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2
                            size={16}
                            className="animate-spin"
                          />
                          {t("buttons.submitting")}
                        </>
                      ) : (
                        <>
                          {t("buttons.submit")}
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>

                  )}

                </div>
              )}

            </div>
          </Reveal>

        </div>
      </div>
    </section>
  );
}
export default ApplyContent