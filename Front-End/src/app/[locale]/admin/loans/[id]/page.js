"use client";

/**
 * ==============================================================================
 * Dedicated Full-Screen Admin Loan Verification & Underwriting Workstation
 * ==============================================================================
 * Route: /[locale]/admin/loans/[id]
 *
 * Full-screen, comprehensive underwriting inspection dashboard:
 * - Complete applicant profile & contact details
 * - Full vehicle valuation, specifications, and LTV calculation
 * - Complete loan request breakdown (Amount, Purpose/Reason for Funds, Urgency)
 * - Dynamic requested documents checklist
 * - All borrower submitted documents with in-browser view & individual Accept/Reject
 * - Quick Decision Actions: Approve (with terms calculator), Decline (with reason), Request Documents, Under Review
 * - Internal staff notes log and timestamped audit trail
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Car,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Calendar,
  FileText,
  Eye,
  Check,
  X,
  Send,
  Download,
  ShieldCheck,
  RefreshCw,
  ExternalLink,
  Loader2,
  AlertCircle,
  User,
  Info,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import loanService from "@/services/loanService";

export default function AdminLoanDetailPage() {
  const { locale, id } = useParams();
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, isSuperAdmin, logout } = useAuth();

  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");

  // Modals state
  const [approvalModal, setApprovalModal] = useState({
    open: false,
    loanAmount: "",
    interestRate: "18.5",
    repaymentMonths: "24",
  });

  const [rejectModal, setRejectModal] = useState({
    open: false,
    reason: "Vehicle estimated value insufficient for requested loan",
    customReason: "",
  });

  const [docRequestModal, setDocRequestModal] = useState({
    open: false,
    selectedDocs: [
      "Vehicle Title (Pink Slip)",
      "Government Issued ID / Driver License",
    ],
    customDoc: "",
  });

  const [rejectDocModal, setRejectDocModal] = useState({
    open: false,
    docId: null,
    docName: "",
    reason: "Document image is blurry or unreadable",
  });

  const [newNoteInput, setNewNoteInput] = useState("");

  // Fetch loan details
  const fetchLoan = useCallback(async () => {
    try {
      setLoading(true);
      const res = await loanService.getLoanById(id);
      if (res.success && res.data) {
        setLoan(res.data);
        // Pre-fill approval modal default amount
        setApprovalModal((prev) => ({
          ...prev,
          loanAmount: String(res.data.amountRequested || ""),
        }));
      }
    } catch (err) {
      setActionError(err.message || "Failed to load loan application.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Live auto-polling: fetch loan updates every 4 seconds without manual refresh
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return;

    fetchLoan();

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchLoan();
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isAuthenticated, isAdmin, fetchLoan]);

  // Toast feedback dismissal timer
  useEffect(() => {
    if (actionSuccess || actionError) {
      const t = setTimeout(() => {
        setActionSuccess("");
        setActionError("");
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [actionSuccess, actionError]);

  // Handle Approve Loan
  const handleApproveLoan = async (e) => {
    e.preventDefault();
    if (!loan) return;
    try {
      setActionLoading(true);
      await loanService.updateLoanStatus(loan._id, {
        status: "Approved",
        approvedTerms: {
          loanAmount: approvalModal.loanAmount || loan.amountRequested,
          interestRate: approvalModal.interestRate,
          repaymentMonths: approvalModal.repaymentMonths,
        },
      });
      setApprovalModal((prev) => ({ ...prev, open: false }));
      setActionSuccess("Loan approved! Agreement terms generated and customer notified.");
      await fetchLoan();
    } catch (err) {
      setActionError(err.message || "Failed to approve loan.");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Reject Loan
  const handleRejectLoan = async (e) => {
    e.preventDefault();
    if (!loan) return;
    try {
      setActionLoading(true);
      const finalReason =
        rejectModal.reason === "Other (Custom reason)"
          ? rejectModal.customReason
          : rejectModal.reason;

      await loanService.updateLoanStatus(loan._id, {
        status: "Rejected",
        rejectionReason: finalReason || "Lending criteria not met",
      });
      setRejectModal((prev) => ({ ...prev, open: false }));
      setActionSuccess("Loan marked as Rejected. Customer notified via email.");
      await fetchLoan();
    } catch (err) {
      setActionError(err.message || "Failed to reject loan.");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Request Documents
  const handleRequestDocs = async (e) => {
    e.preventDefault();
    if (!loan) return;
    try {
      setActionLoading(true);
      const docsToSend = [...docRequestModal.selectedDocs];
      if (docRequestModal.customDoc.trim()) {
        docsToSend.push(docRequestModal.customDoc.trim());
      }

      if (docsToSend.length === 0) {
        setActionError("Please select or specify at least one document to request.");
        setActionLoading(false);
        return;
      }

      await loanService.updateLoanStatus(loan._id, {
        status: "Pending Documents",
        requestedDocuments: docsToSend,
      });

      setDocRequestModal({
        open: false,
        selectedDocs: [
          "Vehicle Title (Pink Slip)",
          "Government Issued ID / Driver License",
        ],
        customDoc: "",
      });
      setActionSuccess("Document request dispatched! Customer portal has been updated.");
      await fetchLoan();
    } catch (err) {
      setActionError(err.message || "Failed to request documents.");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Mark Under Review
  const handleMarkUnderReview = async () => {
    if (!loan) return;
    try {
      setActionLoading(true);
      await loanService.updateLoanStatus(loan._id, {
        status: "Under Review",
        note: "Application taken under formal underwriting review.",
      });
      setActionSuccess("Loan status updated to Under Review.");
      await fetchLoan();
    } catch (err) {
      setActionError(err.message || "Failed to update status.");
    } finally {
      setActionLoading(false);
    }
  };

  // Review Individual Uploaded Document
  const handleReviewDoc = async (docId, status, reason = "") => {
    try {
      setActionLoading(true);
      await loanService.reviewDocument(loan._id, docId, {
        status,
        rejectionReason: reason,
      });
      setActionSuccess(`Document marked as ${status}.`);
      setRejectDocModal({ open: false, docId: null, docName: "", reason: "" });
      await fetchLoan();
    } catch (err) {
      setActionError(err.message || "Failed to review document.");
    } finally {
      setActionLoading(false);
    }
  };

  // Add Internal Staff Note
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteInput.trim() || !loan) return;
    try {
      setActionLoading(true);
      await loanService.addLoanNote(loan._id, newNoteInput.trim());
      setNewNoteInput("");
      setActionSuccess("Staff note logged.");
      await fetchLoan();
    } catch (err) {
      setActionError(err.message || "Failed to add note.");
    } finally {
      setActionLoading(false);
    }
  };

  // Monthly payment calculation preview for approval modal
  const calcMonthlyPayment = (principal, apr, months) => {
    const p = parseFloat(principal);
    const r = parseFloat(apr) / 100 / 12;
    const m = parseInt(months, 10);
    if (!p || !m) return "0.00";
    if (r <= 0) return (p / m).toFixed(2);
    const monthly = (p * r * Math.pow(1 + r, m)) / (Math.pow(1 + r, m) - 1);
    return isNaN(monthly) ? "0.00" : monthly.toFixed(2);
  };

  // Auth Guard
  if (!isAuthenticated || !isAdmin) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-24 bg-[var(--paper)]">
        <div className="w-full max-w-md rounded-3xl border border-[var(--line)] bg-[var(--white)] p-8 text-center shadow-xl">
          <AlertTriangle size={36} className="mx-auto text-amber-500 mb-3" />
          <h1 className="text-xl font-black text-[var(--ink)]">Staff Authorization Required</h1>
          <p className="mt-2 text-xs text-[var(--muted)]">
            You must be signed in with an authorized Title Bros Administrative account to view this loan file.
          </p>
          <Link
            href={`/${locale}/admin/login`}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--green)] py-3 text-sm font-bold text-white hover:bg-[var(--green-dark)] transition"
          >
            <span>Proceed to Admin Login</span>
            <ExternalLink size={16} />
          </Link>
        </div>
      </main>
    );
  }

  if (loading && !loan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--paper)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={36} className="animate-spin text-[var(--green)]" />
          <p className="text-xs font-bold text-[var(--muted)]">Loading loan file #{id}...</p>
        </div>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--paper)] px-4">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-3xl border border-[var(--line)] shadow-lg">
          <AlertCircle size={40} className="mx-auto text-red-500 mb-3" />
          <h2 className="text-lg font-black text-[var(--ink)]">Loan Application Not Found</h2>
          <p className="text-xs text-[var(--muted)] mt-1">
            The requested application ID does not exist or has been deleted.
          </p>
          <Link
            href={`/${locale}/admin/dashboard`}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[var(--green)] px-5 py-2.5 text-xs font-bold text-white"
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    );
  }

  // Loan to Value ratio
  const ltv =
    loan.vehicle?.estimatedValue > 0
      ? ((loan.amountRequested / loan.vehicle.estimatedValue) * 100).toFixed(1)
      : null;

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)] pb-16">
      {/* ============================================================== */}
      {/* TOP WORKSTATION HEADER BAR                                     */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--white)]/95 backdrop-blur-md px-4 lg:px-8 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href={`/${locale}/admin/dashboard`}
              className="flex items-center gap-1.5 rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-xs font-bold text-[var(--ink)] hover:bg-[var(--line)] transition"
              title="Return to Dashboard"
            >
              <ArrowLeft size={16} />
              <span>Loans Dashboard</span>
            </Link>

            <div className="h-5 w-px bg-[var(--line)]" />

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wider text-[var(--muted)] uppercase">
                  Application #{loan._id.slice(-6).toUpperCase()}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                    loan.status === "Approved"
                      ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                      : loan.status === "Rejected"
                      ? "bg-red-500/15 text-red-700 dark:text-red-400"
                      : loan.status === "Pending Documents"
                      ? "bg-amber-500/15 text-amber-700 dark:text-amber-400"
                      : "bg-blue-500/15 text-blue-700 dark:text-blue-400"
                  }`}
                >
                  {loan.status}
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-[var(--ink)] leading-tight">
                {loan.firstName} {loan.lastName} — {loan.vehicle?.year} {loan.vehicle?.make} {loan.vehicle?.model}
              </h1>
            </div>
          </div>

          {/* Quick Decision Actions in Header */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => setApprovalModal({ ...approvalModal, open: true })}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-xl bg-[var(--green)] px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-[var(--green-dark)] transition disabled:opacity-50"
            >
              <Check size={14} />
              <span>Approve Loan</span>
            </button>
            <button
              onClick={() => setRejectModal({ ...rejectModal, open: true })}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-xl bg-red-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition disabled:opacity-50"
            >
              <X size={14} />
              <span>Decline Application</span>
            </button>
            <button
              onClick={() => setDocRequestModal({ ...docRequestModal, open: true })}
              disabled={actionLoading}
              className="inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 rounded-xl border border-[var(--line)] bg-[var(--white)] px-3.5 py-2 text-xs font-bold text-[var(--ink)] hover:bg-[var(--paper)] transition disabled:opacity-50"
            >
              <FileText size={14} className="text-[var(--green)]" />
              <span>Request Documents</span>
            </button>
            <button
              onClick={fetchLoan}
              disabled={loading || actionLoading}
              title="Refresh Application"
              className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] transition"
            >
              <RefreshCw size={15} className={loading || actionLoading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Global Toast Feedback */}
        {actionSuccess && (
          <div className="max-w-7xl mx-auto mt-2 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-300 p-2.5 text-xs font-bold text-emerald-800">
            <CheckCircle2 size={16} />
            <span>{actionSuccess}</span>
          </div>
        )}
        {actionError && (
          <div className="max-w-7xl mx-auto mt-2 flex items-center gap-2 rounded-xl bg-red-50 border border-red-300 p-2.5 text-xs font-bold text-red-700">
            <XCircle size={16} />
            <span>{actionError}</span>
          </div>
        )}
      </header>

      {/* ============================================================== */}
      {/* MAIN WORKSTATION CONTENT (2-COLUMN GRID)                       */}
      {/* ============================================================== */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ========================================================== */}
          {/* LEFT COLUMN: APPLICANT, VEHICLE, DOCUMENTS & AUDIT (65%)   */}
          {/* ========================================================== */}
          <div className="lg:col-span-8 space-y-6">
            {/* Approved Terms Banner (If Approved) */}
            {loan.status === "Approved" && loan.approvedTerms?.loanAmount && (
              <div className="rounded-3xl border border-emerald-500/30 bg-emerald-50/80 p-6 shadow-sm">
                <div className="flex items-center gap-2 text-emerald-950 font-black text-base mb-3">
                  <CheckCircle2 size={20} className="text-emerald-600" />
                  <span>Approved Loan Terms & Agreement</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="rounded-2xl bg-white p-3.5 border border-emerald-200">
                    <span className="text-[var(--muted)] font-bold">Approved Principal</span>
                    <p className="text-lg font-black text-emerald-700 mt-0.5">
                      ${loan.approvedTerms.loanAmount?.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white p-3.5 border border-emerald-200">
                    <span className="text-[var(--muted)] font-bold">Interest Rate (APR)</span>
                    <p className="text-lg font-black text-[var(--ink)] mt-0.5">
                      {loan.approvedTerms.interestRate}%
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white p-3.5 border border-emerald-200">
                    <span className="text-[var(--muted)] font-bold">Monthly Payment</span>
                    <p className="text-lg font-black text-[var(--ink)] mt-0.5">
                      ${loan.approvedTerms.monthlyPayment}/mo
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white p-3.5 border border-emerald-200">
                    <span className="text-[var(--muted)] font-bold">Term Duration</span>
                    <p className="text-lg font-black text-[var(--ink)] mt-0.5">
                      {loan.approvedTerms.repaymentMonths} Months
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-emerald-900 mt-3">
                  Approved on {new Date(loan.approvedTerms.approvedAt).toLocaleString()}
                </p>
              </div>
            )}

            {/* Rejection Notice Banner (If Rejected) */}
            {loan.status === "Rejected" && (
              <div className="rounded-3xl border border-red-500/30 bg-red-50/80 p-6 text-red-950 shadow-sm">
                <div className="flex items-center gap-2 font-black text-base mb-1 text-red-700">
                  <XCircle size={20} />
                  <span>Application Rejected</span>
                </div>
                <p className="text-xs">
                  <strong>Stated Reason:</strong> {loan.rejectionReason || "Criteria requirements not met"}
                </p>
              </div>
            )}

            {/* Applicant Profile Information Card */}
            <div className="rounded-3xl border border-[var(--line)] bg-[var(--white)] p-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--line)] mb-4">
                <div className="flex items-center gap-2 font-black text-sm text-[var(--ink)]">
                  <User size={18} className="text-[var(--green)]" />
                  <span>Applicant Information</span>
                </div>
                <span className="text-xs text-[var(--muted)] font-semibold">
                  Submitted: {new Date(loan.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="font-bold text-[var(--muted)]">Full Name</span>
                  <p className="text-sm font-black text-[var(--ink)] mt-0.5">
                    {loan.firstName} {loan.lastName}
                  </p>
                </div>

                <div>
                  <span className="font-bold text-[var(--muted)]">Primary Phone</span>
                  <p className="font-bold text-[var(--ink)] mt-0.5">
                    <a href={`tel:${loan.phone}`} className="hover:text-[var(--green)] hover:underline">
                      {loan.phone}
                    </a>
                  </p>
                </div>

                <div>
                  <span className="font-bold text-[var(--muted)]">Email Address</span>
                  <p className="font-bold text-[var(--ink)] mt-0.5 truncate">
                    <a href={`mailto:${loan.email}`} className="hover:text-[var(--green)] hover:underline">
                      {loan.email}
                    </a>
                  </p>
                </div>

                <div>
                  <span className="font-bold text-[var(--muted)]">Residential ZIP</span>
                  <p className="font-semibold text-[var(--ink)] mt-0.5">{loan.zipCode || "—"}</p>
                </div>

                <div>
                  <span className="font-bold text-[var(--muted)]">Employment Status</span>
                  <p className="font-semibold text-[var(--ink)] mt-0.5">
                    {loan.employmentStatus || "Not specified"}
                  </p>
                </div>

                <div>
                  <span className="font-bold text-[var(--muted)]">Customer Account</span>
                  <p className="font-semibold text-[var(--green)] mt-0.5">
                    {loan.customer ? "Registered Customer" : "Guest / Online Form"}
                  </p>
                </div>
              </div>
            </div>

            {/* Vehicle & Valuation Card */}
            <div className="rounded-3xl border border-[var(--line)] bg-[var(--white)] p-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--line)] mb-4">
                <div className="flex items-center gap-2 font-black text-sm text-[var(--ink)]">
                  <Car size={18} className="text-[var(--green)]" />
                  <span>Vehicle Specifications & Valuation</span>
                </div>
                {ltv && (
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                      Number(ltv) <= 80
                        ? "bg-emerald-100 text-emerald-800"
                        : Number(ltv) <= 120
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    LTV: {ltv}%
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="font-bold text-[var(--muted)]">Year / Make / Model</span>
                  <p className="text-sm font-black text-[var(--ink)] mt-0.5">
                    {loan.vehicle?.year} {loan.vehicle?.make} {loan.vehicle?.model}
                  </p>
                </div>

                <div>
                  <span className="font-bold text-[var(--muted)]">Estimated Vehicle Value</span>
                  <p className="text-sm font-black text-[var(--ink)] mt-0.5">
                    ${loan.vehicle?.estimatedValue ? loan.vehicle.estimatedValue.toLocaleString() : "0"}
                  </p>
                </div>

                <div>
                  <span className="font-bold text-[var(--muted)]">Title Status</span>
                  <p className="font-bold text-emerald-700 mt-0.5">Clear / Lien Free</p>
                </div>

                <div>
                  <span className="font-bold text-[var(--muted)]">VIN Number</span>
                  <p className="font-mono text-xs text-[var(--ink)] mt-0.5">
                    {loan.vehicle?.vin || "Available on Title"}
                  </p>
                </div>
              </div>
            </div>

            {/* Loan Request Specifications Card */}
            <div className="rounded-3xl border border-[var(--line)] bg-[var(--white)] p-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--line)] mb-4">
                <div className="flex items-center gap-2 font-black text-sm text-[var(--ink)]">
                  <DollarSign size={18} className="text-[var(--green)]" />
                  <span>Loan Request Specifications</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="font-bold text-[var(--muted)]">Amount Requested</span>
                  <p className="text-xl font-black text-[var(--green)] mt-0.5">
                    ${loan.amountRequested?.toLocaleString()}
                  </p>
                </div>

                <div>
                  <span className="font-bold text-[var(--muted)]">Purpose / Reason for Funds</span>
                  <p className="font-semibold text-[var(--ink)] mt-0.5">
                    {loan.reasonForFunds || "Personal / Emergency use"}
                  </p>
                </div>

                <div>
                  <span className="font-bold text-[var(--muted)]">Funding Urgency</span>
                  <p className="font-semibold text-[var(--ink)] mt-0.5">{loan.urgency || "Immediately"}</p>
                </div>
              </div>
            </div>

            {/* Requested Documents Status Checklist */}
            {loan.requestedDocuments?.length > 0 && (
              <div className="rounded-3xl border border-amber-500/30 bg-amber-50/50 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 font-black text-sm text-amber-950">
                    <AlertTriangle size={18} className="text-amber-600" />
                    <span>Requested Documentation Checklist</span>
                  </div>
                  <span className="text-xs font-bold text-amber-800">
                    {loan.requestedDocuments.length} document(s) requested
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {loan.requestedDocuments.map((docName, idx) => {
                    const uploadedMatch = loan.documents?.find(
                      (d) => d.name?.toLowerCase() === docName.toLowerCase()
                    );
                    return (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-3 rounded-2xl border ${
                          uploadedMatch
                            ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                            : "bg-white border-amber-300 text-amber-950"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {uploadedMatch ? (
                            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                          ) : (
                            <Clock size={16} className="text-amber-600 shrink-0" />
                          )}
                          <span className="font-bold">{docName}</span>
                        </div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            uploadedMatch
                              ? "bg-emerald-200 text-emerald-900"
                              : "bg-amber-200 text-amber-900"
                          }`}
                        >
                          {uploadedMatch ? "Uploaded" : "Awaiting Upload"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All Submitted Documents Verification Gallery */}
            <div className="rounded-3xl border border-[var(--line)] bg-[var(--white)] p-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--line)] mb-4">
                <div className="flex items-center gap-2 font-black text-sm text-[var(--ink)]">
                  <FileText size={18} className="text-[var(--green)]" />
                  <span>Borrower Submitted Documents ({loan.documents?.length || 0})</span>
                </div>
              </div>

              <div className="space-y-3">
                {loan.documents?.map((doc) => (
                  <div
                    key={doc._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-[var(--line)] bg-[var(--paper)]/50 text-xs"
                  >
                    <div className="flex items-start gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-white border border-[var(--line)] text-[var(--green)] shrink-0">
                        <FileText size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-sm font-black text-[var(--ink)]">{doc.name}</strong>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                              doc.status === "Accepted"
                                ? "bg-emerald-100 text-emerald-800"
                                : doc.status === "Rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {doc.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--muted)] mt-0.5">
                          {doc.originalName} • {(doc.size / 1024).toFixed(1)} KB • Uploaded:{" "}
                          {new Date(doc.uploadedAt).toLocaleString()}
                        </p>
                        {doc.rejectionReason && (
                          <p className="text-[11px] text-red-600 font-medium mt-1">
                            Rejection Reason: {doc.rejectionReason}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Document Review Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <a
                        href={loanService.getDocumentUrl(doc.path)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 rounded-xl border border-[var(--line)] bg-[var(--white)] px-3 py-1.5 font-bold text-xs text-[var(--ink)] hover:bg-[var(--line)] transition"
                      >
                        <Eye size={14} />
                        <span>View in Tab</span>
                      </a>

                      {doc.status === "Accepted" ? (
                        <div className="flex items-center gap-1.5">
                          <span className="flex items-center gap-1 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1.5 font-bold text-xs">
                            <Check size={14} />
                            <span>Accepted & Verified</span>
                          </span>
                          <button
                            onClick={() =>
                              setRejectDocModal({
                                open: true,
                                docId: doc._id,
                                docName: doc.name,
                                reason: "Document image is blurry or unreadable",
                              })
                            }
                            disabled={actionLoading}
                            className="text-[11px] text-[var(--muted)] hover:text-red-600 underline font-medium px-1"
                          >
                            Change
                          </button>
                        </div>
                      ) : doc.status === "Rejected" ? (
                        <div className="flex items-center gap-1.5">
                          <span className="flex items-center gap-1 rounded-xl bg-red-100 text-red-800 border border-red-300 px-3 py-1.5 font-bold text-xs">
                            <X size={14} />
                            <span>Rejected</span>
                          </span>
                          <button
                            onClick={() => handleReviewDoc(doc._id, "Accepted")}
                            disabled={actionLoading}
                            className="text-[11px] text-[var(--muted)] hover:text-emerald-700 underline font-medium px-1"
                          >
                            Accept Instead
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleReviewDoc(doc._id, "Accepted")}
                            disabled={actionLoading}
                            className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 font-bold text-xs text-white hover:bg-emerald-700 transition"
                          >
                            <Check size={14} />
                            <span>Accept</span>
                          </button>

                          <button
                            onClick={() =>
                              setRejectDocModal({
                                open: true,
                                docId: doc._id,
                                docName: doc.name,
                                reason: "Document image is blurry or unreadable",
                              })
                            }
                            disabled={actionLoading}
                            className="flex items-center gap-1 rounded-xl bg-red-600 px-3 py-1.5 font-bold text-xs text-white hover:bg-red-700 transition"
                          >
                            <X size={14} />
                            <span>Reject</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}

                {(!loan.documents || loan.documents.length === 0) && (
                  <div className="p-8 text-center bg-[var(--paper)]/40 rounded-2xl border border-dashed border-[var(--line)]">
                    <FileText size={32} className="mx-auto text-[var(--muted)] mb-2" />
                    <p className="text-xs font-bold text-[var(--muted)]">
                      No documents have been uploaded by the borrower yet.
                    </p>
                    <p className="text-[11px] text-[var(--muted)] mt-1">
                      Click &quot;Request Docs&quot; at the top to notify the borrower of required records.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Audit Trail & Status History */}
            <div className="rounded-3xl border border-[var(--line)] bg-[var(--white)] p-6 shadow-sm">
              <h2 className="text-sm font-black text-[var(--ink)] mb-3">Audit Trail & Status History</h2>
              <div className="space-y-3">
                {loan.statusHistory?.map((entry, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs border-l-2 border-[var(--green)] pl-3 py-1">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-[var(--ink)]">{entry.toStatus}</span>
                        <span className="text-[10px] text-[var(--muted)]">by {entry.changedByName || "Staff"}</span>
                        <span className="text-[10px] text-[var(--muted)]">
                          • {new Date(entry.changedAt).toLocaleString()}
                        </span>
                      </div>
                      {entry.note && <p className="text-[var(--muted)] mt-0.5">{entry.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ========================================================== */}
          {/* RIGHT COLUMN: ACTIONS, CONTACT & INTERNAL NOTES (35%)      */}
          {/* ========================================================== */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Underwriting Actions Panel */}
            <div className="rounded-3xl border border-[var(--line)] bg-[var(--white)] p-6 shadow-sm">
              <h2 className="text-sm font-black text-[var(--ink)] mb-3">Underwriting Decisions</h2>
              <div className="space-y-2.5">
                <button
                  onClick={() => setApprovalModal({ ...approvalModal, open: true })}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-between rounded-2xl bg-[var(--green)] p-3.5 text-xs font-bold text-white hover:bg-[var(--green-dark)] shadow-sm transition"
                >
                  <span className="flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    <span>Approve Loan File</span>
                  </span>
                  <span>Terms &rarr;</span>
                </button>

                <button
                  onClick={() => setRejectModal({ ...rejectModal, open: true })}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-between rounded-2xl bg-red-600 p-3.5 text-xs font-bold text-white hover:bg-red-700 shadow-sm transition"
                >
                  <span className="flex items-center gap-2">
                    <XCircle size={16} />
                    <span>Decline Application</span>
                  </span>
                  <span>Reason &rarr;</span>
                </button>

                <button
                  onClick={() => setDocRequestModal({ ...docRequestModal, open: true })}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-between rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-3.5 text-xs font-bold text-[var(--ink)] hover:bg-[var(--line)] transition"
                >
                  <span className="flex items-center gap-2">
                    <FileText size={16} />
                    <span>Request Specific Docs</span>
                  </span>
                  <span>Checklist &rarr;</span>
                </button>

                <button
                  onClick={handleMarkUnderReview}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 p-3 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
                >
                  <Clock size={16} />
                  <span>Mark as Under Review</span>
                </button>
              </div>
            </div>

            {/* Direct Contact Applicant */}
            <div className="rounded-3xl border border-[var(--line)] bg-[var(--white)] p-6 shadow-sm">
              <h2 className="text-sm font-black text-[var(--ink)] mb-3">Direct Borrower Contact</h2>
              <div className="space-y-2 text-xs">
                <a
                  href={`tel:${loan.phone}`}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-[var(--line)] bg-[var(--paper)] hover:bg-[var(--line)] transition font-bold"
                >
                  <Phone size={16} className="text-[var(--green)]" />
                  <span className="truncate">Call: {loan.phone}</span>
                </a>

                <a
                  href={`mailto:${loan.email}?subject=Regarding Your Title Bros Loan Application`}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-[var(--line)] bg-[var(--paper)] hover:bg-[var(--line)] transition font-bold"
                >
                  <Mail size={16} className="text-[var(--green)]" />
                  <span className="truncate">Email: {loan.email}</span>
                </a>
              </div>
            </div>

            {/* Internal Staff Notes Log */}
            <div className="rounded-3xl border border-[var(--line)] bg-[var(--white)] p-6 shadow-sm">
              <h2 className="text-sm font-black text-[var(--ink)] mb-3">Internal Staff Notes</h2>

              {/* Notes List */}
              <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 mb-4 text-xs">
                {loan.internalNotes?.map((n, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-[var(--paper)] border border-[var(--line)]">
                    <p className="text-[var(--ink)] leading-relaxed">{n.note}</p>
                    <span className="text-[10px] text-[var(--muted)] font-bold block mt-1">
                      — {n.authorName} on {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}

                {(!loan.internalNotes || loan.internalNotes.length === 0) && (
                  <p className="text-xs text-[var(--muted)] italic text-center py-4">
                    No staff notes recorded yet.
                  </p>
                )}
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="space-y-2">
                <textarea
                  rows={2}
                  placeholder="Type an internal underwriting note..."
                  value={newNoteInput}
                  onChange={(e) => setNewNoteInput(e.target.value)}
                  className="w-full rounded-2xl border border-[var(--line)] p-3 text-xs outline-none focus:border-[var(--green)] resize-none"
                />
                <button
                  type="submit"
                  disabled={actionLoading || !newNoteInput.trim()}
                  className="w-full rounded-xl bg-[var(--green)] text-white py-2 text-xs font-bold hover:bg-[var(--green-dark)] transition disabled:opacity-50"
                >
                  Post Internal Note
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* ============================================================== */}
      {/* MODAL 1: APPROVE LOAN WITH TERMS CALCULATOR                    */}
      {/* ============================================================== */}
      {approvalModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={20} className="text-[var(--green)]" />
                <h3 className="font-black text-base text-[var(--ink)]">Approve Loan File</h3>
              </div>
              <button
                onClick={() => setApprovalModal({ ...approvalModal, open: false })}
                className="grid h-8 w-8 place-items-center rounded-full bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleApproveLoan} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[var(--muted)] block mb-1">Approved Loan Amount ($)</label>
                <input
                  type="number"
                  required
                  value={approvalModal.loanAmount}
                  onChange={(e) => setApprovalModal({ ...approvalModal, loanAmount: e.target.value })}
                  className="w-full rounded-xl border border-[var(--line)] p-2.5 font-black text-sm outline-none focus:border-[var(--green)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[var(--muted)] block mb-1">Annual Interest (APR %)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={approvalModal.interestRate}
                    onChange={(e) => setApprovalModal({ ...approvalModal, interestRate: e.target.value })}
                    className="w-full rounded-xl border border-[var(--line)] p-2.5 font-bold outline-none focus:border-[var(--green)]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[var(--muted)] block mb-1">Term (Months)</label>
                  <select
                    value={approvalModal.repaymentMonths}
                    onChange={(e) => setApprovalModal({ ...approvalModal, repaymentMonths: e.target.value })}
                    className="w-full rounded-xl border border-[var(--line)] p-2.5 font-bold outline-none focus:border-[var(--green)]"
                  >
                    <option value="12">12 Months</option>
                    <option value="24">24 Months</option>
                    <option value="36">36 Months</option>
                    <option value="48">48 Months</option>
                  </select>
                </div>
              </div>

              {/* Monthly Payment Preview */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Calculated Monthly Payment
                </span>
                <p className="text-xl font-black text-emerald-700 mt-0.5">
                  $
                  {calcMonthlyPayment(
                    approvalModal.loanAmount,
                    approvalModal.interestRate,
                    approvalModal.repaymentMonths
                  )}
                  /mo
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setApprovalModal({ ...approvalModal, open: false })}
                  className="flex-1 rounded-xl border border-[var(--line)] py-2.5 font-bold text-xs text-[var(--muted)] hover:bg-[var(--paper)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 rounded-xl bg-[var(--green)] text-white py-2.5 font-bold text-xs hover:bg-[var(--green-dark)] transition disabled:opacity-50"
                >
                  {actionLoading ? "Approving..." : "Confirm Approval"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: DECLINE LOAN APPLICATION                             */}
      {/* ============================================================== */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div className="flex items-center gap-2">
                <XCircle size={20} className="text-red-600" />
                <h3 className="font-black text-base text-[var(--ink)]">Decline Application</h3>
              </div>
              <button
                onClick={() => setRejectModal({ ...rejectModal, open: false })}
                className="grid h-8 w-8 place-items-center rounded-full bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRejectLoan} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-[var(--muted)] block mb-1">Select Rejection Reason</label>
                <select
                  value={rejectModal.reason}
                  onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                  className="w-full rounded-xl border border-[var(--line)] p-2.5 font-bold outline-none focus:border-red-500"
                >
                  <option value="Vehicle estimated value insufficient for requested loan">
                    Vehicle estimated value insufficient for requested loan
                  </option>
                  <option value="Title has existing liens or encumbrances">
                    Title has existing liens or encumbrances
                  </option>
                  <option value="Incomplete or unverifiable borrower documentation">
                    Incomplete or unverifiable borrower documentation
                  </option>
                  <option value="Applicant requested cancellation">Applicant requested cancellation</option>
                  <option value="Other (Custom reason)">Other (Custom reason)</option>
                </select>
              </div>

              {rejectModal.reason === "Other (Custom reason)" && (
                <div>
                  <label className="font-bold text-[var(--muted)] block mb-1">Custom Rejection Reason</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Provide specific underwriting rationale..."
                    value={rejectModal.customReason}
                    onChange={(e) => setRejectModal({ ...rejectModal, customReason: e.target.value })}
                    className="w-full rounded-xl border border-[var(--line)] p-2.5 font-medium outline-none focus:border-red-500"
                  />
                </div>
              )}

              <p className="text-[11px] text-[var(--muted)]">
                The borrower will be notified of this outcome via automated email notification.
              </p>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModal({ ...rejectModal, open: false })}
                  className="flex-1 rounded-xl border border-[var(--line)] py-2.5 font-bold text-xs text-[var(--muted)] hover:bg-[var(--paper)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 rounded-xl bg-red-600 text-white py-2.5 font-bold text-xs hover:bg-red-700 transition disabled:opacity-50"
                >
                  {actionLoading ? "Declining..." : "Confirm Decline"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: REQUEST SPECIFIC DOCUMENTS FROM BORROWER              */}
      {/* ============================================================== */}
      {docRequestModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-[var(--green)]" />
                <h3 className="font-black text-base text-[var(--ink)]">Request Documents</h3>
              </div>
              <button
                onClick={() => setDocRequestModal({ ...docRequestModal, open: false })}
                className="grid h-8 w-8 place-items-center rounded-full bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)]"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleRequestDocs} className="mt-4 space-y-3.5 text-xs">
              <p className="text-[11px] text-[var(--muted)]">
                Select the exact records required. The customer portal will present upload slots strictly for these items.
              </p>

              <div className="space-y-2">
                {[
                  "Vehicle Title (Pink Slip)",
                  "Government Issued ID / Driver License",
                  "Proof of Income / Pay Stub",
                  "Proof of Residence / Utility Bill",
                  "Vehicle Photos (4 Sides & Odometer)",
                  "Vehicle Registration",
                ].map((docName) => (
                  <label
                    key={docName}
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[var(--paper)] cursor-pointer font-bold text-[var(--ink)]"
                  >
                    <input
                      type="checkbox"
                      checked={docRequestModal.selectedDocs.includes(docName)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setDocRequestModal((prev) => ({
                            ...prev,
                            selectedDocs: [...prev.selectedDocs, docName],
                          }));
                        } else {
                          setDocRequestModal((prev) => ({
                            ...prev,
                            selectedDocs: prev.selectedDocs.filter((d) => d !== docName),
                          }));
                        }
                      }}
                      className="rounded border-[var(--line)] text-[var(--green)] focus:ring-[var(--green)]"
                    />
                    <span>{docName}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="font-bold text-[var(--muted)] block mb-1">Or Add Custom Document Name</label>
                <input
                  type="text"
                  placeholder="e.g. Bank Statement (Last 30 Days)"
                  value={docRequestModal.customDoc}
                  onChange={(e) => setDocRequestModal({ ...docRequestModal, customDoc: e.target.value })}
                  className="w-full rounded-xl border border-[var(--line)] p-2.5 font-medium outline-none focus:border-[var(--green)]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDocRequestModal({ ...docRequestModal, open: false })}
                  className="flex-1 rounded-xl border border-[var(--line)] py-2.5 font-bold text-xs text-[var(--muted)] hover:bg-[var(--paper)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 rounded-xl bg-[var(--green)] text-white py-2.5 font-bold text-xs hover:bg-[var(--green-dark)] transition disabled:opacity-50"
                >
                  {actionLoading ? "Dispatching..." : "Dispatch Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: REJECT SINGLE DOCUMENT REASON MODAL                  */}
      {/* ============================================================== */}
      {rejectDocModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <h3 className="font-black text-base text-[var(--ink)]">Reject Document</h3>
              <button
                onClick={() => setRejectDocModal({ open: false, docId: null, docName: "", reason: "" })}
                className="grid h-8 w-8 place-items-center rounded-full bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <p className="text-[var(--muted)]">
                Document: <strong className="text-[var(--ink)]">{rejectDocModal.docName}</strong>
              </p>

              <div>
                <label className="font-bold text-[var(--muted)] block mb-1">Reason for Rejection</label>
                <select
                  value={rejectDocModal.reason}
                  onChange={(e) => setRejectDocModal({ ...rejectDocModal, reason: e.target.value })}
                  className="w-full rounded-xl border border-[var(--line)] p-2.5 font-bold outline-none focus:border-red-500"
                >
                  <option value="Document image is blurry or unreadable">
                    Document image is blurry or unreadable
                  </option>
                  <option value="Wrong document uploaded">Wrong document uploaded</option>
                  <option value="Document has expired">Document has expired</option>
                  <option value="Name on document does not match applicant">
                    Name on document does not match applicant
                  </option>
                  <option value="Edges cropped or critical information missing">
                    Edges cropped or critical information missing
                  </option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectDocModal({ open: false, docId: null, docName: "", reason: "" })}
                  className="flex-1 rounded-xl border border-[var(--line)] py-2.5 font-bold text-xs text-[var(--muted)] hover:bg-[var(--paper)]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleReviewDoc(rejectDocModal.docId, "Rejected", rejectDocModal.reason)
                  }
                  disabled={actionLoading}
                  className="flex-1 rounded-xl bg-red-600 text-white py-2.5 font-bold text-xs hover:bg-red-700 transition"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
