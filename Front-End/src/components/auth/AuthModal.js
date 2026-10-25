"use client";

/**
 * ==============================================================================
 * Title Bros Customer Authentication Popup Modal (AuthModal)
 * ==============================================================================
 * A modern, interactive modal providing seamless customer login, registration,
 * and password recovery without leaving the current page.
 *
 * Key Capabilities:
 * - Fluid tab switching: "Sign In" vs "Create Account"
 * - In-place "Forgot Password" workflow with email dispatch feedback
 * - Visual cues using Title Bros brand colors (--green: #087a45, --paper, --ink)
 * - Full keyboard navigation (Escape to close) and backdrop click dismissal
 * - Responsive, mobile-first design with smooth micro-interactions
 */

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AuthInput from "./AuthInput";
import authService from "@/services/authService";

export default function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalTab,
    setAuthModalTab,
    loginCustomer,
    registerCustomer,
  } = useAuth();

  // Form states
  const [signInData, setSignInData] = useState({ email: "", password: "" });
  const [signUpData, setSignUpData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [forgotEmail, setForgotEmail] = useState("");

  // Feedback states
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Close modal on ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isAuthModalOpen) {
        closeAuthModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isAuthModalOpen, closeAuthModal]);

  // Reset errors when switching tabs
  useEffect(() => {
    setErrorMessage("");
    setSuccessMessage("");
  }, [authModalTab]);

  if (!isAuthModalOpen) return null;

  /**
   * Handle Customer Sign In Submission
   */
  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSubmitting(true);

    try {
      await loginCustomer({
        email: signInData.email,
        password: signInData.password,
      });
      // Modal is automatically closed by context on success
    } catch (err) {
      setErrorMessage(err.message || "Invalid credentials. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle Customer Registration Submission
   */
  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (signUpData.password !== signUpData.confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify.");
      return;
    }

    if (!signUpData.agreeTerms) {
      setErrorMessage("Please accept the Terms of Service and Privacy Policy to proceed.");
      return;
    }

    setSubmitting(true);

    try {
      await registerCustomer({
        name: signUpData.name,
        email: signUpData.email,
        phone: signUpData.phone,
        password: signUpData.password,
      });
      // Modal is automatically closed by context on success
    } catch (err) {
      setErrorMessage(err.message || "Failed to create account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle Forgot Password Link Request
   */
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setSubmitting(true);

    try {
      await authService.forgotPassword(forgotEmail);
      setSuccessMessage(
        "A password reset link has been dispatched to your email address. Please check your inbox (and spam folder)."
      );
    } catch (err) {
      setErrorMessage(err.message || "Could not send reset link. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-4 py-6"
    >
      {/* Semi-transparent blur backdrop */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-sm transition-opacity"
        onClick={closeAuthModal}
      />

      {/* Main Modal Card */}
      <div className="relative z-10 w-full max-w-[460px] overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--white)] shadow-2xl transition-all duration-300">
        {/* Header Ribbon with Title Bros Accent */}
        <div className="relative bg-[var(--paper)] px-6 pt-7 pb-5 text-center border-b border-[var(--line)]">
          {/* Close button */}
          <button
            type="button"
            onClick={closeAuthModal}
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-[var(--white)] text-[var(--muted)] border border-[var(--line)] transition hover:text-[var(--ink)] hover:scale-105"
            aria-label="Close authentication modal"
          >
            <X size={18} />
          </button>

          {/* Logo & Title */}
          <div className="mx-auto mb-3 flex items-center justify-center gap-2.5">
            <Image
              width={40}
              height={40}
              src="/logo.jpg"
              alt="Title Bros Loans"
              className="h-9 w-9 rounded-full bg-white object-contain shadow-sm"
            />
            <span className="text-base font-black tracking-tight text-[var(--ink)]">
              TITLE BROS <span className="text-[var(--green)]">LOANS</span>
            </span>
          </div>

          <h2 className="text-xl font-bold tracking-tight text-[var(--ink)]">
            {authModalTab === "login" && "Welcome Back"}
            {authModalTab === "register" && "Create Your Account"}
            {authModalTab === "forgot" && "Reset Your Password"}
          </h2>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {authModalTab === "login" && "Access your loan applications, payments, and documents"}
            {authModalTab === "register" && "Apply for loans in minutes and keep driving your car"}
            {authModalTab === "forgot" && "Enter your registered email to receive a recovery link"}
          </p>

          {/* Tab Selector (Hidden during Forgot Password flow) */}
          {authModalTab !== "forgot" && (
            <div className="mt-5 grid grid-cols-2 rounded-2xl bg-[var(--white)] p-1 border border-[var(--line)]">
              <button
                type="button"
                onClick={() => setAuthModalTab("login")}
                className={`rounded-xl py-2 text-xs font-bold transition-all ${
                  authModalTab === "login"
                    ? "bg-[var(--green)] text-white shadow-md shadow-[var(--green)]/20"
                    : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthModalTab("register")}
                className={`rounded-xl py-2 text-xs font-bold transition-all ${
                  authModalTab === "register"
                    ? "bg-[var(--green)] text-white shadow-md shadow-[var(--green)]/20"
                    : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>

        {/* Modal Body / Forms */}
        <div className="p-6 sm:p-7">
          {/* Inline Error Banner */}
          {errorMessage && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-50 p-3 text-xs font-medium text-red-700 dark:bg-red-950/40 dark:text-red-300">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Inline Success Banner */}
          {successMessage && (
            <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-[var(--green)]/20 bg-emerald-50 p-3 text-xs font-medium text-[var(--green-dark)] dark:bg-emerald-950/40 dark:text-emerald-300">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1. SIGN IN FORM */}
          {authModalTab === "login" && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <AuthInput
                label="Email Address"
                type="email"
                name="email"
                icon={Mail}
                placeholder="you@example.com"
                value={signInData.email}
                onChange={(e) =>
                  setSignInData({ ...signInData, email: e.target.value })
                }
                required
                autoComplete="email"
              />

              <AuthInput
                label="Password"
                type="password"
                name="password"
                icon={Lock}
                placeholder="Enter your password"
                value={signInData.password}
                onChange={(e) =>
                  setSignInData({ ...signInData, password: e.target.value })
                }
                required
                autoComplete="current-password"
              />

              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 text-[var(--muted)] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-[var(--line)] text-[var(--green)] focus:ring-[var(--green)]"
                  />
                  <span>Remember me</span>
                </label>

                <button
                  type="button"
                  onClick={() => setAuthModalTab("forgot")}
                  className="font-bold text-[var(--green)] transition hover:text-[var(--green-dark)] hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[var(--green)] py-3.5 text-sm font-bold text-white shadow-lg shadow-[var(--green)]/25 transition-all hover:bg-[var(--green-dark)] hover:shadow-xl active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Account</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>

              <div className="relative mt-5 flex items-center py-2">
                <div className="flex-grow border-t border-[var(--line)]"></div>
                <span className="mx-4 flex-shrink-0 text-[11px] font-bold uppercase tracking-widest text-[var(--muted)]">
                  Or continue with
                </span>
                <div className="flex-grow border-t border-[var(--line)]"></div>
              </div>

              <button
                type="button"
                onClick={() => {
                  alert("Google Authentication requires OAuth Client ID configuration.");
                }}
                className="w-full flex items-center justify-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--white)] py-3.5 text-sm font-bold text-[var(--ink)] shadow-sm transition-all hover:bg-gray-50 active:scale-[0.99]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Sign in with Google</span>
              </button>
            </form>
          )}

          {/* 2. SIGN UP FORM */}
          {authModalTab === "register" && (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <AuthInput
                label="Full Name"
                type="text"
                name="name"
                icon={UserIcon}
                placeholder="e.g. John Doe"
                value={signUpData.name}
                onChange={(e) =>
                  setSignUpData({ ...signUpData, name: e.target.value })
                }
                required
                autoComplete="name"
              />

              <AuthInput
                label="Email Address"
                type="email"
                name="email"
                icon={Mail}
                placeholder="you@example.com"
                value={signUpData.email}
                onChange={(e) =>
                  setSignUpData({ ...signUpData, email: e.target.value })
                }
                required
                autoComplete="email"
              />

              <AuthInput
                label="Phone Number (Optional)"
                type="tel"
                name="phone"
                icon={Phone}
                placeholder="(702) 555-0123"
                value={signUpData.phone}
                onChange={(e) =>
                  setSignUpData({ ...signUpData, phone: e.target.value })
                }
                autoComplete="tel"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <AuthInput
                  label="Password"
                  type="password"
                  name="password"
                  icon={Lock}
                  placeholder="At least 8 chars"
                  value={signUpData.password}
                  onChange={(e) =>
                    setSignUpData({ ...signUpData, password: e.target.value })
                  }
                  required
                  autoComplete="new-password"
                />

                <AuthInput
                  label="Confirm Password"
                  type="password"
                  name="confirmPassword"
                  icon={Lock}
                  placeholder="Repeat password"
                  value={signUpData.confirmPassword}
                  onChange={(e) =>
                    setSignUpData({
                      ...signUpData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                  autoComplete="new-password"
                />
              </div>

              <label className="flex items-start gap-2 pt-1 text-xs text-[var(--muted)] cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={signUpData.agreeTerms}
                  onChange={(e) =>
                    setSignUpData({ ...signUpData, agreeTerms: e.target.checked })
                  }
                  className="mt-0.5 h-4 w-4 rounded border-[var(--line)] text-[var(--green)] focus:ring-[var(--green)]"
                />
                <span>
                  I agree to Title Bros'{" "}
                  <a href="/en/terms" target="_blank" className="font-bold text-[var(--green)] underline">
                    Terms
                  </a>{" "}
                  and{" "}
                  <a href="/en/privacy-policy" target="_blank" className="font-bold text-[var(--green)] underline">
                    Privacy Policy
                  </a>
                  .
                </span>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[var(--green)] py-3.5 text-sm font-bold text-white shadow-lg shadow-[var(--green)]/25 transition-all hover:bg-[var(--green-dark)] hover:shadow-xl active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Customer Account</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>

              <div className="relative mt-5 flex items-center py-2">
                <div className="flex-grow border-t border-[var(--line)]"></div>
                <span className="mx-4 flex-shrink-0 text-[11px] font-bold uppercase tracking-widest text-[var(--muted)]">
                  Or sign up with
                </span>
                <div className="flex-grow border-t border-[var(--line)]"></div>
              </div>

              <button
                type="button"
                onClick={() => {
                  alert("Google Authentication requires OAuth Client ID configuration.");
                }}
                className="w-full flex items-center justify-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--white)] py-3.5 text-sm font-bold text-[var(--ink)] shadow-sm transition-all hover:bg-gray-50 active:scale-[0.99]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            </form>
          )}

          {/* 3. FORGOT PASSWORD FORM */}
          {authModalTab === "forgot" && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <AuthInput
                label="Registered Email"
                type="email"
                name="forgotEmail"
                icon={Mail}
                placeholder="Enter your registered email address"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                autoComplete="email"
              />

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[var(--green)] py-3.5 text-sm font-bold text-white shadow-lg shadow-[var(--green)]/25 transition-all hover:bg-[var(--green-dark)] hover:shadow-xl active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <>
                    <span>Send Password Reset Link</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setAuthModalTab("login")}
                  className="text-xs font-bold text-[var(--muted)] transition hover:text-[var(--ink)]"
                >
                  &larr; Back to Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
