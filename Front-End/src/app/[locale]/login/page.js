"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import AuthInput from "@/components/auth/AuthInput";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { locale } = useParams();
  const { loginCustomer } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSubmitting(true);

    try {
      await loginCustomer(formData);
      router.push(`/${locale}`);
    } catch (err) {
      setErrorMessage(err.message || "Invalid credentials. Please try again.");
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

          <h1 className="text-2xl font-black text-[var(--ink)]">Welcome Back</h1>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Sign in to access your loan applications and dashboard
          </p>

          {/* Clean Route Switcher Tabs */}
          <div className="mt-5 grid grid-cols-2 rounded-2xl bg-[var(--white)] p-1 border border-[var(--line)]">
            <span className="rounded-xl bg-[var(--green)] py-2 text-xs font-bold text-white shadow-sm text-center">
              Sign In
            </span>
            <Link
              href={`/${locale}/register`}
              className="rounded-xl py-2 text-xs font-bold text-[var(--muted)] hover:text-[var(--ink)] transition-colors text-center"
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Login Form */}
        <div className="p-6 sm:p-7">
          {errorMessage && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/30">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthInput
              label="Email Address"
              type="email"
              name="email"
              icon={Mail}
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              autoComplete="email"
            />

            <AuthInput
              label="Password"
              type="password"
              name="password"
              icon={Lock}
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-[var(--muted)] cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-[var(--line)] text-[var(--green)] focus:ring-[var(--green)]"
                />
                <span>Remember me</span>
              </label>

              <Link
                href={`/${locale}/forgot-password`}
                className="font-bold text-[var(--green)] hover:text-[var(--green-dark)] transition"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[var(--green)] py-3.5 text-sm font-bold text-white shadow-md hover:bg-[var(--green-dark)] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[var(--muted)]">
            Don't have an account?{" "}
            <Link href={`/${locale}/register`} className="font-bold text-[var(--green)] hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
