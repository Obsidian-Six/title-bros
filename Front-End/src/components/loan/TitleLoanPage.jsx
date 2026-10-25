"use client";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CarFront,
  Check,
  ChevronDown,
  FileCheck2,
  HandCoins,
  IdCard,
  Landmark,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { useParams } from "next/navigation";
import Button from "../common/Button";

const steps = [
  {
    number: "01",
    title: "Start Your Application",
    description:
      "Tell us about yourself, how much you need, and provide the basic information to get started.",
    icon: FileCheck2,
  },
  {
    number: "02",
    title: "Tell Us About Your Vehicle",
    description:
      "Provide your vehicle year, make, model, mileage, VIN, and other required vehicle details.",
    icon: CarFront,
  },
  {
    number: "03",
    title: "Vehicle Evaluation",
    description:
      "We review your vehicle information and determine the loan options available based on your application.",
    icon: Landmark,
  },
  {
    number: "04",
    title: "Review Your Offer",
    description:
      "If approved, review your available loan amount, rate, repayment schedule, and applicable terms.",
    icon: HandCoins,
  },
  {
    number: "05",
    title: "Complete & Get Funded",
    description:
      "Complete the required documents, agree to your terms, and receive your funds according to your agreement.",
    icon: WalletCards,
  },
];

const requirements = [
  {
    title: "Government-Issued ID",
    description: "A valid form of identification may be required.",
    icon: IdCard,
  },
  {
    title: "Vehicle Title",
    description: "Provide the required vehicle title documentation.",
    icon: FileCheck2,
  },
  {
    title: "Qualifying Vehicle",
    description: "Your vehicle must meet applicable eligibility requirements.",
    icon: CarFront,
  },
  {
    title: "Vehicle Information",
    description: "Year, make, model, mileage, VIN, and other vehicle details.",
    icon: Landmark,
  },
];

const benefits = [
  "Simple online application",
  "Flexible repayment options",
  "Clear loan terms",
  "Secure application process",
  "Keep driving your vehicle",
  "Dedicated customer support",
];

const faqs = [
  {
    question: "What is a title loan?",
    answer:
      "A title loan is a secured loan that uses an eligible vehicle title as collateral. Your available loan terms depend on your application, vehicle, and applicable requirements.",
  },
  {
    question: "Can I keep driving my vehicle?",
    answer:
      "Eligible borrowers may generally continue using their vehicle while making payments according to their loan agreement and applicable requirements.",
  },
  {
    question: "How much can I borrow?",
    answer:
      "The amount you may qualify for depends on factors such as your application, vehicle information, vehicle value, and approved loan terms.",
  },
  {
    question: "What information do I need to apply?",
    answer:
      "You may need personal information, a valid government-issued ID, vehicle information, vehicle title documentation, and other information required during the application process.",
  },
  {
    question: "How do I start?",
    answer:
      "Start your online application by providing your basic personal and vehicle information. Our team can then review your application and available options.",
  },
];

