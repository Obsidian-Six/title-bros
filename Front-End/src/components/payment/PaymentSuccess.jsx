
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock3,
  Copy,
  Home,
  ShieldCheck,
  ReceiptText,
} from "lucide-react";
import { useState } from "react";

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [copied, setCopied] = useState(false);

  const copyReference = async () => {
    if (!sessionId) return;

    try {
      await navigator.clipboard.writeText(sessionId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Unable to copy payment reference:", error);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f7f6] px-4 py-10 font-sans text-[#202923] sm:px-6 sm:py-16">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center">
        {/* Brand */}
        <Link
          href="/"
          aria-label="Title Bros home"
          className="mb-9 inline-flex items-center gap-3"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#087a46] text-white shadow-sm">
            <span className="text-lg font-extrabold tracking-tight">TB</span>
          </span>

          <span className="text-lg font-extrabold tracking-[0.12em] text-[#173d2b] sm:text-xl">
            TITLE BROS
            <span className="ml-2 font-medium tracking-normal text-[#087a46]">
              LOANS
            </span>
          </span>
        </Link>

        {/* Success card */}
        <section className="w-full overflow-hidden rounded-2xl border border-[#e3e9e5] bg-white shadow-[0_18px_60px_rgba(20,50,32,0.07)]">
          {/* Green banner */}
          <div className="relative overflow-hidden bg-[#087a46] px-6 py-9 text-center text-white sm:px-10 sm:py-12">
            <div className="pointer-events-none absolute -right-10 -top-20 h-56 w-56 rounded-full border border-white/10" />
            <div className="pointer-events-none absolute -bottom-28 -left-10 h-56 w-56 rounded-full border border-white/10" />

            <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-white/25 bg-white/15 shadow-inner">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#087a46]">
                <Check size={32} strokeWidth={3} />
              </div>
            </div>

            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-white/75">
              Title Bros Payment
            </p>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Thank You!
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/85 sm:text-base">
              Your checkout has completed. We’re finalizing your payment
              confirmation.
            </p>
          </div>

          <div className="px-5 py-7 sm:px-10 sm:py-9">
            {/* Status */}
            <div className="mb-8 flex items-start gap-3 rounded-xl border border-[#dcebe1] bg-[#f2f8f4] p-4">
              <CheckCircle2
                className="mt-0.5 shrink-0 text-[#087a46]"
                size={22}
              />

              <div>
                <h2 className="text-sm font-bold text-[#174b30]">
                  Checkout completed
                </h2>
                <p className="mt-1 text-sm leading-6 text-[#5c6b61]">
                  Your payment is being processed for confirmation. Your loan
                  payment status will be finalized by our payment system.
                </p>
              </div>
            </div>

            {/* Reference */}
            <div className="mb-7">
              <div className="mb-3 flex items-center gap-2">
                <ReceiptText size={19} className="text-[#087a46]" />
                <h2 className="text-base font-bold text-[#202923]">
                  Payment reference
                </h2>
              </div>

              <div className="rounded-xl border border-[#e5eae6] bg-[#fafcfb] p-4 sm:p-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#77847b]">
                  Stripe Checkout Session
                </p>

                {sessionId ? (
                  <div className="flex items-start gap-3">
                    <p className="min-w-0 flex-1 break-all font-mono text-xs leading-6 text-[#36463b] sm:text-sm">
                      {sessionId}
                    </p>

                    <button
                      type="button"
                      onClick={copyReference}
                      aria-label="Copy payment reference"
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#dce5de] bg-white px-3 py-2 text-xs font-semibold text-[#315641] transition hover:border-[#087a46] hover:text-[#087a46]"
                    >
                      {copied ? (
                        <Check size={15} />
                      ) : (
                        <Copy size={15} />
                      )}
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-[#8b5b24]">
                    No checkout session reference was found in this URL.
                  </p>
                )}
              </div>
            </div>

            {/* Information cards */}
            <div className="mb-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-[#e5eae6] p-4">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#eaf5ee] text-[#087a46]">
                  <ShieldCheck size={21} />
                </div>
                <h3 className="text-sm font-bold">Secure payment</h3>
                <p className="mt-1.5 text-sm leading-5 text-[#758078]">
                  Your payment was handled through Stripe Checkout.
                </p>
              </div>

              <div className="rounded-xl border border-[#e5eae6] p-4">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#f1f3f2] text-[#53645a]">
                  <Clock3 size={21} />
                </div>
                <h3 className="text-sm font-bold">Payment confirmation</h3>
                <p className="mt-1.5 text-sm leading-5 text-[#758078]">
                  Confirmation and receipt availability depend on backend
                  payment processing.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#087a46] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#06643a] focus:outline-none focus:ring-4 focus:ring-[#087a46]/20"
              >
                <Home size={17} />
                Back to Home
              </Link>

              <Link
                href="/"
                className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-[#dce5de] bg-white px-5 py-3 text-sm font-bold text-[#315641] transition hover:border-[#087a46] hover:bg-[#f5faf6] focus:outline-none focus:ring-4 focus:ring-[#087a46]/10"
              >
                Continue
                <ArrowRight size={17} />
              </Link>
            </div>

            <p className="mt-6 text-center text-xs leading-5 text-[#849087]">
              Need help with your payment? Please contact the Title Bros
              support team and provide your payment reference.
            </p>
          </div>
        </section>

        <p className="mt-6 text-center text-xs text-[#89948c]">
          © {new Date().getFullYear()} Title Bros Loans. All rights reserved.
        </p>
      </div>
    </main>
  );
}
