"use client";

import { useRouter, useParams } from "next/navigation";
import {
  ArrowRight,
  CarFront,
  CheckCircle2,
  CircleDollarSign,
  HelpCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import Reveal from "@/components/Reveal";
import { useAuth } from "@/context/AuthContext";

export default function PreApprovalContent() {
  const router = useRouter();
  const { locale } = useParams();

  const { user, isAuthenticated, openAuthModal } = useAuth();

  const goToApplication = (loanType) => {
    router.push(`/${locale}/apply?loanType=${loanType}`);
  };

  const goToEnquiry = () => {
    router.push(`/${locale}/enquiry`);
  };

  /*
   * LOGIN GATE
   */
  if (!isAuthenticated) {
    return (
      <section className="relative min-h-screen overflow-hidden bg-[#f5f7f3] pb-24 pt-32 md:pt-40">
        {/* Background decoration */}
        <div className="pointer-events-none absolute left-[-120px] top-[15%] h-[280px] w-[280px] rounded-full bg-[#087a45]/10 blur-[100px]" />
        <div className="pointer-events-none absolute right-[-120px] top-[30%] h-[320px] w-[320px] rounded-full bg-[#087a45]/10 blur-[120px]" />

        <div className="container-x relative mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-xl">
            <Reveal>
              <div className="overflow-hidden rounded-[34px] border border-black/[0.06] bg-white shadow-[0_25px_80px_rgba(0,0,0,0.08)]">
                {/* Top accent */}
                <div className="h-1.5 w-full bg-[#087a45]" />

                <div className="p-7 text-center sm:p-10 md:p-12">
                  {/* Logo mark */}
                  <div className="mx-auto mb-7 grid h-20 w-20 place-items-center rounded-[24px] bg-[#101512] shadow-lg">
                    <CarFront
                      size={34}
                      strokeWidth={1.7}
                      className="text-[#61c894]"
                    />
                  </div>

                  <div className="text-[10px] font-black uppercase tracking-[0.28em] text-[#087a45]">
                    TITLE BROS FINANCING
                  </div>

                  <h1 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[#101512] sm:text-4xl">
                    Let&apos;s get you
                    <br />
                    <span className="text-[#087a45]">
                      pre-approved.
                    </span>
                  </h1>

                  <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-black/55">
                    Sign in to your Title Bros account to
                    explore your financing options and
                    start your application.
                  </p>

                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => openAuthModal("login")}
                      className="flex items-center justify-center gap-2 rounded-2xl bg-[#087a45] px-5 py-4 text-xs font-black text-white shadow-lg shadow-[#087a45]/20 transition hover:-translate-y-0.5 hover:bg-[#096c3f]"
                    >
                      Sign In
                      <ArrowRight size={16} />
                    </button>

                    <button
                      type="button"
                      onClick={() => openAuthModal("register")}
                      className="flex items-center justify-center gap-2 rounded-2xl border border-black/10 bg-[#f7f8f5] px-5 py-4 text-xs font-black text-[#101512] transition hover:bg-black/[0.04]"
                    >
                      Create Account
                    </button>
                  </div>

                  <div className="mt-7 flex items-center justify-center gap-2 text-[11px] font-medium text-black/40">
                    <ShieldCheck size={15} />
                    Secure & confidential application
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    );
  }

  /*
   * LOAN SELECTION
   */
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#f5f7f3] pb-24 pt-32 md:pt-40">
      {/* Background glow */}
      <div className="pointer-events-none absolute left-[-180px] top-[5%] h-[420px] w-[420px] rounded-full bg-[#087a45]/8 blur-[130px]" />

      <div className="pointer-events-none absolute right-[-180px] top-[25%] h-[450px] w-[450px] rounded-full bg-[#087a45]/10 blur-[140px]" />

      <div className="container-x relative mx-auto max-w-7xl px-4">
        {/* HEADER */}
        <Reveal>
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#087a45]/15 bg-[#087a45]/[0.06] px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#087a45]">
              <Sparkles size={13} />
              Title Bros Financing
            </div>

            <h1 className="mt-6 text-4xl font-black tracking-[-0.055em] text-[#101512] sm:text-5xl md:text-6xl">
              Choose the financing
              <br />
              <span className="text-[#087a45]">
                that fits your needs.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-black/55 md:text-base">
              Welcome back,{" "}
              <span className="font-bold text-[#101512]">
                {user?.name?.split(" ")?.[0] || "there"}
              </span>
              . Whether you&apos;re using your vehicle
              or looking for flexible personal financing,
              Title Bros makes getting started simple.
            </p>
          </div>
        </Reveal>

        {/* FINANCING OPTIONS */}
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {/* ================= TITLE LOAN ================= */}
          <Reveal delay={0.05}>
            <div className="group relative h-full overflow-hidden rounded-[34px] border border-black/[0.06] bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(0,0,0,0.1)]">
              {/* Background glow */}
              <div className="pointer-events-none absolute right-[-70px] top-[-70px] h-[250px] w-[250px] rounded-full bg-[#087a45]/10 blur-[80px]" />

              {/* Decorative line */}
              <div className="absolute left-0 top-0 h-full w-1 bg-[#087a45]" />

              <div className="relative p-7 sm:p-9 md:p-10">
                {/* Card top */}
                <div className="flex items-start justify-between gap-4">
                  <div className="grid h-16 w-16 place-items-center rounded-[20px] bg-[#087a45]/10 text-[#087a45] transition-transform duration-500 group-hover:scale-105">
                    <CarFront
                      size={30}
                      strokeWidth={1.8}
                    />
                  </div>

                  <span className="rounded-full bg-[#087a45]/10 px-3.5 py-2 text-[9px] font-black uppercase tracking-[0.16em] text-[#087a45]">
                    Vehicle Based
                  </span>
                </div>

                <div className="mt-8">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#087a45]">
                    Option 01
                  </p>

                  <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#101512] md:text-4xl">
                    Title Loan
                  </h2>

                  <p className="mt-4 max-w-xl text-sm leading-7 text-black/55">
                    Put the value of your vehicle to work.
                    Apply using your eligible vehicle title
                    and keep driving while your application
                    moves forward.
                  </p>
                </div>

                {/* Features */}
                <div className="mt-8 space-y-3">
                  {[
                    "Vehicle & VIN verification",
                    "Year, make & model lookup",
                    "Vehicle details & photos",
                    "Employment & income information",
                    "Requested loan amount & purpose",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-xl bg-[#f7f8f5] px-4 py-3"
                    >
                      <CheckCircle2
                        size={17}
                        strokeWidth={2}
                        className="shrink-0 text-[#087a45]"
                      />

                      <span className="text-sm font-medium text-[#101512]/70">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  type="button"
                  onClick={() =>
                    goToApplication("title-loan")
                  }
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#087a45] px-5 py-4 text-xs font-black text-white shadow-lg shadow-[#087a45]/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#096c3f]"
                >
                  Start Title Loan Application
                  <ArrowRight size={17} />
                </button>

                <p className="mt-4 text-center text-[10px] font-medium text-black/35">
                  Quick, secure & straightforward
                </p>
              </div>
            </div>
          </Reveal>

          {/* ================= PERSONAL LOAN ================= */}
          <Reveal delay={0.1}>
            <div className="group relative h-full overflow-hidden rounded-[34px] bg-[#101512] text-white shadow-[0_25px_70px_rgba(0,0,0,0.18)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_35px_90px_rgba(0,0,0,0.25)]">
              {/* Glow */}
              <div className="pointer-events-none absolute right-[-80px] top-[-80px] h-[300px] w-[300px] rounded-full bg-[#087a45]/30 blur-[100px]" />

              <div className="pointer-events-none absolute bottom-[-100px] left-[-80px] h-[250px] w-[250px] rounded-full bg-[#61c894]/10 blur-[100px]" />

              {/* Border */}
              <div className="absolute inset-0 rounded-[34px] border border-white/[0.08]" />

              <div className="relative p-7 sm:p-9 md:p-10">
                {/* Card top */}
                <div className="flex items-start justify-between gap-4">
                  <div className="grid h-16 w-16 place-items-center rounded-[20px] bg-[#087a45]/20 text-[#61c894] transition-transform duration-500 group-hover:scale-105">
                    <CircleDollarSign
                      size={30}
                      strokeWidth={1.8}
                    />
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-2 text-[9px] font-black uppercase tracking-[0.16em] text-white/65">
                    Flexible
                  </span>
                </div>

                <div className="mt-8">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#61c894]">
                    Option 02
                  </p>

                  <h2 className="mt-2 text-3xl font-black tracking-[-0.04em] md:text-4xl">
                    Personal Loan
                  </h2>

                  <p className="mt-4 max-w-xl text-sm leading-7 text-white/55">
                    Need funds for something beyond your
                    vehicle? Tell us about your income,
                    housing situation and financing needs.
                  </p>
                </div>

                {/* Features */}
                <div className="mt-8 space-y-3">
                  {[
                    "Personal information",
                    "Employment & income details",
                    "Housing & monthly payment",
                    "Requested loan amount",
                    "Reason for funds",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.035] px-4 py-3"
                    >
                      <CheckCircle2
                        size={17}
                        strokeWidth={2}
                        className="shrink-0 text-[#61c894]"
                      />

                      <span className="text-sm font-medium text-white/65">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  type="button"
                  onClick={() =>
                    goToApplication("personal-loan")
                  }
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#087a45] px-5 py-4 text-xs font-black text-white shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#096c3f]"
                >
                  Start Personal Loan Application
                  <ArrowRight size={17} />
                </button>

                <p className="mt-4 text-center text-[10px] font-medium text-white/30">
                  Simple application process
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* ENQUIRY */}
        <Reveal delay={0.15}>
          <div className="mx-auto mt-8 max-w-5xl overflow-hidden rounded-[30px] border border-black/[0.06] bg-white shadow-[0_15px_50px_rgba(0,0,0,0.05)]">
            <div className="flex flex-col gap-6 p-6 sm:p-7 md:flex-row md:items-center md:justify-between md:p-8">
              <div className="flex items-start gap-4">
                <div className="grid h-13 w-13 shrink-0 place-items-center rounded-2xl bg-[#087a45]/10 text-[#087a45]">
                  <HelpCircle
                    size={23}
                    strokeWidth={1.8}
                  />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#087a45]">
                    Need help?
                  </p>

                  <h3 className="mt-1 text-lg font-black tracking-[-0.02em] text-[#101512]">
                    Not sure which option is right for you?
                  </h3>

                  <p className="mt-1 max-w-xl text-sm leading-6 text-black/50">
                    Our Title Bros team can help you
                    understand the available financing
                    options before you apply.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={goToEnquiry}
                className="flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-[#087a45] px-6 py-4 text-xs font-black text-[#087a45] transition-all duration-300 hover:bg-[#087a45] hover:text-white"
              >
                Talk to Title Bros
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </Reveal>

        {/* SECURITY */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] font-medium uppercase tracking-[0.12em] text-black/35">
          <div className="flex items-center gap-2">
            <ShieldCheck size={15} />
            Secure application
          </div>

          <span className="hidden h-1 w-1 rounded-full bg-black/20 sm:block" />

          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} />
            Your information stays protected
          </div>
        </div>
      </div>
    </section>
  );
}