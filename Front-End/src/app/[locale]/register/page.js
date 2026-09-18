"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { Mail, Lock, User, Phone, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import AuthInput from "@/components/auth/AuthInput";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { locale } = useParams();
  const { registerCustomer } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    if (!formData.agreeTerms) {
      setErrorMessage("Please accept the Terms and Privacy Policy.");
      return;
    }

    setSubmitting(true);

    try {
      await registerCustomer({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
      router.push(`/${locale}`);
    } catch (err) {
      setErrorMessage(err.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-24 bg-[var(--paper)]">
      <div className="w-full max-w-[480px] overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--white)] shadow-xl">
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

          <h1 className="text-2xl font-black text-[var(--ink)]">Create Account</h1>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Apply for fast auto title loans and keep driving your car
          </p>

          {/* Clean Route Switcher Tabs */}
          <div className="mt-5 grid grid-cols-2 rounded-2xl bg-[var(--white)] p-1 border border-[var(--line)]">
            <Link
              href={`/${locale}/login`}
              className="rounded-xl py-2 text-xs font-bold text-[var(--muted)] hover:text-[var(--ink)] transition-colors text-center"
            >
              Sign In
            </Link>
            <span className="rounded-xl bg-[var(--green)] py-2 text-xs font-bold text-white shadow-sm text-center">
              Sign Up
            </span>
          </div>
        </div>

        {/* Register Form */}
        <div className="p-6 sm:p-7">
          {errorMessage && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/30">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <AuthInput
              label="Full Name"
              type="text"
              name="name"
              icon={User}
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              autoComplete="name"
            />

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
              label="Phone Number (Optional)"
              type="tel"
              name="phone"
              icon={Phone}
              placeholder="(702) 555-0123"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              autoComplete="tel"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <AuthInput
                label="Password"
                type="password"
                name="password"
                icon={Lock}
                placeholder="Min. 8 chars"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                autoComplete="new-password"
              />

              <AuthInput
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                icon={Lock}
                placeholder="Repeat password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
                autoComplete="new-password"
              />
            </div>

            <label className="flex items-start gap-2 pt-1 text-xs text-[var(--muted)] cursor-pointer">
              <input
                type="checkbox"
                checked={formData.agreeTerms}
                onChange={(e) =>
                  setFormData({ ...formData, agreeTerms: e.target.checked })
                }
                className="mt-0.5 h-4 w-4 rounded border-[var(--line)] text-[var(--green)] focus:ring-[var(--green)]"
              />
              <span>
                I accept Title Bros'{" "}
                <Link href={`/${locale}/terms`} className="font-bold text-[var(--green)] underline">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href={`/${locale}/privacy-policy`} className="font-bold text-[var(--green)] underline">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[var(--green)] py-3.5 text-sm font-bold text-white shadow-md hover:bg-[var(--green-dark)] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-[var(--muted)]">
            Already have an account?{" "}
            <Link href={`/${locale}/login`} className="font-bold text-[var(--green)] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
