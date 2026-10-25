
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, RefreshCw, XCircle } from "lucide-react";

export default function PaymentCancelledPage() {
  const params = useParams();
  const locale = params?.locale || "en";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7f6] px-4 py-12 text-[#202923]">
      <section className="w-full max-w-xl rounded-2xl border border-[#e3e9e5] bg-white p-7 text-center shadow-[0_18px_60px_rgba(20,50,32,0.07)] sm:p-10">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#fdf1ed]">
          <XCircle size={42} className="text-[#c45b43]" />
        </div>

        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#087a46]">
          Title Bros Loans
        </p>

        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Payment Cancelled
        </h1>

        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#68766d] sm:text-base">
          Your checkout was cancelled before completion. No successful payment
          is confirmed by this page. You can return to your loan portal and try
          again whenever you are ready.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/${locale}`}
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-[#087a46] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#06643a]"
          >
            <ArrowLeft size={17} />
            Back to Home
          </Link>

          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-[#dce5de] bg-white px-5 py-3 text-sm font-bold text-[#315641] transition hover:border-[#087a46] hover:bg-[#f5faf6]"
          >
            <RefreshCw size={17} />
            Return to Checkout
          </button>
        </div>

        <p className="mt-6 text-xs leading-5 text-[#89948c]">
          If you believe a payment was charged, please contact Title Bros
          support before trying again.
        </p>
      </section>
    </main>
  );
}
