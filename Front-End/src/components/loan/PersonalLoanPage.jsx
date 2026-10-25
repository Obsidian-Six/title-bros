"use client";
import Link from "next/link";
import {
  ArrowRight,
  Banknote,
  Check,
  ChevronDown,
  CircleDollarSign,
  FileCheck2,
  HandCoins,
  IdCard,
  Landmark,
  LockKeyhole,
  ShieldCheck,
  UserRound,
  WalletCards,
} from "lucide-react";

import Button from "../common/Button";
import { useParams } from "next/navigation";


/* -------------------------------------------------------------------------- */
/* DATA                                                                       */
/* -------------------------------------------------------------------------- */
const requirements = [
  {
    icon: IdCard,
    title: "Valid Government ID",
    description:
      "Have a valid government-issued identification document available when required.",
  },
  {
    icon: Landmark,
    title: "Banking Information",
    description:
      "You may need recent banking information or other proof of income depending on eligibility requirements.",
  },
  {
    icon: UserRound,
    title: "Personal Information",
    description:
      "Provide your basic contact, residential, employment, and other application information.",
  },
  {
    icon: FileCheck2,
    title: "Proof of Income",
    description:
      "Additional income documentation may be requested as part of the application review.",
  },
];

const steps = [
  {
    number: "01",
    icon: UserRound,
    title: "Tell Us About Yourself",
    description:
      "Provide your basic personal and contact information so we can get your application started.",
  },
  {
    number: "02",
    icon: CircleDollarSign,
    title: "Tell Us What You Need",
    description:
      "Choose the amount you're looking for and provide the reason for your personal loan.",
  },
  {
    number: "03",
    icon: FileCheck2,
    title: "Provide Your Information",
    description:
      "Complete the requested employment, income, banking, and identification information.",
  },
  {
    number: "04",
    icon: ShieldCheck,
    title: "Application Review",
    description:
      "Your application and information are reviewed to determine available loan options.",
  },
  {
    number: "05",
    icon: WalletCards,
    title: "Review & Receive Funds",
    description:
      "Review your approved terms, complete the required documents, and receive funds according to your agreement.",
  },
];

const benefits = [
  {
    icon: CircleDollarSign,
    title: "Flexible Loan Options",
    description:
      "Explore available options based on your application and approved terms.",
  },
  {
    icon: FileCheck2,
    title: "Simple Application",
    description:
      "Get started online with a straightforward application process.",
  },
  {
    icon: ShieldCheck,
    title: "Clear Terms",
    description:
      "Review your available loan amount, repayment schedule, and applicable terms.",
  },
  {
    icon: LockKeyhole,
    title: "Secure Process",
    description:
      "Your application information is handled through a secure process.",
  },
  {
    icon: HandCoins,
    title: "Convenient Repayment",
    description:
      "Manage your payments according to the terms of your loan agreement.",
  },
  {
    icon: UserRound,
    title: "Dedicated Support",
    description:
      "Our team is available to help you throughout the application process.",
  },
];

const loanUses = [
  "Unexpected expenses",
  "Emergency needs",
  "Major purchases",
  "Household expenses",
  "Personal projects",
  "Other eligible expenses",
];

const faqs = [
  {
    question: "What is a personal loan?",
    answer:
      "A personal loan is a loan that can provide funds for eligible personal expenses without requiring a vehicle as collateral. Your available loan amount, rate, and repayment terms depend on your application and approved terms.",
  },
  {
    question: "How much can I get with a personal loan?",
    answer:
      "The amount you may qualify for depends on factors such as your application, income, eligibility, and the loan terms available to you.",
  },
  {
    question: "Can I apply for a personal loan online?",
    answer:
      "You can start your personal loan application online by providing the requested personal and financial information. Additional steps or documentation may be required before your application is completed.",
  },
  {
    question: "What information do I need?",
    answer:
      "You may be asked to provide government-issued identification, personal information, employment and income information, banking information, and other documents required for your application.",
  },
  {
    question: "What can I use a personal loan for?",
    answer:
      "Personal loan funds may be used for eligible personal expenses. The permitted use of funds can depend on the applicable loan terms and requirements.",
  },
  {
    question: "How do I make my payments?",
    answer:
      "Payment options and schedules depend on your approved loan terms and applicable requirements. Your account information will provide the details you need to manage your payments.",
  },
];

/* -------------------------------------------------------------------------- */
/* REUSABLE UI                                                                */
/* -------------------------------------------------------------------------- */

