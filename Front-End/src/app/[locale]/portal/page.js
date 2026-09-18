"use client";

/**
 * ==============================================================================
 * Title Bros Customer Portal
 * ==============================================================================
 * Dynamic borrower dashboard:
 * - Proper top-offset preventing navbar overlap
 * - Action Required Unread Badge (1) when documents are requested
 * - 4-Stage Application Progress Stepper (Submitted -> Under Review -> Requested Docs -> Decision)
 * - Dynamic Requested Documents checklist: Customer uploads ONLY the documents requested by CMS
 * - Instant upload with Multer and live status feedback
 * - Approved Loan Terms & office visit instructions
 * - Complete Submitted Application summary
 * - Contact & profile information editing
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  FileCheck,
  Phone,
  Mail,
  Car,
  DollarSign,
  User,
  ShieldAlert,
  ArrowRight,
  Loader2,
  Lock,
  ChevronRight,
  Calendar,
  Eye,
  Camera,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import loanService from "@/services/loanService";
import authService from "@/services/authService";

export default function CustomerPortalPage() {
  const { locale } = useParams();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);

  // Uploading state
  const [uploadingDocName, setUploadingDocName] = useState(null);
  const [uploadFeedback, setUploadFeedback] = useState({ success: "", error: "" });

  // Profile update state
  const [profileData, setProfileData] = useState({ name: "", phone: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");

  // Staged files waiting for manual user "Upload & Submit" click
  const [stagedFiles, setStagedFiles] = useState({});

  // Load customer's applications
  const loadCustomerData = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const res = await loanService.getMyApplications();
      if (res.success && Array.isArray(res.data)) {
        setApplications(res.data);
        if (res.data.length > 0) {
          setSelectedApp((prev) => {
            if (!prev) return res.data[0];
            const current = res.data.find((a) => a._id === prev._id);
            return current || res.data[0];
          });
        } else {
          setSelectedApp(null);
        }
      }
    } catch (err) {
      console.warn("Failed to load customer applications:", err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadCustomerData();
      if (user) {
        setProfileData({ name: user.name || "", phone: user.phone || "" });
      }
    }
  }, [isAuthenticated, user, loadCustomerData]);

  // Real-time auto-synchronization: live poll every 4 seconds without manual refresh
  useEffect(() => {
    if (!isAuthenticated) return;

    const pollInterval = setInterval(() => {
      if (document.visibilityState === "visible") {
        loadCustomerData(true);
      }
    }, 4000);

    return () => clearInterval(pollInterval);
  }, [isAuthenticated, loadCustomerData]);

  // Handle upload of a specific requested document
  const handleUploadSpecificDoc = async (docName) => {
    const file = stagedFiles[docName];
    if (!file || !selectedApp) return;

    setUploadingDocName(docName);
    setUploadFeedback({ success: "", error: "" });

    try {
      await loanService.uploadDocument(selectedApp._id, file, docName);
      setUploadFeedback({
        success: `"${docName}" uploaded successfully! Our review team has received your document.`,
        error: "",
      });

      // Clear the staged file for this doc
      setStagedFiles((prev) => {
        const next = { ...prev };
        delete next[docName];
        return next;
      });

      // Refresh application data
      await loadCustomerData(true);
    } catch (err) {
      setUploadFeedback({ success: "", error: err.message || "Upload failed." });
    } finally {
      setUploadingDocName(null);
    }
  };


  // Handle Profile Update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess("");
    try {
      const res = await authService.updateProfile(profileData);
      if (res.success) {
        setProfileSuccess("Contact details updated successfully.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProfileSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 pt-32 pb-24 bg-[var(--paper)]">
        <div className="w-full max-w-md rounded-3xl border border-[var(--line)] bg-[var(--white)] p-8 text-center shadow-xl">
          <Lock size={36} className="mx-auto text-[var(--green)] mb-3" />
          <h1 className="text-xl font-black text-[var(--ink)]">Customer Sign In Required</h1>
          <p className="mt-2 text-xs text-[var(--muted)]">
            Please log in to your Title Bros customer account to track your loan application and upload documents.
          </p>
          <Link
            href={`/${locale}/login`}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--green)] py-3 text-sm font-bold text-white hover:bg-[var(--green-dark)] transition"
          >
            <span>Sign In to Portal</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    );
  }

  // Calculate un-uploaded requested documents
  const unUploadedDocs = (selectedApp?.requestedDocuments || []).filter((docName) => {
    const uploaded = (selectedApp?.documents || []).find(
      (d) => d.name?.toLowerCase() === docName.toLowerCase() && d.status !== "Rejected"
    );
    return !uploaded;
  });

  const allRequestedDocsUploaded =
    selectedApp?.requestedDocuments?.length > 0 && unUploadedDocs.length === 0;

  const hasPendingDocs =
    selectedApp &&
    selectedApp.status === "Pending Documents" &&
    unUploadedDocs.length > 0;

  return (
    <div className="min-h-screen bg-[var(--paper)] pt-28 sm:pt-32 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Portal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-[var(--line)] bg-[var(--white)] p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Image
              width={44}
              height={44}
              src="/logo.jpg"
              alt="Title Bros Loans"
              className="h-10 w-10 rounded-full bg-white object-contain shadow-sm"
            />
            <div>
              <h1 className="text-lg font-black text-[var(--ink)]">
                Welcome, {user?.name || "Valued Customer"}
              </h1>
              <p className="text-xs text-[var(--muted)]">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadCustomerData(false)}
              disabled={loading}
              title="Refresh Application"
              className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--line)] bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)] transition"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </button>
            <Link
              href={`/${locale}/apply`}
              className="rounded-xl border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-xs font-bold text-[var(--ink)] hover:bg-[var(--line)] transition"
            >
              + New Application
            </Link>
            <button
              onClick={() => logout()}
              className="rounded-xl border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Action Required Unread Badge Banner - ONLY shown when un-uploaded requested documents remain */}
        {hasPendingDocs && (
          <div className="flex items-center gap-3 p-4 rounded-3xl bg-amber-500/15 border border-amber-500/30 text-amber-950 shadow-sm animate-in fade-in duration-200">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-500 text-white font-black text-sm shrink-0 shadow-sm">
              {unUploadedDocs.length}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-sm text-amber-950 flex items-center gap-1.5">
                <AlertTriangle size={16} className="text-amber-600" />
                <span>Action Required: Verification Documents Requested ({unUploadedDocs.length} remaining)</span>
              </h3>
              <p className="text-xs text-amber-900 mt-0.5">
                Our underwriting team has reviewed your application and requires specific documents to finalize your cash approval. Please upload them in the checklist below.
              </p>
            </div>
          </div>
        )}

        {/* Success Confirmation Banner - Displayed after user successfully uploads all requested documents */}
        {allRequestedDocsUploaded && selectedApp?.status === "Pending Documents" && (
          <div className="flex items-center gap-3 p-4 rounded-3xl bg-emerald-50 border border-emerald-300 text-emerald-950 shadow-sm animate-in fade-in duration-200">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-600 text-white font-black text-sm shrink-0 shadow-sm">
              <CheckCircle2 size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-sm text-emerald-950 flex items-center gap-1.5">
                <span>All Requested Documents Received</span>
              </h3>
              <p className="text-xs text-emerald-800 mt-0.5">
                Thank you! All requested verification files have been uploaded and received. Our underwriting team is actively reviewing your file.
              </p>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PAST & ACTIVE APPLICATIONS SELECTOR (MY APPLICATIONS)          */}
        {/* ============================================================== */}
        {applications.length > 0 && (
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--white)] p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-base font-black text-[var(--ink)]">
                  My Loan Applications ({applications.length})
                </h2>
                <p className="text-xs text-[var(--muted)]">
                  Select any past or active application to review full tracking history, terms, and submitted documents.
                </p>
              </div>
              <span className="text-[11px] font-bold text-[var(--muted)]">
                Viewing: #{selectedApp?._id.slice(-6).toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {applications.map((app) => {
                const isSelected = selectedApp?._id === app._id;
                return (
                  <button
                    key={app._id}
                    type="button"
                    onClick={() => setSelectedApp(app)}
                    className={`text-left p-4 rounded-2xl border transition flex flex-col justify-between ${
                      isSelected
                        ? "border-[var(--green)] bg-emerald-50/40 shadow-sm ring-2 ring-[var(--green)]/30"
                        : "border-[var(--line)] bg-[var(--white)] hover:border-[var(--green)]/50 hover:bg-[var(--paper)]/50"
                    }`}
                  >
                    <div className="w-full">
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className="font-mono text-[11px] font-bold text-[var(--muted)]">
                          #{app._id.slice(-6).toUpperCase()}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                            app.status === "Approved"
                              ? "bg-emerald-100 text-emerald-800"
                              : app.status === "Rejected"
                              ? "bg-red-100 text-red-700"
                              : app.status === "Pending Documents"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {app.status === "Approved" ? "✓ Approved" : app.status}
                        </span>
                      </div>

                      <p className="font-black text-sm text-[var(--ink)] truncate">
                        {app.vehicle?.year} {app.vehicle?.make} {app.vehicle?.model}
                      </p>
                      <p className="text-xs font-black text-[var(--green)] mt-1">
                        ${app.amountRequested ? app.amountRequested.toLocaleString() : "0"}
                      </p>
                    </div>

                    <div className="w-full mt-3 pt-2.5 border-t border-[var(--line)] flex items-center justify-between text-[11px]">
                      <span className="text-[var(--muted)]">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                      <span className={`font-bold ${isSelected ? "text-[var(--green)]" : "text-[var(--muted)]"}`}>
                        {isSelected ? "● Active View" : "View Details →"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* If no application found */}
        {!loading && applications.length === 0 && (
          <div className="rounded-3xl border border-[var(--line)] bg-[var(--white)] p-10 text-center shadow-sm">
            <Car size={40} className="mx-auto text-[var(--muted)] mb-3" />
            <h2 className="text-base font-bold text-[var(--ink)]">No Active Loan Applications</h2>
            <p className="text-xs text-[var(--muted)] mt-1 max-w-sm mx-auto">
              You haven&apos;t submitted an auto title loan application yet. Apply online in 3 minutes and keep driving your car!
            </p>
            <Link
              href={`/${locale}/apply`}
              className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[var(--green)] px-5 py-2.5 text-xs font-bold text-white hover:bg-[var(--green-dark)] shadow-sm"
            >
              <span>Apply For a Loan</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        )}

        {/* Main Application Tracker View */}
        {selectedApp && (
          <>
            {/* Status & What to Expect Advisory Card */}
            <div
              className={`rounded-3xl border p-6 shadow-sm ${
                selectedApp.status === "Approved"
                  ? "bg-emerald-50/70 border-emerald-500/30 text-emerald-950"
                  : selectedApp.status === "Rejected"
                  ? "bg-red-50/70 border-red-500/30 text-red-950"
                  : selectedApp.status === "Pending Documents"
                  ? "bg-amber-50/70 border-amber-500/30 text-amber-950"
                  : "bg-blue-50/70 border-blue-500/30 text-blue-950"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-black text-base">
                  {selectedApp.status === "Approved" && <CheckCircle2 size={22} className="text-emerald-600" />}
                  {selectedApp.status === "Rejected" && <AlertCircle size={22} className="text-red-600" />}
                  {selectedApp.status === "Pending Documents" && <AlertTriangle size={22} className="text-amber-600" />}
                  {(selectedApp.status === "New" || selectedApp.status === "Under Review") && (
                    <Clock size={22} className="text-blue-600" />
                  )}
                  <span>Current Status: {selectedApp.status}</span>
                </div>

                <span className="text-xs font-bold text-[var(--muted)]">
                  Application #{selectedApp._id.slice(-6).toUpperCase()}
                </span>
              </div>

              {/* What to Expect Advisory text */}
              <div className="mt-3 text-xs leading-relaxed font-medium">
                {selectedApp.status === "Approved" && (
                  <p>
                    <strong>Next Step:</strong> Your loan has been approved! Please review your terms below and visit our Title Bros Las Vegas branch with your vehicle and pink slip to collect your funds.
                  </p>
                )}
                {selectedApp.status === "Pending Documents" && (
                  allRequestedDocsUploaded ? (
                    <p>
                      <strong>Underwriting Review:</strong> Thank you! All requested documents have been received. Our loan team is currently verifying your paperwork.
                    </p>
                  ) : (
                    <p>
                      <strong>Action Required:</strong> Additional documents are needed. Please upload the specific items requested below so our underwriting team can issue your final cash approval.
                    </p>
                  )
                )}
                {(selectedApp.status === "New" || selectedApp.status === "Under Review") && (
                  <p>
                    <strong>What to Expect:</strong> Your application is actively being evaluated by a Title Bros loan specialist. Decisions typically take 30–60 minutes during business hours. Updates will appear here automatically.
                  </p>
                )}
                {selectedApp.status === "Rejected" && (
                  <p>
                    <strong>Outcome:</strong> Unfortunately, your application could not be approved due to:{" "}
                    <em>{selectedApp.rejectionReason || "Criteria requirements not met"}</em>. You are welcome to contact our office to explore alternative lending options.
                  </p>
                )}
              </div>
            </div>

            {/* Visual 4-Stage Timeline Stepper */}
            <div className="rounded-3xl border border-[var(--line)] bg-[var(--white)] p-6 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--muted)] mb-4">
                Application Progress Timeline
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                {/* Step 1: Submitted */}
                <div className="flex flex-col items-center">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-[var(--green)] text-white font-bold mb-2 shadow-sm">
                    <CheckCircle2 size={20} />
                  </div>
                  <span className="font-bold text-[var(--ink)]">1. Submitted</span>
                  <span className="text-[10px] text-[var(--muted)]">Received</span>
                </div>

                {/* Step 2: Under Review */}
                <div className="flex flex-col items-center">
                  <div
                    className={`grid h-10 w-10 place-items-center rounded-full font-bold mb-2 shadow-sm ${
                      selectedApp.status !== "New"
                        ? "bg-[var(--green)] text-white"
                        : "bg-[var(--paper)] text-[var(--muted)] border border-[var(--line)]"
                    }`}
                  >
                    <FileCheck size={20} />
                  </div>
                  <span className="font-bold text-[var(--ink)]">2. Under Review</span>
                  <span className="text-[10px] text-[var(--muted)]">Vehicle Valuation</span>
                </div>

                {/* Step 3: Documents */}
                <div className="flex flex-col items-center">
                  <div
                    className={`grid h-10 w-10 place-items-center rounded-full font-bold mb-2 shadow-sm ${
                      hasPendingDocs
                        ? "bg-amber-500 text-white animate-pulse ring-4 ring-amber-500/20"
                        : allRequestedDocsUploaded || selectedApp.status === "Approved" || selectedApp.status === "Rejected"
                        ? "bg-[var(--green)] text-white"
                        : "bg-[var(--paper)] text-[var(--muted)] border border-[var(--line)]"
                    }`}
                  >
                    <UploadCloud size={20} />
                  </div>
                  <span className="font-bold text-[var(--ink)]">3. Documents</span>
                  <span className="text-[10px] text-[var(--muted)]">
                    {hasPendingDocs
                      ? "Action Required"
                      : allRequestedDocsUploaded
                      ? "✓ Uploaded"
                      : "Verification"}
                  </span>
                </div>

                {/* Step 4: Decision */}
                <div className="flex flex-col items-center">
                  <div
                    className={`grid h-10 w-10 place-items-center rounded-full font-bold mb-2 shadow-sm ${
                      selectedApp.status === "Approved"
                        ? "bg-emerald-600 text-white"
                        : selectedApp.status === "Rejected"
                        ? "bg-red-600 text-white"
                        : "bg-[var(--paper)] text-[var(--muted)] border border-[var(--line)]"
                    }`}
                  >
                    <CheckCircle2 size={20} />
                  </div>
                  <span className="font-bold text-[var(--ink)]">4. Decision</span>
                  <span className="text-[10px] text-[var(--muted)]">
                    {selectedApp.status === "Approved"
                      ? "Approved!"
                      : selectedApp.status === "Rejected"
                      ? "Declined"
                      : "Pending"}
                  </span>
                </div>
              </div>
            </div>

            {/* Approved Stamp & Official Billing Terms Card */}
            {selectedApp.status === "Approved" && (
              <div className="rounded-3xl border border-emerald-500/30 bg-emerald-50/60 p-6 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-200">
                  <div>
                    <span className="inline-block rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-800 mb-1">
                      Official Approval
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-emerald-950">
                      Congratulations! Your Loan Has Been Approved
                    </h2>
                    <p className="text-xs text-emerald-800 mt-1">
                      Please review your approved financial terms and visit our Las Vegas branch with your vehicle and pink slip to collect your funds.
                    </p>
                  </div>

                  {/* VINTAGE OFFICIAL RUBBER STAMP */}
                  <div className="shrink-0 transform -rotate-3 hover:rotate-0 transition duration-200 select-none">
                    <div className="border-4 border-double border-emerald-700 bg-white/95 rounded-2xl px-5 py-2 text-center shadow-lg ring-2 ring-emerald-500/20">
                      <div className="text-[8px] font-black tracking-[0.25em] text-emerald-800 uppercase">
                        Title Bros Las Vegas
                      </div>
                      <div className="text-2xl font-black tracking-widest text-emerald-700 flex items-center justify-center gap-1.5 my-0.5">
                        <span>★</span>
                        <span>APPROVED</span>
                        <span>★</span>
                      </div>
                      <div className="text-[9px] font-mono font-bold text-emerald-800 tracking-wider">
                        {selectedApp.approvedTerms?.approvedAt
                          ? new Date(selectedApp.approvedTerms.approvedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                          : "AUTHORIZED"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Approved Terms Financial Billing Grid */}
                {selectedApp.approvedTerms?.loanAmount && (
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-emerald-900 mb-3">
                      Approved Financial Agreement & Billing Schedule
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="rounded-2xl bg-white p-3.5 border border-emerald-200 shadow-sm">
                        <span className="text-[var(--muted)] font-bold block">Approved Loan Amount</span>
                        <p className="text-xl font-black text-emerald-700 mt-1">
                          ${selectedApp.approvedTerms.loanAmount?.toLocaleString()}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white p-3.5 border border-emerald-200 shadow-sm">
                        <span className="text-[var(--muted)] font-bold block">Monthly Payment</span>
                        <p className="text-xl font-black text-[var(--ink)] mt-1">
                          ${selectedApp.approvedTerms.monthlyPayment?.toLocaleString()}/mo
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white p-3.5 border border-emerald-200 shadow-sm">
                        <span className="text-[var(--muted)] font-bold block">Repayment Term</span>
                        <p className="text-xl font-black text-[var(--ink)] mt-1">
                          {selectedApp.approvedTerms.repaymentMonths} Months
                        </p>
                      </div>

                      <div className="rounded-2xl bg-white p-3.5 border border-emerald-200 shadow-sm">
                        <span className="text-[var(--muted)] font-bold block">Annual Rate (APR)</span>
                        <p className="text-xl font-black text-[var(--ink)] mt-1">
                          {selectedApp.approvedTerms.interestRate || "18.5"}%
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3.5 rounded-2xl bg-white border border-emerald-200">
                        <span className="text-[var(--muted)] font-bold block">Total Repayment (Estimated)</span>
                        <p className="text-base font-black text-emerald-900 mt-0.5">
                          ${(
                            Number(selectedApp.approvedTerms.monthlyPayment || 0) *
                            Number(selectedApp.approvedTerms.repaymentMonths || 1)
                          ).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-white border border-emerald-200">
                        <span className="text-[var(--muted)] font-bold block">Disbursement Status</span>
                        <p className="text-base font-black text-emerald-700 mt-0.5">
                          Ready for Office Pickup / Instant Transfer
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 p-4 rounded-2xl bg-white border border-emerald-200 text-xs">
                      <strong className="text-emerald-950 block mb-1">What to Bring to Our Office to Collect Funds:</strong>
                      <ul className="list-disc pl-4 space-y-1 text-[var(--muted)]">
                        <li>Your clear vehicle title (pink slip).</li>
                        <li>Valid Government-issued photo ID or Nevada Driver License.</li>
                        <li>The vehicle for a quick 2-minute visual inspection.</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================== */}
            {/* DYNAMIC REQUESTED DOCUMENTS SECTION                            */}
            {/* Customer uploads ONLY the documents requested by CMS           */}
            {/* ============================================================== */}
            {selectedApp.requestedDocuments?.length > 0 && (
              <div className="rounded-3xl border border-amber-500/30 bg-[var(--white)] p-6 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--line)] mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="grid h-6 w-6 place-items-center rounded-full bg-amber-500 text-white font-bold text-xs">
                        1
                      </span>
                      <h2 className="text-base font-black text-[var(--ink)]">
                        Documents Requested by Title Bros
                      </h2>
                    </div>
                    <p className="text-xs text-[var(--muted)] mt-1">
                      Our underwriters requested the following specific documentation. Please upload each item directly:
                    </p>
                  </div>
                </div>

                {/* Global Feedback Banner for Uploads */}
                {uploadFeedback.success && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 font-semibold">
                    <CheckCircle2 size={16} />
                    <span>{uploadFeedback.success}</span>
                  </div>
                )}
                {uploadFeedback.error && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-semibold">
                    <AlertCircle size={16} />
                    <span>{uploadFeedback.error}</span>
                  </div>
                )}

                {/* Upload slots specifically for each requested document */}
                <div className="space-y-3">
                  {selectedApp.requestedDocuments.map((docName, idx) => {
                    const uploadedDoc = (selectedApp.documents || [])
                      .slice()
                      .reverse()
                      .find((d) => d.name?.toLowerCase() === docName.toLowerCase());
                    const isUploadingThis = uploadingDocName === docName;

                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border transition ${
                          uploadedDoc
                            ? uploadedDoc.status === "Accepted"
                              ? "bg-emerald-50/50 border-emerald-300"
                              : uploadedDoc.status === "Rejected"
                              ? "bg-red-50/50 border-red-300"
                              : "bg-blue-50/50 border-blue-200"
                            : "bg-amber-50/40 border-amber-300"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <FileText size={18} className={uploadedDoc ? "text-[var(--green)]" : "text-amber-600"} />
                            <span className="font-black text-sm text-[var(--ink)]">{docName}</span>
                          </div>
                          <span
                            className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                              uploadedDoc
                                ? uploadedDoc.status === "Accepted"
                                  ? "bg-emerald-200 text-emerald-900"
                                  : uploadedDoc.status === "Rejected"
                                  ? "bg-red-200 text-red-900"
                                  : "bg-blue-200 text-blue-900"
                                : "bg-amber-200 text-amber-900"
                            }`}
                          >
                            {uploadedDoc
                              ? uploadedDoc.status === "Accepted"
                                ? "✓ Verified & Accepted"
                                : uploadedDoc.status === "Rejected"
                                ? `✕ Rejected (${uploadedDoc.rejectionReason || "Re-upload required"})`
                                : "✓ Uploaded (Under Review)"
                              : "Upload Required"}
                          </span>
                        </div>

                        {uploadedDoc ? (
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-2 pt-2 border-t border-[var(--line)] text-xs">
                            <div className="text-[var(--muted)]">
                              <strong>Uploaded file:</strong> {uploadedDoc.originalName} (
                              {(uploadedDoc.size / 1024).toFixed(1)} KB) •{" "}
                              {new Date(uploadedDoc.uploadedAt).toLocaleString()}
                            </div>
                            <div className="flex items-center gap-3">
                              <a
                                href={loanService.getDocumentUrl(uploadedDoc.path)}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 font-bold text-[var(--green)] hover:underline"
                              >
                                <Eye size={13} />
                                <span>View File</span>
                              </a>
                              {/* Option to replace / re-upload if rejected */}
                              {uploadedDoc.status === "Rejected" && (
                                <div className="mt-2 pt-2 border-t border-red-200">
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <input
                                      type="file"
                                      accept="image/jpeg,image/png,application/pdf"
                                      disabled={isUploadingThis}
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          setStagedFiles((prev) => ({ ...prev, [docName]: file }));
                                        }
                                      }}
                                      className="w-full rounded-xl border border-red-200 bg-white p-1.5 text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-red-600 file:text-white"
                                    />
                                    {stagedFiles[docName] && (
                                      <button
                                        type="button"
                                        onClick={() => handleUploadSpecificDoc(docName)}
                                        disabled={isUploadingThis}
                                        className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-[var(--green)] px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[var(--green-dark)] transition shrink-0"
                                      >
                                        {isUploadingThis ? (
                                          <>
                                            <Loader2 size={13} className="animate-spin" />
                                            <span>Uploading...</span>
                                          </>
                                        ) : (
                                          <>
                                            <UploadCloud size={13} />
                                            <span>Submit Replacement</span>
                                          </>
                                        )}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          /* Direct inline file selector with explicit Upload & Submit button */
                          <div className="mt-3 space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs">
                              <input
                                type="file"
                                accept="image/jpeg,image/png,application/pdf"
                                disabled={isUploadingThis}
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    setStagedFiles((prev) => ({ ...prev, [docName]: file }));
                                  }
                                }}
                                className="w-full rounded-xl border border-[var(--line)] bg-white p-2 text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-[var(--paper)] file:text-[var(--ink)] file:border file:border-[var(--line)]"
                              />

                              {stagedFiles[docName] && (
                                <button
                                  type="button"
                                  onClick={() => handleUploadSpecificDoc(docName)}
                                  disabled={isUploadingThis}
                                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-[var(--green)] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[var(--green-dark)] transition shrink-0"
                                >
                                  {isUploadingThis ? (
                                    <>
                                      <Loader2 size={14} className="animate-spin" />
                                      <span>Uploading...</span>
                                    </>
                                  ) : (
                                    <>
                                      <UploadCloud size={14} />
                                      <span>Upload & Submit Document</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>

                            {stagedFiles[docName] && !isUploadingThis && (
                              <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                                <CheckCircle2 size={13} />
                                <span>File selected: {stagedFiles[docName].name} ({(stagedFiles[docName].size / 1024).toFixed(1)} KB) — Click &quot;Upload &amp; Submit Document&quot; to send file</span>
                              </p>
                            )}

                            {isUploadingThis && (
                              <div className="flex items-center gap-1.5 text-xs text-[var(--green)] font-bold">
                                <Loader2 size={15} className="animate-spin" />
                                <span>Uploading document to underwriters...</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Read-Only Documents on File (Only shown if documents have already been uploaded) */}
            {selectedApp.documents?.length > 0 && (
              <div className="rounded-3xl border border-[var(--line)] bg-[var(--white)] p-6 shadow-sm">
                <h2 className="text-base font-black text-[var(--ink)] mb-1">
                  Submitted Documents on File ({selectedApp.documents.length})
                </h2>
                <p className="text-xs text-[var(--muted)] mb-4">
                  Review verified and submitted documentation for your loan file.
                </p>

                <div className="space-y-2">
                  {selectedApp.documents.map((doc) => (
                    <div
                      key={doc._id}
                      className="flex items-center justify-between p-3 rounded-2xl border border-[var(--line)] bg-[var(--paper)] text-xs"
                    >
                      <div>
                        <strong className="text-[var(--ink)]">{doc.name}</strong>
                        <div className="text-[11px] text-[var(--muted)]">
                          {doc.originalName} • {(doc.size / 1024).toFixed(1)} KB • Uploaded:{" "}
                          {new Date(doc.uploadedAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            doc.status === "Accepted"
                              ? "bg-emerald-100 text-emerald-800"
                              : doc.status === "Rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {doc.status === "Accepted" ? "✓ Verified" : doc.status}
                        </span>
                        <a
                          href={loanService.getDocumentUrl(doc.path)}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-[var(--line)] p-1 text-[var(--muted)] hover:text-[var(--ink)]"
                          title="View In Browser"
                        >
                          <Eye size={14} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Complete Submitted Application Records (All 4 Steps Dynamically) */}
            <div className="rounded-3xl border border-[var(--line)] bg-[var(--white)] p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--line)]">
                <div>
                  <h2 className="text-base font-black text-[var(--ink)]">
                    Submitted Application Details (All 4 Steps)
                  </h2>
                  <p className="text-xs text-[var(--muted)]">
                    Dynamic snapshot of your complete application records filed with Title Bros.
                  </p>
                </div>
                <span className="font-mono text-xs font-bold text-[var(--green)] bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
                  #{selectedApp._id.slice(-6).toUpperCase()}
                </span>
              </div>

              {/* Step 1: Vehicle Specifications */}
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper)]/50 p-4">
                <div className="flex items-center gap-2 font-black text-xs text-[var(--ink)] mb-3">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-[var(--green)] text-white text-[10px]">1</span>
                  <Car size={15} className="text-[var(--green)]" />
                  <span>Step 1: Vehicle Specifications</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[var(--muted)] block font-medium">Year</span>
                    <p className="font-black text-[var(--ink)] mt-0.5">{selectedApp.vehicle?.year || "—"}</p>
                  </div>
                  <div>
                    <span className="text-[var(--muted)] block font-medium">Make</span>
                    <p className="font-black text-[var(--ink)] mt-0.5">{selectedApp.vehicle?.make || "—"}</p>
                  </div>
                  <div>
                    <span className="text-[var(--muted)] block font-medium">Model</span>
                    <p className="font-black text-[var(--ink)] mt-0.5">{selectedApp.vehicle?.model || "—"}</p>
                  </div>
                  <div>
                    <span className="text-[var(--muted)] block font-medium">Est. Value</span>
                    <p className="font-black text-[var(--green)] mt-0.5">
                      ${selectedApp.vehicle?.estimatedValue ? selectedApp.vehicle.estimatedValue.toLocaleString() : "0"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2: Personal & Contact Profile */}
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper)]/50 p-4">
                <div className="flex items-center gap-2 font-black text-xs text-[var(--ink)] mb-3">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-[var(--green)] text-white text-[10px]">2</span>
                  <User size={15} className="text-[var(--green)]" />
                  <span>Step 2: Personal & Contact Information</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[var(--muted)] block font-medium">Applicant Name</span>
                    <p className="font-black text-[var(--ink)] mt-0.5">
                      {selectedApp.firstName} {selectedApp.lastName}
                    </p>
                  </div>
                  <div>
                    <span className="text-[var(--muted)] block font-medium">Phone Number</span>
                    <p className="font-black text-[var(--ink)] mt-0.5">{selectedApp.phone || "—"}</p>
                  </div>
                  <div>
                    <span className="text-[var(--muted)] block font-medium">Email Address</span>
                    <p className="font-black text-[var(--ink)] mt-0.5 truncate">{selectedApp.email || "—"}</p>
                  </div>
                  <div>
                    <span className="text-[var(--muted)] block font-medium">ZIP Code & Employment</span>
                    <p className="font-black text-[var(--ink)] mt-0.5">
                      {selectedApp.zipCode || "—"} ({selectedApp.employmentStatus || "Employed"})
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3: Loan Request Specifications */}
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper)]/50 p-4">
                <div className="flex items-center gap-2 font-black text-xs text-[var(--ink)] mb-3">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-[var(--green)] text-white text-[10px]">3</span>
                  <DollarSign size={15} className="text-[var(--green)]" />
                  <span>Step 3: Loan Request Specifications</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[var(--muted)] block font-medium">Requested Amount</span>
                    <p className="font-black text-[var(--green)] text-sm mt-0.5">
                      ${selectedApp.amountRequested ? selectedApp.amountRequested.toLocaleString() : "0"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[var(--muted)] block font-medium">Purpose of Funds</span>
                    <p className="font-semibold text-[var(--ink)] mt-0.5">
                      {selectedApp.reasonForFunds || "Personal / Emergency use"}
                    </p>
                  </div>
                  <div>
                    <span className="text-[var(--muted)] block font-medium">Funding Urgency</span>
                    <p className="font-semibold text-[var(--ink)] mt-0.5">{selectedApp.urgency || "Immediately"}</p>
                  </div>
                  <div>
                    <span className="text-[var(--muted)] block font-medium">Estimated Monthly</span>
                    <p className="font-semibold text-[var(--ink)] mt-0.5">
                      ~${(Number(selectedApp.amountRequested || 0) * 0.05).toFixed(0)}/mo
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 4: Underwriting, Decision & Timeline */}
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper)]/50 p-4">
                <div className="flex items-center gap-2 font-black text-xs text-[var(--ink)] mb-3">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-[var(--green)] text-white text-[10px]">4</span>
                  <Clock size={15} className="text-[var(--green)]" />
                  <span>Step 4: Real-time Underwriting Status & Timeline</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[var(--muted)] block font-medium">Application Status</span>
                    <p className="font-black text-[var(--ink)] mt-0.5">{selectedApp.status}</p>
                  </div>
                  <div>
                    <span className="text-[var(--muted)] block font-medium">Submitted On</span>
                    <p className="font-semibold text-[var(--ink)] mt-0.5">
                      {new Date(selectedApp.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-[var(--muted)] block font-medium">Documents Uploaded</span>
                    <p className="font-semibold text-[var(--ink)] mt-0.5">
                      {selectedApp.documents?.length || 0} File(s)
                    </p>
                  </div>
                  <div>
                    <span className="text-[var(--muted)] block font-medium">Decision</span>
                    <p className="font-black text-[var(--green)] mt-0.5">
                      {selectedApp.status === "Approved"
                        ? "Approved"
                        : selectedApp.status === "Rejected"
                        ? "Declined"
                        : "Review in Progress"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Profile Management Section */}
        <div className="rounded-3xl border border-[var(--line)] bg-[var(--white)] p-6 shadow-sm">
          <h2 className="text-base font-black text-[var(--ink)] mb-1">Profile & Contact Information</h2>
          <p className="text-xs text-[var(--muted)] mb-4">
            Keep your contact details up to date to ensure fast notifications on your title loan.
          </p>

          {profileSuccess && (
            <div className="mb-3 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 font-semibold">
              {profileSuccess}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-3 text-xs max-w-md">
            <div>
              <label className="font-bold text-[var(--muted)] block mb-1">Full Name</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full rounded-xl border border-[var(--line)] p-2.5 font-medium outline-none focus:border-[var(--green)]"
              />
            </div>
            <div>
              <label className="font-bold text-[var(--muted)] block mb-1">Phone Number</label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="w-full rounded-xl border border-[var(--line)] p-2.5 font-medium outline-none focus:border-[var(--green)]"
              />
            </div>

            <button
              type="submit"
              disabled={profileSaving}
              className="rounded-2xl bg-[var(--green)] text-white px-5 py-2.5 font-bold text-xs hover:bg-[var(--green-dark)] transition"
            >
              {profileSaving ? "Saving..." : "Save Contact Info"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
