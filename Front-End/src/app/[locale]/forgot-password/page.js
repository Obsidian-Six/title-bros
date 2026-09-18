"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import AuthInput from "@/components/auth/AuthInput";
import authService from "@/services/authService";

export default function ForgotPasswordPage() {
  const { locale } = useParams();

  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setSubmitting(true);

    try {
      await authService.forgotPassword(email);
      setSuccessMessage("A password reset link has been dispatched to your email address.");
    } catch (err) {
      setErrorMessage(err.message || "Failed to send reset link. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-24 bg-[var(--paper)]">
      <div className="w-full max-w-[460px] overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--white)] shadow-xl">
        {/* Header */}
        <div className="border-b border-[var(--line)] bg-[var(--paper)] px-6 pt-8 pb-5 text-center">
          <Link href={`/${locale}`} className="mx-auto mb-3 inline-flex items-center gap-2">
            <Image
              width={40}
              height={40}
              src="/logo.jpg"
              alt="Title Bros Loans"
              className="h-9 w-9 rounded-full bg-white object-contain"
            />
            <span className="text-base font-black tracking-tight text-[var(--ink)]">
              TITLE BROS <span className="text-[var(--green)]">LOANS</span>
            </span>
          </Link>

          <h1 className="text-2xl font-black text-[var(--ink)]">Reset Password</h1>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Enter your registered email to receive a password reset link
          </p>
        </div>

        {/* Forgot Password Form */}
        <div className="p-6 sm:p-7">
          {errorMessage && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/30">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-50 p-3 text-xs text-emerald-700 dark:bg-emerald-950/30">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthInput
              label="Registered Email"
              type="email"
              name="email"
              icon={Mail}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[var(--green)] py-3.5 text-sm font-bold text-white shadow-md hover:bg-[var(--green-dark)] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Sending Link...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href={`/${locale}/login`}
              className="text-xs font-bold text-[var(--muted)] hover:text-[var(--ink)] transition"
            >
              &larr; Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