function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}) {
  const centered = align === "center";

  return (
    <div
      className={`max-w-3xl ${
        centered ? "mx-auto text-center" : ""
      }`}
    >
      {eyebrow && (
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 sm:text-sm">
          {eyebrow}
        </p>
      )}

      <h2 className="text-3xl font-semibold tracking-[-0.03em] text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">
        {title}
      </h2>

      {description && (
        <p className="mt-5 text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg sm:leading-8">
          {description}
        </p>
      )}
    </div>
  );
}

// function PrimaryButton({
//   children,
//   href = `/${locale}/apply?loanType=personal-loan`,
// }) {
//   return (
//     <Link
//       href={href}
//       className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition duration-300 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-600/25 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950 sm:px-7"
//     >
//       {children}

//       <ArrowRight
//         size={18}
//         className="transition-transform duration-300 group-hover:translate-x-1"
//       />
//     </Link>
//   );
// }

function SecondaryButton({
  children,
  href = "#how-it-works",
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-12 items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-800 transition duration-300 hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:border-white/25 dark:hover:bg-white/10 sm:px-7"
    >
      {children}
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* PAGE                                                                       */
/* -------------------------------------------------------------------------- */

export default function PersonalLoanPage() {
 const { locale } = useParams();

  return (
    <main className="overflow-hidden bg-white text-slate-950 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
      {/* ================================================================== */}
      {/* HERO                                                               */}
      {/* ================================================================== */}

      <section className="relative isolate overflow-hidden bg-slate-50 dark:bg-slate-950">
        {/* Background glow */}
        <div
          aria-hidden="true"
          className="absolute -right-40 -top-40 size-[30rem] rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-500/15"
        />

        <div
          aria-hidden="true"
          className="absolute -bottom-40 -left-40 size-[28rem] rounded-full bg-slate-300/30 blur-3xl dark:bg-slate-800/40"
        />

        <div className="mx-auto grid min-h-[680px] max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:py-24">
          {/* Content */}
          <div className="relative z-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
              <Banknote size={14} />
              Title Bros • Personal Loans
            </div>

            <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-slate-950 dark:text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Personal Financing
              <span className="block text-emerald-600 dark:text-emerald-400">
                Made Simpler.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg sm:leading-8">
              Whether you're handling an unexpected expense or planning for
              an important need, Title Bros gives you a simple way to explore
              personal loan options.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href={`/${locale}/apply?loanType=personal-loan`}>Get Started</Button>

              <SecondaryButton>
                How It Works
              </SecondaryButton>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-600 dark:text-slate-400">
              {[
                "Simple application",
                "No vehicle required",
                "Clear loan terms",
              ].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2"
                >
                  <span className="flex size-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
                    <Check size={13} strokeWidth={3} />
                  </span>

                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Visual */}
          <div className="relative mx-auto w-full max-w-xl">
            <div className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-950 p-6 shadow-2xl shadow-slate-300/30 dark:border-white/10 dark:shadow-black/40 sm:p-8">
              {/* Decorative circles */}
              <div
                aria-hidden="true"
                className="absolute -right-20 -top-20 size-64 rounded-full border border-emerald-400/20"
              />

              <div
                aria-hidden="true"
                className="absolute -right-10 -top-10 size-44 rounded-full border border-emerald-400/10"
              />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
                    <WalletCards size={27} />
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300">
                    Personal Loan
                  </span>
                </div>

                <div className="mt-12">
                  <p className="text-sm font-medium text-slate-400">
                    Financing designed around
                  </p>

                  <p className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                    Your Needs.
                  </p>
                </div>

                <div className="mt-10 grid grid-cols-2 gap-3">
                  {[
                    ["01", "Apply"],
                    ["02", "Review"],
                    ["03", "Accept"],
                    ["04", "Receive"],
                  ].map(([number, label]) => (
                    <div
                      key={number}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <span className="text-xs font-bold text-emerald-400">
                        {number}
                      </span>

                      <p className="mt-2 text-sm font-semibold text-white">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <ShieldCheck
                    size={20}
                    className="shrink-0 text-emerald-400"
                  />

                  <p className="text-xs leading-5 text-slate-400">
                    Loan eligibility and terms are subject to approval and
                    applicable requirements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* WHAT IS A PERSONAL LOAN                                            */}
      {/* ================================================================== */}

      <section className="bg-white px-5 py-20 dark:bg-slate-950 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionHeading
            eyebrow="Personal Loans"
            title="What Is a Personal Loan?"
            description="A personal loan provides access to funds for eligible personal expenses without requiring a vehicle as collateral. Your available loan amount, rate, and repayment terms depend on your application and approved terms."
          />

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                icon: CircleDollarSign,
                title: "Flexible Use",
                text: "Use funds for eligible personal expenses.",
              },
              {
                icon: FileCheck2,
                title: "Simple Process",
                text: "Start your application with basic information.",
              },
              {
                icon: ShieldCheck,
                title: "Clear Terms",
                text: "Review your available terms before agreeing.",
              },
              {
                icon: LockKeyhole,
                title: "Secure",
                text: "Your application information is handled securely.",
              },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-6 transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-emerald-400/30"
                >
                  <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
                    <Icon size={21} />
                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-slate-950 dark:text-white">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {item.text}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* REQUIREMENTS                                                       */}
      {/* ================================================================== */}

      <section className="bg-slate-50 px-5 py-20 dark:bg-slate-900/60 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Before You Apply"
            title="What Do I Need for a Personal Loan?"
            description="Having the right information ready can help make the application process easier. Requirements may vary depending on your location, eligibility, and loan terms."
          />

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {requirements.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="group rounded-3xl border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-slate-200/50 dark:border-white/10 dark:bg-slate-950 dark:hover:border-emerald-400/30 dark:hover:shadow-black/20"
                >
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-950 text-emerald-400 transition duration-300 group-hover:bg-emerald-600 group-hover:text-white dark:bg-white/10">
                    <Icon size={22} />
                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-slate-950 dark:text-white">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* HOW TO APPLY                                                       */}
      {/* ================================================================== */}

      <section
        id="how-it-works"
        className="bg-white px-5 py-20 dark:bg-slate-950 sm:px-8 lg:px-10 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="How It Works"
            title="How to Apply for a Personal Loan"
            description="Get started online and move through a straightforward application process."
            align="center"
          />

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <article
                  key={step.number}
                  className="group relative rounded-3xl border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-emerald-400/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition duration-300 group-hover:bg-emerald-600 group-hover:text-white dark:bg-emerald-400/10 dark:text-emerald-400">
                      <Icon size={21} />
                    </div>

                    <span className="text-sm font-bold text-slate-300 dark:text-slate-700">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="mt-6 text-lg font-semibold text-slate-950 dark:text-white">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {step.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* WHAT CAN IT BE USED FOR                                            */}
      {/* ================================================================== */}

      <section className="bg-slate-950 px-5 py-20 text-white sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1fr_0.9fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400 sm:text-sm">
              Use Your Funds For
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Financing for the moments that matter.
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
              A personal loan can help with eligible expenses when you need
              additional financial flexibility.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {loanUses.map((use, index) => (
              <div
                key={use}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition duration-300 hover:border-emerald-400/30 hover:bg-white/[0.07]"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-sm font-bold text-emerald-400">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="text-sm font-medium text-slate-200">
                  {use}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* BENEFITS                                                           */}
      {/* ================================================================== */}

      <section className="bg-white px-5 py-20 dark:bg-slate-950 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Why Title Bros"
            title="Built Around a Better Borrowing Experience"
            description="Our goal is to make the application process straightforward while giving you clear information about your available loan options."
            align="center"
          />

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="rounded-3xl border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-emerald-400/30"
                >
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
                    <Icon size={22} />
                  </div>

                  <h3 className="mt-5 text-lg font-semibold text-slate-950 dark:text-white">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* EXPECT / APPROVAL                                                  */}
      {/* ================================================================== */}

      <section className="bg-slate-50 px-5 py-20 dark:bg-slate-900/60 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-5xl">
          <SectionHeading
            eyebrow="After You Apply"
            title="Here's What to Expect"
            description="The exact process can vary based on your application and applicable requirements."
            align="center"
          />

          <div className="mt-14 overflow-hidden rounded-[2rem] border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950">
            {[
              "Provide the required information and documents.",
              "Your identification and financial information may be reviewed.",
              "Your application will be evaluated for available loan options.",
              "If approved, review the loan amount, rate, fees, and repayment terms.",
              "Complete the required agreement and receive funds according to your approved terms.",
            ].map((item, index) => (
              <div
                key={item}
                className={`flex gap-5 p-6 sm:p-7 ${
                  index !== 4
                    ? "border-b border-slate-200 dark:border-white/10"
                    : ""
                }`}
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400">
                  {index + 1}
                </span>

                <p className="pt-1.5 text-sm leading-6 text-slate-700 dark:text-slate-300 sm:text-base">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* REPAYMENT                                                          */}
      {/* ================================================================== */}

      <section className="bg-white px-5 py-20 dark:bg-slate-950 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Repayment"
              title="Manage Your Personal Loan With Confidence"
              description="Your approved loan agreement will outline your payment amount, due dates, repayment frequency, and applicable fees."
            />

            <div className="mt-8 space-y-4">
              {[
                "Know your payment schedule",
                "Review your due dates",
                "Use available payment methods",
                "Keep track of your remaining balance",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3"
                >
                  <span className="flex size-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
                    <Check size={15} strokeWidth={2.5} />
                  </span>

                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-slate-950 p-7 text-white shadow-xl dark:border dark:border-white/10 sm:p-9">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400">
              <HandCoins size={27} />
            </div>

            <h3 className="mt-7 text-2xl font-semibold">
              Stay on top of your payments.
            </h3>

            <p className="mt-4 text-sm leading-7 text-slate-400">
              Your customer portal can provide access to payment information,
              account details, and available repayment options according to
              your loan agreement.
            </p>

            <Link
              href="/portal"
              className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-emerald-400 transition hover:text-emerald-300"
            >
              Visit Customer Portal
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* FAQ                                                                */}
      {/* ================================================================== */}

      <section className="bg-slate-50 px-5 py-20 dark:bg-slate-900/60 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-4xl">
          <SectionHeading
            eyebrow="FAQ"
            title="Frequently Asked Questions"
            description="Answers to some common questions about personal loans."
            align="center"
          />

          <div className="mt-12 overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-950">
            {faqs.map((faq, index) => (
              <details
                key={faq.question}
                className={`group ${
                  index !== faqs.length - 1
                    ? "border-b border-slate-200 dark:border-white/10"
                    : ""
                }`}
              >
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 px-5 py-5 text-left transition hover:bg-slate-50 dark:hover:bg-white/[0.03] sm:px-7">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white sm:text-base">
                    {faq.question}
                  </span>

                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition duration-300 group-open:bg-emerald-100 group-open:text-emerald-600 dark:bg-white/10 dark:text-slate-300 dark:group-open:bg-emerald-400/10 dark:group-open:text-emerald-400">
                    <ChevronDown
                      size={17}
                      className="transition-transform duration-300 group-open:rotate-180"
                    />
                  </span>
                </summary>

                <div className="px-5 pb-6 sm:px-7">
                  <p className="max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
                    {faq.answer}
                  </p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* CTA                                                                */}
      {/* ================================================================== */}

      <section className="bg-white px-5 pb-20 dark:bg-slate-950 sm:px-8 lg:px-10 lg:pb-28">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-emerald-600 px-6 py-14 text-center sm:px-10 sm:py-20">
          <div
            aria-hidden="true"
            className="absolute -right-32 -top-32 size-80 rounded-full bg-white/10 blur-3xl"
          />

          <div
            aria-hidden="true"
            className="absolute -bottom-32 -left-20 size-72 rounded-full bg-slate-950/10 blur-3xl"
          />

          <div className="relative mx-auto max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-100 sm:text-sm">
              Get Started
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Ready to explore your personal loan options?
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-emerald-50 sm:text-lg">
              Start your application online and take the first step toward
              exploring your available options.
            </p>

            <div className="mt-8">
              {/* <PrimaryButton> */}
              <Button href={`/${locale}/apply?loanType=personal-loan`}>
                Apply for a Personal Loan
              </Button>
              {/* </PrimaryButton> */}
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* TRUST STRIP                                                        */}
      {/* ================================================================== */}

      <section className="border-t border-slate-200 bg-white px-5 py-8 dark:border-white/10 dark:bg-slate-950 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-slate-950 text-emerald-400 dark:bg-white/10">
              <LockKeyhole size={19} />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Secure Application
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-500">
                Your information is handled securely.
              </p>
            </div>
          </div>

          <p className="max-w-xl text-xs leading-5 text-slate-500">
            Loan eligibility, rates, amounts, fees, terms, and funding are
            subject to approval and applicable requirements.
          </p>
        </div>
      </section>
    </main>
  );
}