function SectionHeading({ eyebrow, title, description, align = "left" }) {
  const centered = align === "center";

  return (
    <div
      className={["max-w-3xl", centered ? "mx-auto text-center" : ""].join(" ")}
    >
      {eyebrow && (
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">
          {eyebrow}
        </p>
      )}

      <h2 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
        {title}
      </h2>

      {description && (
        <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}

// function PrimaryButton({ children, href = "/apply" }) {
//   return (
//     <Link
//       href={href}
//       className="group inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-600/25 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 sm:px-7"
//     >
//       {children}
//       <ArrowRight
//         size={18}
//         className="transition-transform duration-300 group-hover:translate-x-1"
//       />
//     </Link>
//   );
// }

function SecondaryButton({ children, href = "#how-it-works" }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-800 transition-all duration-300 hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2 sm:px-7"
    >
      {children}
    </Link>
  );
}

export default function TitleLoanPage() {
  const { locale } = useParams();

  return (
    <main className="overflow-hidden bg-white text-slate-950">
      {/* =========================================================
          HERO
      ========================================================== */}
      <section className="relative isolate overflow-hidden bg-slate-950">
        {/* Background decoration */}
        <div
          aria-hidden="true"
          className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="absolute -bottom-40 left-0 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl"
        />

        <div className="mx-auto grid min-h-[680px] max-w-7xl items-center gap-12 px-5 py-20 sm:px-8 lg:grid-cols-2 lg:px-10 lg:py-24">
          {/* Hero content */}
          <div className="relative z-10 max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-300 backdrop-blur">
              <Sparkles size={14} />
              Title Bros • Title Loans
            </div>

            <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Put Your Vehicle
              <span className="block text-emerald-400">To Work For You.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
              Get started with a Title Bros title loan using your eligible
              vehicle title as collateral. Apply online and explore your
              available loan options.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {/* <PrimaryButton href="/apply?loanType=title-loan"> */}
              <Button href={`/${locale}/apply?loanType=personal-loan`}>
                Get Started
              </Button>
              {/* </PrimaryButton> */}

              <SecondaryButton href="#how-it-works">
                See How It Works
              </SecondaryButton>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-300">
              <span className="inline-flex items-center gap-2">
                <Check size={16} className="text-emerald-400" />
                Simple application
              </span>

              <span className="inline-flex items-center gap-2">
                <Check size={16} className="text-emerald-400" />
                Flexible options
              </span>

              <span className="inline-flex items-center gap-2">
                <Check size={16} className="text-emerald-400" />
                Secure process
              </span>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative">
            <div className="relative mx-auto aspect-[4/3] max-w-xl overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl">
              {/* Replace this image with your actual Title Bros vehicle image */}
              <Image
                src="/images/title-loan-hero.webp"
                alt="Vehicle for Title Bros title loan"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 50vw"
                className="object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

              <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/10 bg-slate-950/70 p-4 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                    <CarFront size={22} />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white">
                      Vehicle-backed financing
                    </p>
                    <p className="mt-0.5 text-xs text-slate-300">
                      Subject to eligibility and approved terms
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating card */}
            <div className="absolute -bottom-5 -left-3 hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:block lg:-left-8">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck size={20} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Secure process
                  </p>
                  <p className="text-xs text-slate-500">
                    Built for your convenience
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          WHAT IS A TITLE LOAN
      ========================================================== */}
      <section className="bg-white px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <SectionHeading
              eyebrow="Title Loans"
              title="What Is a Title Loan?"
              description="A title loan is a secured loan that uses an eligible vehicle title as collateral. Title Bros makes it easy to start the process online and explore the loan options available to you."
            />

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                "Keep driving your vehicle",
                "Simple online application",
                "Flexible repayment options",
                "Clear loan terms",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <Check size={16} strokeWidth={2.5} />
                  </span>

                  <span className="text-sm font-semibold text-slate-800">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] bg-slate-100 p-8 sm:p-10">
            <div className="absolute -right-20 -top-20 size-60 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative">
              <div className="mb-6 flex size-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
                <CarFront size={27} />
              </div>

              <h3 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                Your vehicle can help unlock the funds you need.
              </h3>

              <p className="mt-4 leading-7 text-slate-600">
                Start with your vehicle information, complete the application,
                and review your available terms. Eligibility, loan amount,
                rates, and repayment terms are subject to approval and
                applicable requirements.
              </p>

              <Link
                href="/apply?loanType=title-loan"
                className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-emerald-700 hover:text-emerald-800"
              >
                Start your application
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          HOW IT WORKS
      ========================================================== */}
      <section
        id="how-it-works"
        className="bg-slate-50 px-5 py-20 sm:px-8 lg:px-10 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Simple Process"
            title="How Title Loans Work"
            description="From your first application to receiving your funds, the process is designed to keep every step clear."
            align="center"
          />

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <article
                  key={step.number}
                  className="group relative rounded-3xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-slate-200/60"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                      <Icon size={21} />
                    </div>

                    <span className="text-sm font-bold text-slate-300">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="mt-6 text-lg font-semibold text-slate-950">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {step.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          REQUIREMENTS
      ========================================================== */}
      <section className="bg-white px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <SectionHeading
              eyebrow="Before You Apply"
              title="What You'll Need for a Title Loan"
              description="Have the basic information and documents ready to make your application process smoother. Requirements may vary based on location and eligibility."
            />

            <div className="grid gap-4 sm:grid-cols-2">
              {requirements.map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    key={item.title}
                    className="rounded-3xl border border-slate-200 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg"
                  >
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-950 text-emerald-400">
                      <Icon size={22} />
                    </div>

                    <h3 className="mt-5 text-lg font-semibold text-slate-950">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {item.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          VEHICLE SECTION
      ========================================================== */}
      <section className="bg-slate-950 px-5 py-20 text-white sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-400">
              Your Vehicle Matters
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              Tell us about the vehicle you're using for your application.
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
              During the application process, you'll provide details about your
              vehicle so our team can evaluate the information needed for your
              loan options.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                "Year",
                "Make & Model",
                "Mileage",
                "VIN",
                "Vehicle Value",
                "Title Information",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <Check size={17} className="shrink-0 text-emerald-400" />
                  <span className="text-sm font-medium text-slate-200">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 sm:p-10">
            <div className="absolute -right-24 -top-24 size-72 rounded-full bg-emerald-500/10 blur-3xl" />

            <div className="relative">
              <CarFront className="text-emerald-400" size={42} />

              <p className="mt-8 text-5xl font-semibold tracking-tight text-white">
                Vehicle
              </p>

              <p className="mt-2 text-slate-400">
                Information helps determine your available loan options.
              </p>

              <div className="mt-8 h-px bg-white/10" />

              <p className="mt-6 text-sm leading-6 text-slate-400">
                Loan eligibility, amount, rates and terms are subject to
                approval and applicable requirements.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          BENEFITS
      ========================================================== */}
      <section className="bg-white px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Why Title Bros"
            title="A Simple Way to Get Started"
            description="We focus on making the application and repayment experience clear, convenient, and easy to understand."
          />

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex items-center gap-4 rounded-2xl border border-slate-200 p-5"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Check size={18} strokeWidth={2.5} />
                </span>

                <span className="font-semibold text-slate-800">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          AFTER APPROVAL
      ========================================================== */}
      <section className="bg-slate-50 px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="After Approval"
            title="What Happens After You're Approved?"
            description="Once you're approved, you'll have the opportunity to review your loan terms before completing the required documents."
            align="center"
          />

          <div className="mx-auto mt-14 grid max-w-5xl gap-4 md:grid-cols-5">
            {[
              "Review Your Offer",
              "Accept Your Terms",
              "Complete Documents",
              "Receive Your Funds",
              "Manage Payments",
            ].map((item, index) => (
              <div
                key={item}
                className="relative rounded-3xl border border-slate-200 bg-white p-6 text-center"
              >
                <div className="mx-auto flex size-10 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-emerald-400">
                  {index + 1}
                </div>

                <p className="mt-4 text-sm font-semibold leading-5 text-slate-800">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          FAQ
      ========================================================== */}
      <section className="bg-white px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-4xl">
          <SectionHeading
            eyebrow="FAQ"
            title="Frequently Asked Questions"
            description="A few common questions about Title Bros title loans."
            align="center"
          />

          <div className="mt-12 divide-y divide-slate-200 rounded-3xl border border-slate-200 bg-white">
            {faqs.map((faq) => (
              <details key={faq.question} className="group p-6 sm:p-7">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-left">
                  <span className="text-base font-semibold text-slate-900 sm:text-lg">
                    {faq.question}
                  </span>

                  <ChevronDown
                    size={20}
                    className="shrink-0 text-slate-500 transition-transform duration-300 group-open:rotate-180"
                  />
                </summary>

                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================== */}
      <section className="px-5 pb-20 sm:px-8 lg:px-10 lg:pb-28">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-emerald-600 px-6 py-14 text-center sm:px-10 sm:py-20">
          <div
            aria-hidden="true"
            className="absolute -right-24 -top-24 size-80 rounded-full bg-white/10 blur-3xl"
          />

          <div
            aria-hidden="true"
            className="absolute -bottom-32 -left-20 size-72 rounded-full bg-slate-950/10 blur-3xl"
          />

          <div className="relative mx-auto max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-100">
              Get Started Today
            </p>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Ready to explore your title loan options?
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-emerald-50 sm:text-lg">
              Start your online application and provide the information needed
              to explore your available options.
            </p>

            <div className="mt-8">
              <Button href={`/${locale}/apply?loanType=title-loan`}>
                Apply for a Title Loan
              </Button>
              {/* <Link
                href="/apply?loanType=title-loan"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-slate-950 shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-100"
              >
                Apply for a Title Loan
                <ArrowRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link> */}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          TRUST FOOTER STRIP
      ========================================================== */}
      <section className="border-t border-slate-200 bg-white px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-slate-950 text-emerald-400">
              <LockKeyhole size={19} />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Secure Application
              </p>
              <p className="text-xs text-slate-500">
                Your information is handled securely.
              </p>
            </div>
          </div>

          <p className="max-w-xl text-xs leading-5 text-slate-500">
            Loan eligibility, terms, rates, amounts, and funding are subject to
            approval and applicable requirements.
          </p>
        </div>
      </section>
    </main>
  );
}
