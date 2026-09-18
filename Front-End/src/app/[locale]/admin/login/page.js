"use client";

/**
 * ==============================================================================
 * Title Bros Dedicated Staff & Administrator Login Portal
 * ==============================================================================
 * Route: /[locale]/admin/login
 *
 * Distinct administrative security gateway built separately from the public customer
 * popup modal. Implements:
 * - Direct authentication via POST /api/v1/auth/admin/login
 * - Strict role enforcement (Rejects CUSTOMER accounts with explicit 403 status)
 * - Security disclaimers, audit notices, and 15-minute inactivity timeout alerts
 * - Modern responsive layout styled with Title Bros design tokens
 */

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
  Clock,
  KeyRound,
} from "lucide-react";
import AuthInput from "@/components/auth/AuthInput";
import authService from "@/services/authService";
import { useAuth } from "@/context/AuthContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { locale } = useParams();
  const { user, isAuthenticated, isAdmin, loginAdmin, logout } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [isPending, startTransition] = useTransition();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successInfo, setSuccessInfo] = useState(null);

  /**
   * Handle Admin Login Submission
   */
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSubmitting(true);

    try {
      const response = await loginAdmin({
        email: formData.email,
        password: formData.password,
      });

      if (response.success && response.data) {
        setSuccessInfo({
          name: response.data.user.name,
          role: response.data.user.role,
        });

        // Trigger direct redirect to admin dashboard
        setTimeout(() => {
          window.location.href = `/${locale}/admin/dashboard`;
        }, 800);
      }
    } catch (err) {
      setErrorMessage(
        err.message ||
          "Administrative access denied. Verify your credentials or permissions."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // If already authenticated as an Admin/SuperAdmin
  if (isAuthenticated && isAdmin) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-28 bg-[var(--paper)]">
        <div className="w-full max-w-md rounded-3xl border border-[var(--line)] bg-[var(--white)] p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-[var(--green)]/10 text-[var(--green)]">
            <ShieldCheck size={36} />
          </div>
          <h1 className="text-xl font-black text-[var(--ink)]">
            Administrator Authenticated
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Welcome back, <strong className="text-[var(--ink)]">{user?.name}</strong> (
            <span className="font-semibold text-[var(--green)]">{user?.role}</span>).
          </p>

          <div className="mt-6 space-y-3">
            <Link
              href={`/${locale}/admin/dashboard`}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--green)] py-3 text-sm font-bold text-white shadow-md transition hover:bg-[var(--green-dark)]"
            >
              <span>Go to Admin Dashboard</span>
              <ArrowRight size={16} />
            </Link>

            <a
              href={`/${locale}`}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--line)] py-2.5 text-xs font-bold text-[var(--ink)] transition hover:bg-[var(--paper)]"
            >
              <span>Return to Main Site</span>
            </a>

            <button
              type="button"
              onClick={() => logout()}
              className="w-full rounded-2xl border border-[var(--line)] py-2.5 text-xs font-bold text-[var(--muted)] transition hover:text-red-600 hover:border-red-300"
            >
              End Administrative Session (Logout)
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-28 bg-[var(--paper)]">
      <div className="w-full max-w-[480px]">
        {/* Security Alert Header Card */}
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-50/70 p-3.5 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
          <ShieldAlert size={18} className="shrink-0 text-amber-600" />
          <span>
            <strong>Title Bros Internal Portal:</strong> Authorized personnel only. All access attempts and activities are monitored and logged.
          </span>
        </div>

        {/* Main Admin Card */}
        <div className="overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--white)] shadow-2xl">
          {/* Card Top Banner */}
          <div className="relative border-b border-[var(--line)] bg-[var(--paper)] p-7 text-center">
            <div className="mx-auto mb-3 flex items-center justify-center gap-2.5">
              <Image
                width={48}
                height={48}
                src="/logo.jpg"
                alt="Title Bros Loans"
                className="h-10 w-10 rounded-full bg-white object-contain shadow"
              />
              <span className="text-base font-black tracking-tight text-[var(--ink)]">
                TITLE BROS <span className="text-[var(--green)]">ADMIN</span>
              </span>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-[var(--ink)]">
              Operations Gateway
            </h1>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Enter your official staff credentials to access administrative systems
            </p>
          </div>

          {/* Form Content */}
          <div className="p-7 sm:p-8">
            {/* Error Alert */}
            {errorMessage && (
              <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-50 p-3.5 text-xs font-medium text-red-700 dark:bg-red-950/40 dark:text-red-300">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Alert */}
            {successInfo && (
              <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-[var(--green)]/20 bg-emerald-50 p-3.5 text-xs font-medium text-[var(--green-dark)] dark:bg-emerald-950/40 dark:text-emerald-300">
                <ShieldCheck size={16} className="mt-0.5 shrink-0" />
                <span>
                  Authenticated as <strong>{successInfo.name}</strong> ({successInfo.role}). Initializing workspace...
                </span>
              </div>
            )}

            {/* Quick Demo Credentials Pill Selector */}
            <div className="mb-6 rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-3.5">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] mb-2">
                Quick Test Credentials (Click to Autofill)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      email: "superadmin@titlebros.com",
                      password: "SuperAdmin@2026!",
                    });
                    setErrorMessage("");
                  }}
                  className="flex flex-col items-start rounded-xl border border-amber-500/30 bg-amber-500/10 p-2 text-left transition hover:border-amber-500 hover:bg-amber-500/15"
                >
                  <span className="text-[11px] font-black text-amber-700 dark:text-amber-400">
                    👑 Super Admin
                  </span>
                  <span className="text-[10px] text-[var(--muted)] truncate w-full">
                    superadmin@titlebros.com
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFormData({
                      email: "admin@titlebros.com",
                      password: "AdminPass@2026!",
                    });
                    setErrorMessage("");
                  }}
                  className="flex flex-col items-start rounded-xl border border-[var(--green)]/30 bg-[var(--green)]/10 p-2 text-left transition hover:border-[var(--green)] hover:bg-[var(--green)]/15"
                >
                  <span className="text-[11px] font-black text-[var(--green)]">
                    🛡️ Staff Admin
                  </span>
                  <span className="text-[10px] text-[var(--muted)] truncate w-full">
                    admin@titlebros.com
                  </span>
                </button>
              </div>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <AuthInput
                label="Official Staff Email"
                type="email"
                name="email"
                icon={Mail}
                placeholder="staff@titlebros.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                autoComplete="email"
              />

              <AuthInput
                label="Administrative Password"
                type="password"
                name="password"
                icon={Lock}
                placeholder="Enter secure password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                autoComplete="current-password"
              />

              {/* Policy reminders */}
              <div className="rounded-xl border border-[var(--line)] bg-[var(--paper)] p-3 text-[11px] text-[var(--muted)] space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-[var(--ink)]">
                  <Clock size={13} />
                  <span>Security Compliance Notice:</span>
                </div>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Sessions automatically terminate after 15 minutes of inactivity.</li>
                  <li>Account locks for 30 minutes after 5 consecutive failed attempts.</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[var(--ink)] py-3.5 text-sm font-bold text-[var(--paper)] shadow-lg transition-all hover:bg-black hover:shadow-xl active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Verifying Authority...</span>
                  </>
                ) : (
                  <>
                    <KeyRound size={16} />
                    <span>Authenticate to Admin Portal</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
