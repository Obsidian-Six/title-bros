"use client";

/**
 * ==============================================================================
 * 4.3 Title Bros Admin Dashboard (CMS)
 * ==============================================================================
 * Full-featured administrative management suite for Title Bros staff & Super Admins:
 * - Tab 1: Overview (Summary Cards, 24h Alerts, Recent 10 Applications Feed)
 * - Tab 2: Loan Applications (Filter, Live Search, Slide-Over Review Modal, Approval Terms, Rejections, Document Verification, Audit Log)
 * - Tab 3: Customer Management (Customer 360 Profiles, Walk-in Creator, Notes)
 * - Tab 4: Communication Logs (Email & SMS Audit Trail, Custom Composer)
 * - Tab 5: Team Management (Super Admin restricted staff provisioning)
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileSpreadsheet,
  Users,
  MessageSquare,
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  DollarSign,
  Phone,
  Mail,
  Car,
  UserPlus,
  Send,
  Eye,
  Plus,
  ArrowUpRight,
  Loader2,
  RefreshCw,
  LogOut,
  ChevronRight,
  X,
  Calendar,
  Trash2,
  BookOpen,
  Edit3,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import loanService, { getDocumentUrl } from "@/services/loanService";
import BlogBuilderModal from "@/components/admin/BlogBuilderModal";

export default function AdminDashboardPage() {
  const { locale } = useParams();
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, isSuperAdmin, logout } = useAuth();

  // Active navigation tab: 'overview' | 'loans' | 'customers' | 'communications' | 'team'
  const [activeTab, setActiveTab] = useState("overview");

  // Loading & notification states
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");

  // ==========================================
  // DATA STATES
  // ==========================================
  const [stats, setStats] = useState({
    totalToday: 0,
    pendingReview: 0,
    unreadCount: 0,
    approvedThisWeek: 0,
    activeLoans: 0,
    totalCustomers: 0,
    recentApplications: [],
    alerts: { waitingOver24hCount: 0, waitingOver24hItems: [] },
  });

  // Loans tab state
  const [loans, setLoans] = useState([]);
  const [loanStatusFilter, setLoanStatusFilter] = useState("All");
  const [loanSearchQuery, setLoanSearchQuery] = useState("");
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Loan action modals state
  const [approvalModal, setApprovalModal] = useState({
    open: false,
    loanAmount: "",
    interestRate: "18.5",
    repaymentMonths: "24",
  });
  const [rejectModal, setRejectModal] = useState({ open: false, reason: "Title lien exists or incomplete documentation" });
  const [docRequestModal, setDocRequestModal] = useState({
    open: false,
    selectedDocs: ["Vehicle Title (Pink Slip)", "Government Issued ID / Driver License"],
    customDoc: "",
  });
  const [newNoteInput, setNewNoteInput] = useState("");

  // Customers tab state
  const [customers, setCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [walkInModal, setWalkInModal] = useState({ open: false, name: "", email: "", phone: "", notes: "" });
  const [deleteCustomerModal, setDeleteCustomerModal] = useState({ open: false, customer: null, deleting: false });

  // Communications tab state
  const [commLogs, setCommLogs] = useState([]);
  const [commChannelFilter, setCommChannelFilter] = useState("ALL");
  const [commComposer, setCommComposer] = useState({
    open: false,
    recipient: "",
    channel: "EMAIL",
    subject: "",
    message: "",
  });

  // Team management state (Super Admin)
  const [staffList, setStaffList] = useState([]);
  const [newStaffModal, setNewStaffModal] = useState({
    open: false,
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "ADMIN",
  });

  // Blog posts CMS state
  const [blogs, setBlogs] = useState([]);
  const [blogStatusFilter, setBlogStatusFilter] = useState("All");
  const [blogSearchQuery, setBlogSearchQuery] = useState("");
  const [blogModalOpen, setBlogModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);

  const loadBlogs = useCallback(async () => {
    try {
      const res = await loanService.getAdminBlogs({
        status: blogStatusFilter,
        search: blogSearchQuery,
      });
      if (res.success) setBlogs(res.data.posts || []);
    } catch (err) {
      console.error("Failed to load admin blogs:", err);
    }
  }, [blogStatusFilter, blogSearchQuery]);

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadBlogs();
    }
  }, [loadBlogs, isAuthenticated, isAdmin]);

  // ==========================================
  // DATA FETCHING FUNCTIONS
  // ==========================================
  const loadDashboardData = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const statsRes = await loanService.getAdminStats();
      if (statsRes.success) setStats(statsRes.data);

      const loansRes = await loanService.getAllLoans({
        status: loanStatusFilter,
        search: loanSearchQuery,
      });
      if (loansRes.success) setLoans(loansRes.data.loans);

      const customersRes = await loanService.getCustomers({ search: customerSearch });
      if (customersRes.success) setCustomers(customersRes.data.customers);

      const commRes = await loanService.getCommunicationLogs({ channel: commChannelFilter });
      if (commRes.success) setCommLogs(commRes.data.logs);

      if (isSuperAdmin) {
        const staffRes = await loanService.getAllAdmins();
        if (staffRes.success) setStaffList(staffRes.data.admins);
      }

      await loadBlogs();
    } catch (err) {
      if (!isBackground) setActionError(err.message || "Failed to load dashboard data.");
    } finally {
      if (!isBackground) setLoading(false);
    }
  }, [loanStatusFilter, loanSearchQuery, customerSearch, commChannelFilter, isSuperAdmin, loadBlogs]);

  // Initial load and background real-time auto-polling every 4 seconds
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) return;

    loadDashboardData(false);

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        loadDashboardData(true);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isAuthenticated, isAdmin, loadDashboardData]);

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

  // Open full loan detail view
  const openLoanDetail = async (id) => {
    try {
      const res = await loanService.getLoanById(id);
      if (res.success) {
        setSelectedLoan(res.data);
        setIsDetailOpen(true);
      }
    } catch (err) {
      setActionError("Could not retrieve loan details: " + err.message);
    }
  };

  // Status Action: Approve Loan
  const handleApproveLoan = async () => {
    if (!selectedLoan) return;
    try {
      await loanService.updateLoanStatus(selectedLoan._id, {
        status: "Approved",
        approvedTerms: {
          loanAmount: approvalModal.loanAmount || selectedLoan.amountRequested,
          interestRate: approvalModal.interestRate,
          repaymentMonths: approvalModal.repaymentMonths,
        },
      });
      setApprovalModal({ ...approvalModal, open: false });
      setActionSuccess("Loan application has been APPROVED with repayment terms.");
      openLoanDetail(selectedLoan._id);
      loadDashboardData();
    } catch (err) {
      setActionError(err.message || "Approval failed");
    }
  };

  // Status Action: Reject Loan
  const handleRejectLoan = async () => {
    if (!selectedLoan) return;
    try {
      await loanService.updateLoanStatus(selectedLoan._id, {
        status: "Rejected",
        rejectionReason: rejectModal.reason,
      });
      setRejectModal({ ...rejectModal, open: false });
      setActionSuccess("Application marked as REJECTED and customer notified.");
      openLoanDetail(selectedLoan._id);
      loadDashboardData();
    } catch (err) {
      setActionError(err.message || "Rejection failed");
    }
  };

  // Status Action: Request Documents
  const handleRequestDocs = async () => {
    if (!selectedLoan) return;
    try {
      await loanService.updateLoanStatus(selectedLoan._id, {
        status: "Pending Documents",
        requestedDocuments: docRequestModal.selectedDocs,
      });
      setDocRequestModal({ ...docRequestModal, open: false });
      setActionSuccess("Document checklist requested. SMS & Email notice sent to customer.");
      openLoanDetail(selectedLoan._id);
      loadDashboardData();
    } catch (err) {
      setActionError(err.message || "Failed to request documents");
    }
  };

  // Status Action: Mark Under Review
  const handleMarkUnderReview = async () => {
    if (!selectedLoan) return;
    try {
      await loanService.updateLoanStatus(selectedLoan._id, { status: "Under Review" });
      setActionSuccess("Loan status updated to Under Review.");
      openLoanDetail(selectedLoan._id);
      loadDashboardData();
    } catch (err) {
      setActionError(err.message || "Update failed");
    }
  };

  // Add Internal Staff Note
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteInput.trim() || !selectedLoan) return;
    try {
      await loanService.addLoanNote(selectedLoan._id, newNoteInput.trim());
      setNewNoteInput("");
      openLoanDetail(selectedLoan._id);
      setActionSuccess("Internal staff note logged.");
    } catch (err) {
      setActionError(err.message || "Failed to add note");
    }
  };

  // Review Document (Accept / Reject)
  const handleReviewDoc = async (docId, status) => {
    if (!selectedLoan) return;
    try {
      await loanService.reviewDocument(selectedLoan._id, docId, { status });
      openLoanDetail(selectedLoan._id);
      setActionSuccess(`Document marked as ${status}.`);
    } catch (err) {
      setActionError(err.message || "Failed to review document");
    }
  };

  // Create Walk-In Customer
  const handleCreateWalkIn = async (e) => {
    e.preventDefault();
    try {
      await loanService.createWalkInCustomer(walkInModal);
      setWalkInModal({ open: false, name: "", email: "", phone: "", notes: "" });
      setActionSuccess("Walk-in customer account created successfully.");
      loadDashboardData();
    } catch (err) {
      setActionError(err.message || "Failed to create walk-in customer");
    }
  };

  // Send Manual Custom Message
  const handleSendCustomMessage = async (e) => {
    e.preventDefault();
    try {
      await loanService.sendManualMessage(commComposer);
      setCommComposer({ open: false, recipient: "", channel: "EMAIL", subject: "", message: "" });
      setActionSuccess("Message dispatched and logged to audit trail.");
      loadDashboardData();
    } catch (err) {
      setActionError(err.message || "Failed to dispatch message");
    }
  };

  // Provision New Admin (Super Admin)
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      await loanService.createAdmin(newStaffModal);
      setNewStaffModal({ open: false, name: "", email: "", password: "", phone: "", role: "ADMIN" });
      setActionSuccess("New administrative staff account provisioned.");
      loadDashboardData();
    } catch (err) {
      setActionError(err.message || "Failed to create admin");
    }
  };

  // Delete Customer Permanently (Super Admin Only)
  const handleDeleteCustomer = async () => {
    if (!deleteCustomerModal.customer?._id) return;
    setDeleteCustomerModal((prev) => ({ ...prev, deleting: true }));
    try {
      await loanService.deleteCustomer(deleteCustomerModal.customer._id);
      const customerName = deleteCustomerModal.customer.name || "Customer";
      setDeleteCustomerModal({ open: false, customer: null, deleting: false });
      setActionSuccess(`Customer ${customerName} and all associated loan files were permanently deleted.`);
      loadDashboardData();
    } catch (err) {
      setActionError(err.message || "Failed to delete customer");
      setDeleteCustomerModal((prev) => ({ ...prev, deleting: false }));
    }
  };

  // Authentication Guard: Redirect if not logged in as Admin
  if (!isAuthenticated || !isAdmin) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-24 bg-[var(--paper)]">
        <div className="w-full max-w-md rounded-3xl border border-[var(--line)] bg-[var(--white)] p-8 text-center shadow-xl">
          <AlertTriangle size={36} className="mx-auto text-amber-500 mb-3" />
          <h1 className="text-xl font-black text-[var(--ink)]">Staff Authorization Required</h1>
          <p className="mt-2 text-xs text-[var(--muted)]">
            You must be signed in with an authorized Title Bros Administrative account to view this dashboard.
          </p>
          <Link
            href={`/${locale}/admin/login`}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--green)] py-3 text-sm font-bold text-white hover:bg-[var(--green-dark)] transition"
          >
            <span>Proceed to Admin Login</span>
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      {/* ============================================================== */}
      {/* TOP CMS NAVBAR                                                 */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[var(--white)]/90 backdrop-blur-md px-4 lg:px-8 py-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              width={36}
              height={36}
              src="/logo.jpg"
              alt="Title Bros"
              className="h-8 w-8 rounded-full bg-white object-contain"
            />
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-black tracking-tight text-[var(--ink)]">
                TITLE BROS <span className="text-[var(--green)]">OPS CMS</span>
              </span>
              {isSuperAdmin ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-black text-amber-700 dark:text-amber-400">
                  👑 Super Admin (Full Access)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full border border-[var(--green)]/30 bg-[var(--green)]/10 px-2.5 py-0.5 text-[10px] font-black text-[var(--green)]">
                  🛡️ Staff Admin (Loan Officer)
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadDashboardData}
              disabled={loading}
              title="Refresh Data"
              className="grid h-9 w-9 place-items-center rounded-full border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] transition"
            >
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-[var(--ink)] border-l border-[var(--line)] pl-3">
              <div className="grid h-7 w-7 place-items-center rounded-full bg-[var(--green)] text-white text-[11px]">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <span>{user?.name}</span>
            </div>

            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 rounded-xl border border-[var(--line)] px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* Global Feedback Toast */}
        {actionSuccess && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-800">
            <CheckCircle2 size={15} />
            <span>{actionSuccess}</span>
          </div>
        )}
        {actionError && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 border border-red-500/20 px-3 py-2 text-xs font-semibold text-red-700">
            <XCircle size={15} />
            <span>{actionError}</span>
          </div>
        )}
      </header>

      {/* ============================================================== */}
      {/* MAIN LAYOUT (SIDEBAR TABS + CONTENT)                           */}
      {/* ============================================================== */}
      <div className="flex flex-col lg:flex-row">
        {/* Navigation Sidebar */}
        <aside className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r border-[var(--line)] bg-[var(--white)] p-4 shrink-0">
          <nav className="flex lg:flex-col gap-1.5 overflow-x-auto pb-2 lg:pb-0">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2.5 rounded-2xl px-4 py-3 text-xs font-bold transition whitespace-nowrap ${
                activeTab === "overview"
                  ? "bg-[var(--green)] text-white shadow-md shadow-[var(--green)]/20"
                  : "text-[var(--muted)] hover:bg-[var(--paper)] hover:text-[var(--ink)]"
              }`}
            >
              <LayoutDashboard size={16} />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab("loans")}
              className={`flex items-center gap-2.5 rounded-2xl px-4 py-3 text-xs font-bold transition whitespace-nowrap ${
                activeTab === "loans"
                  ? "bg-[var(--green)] text-white shadow-md shadow-[var(--green)]/20"
                  : "text-[var(--muted)] hover:bg-[var(--paper)] hover:text-[var(--ink)]"
              }`}
            >
              <FileSpreadsheet size={16} />
              <span>Loan Applications</span>
              {stats.unreadCount > 0 ? (
                <span className="ml-auto rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-black text-white animate-pulse">
                  {stats.unreadCount} New
                </span>
              ) : stats.pendingReview > 0 ? (
                <span className="ml-auto rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 px-2 py-0.5 text-[10px] font-bold">
                  {stats.pendingReview}
                </span>
              ) : null}
            </button>

            <button
              onClick={() => setActiveTab("customers")}
              className={`flex items-center gap-2.5 rounded-2xl px-4 py-3 text-xs font-bold transition whitespace-nowrap ${
                activeTab === "customers"
                  ? "bg-[var(--green)] text-white shadow-md shadow-[var(--green)]/20"
                  : "text-[var(--muted)] hover:bg-[var(--paper)] hover:text-[var(--ink)]"
              }`}
            >
              <Users size={16} />
              <span>Customers</span>
            </button>

            <button
              onClick={() => setActiveTab("communications")}
              className={`flex items-center gap-2.5 rounded-2xl px-4 py-3 text-xs font-bold transition whitespace-nowrap ${
                activeTab === "communications"
                  ? "bg-[var(--green)] text-white shadow-md shadow-[var(--green)]/20"
                  : "text-[var(--muted)] hover:bg-[var(--paper)] hover:text-[var(--ink)]"
              }`}
            >
              <MessageSquare size={16} />
              <span>Communications</span>
            </button>

            <button
              onClick={() => setActiveTab("blogs")}
              className={`flex items-center gap-2.5 rounded-2xl px-4 py-3 text-xs font-bold transition whitespace-nowrap ${
                activeTab === "blogs"
                  ? "bg-[var(--green)] text-white shadow-md shadow-[var(--green)]/20"
                  : "text-[var(--muted)] hover:bg-[var(--paper)] hover:text-[var(--ink)]"
              }`}
            >
              <BookOpen size={16} />
              <span>Blog Posts</span>
              {blogs.length > 0 && (
                <span className="ml-auto rounded-full bg-black/10 px-2 py-0.5 text-[10px] font-bold text-[var(--ink)]">
                  {blogs.length}
                </span>
              )}
            </button>

            {isSuperAdmin ? (
              <button
                onClick={() => setActiveTab("team")}
                className={`flex items-center gap-2.5 rounded-2xl px-4 py-3 text-xs font-bold transition whitespace-nowrap ${
                  activeTab === "team"
                    ? "bg-[var(--green)] text-white shadow-md shadow-[var(--green)]/20"
                    : "text-[var(--muted)] hover:bg-[var(--paper)] hover:text-[var(--ink)]"
                }`}
              >
                <ShieldCheck size={16} />
                <span>Team & Admins</span>
                <span className="ml-auto rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-black text-amber-600">
                  ROOT
                </span>
              </button>
            ) : (
              <div
                title="Super Admin role required to provision or manage team accounts"
                className="flex items-center gap-2.5 rounded-2xl px-4 py-3 text-xs font-medium text-[var(--muted)]/50 cursor-not-allowed select-none"
              >
                <ShieldCheck size={16} />
                <span>Team & Admins</span>
                <span className="ml-auto rounded-full bg-zinc-200 px-1.5 py-0.5 text-[9px] font-bold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                  Locked
                </span>
              </div>
            )}
          </nav>
        </aside>

        {/* Content Pane */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {/* ============================================================== */}
          {/* TAB 1: OVERVIEW SCREEN                                         */}
          {/* ============================================================== */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* 5 Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div className="rounded-3xl border border-[var(--line)] bg-[var(--white)] p-5 shadow-sm">
                  <span className="text-[11px] font-bold text-[var(--muted)]">Applications Today</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-[var(--ink)]">{stats.totalToday}</span>
                    <Clock size={18} className="text-[var(--green)]" />
                  </div>
                </div>

                <div className="rounded-3xl border border-[var(--line)] bg-[var(--white)] p-5 shadow-sm">
                  <span className="text-[11px] font-bold text-[var(--muted)]">Pending Review</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-amber-600">{stats.pendingReview}</span>
                    <AlertTriangle size={18} className="text-amber-500" />
                  </div>
                </div>

                <div className="rounded-3xl border border-[var(--line)] bg-[var(--white)] p-5 shadow-sm">
                  <span className="text-[11px] font-bold text-[var(--muted)]">Approved This Week</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-[var(--green)]">{stats.approvedThisWeek}</span>
                    <CheckCircle2 size={18} className="text-[var(--green)]" />
                  </div>
                </div>

                <div className="rounded-3xl border border-[var(--line)] bg-[var(--white)] p-5 shadow-sm">
                  <span className="text-[11px] font-bold text-[var(--muted)]">Active Loans</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-[var(--ink)]">{stats.activeLoans}</span>
                    <DollarSign size={18} className="text-[var(--green)]" />
                  </div>
                </div>

                <div className="rounded-3xl border border-[var(--line)] bg-[var(--white)] p-5 shadow-sm col-span-2 md:col-span-1">
                  <span className="text-[11px] font-bold text-[var(--muted)]">Total Customers</span>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-2xl font-black text-[var(--ink)]">{stats.totalCustomers}</span>
                    <Users size={18} className="text-[var(--muted)]" />
                  </div>
                </div>
              </div>

              {/* Alerts Panel: Applications waiting >24 hours */}
              {stats.alerts?.waitingOver24hCount > 0 && (
                <div className="rounded-3xl border border-amber-500/30 bg-amber-50/70 dark:bg-amber-950/20 p-5">
                  <div className="flex items-center gap-2 text-sm font-bold text-amber-900 dark:text-amber-300">
                    <AlertTriangle size={18} />
                    <span>Action Required: {stats.alerts.waitingOver24hCount} application(s) pending review for over 24 hours</span>
                  </div>
                  <div className="mt-3 divide-y divide-amber-200/50 dark:divide-amber-800/30">
                    {stats.alerts.waitingOver24hItems.map((item) => (
                      <div key={item._id} className="py-2.5 flex items-center justify-between text-xs">
                        <div>
                          <strong className="text-[var(--ink)]">{item.firstName} {item.lastName}</strong> — {item.vehicle?.year} {item.vehicle?.make} {item.vehicle?.model} (${item.amountRequested?.toLocaleString()})
                          <span className="ml-2 text-[var(--muted)]">Received: {new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                        <button
                          onClick={async () => {
                            try {
                              await loanService.markLoanAsRead(item._id);
                            } catch (e) {}
                            router.push(`/${locale}/admin/loans/${item._id}`);
                          }}
                          className="rounded-xl bg-amber-600 text-white px-3 py-1 font-bold text-[11px] hover:bg-amber-700 transition"
                        >
                          Review Now
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Applications Feed (Latest 10) */}
              <div className="rounded-3xl border border-[var(--line)] bg-[var(--white)] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-black text-[var(--ink)]">Recent Applications Feed</h2>
                  <button
                    onClick={() => setActiveTab("loans")}
                    className="text-xs font-bold text-[var(--green)] hover:underline"
                  >
                    View All Applications &rarr;
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[var(--line)] text-[var(--muted)] font-bold">
                        <th className="pb-3">Applicant</th>
                        <th className="pb-3">Vehicle</th>
                        <th className="pb-3">Requested</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3">Date</th>
                        <th className="pb-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--line)]">
                      {stats.recentApplications?.map((app) => (
                        <tr key={app._id} className="hover:bg-[var(--paper)]/60 transition-colors">
                          <td className="py-3 font-bold text-[var(--ink)]">
                            <div className="flex items-center gap-1.5">
                              <span>{app.firstName} {app.lastName}</span>
                              {!app.isRead && (
                                <span className="rounded-md bg-red-600 text-white px-1.5 py-0.5 text-[9px] font-black animate-pulse">
                                  NEW
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-normal text-[var(--muted)]">{app.phone}</div>
                          </td>
                          <td className="py-3 text-[var(--muted)] font-medium">
                            {app.vehicle?.year} {app.vehicle?.make} {app.vehicle?.model}
                          </td>
                          <td className="py-3 font-bold text-[var(--green)]">
                            ${app.amountRequested?.toLocaleString()}
                          </td>
                          <td className="py-3">
                            <span
                              className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                app.status === "Approved"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : app.status === "Rejected"
                                  ? "bg-red-100 text-red-700"
                                  : app.status === "Pending Documents"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {app.status}
                            </span>
                          </td>
                          <td className="py-3 text-[var(--muted)]">
                            {new Date(app.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={async () => {
                                try {
                                  await loanService.markLoanAsRead(app._id);
                                } catch (e) {}
                                router.push(`/${locale}/admin/loans/${app._id}`);
                              }}
                              className="rounded-xl border border-[var(--line)] px-3 py-1 font-bold text-[11px] text-[var(--ink)] hover:bg-[var(--paper)] transition"
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: LOAN APPLICATION MANAGEMENT                             */}
          {/* ============================================================== */}
          {activeTab === "loans" && (
            <div className="space-y-4">
              {/* Header & Filters */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {["All", "New", "Under Review", "Approved", "Pending Documents", "Rejected"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setLoanStatusFilter(st)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                        loanStatusFilter === st
                          ? "bg-[var(--green)] text-white shadow-sm"
                          : "border border-[var(--line)] bg-[var(--white)] text-[var(--muted)] hover:text-[var(--ink)]"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                {/* Search Bar */}
                <div className="relative w-full md:w-72">
                  <Search size={15} className="absolute left-3.5 top-3 text-[var(--muted)]" />
                  <input
                    type="text"
                    placeholder="Search applicant or vehicle..."
                    value={loanSearchQuery}
                    onChange={(e) => setLoanSearchQuery(e.target.value)}
                    className="w-full rounded-2xl border border-[var(--line)] bg-[var(--white)] py-2 pl-9 pr-4 text-xs font-medium text-[var(--ink)] outline-none focus:border-[var(--green)]"
                  />
                </div>
              </div>

              {/* Loans Directory Table */}
              <div className="rounded-3xl border border-[var(--line)] bg-[var(--white)] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[var(--line)] bg-[var(--paper)] text-[var(--muted)] font-bold">
                        <th className="p-4">Applicant</th>
                        <th className="p-4">Contact</th>
                        <th className="p-4">Vehicle</th>
                        <th className="p-4">Requested</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Submitted</th>
                        <th className="p-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--line)]">
                      {loans.map((loan) => (
                        <tr key={loan._id} className="hover:bg-[var(--paper)]/60 transition">
                          <td className="p-4 font-bold text-[var(--ink)]">
                            <div className="flex items-center gap-2">
                              <span>{loan.firstName} {loan.lastName}</span>
                              {!loan.isRead && (
                                <span className="rounded-md bg-red-600 text-white px-1.5 py-0.5 text-[9px] font-black animate-pulse">
                                  NEW
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-[var(--muted)]">
                            <div>{loan.phone}</div>
                            <div className="text-[11px]">{loan.email}</div>
                          </td>
                          <td className="p-4 text-[var(--ink)] font-semibold">
                            {loan.vehicle?.year} {loan.vehicle?.make} {loan.vehicle?.model}
                            <div className="text-[11px] text-[var(--muted)] font-normal">
                              Est: ${loan.vehicle?.estimatedValue?.toLocaleString()}
                            </div>
                          </td>
                          <td className="p-4 font-bold text-[var(--green)]">
                            ${loan.amountRequested?.toLocaleString()}
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                loan.status === "Approved"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : loan.status === "Rejected"
                                  ? "bg-red-100 text-red-700"
                                  : loan.status === "Pending Documents"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {loan.status}
                            </span>
                          </td>
                          <td className="p-4 text-[var(--muted)]">
                            {new Date(loan.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={async () => {
                                try {
                                  await loanService.markLoanAsRead(loan._id);
                                } catch (e) {}
                                router.push(`/${locale}/admin/loans/${loan._id}`);
                              }}
                              className="rounded-xl bg-[var(--paper)] border border-[var(--line)] px-3 py-1.5 font-bold text-[11px] hover:bg-[var(--green)] hover:text-white transition"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                      {loans.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-8 text-center text-xs text-[var(--muted)]">
                            No loan applications match the specified criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: CUSTOMER MANAGEMENT                                     */}
          {/* ============================================================== */}
          {activeTab === "customers" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Search size={15} className="absolute left-3.5 top-3 text-[var(--muted)]" />
                  <input
                    type="text"
                    placeholder="Search customers by name, phone, email..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full rounded-2xl border border-[var(--line)] bg-[var(--white)] py-2 pl-9 pr-4 text-xs font-medium outline-none focus:border-[var(--green)]"
                  />
                </div>

                <button
                  onClick={() => setWalkInModal({ ...walkInModal, open: true })}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-2xl bg-[var(--green)] text-white px-4 py-2.5 text-xs font-bold hover:bg-[var(--green-dark)] shadow-sm transition"
                >
                  <UserPlus size={15} />
                  <span>New Walk-in Customer</span>
                </button>
              </div>

              {/* Customers Directory Table */}
              <div className="rounded-3xl border border-[var(--line)] bg-[var(--white)] overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--line)] bg-[var(--paper)] text-[var(--muted)] font-bold">
                      <th className="p-4">Customer Name</th>
                      <th className="p-4">Phone</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Applications</th>
                      <th className="p-4">Active Loan</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    {customers.map((c) => (
                      <tr key={c._id} className="hover:bg-[var(--paper)]/60 transition">
                        <td className="p-4 font-bold text-[var(--ink)]">{c.name}</td>
                        <td className="p-4 text-[var(--muted)]">{c.phone || "—"}</td>
                        <td className="p-4 text-[var(--muted)]">{c.email}</td>
                        <td className="p-4 font-semibold text-[var(--ink)]">{c.totalApplications}</td>
                        <td className="p-4">
                          {c.hasActiveLoan ? (
                            <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                              Active
                            </span>
                          ) : (
                            <span className="text-[var(--muted)] text-[11px]">None</span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={async () => {
                                const res = await loanService.getCustomerDetail(c._id);
                                if (res.success) setSelectedCustomer(res.data);
                              }}
                              className="rounded-xl border border-[var(--line)] px-3 py-1 font-bold text-[11px] hover:bg-[var(--green)] hover:text-white transition"
                            >
                              View 360
                            </button>
                            {isSuperAdmin && (
                              <button
                                onClick={() =>
                                  setDeleteCustomerModal({ open: true, customer: c, deleting: false })
                                }
                                className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 hover:bg-red-600 hover:text-white dark:bg-red-950/40 dark:border-red-800 text-red-600 px-2.5 py-1 font-bold text-[11px] transition"
                                title="Delete customer permanently"
                              >
                                <Trash2 size={12} />
                                <span>Delete</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 4: NOTIFICATIONS & COMMUNICATION LOG                       */}
          {/* ============================================================== */}
          {activeTab === "communications" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {["ALL", "EMAIL", "SMS"].map((ch) => (
                    <button
                      key={ch}
                      onClick={() => setCommChannelFilter(ch)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                        commChannelFilter === ch
                          ? "bg-[var(--green)] text-white shadow-sm"
                          : "border border-[var(--line)] bg-[var(--white)] text-[var(--muted)]"
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCommComposer({ ...commComposer, open: true })}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-2xl bg-[var(--ink)] text-white px-4 py-2.5 text-xs font-bold hover:bg-black transition shadow-sm"
                >
                  <Send size={14} />
                  <span>Send Custom Message</span>
                </button>
              </div>

              <div className="rounded-3xl border border-[var(--line)] bg-[var(--white)] overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--line)] bg-[var(--paper)] text-[var(--muted)] font-bold">
                      <th className="p-4">Channel</th>
                      <th className="p-4">Recipient</th>
                      <th className="p-4">Subject</th>
                      <th className="p-4">Message Preview</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    {commLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-[var(--paper)]/50">
                        <td className="p-4">
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              log.channel === "EMAIL" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {log.channel}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-[var(--ink)]">{log.recipient}</td>
                        <td className="p-4 font-semibold text-[var(--ink)]">{log.subject || "—"}</td>
                        <td className="p-4 max-w-xs truncate text-[var(--muted)]">{log.message}</td>
                        <td className="p-4">
                          <span className="text-[10px] text-[var(--muted)] font-bold">{log.type}</span>
                        </td>
                        <td className="p-4 text-[var(--muted)]">
                          {new Date(log.sentAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {commLogs.length === 0 && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-xs text-[var(--muted)]">
                          No communication records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 5: TEAM & ADMIN USERS (SUPER ADMIN ONLY)                   */}
          {/* ============================================================== */}
          {activeTab === "team" && isSuperAdmin && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-[var(--ink)]">Internal Staff & Access Delegation</h2>
                  <p className="text-xs text-[var(--muted)]">Super Admin exclusive control center</p>
                </div>
                <button
                  onClick={() => setNewStaffModal({ ...newStaffModal, open: true })}
                  className="flex items-center gap-1.5 rounded-2xl bg-[var(--green)] text-white px-4 py-2.5 text-xs font-bold hover:bg-[var(--green-dark)] shadow-sm transition"
                >
                  <Plus size={15} />
                  <span>Provision New Admin</span>
                </button>
              </div>

              <div className="rounded-3xl border border-[var(--line)] bg-[var(--white)] overflow-hidden shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[var(--line)] bg-[var(--paper)] text-[var(--muted)] font-bold">
                      <th className="p-4">Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Created Date</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)]">
                    {staffList.map((st) => (
                      <tr key={st._id}>
                        <td className="p-4 font-bold text-[var(--ink)]">{st.name}</td>
                        <td className="p-4 text-[var(--muted)]">{st.email}</td>
                        <td className="p-4">
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                              st.role === "SUPER_ADMIN" ? "bg-amber-100 text-amber-900" : "bg-slate-100 text-slate-800"
                            }`}
                          >
                            {st.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              st.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-700"
                            }`}
                          >
                            {st.status}
                          </span>
                        </td>
                        <td className="p-4 text-[var(--muted)]">
                          {new Date(st.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right">
                          {st.role !== "SUPER_ADMIN" && (
                            <button
                              onClick={async () => {
                                const newStatus = st.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
                                await loanService.updateUserStatus(st._id, newStatus);
                                loadDashboardData();
                              }}
                              className="rounded-xl border border-[var(--line)] px-3 py-1 font-bold text-[11px] text-red-600 hover:bg-red-50 transition"
                            >
                              {st.status === "ACTIVE" ? "Deactivate" : "Activate"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 6: BLOG POSTS MANAGEMENT (CMS)                             */}
          {/* ============================================================== */}
          {activeTab === "blogs" && (
            <div className="space-y-6">
              {/* Header bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-xl font-black text-[var(--ink)]">
                    Blog Posts & Content CMS
                  </h1>
                  <p className="text-xs text-[var(--muted)]">
                    Create, edit, and organize dynamic articles with cover images, live character count, and reorderable blocks.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setEditingBlog(null);
                    setBlogModalOpen(true);
                  }}
                  className="flex items-center gap-2 rounded-2xl bg-[#087a45] px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-[#087a45]/20 transition hover:bg-[#066237]"
                >
                  <Plus size={16} />
                  <span>New Blog Post</span>
                </button>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {["All", "PUBLISHED", "DRAFT"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setBlogStatusFilter(st)}
                      className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                        blogStatusFilter === st
                          ? "bg-[var(--ink)] text-white"
                          : "bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)]"
                      }`}
                    >
                      {st === "All" ? "All Posts" : st === "PUBLISHED" ? "Published" : "Drafts"}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
                  <input
                    type="text"
                    value={blogSearchQuery}
                    onChange={(e) => setBlogSearchQuery(e.target.value)}
                    placeholder="Search blogs..."
                    className="h-9 w-full rounded-xl border border-[var(--line)] bg-[var(--white)] pl-9 pr-3 text-xs outline-none focus:border-[#087a45]"
                  />
                </div>
              </div>

              {/* Blog Posts Grid */}
              {blogs.length === 0 ? (
                <div className="rounded-3xl border border-[var(--line)] bg-[var(--white)] py-16 text-center">
                  <BookOpen size={40} className="mx-auto text-[var(--muted)]/40" />
                  <h3 className="mt-3 text-sm font-bold text-[var(--ink)]">No blog posts found</h3>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    Get started by clicking &quot;New Blog Post&quot; to publish your first article.
                  </p>
                  <button
                    onClick={() => {
                      setEditingBlog(null);
                      setBlogModalOpen(true);
                    }}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#087a45] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#066237]"
                  >
                    <Plus size={14} /> Create Post
                  </button>
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {blogs.map((b) => (
                    <div
                      key={b._id}
                      className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--white)] shadow-sm transition hover:shadow-lg"
                    >
                      <div>
                        {/* Cover Image */}
                        <div className="relative h-44 w-full overflow-hidden bg-[var(--paper)]">
                          <img
                            src={getDocumentUrl(b.coverImage)}
                            alt={b.title}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                          <div className="absolute left-3 top-3">
                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider backdrop-blur-md ${
                                b.status === "PUBLISHED"
                                  ? "bg-emerald-600/90 text-white"
                                  : "bg-amber-600/90 text-white"
                              }`}
                            >
                              {b.status}
                            </span>
                          </div>
                          <div className="absolute right-3 top-3">
                            <span className="rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                              {b.category}
                            </span>
                          </div>
                        </div>

                        {/* Card Content */}
                        <div className="p-5">
                          <div className="flex items-center justify-between text-[11px] text-[var(--muted)]">
                            <span>{new Date(b.createdAt).toLocaleDateString()}</span>
                            <span>{b.readTime || "4 min read"}</span>
                          </div>

                          <h3 className="mt-2 text-base font-black leading-tight text-[var(--ink)] line-clamp-2">
                            {b.title}
                          </h3>

                          {/* Truncated description with character awareness */}
                          <p className="mt-2 text-xs leading-relaxed text-[var(--muted)] line-clamp-3">
                            {b.description}
                          </p>

                          <div className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-[var(--muted)]">
                            <span className="rounded-md bg-[#087a45]/10 px-2 py-0.5 text-[10px] font-bold text-[#087a45]">
                              {b.blocks?.length || 0} Dynamic Blocks
                            </span>
                            <span>•</span>
                            <span>{b.views || 0} views</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Action Footer */}
                      <div className="flex items-center justify-between border-t border-[var(--line)] bg-[var(--paper)]/40 px-5 py-3 text-xs">
                        <Link
                          href={`/${locale}/blog/${b.slug}`}
                          target="_blank"
                          className="flex items-center gap-1 font-bold text-[var(--muted)] hover:text-[#087a45]"
                        >
                          <span>Live Post</span>
                          <ArrowUpRight size={14} />
                        </Link>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setEditingBlog(b);
                              setBlogModalOpen(true);
                            }}
                            className="flex items-center gap-1 rounded-lg border border-[var(--line)] bg-white px-2.5 py-1 font-bold text-[var(--ink)] transition hover:bg-[#087a45] hover:text-white"
                          >
                            <Edit3 size={13} />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={async () => {
                              if (confirm(`Are you sure you want to delete "${b.title}"?`)) {
                                try {
                                  await loanService.deleteBlog(b._id);
                                  loadBlogs();
                                } catch (err) {
                                  alert(err.message || "Failed to delete blog post");
                                }
                              }
                            }}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-200 text-red-500 transition hover:bg-red-600 hover:text-white"
                            title="Delete Blog"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ============================================================== */}
      {/* SLIDE-OVER DETAIL MODAL FOR LOAN APPLICATION                    */}
      {/* ============================================================== */}
      {isDetailOpen && selectedLoan && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-[var(--white)] h-full overflow-y-auto p-6 sm:p-8 flex flex-col shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[var(--line)]">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-[var(--muted)] uppercase">
                  Application #{selectedLoan._id.slice(-6).toUpperCase()}
                </span>
                <h2 className="text-xl font-black text-[var(--ink)]">
                  {selectedLoan.firstName} {selectedLoan.lastName}
                </h2>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full bg-[var(--paper)] text-[var(--muted)] hover:text-[var(--ink)]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Action Decision Buttons Bar */}
            <div className="mt-4 p-3 rounded-2xl bg-[var(--paper)] border border-[var(--line)] flex flex-wrap gap-2 items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[var(--muted)]">Status:</span>
                <span className="rounded-full bg-[var(--green)]/15 text-[var(--green)] px-2.5 py-0.5 text-xs font-bold">
                  {selectedLoan.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setApprovalModal({ ...approvalModal, open: true })}
                  className="rounded-xl bg-[var(--green)] px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[var(--green-dark)] transition"
                >
                  Approve...
                </button>
                <button
                  onClick={() => setRejectModal({ ...rejectModal, open: true })}
                  className="rounded-xl bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 transition"
                >
                  Reject...
                </button>
                <button
                  onClick={() => setDocRequestModal({ ...docRequestModal, open: true })}
                  className="rounded-xl border border-[var(--line)] bg-[var(--white)] px-3 py-1.5 text-xs font-bold text-[var(--ink)] hover:bg-[var(--paper)] transition"
                >
                  Request Docs...
                </button>
                <button
                  onClick={handleMarkUnderReview}
                  className="rounded-xl border border-[var(--line)] bg-[var(--white)] px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 transition"
                >
                  Mark Under Review
                </button>
              </div>
            </div>

            {/* Application Data Grid */}
            <div className="mt-6 space-y-6 flex-1 text-xs">
              {/* Vehicle & Loan Details */}
              <div className="grid grid-cols-2 gap-4 rounded-2xl border border-[var(--line)] p-4 bg-[var(--paper)]/40">
                <div>
                  <span className="font-bold text-[var(--muted)]">Vehicle</span>
                  <p className="text-sm font-black text-[var(--ink)]">
                    {selectedLoan.vehicle?.year} {selectedLoan.vehicle?.make} {selectedLoan.vehicle?.model}
                  </p>
                  <p className="text-[11px] text-[var(--muted)]">
                    Est. Value: ${selectedLoan.vehicle?.estimatedValue?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="font-bold text-[var(--muted)]">Loan Requested</span>
                  <p className="text-sm font-black text-[var(--green)]">
                    ${selectedLoan.amountRequested?.toLocaleString()}
                  </p>
                  <p className="text-[11px] text-[var(--muted)]">Urgency: {selectedLoan.urgency}</p>
                </div>
                <div>
                  <span className="font-bold text-[var(--muted)]">Phone & Email</span>
                  <p className="font-bold text-[var(--ink)]">{selectedLoan.phone}</p>
                  <p className="text-[11px] text-[var(--muted)]">{selectedLoan.email}</p>
                </div>
                <div>
                  <span className="font-bold text-[var(--muted)]">Employment & Zip</span>
                  <p className="font-semibold text-[var(--ink)]">{selectedLoan.employmentStatus || "Not specified"}</p>
                  <p className="text-[11px] text-[var(--muted)]">{selectedLoan.zipCode || "—"}</p>
                </div>
              </div>

              {/* Approved Terms Banner (if Approved) */}
              {selectedLoan.approvedTerms?.loanAmount && (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-50 p-4 text-emerald-950">
                  <h3 className="font-bold text-sm text-[var(--green)]">Approved Loan Agreement</h3>
                  <div className="grid grid-cols-3 gap-2 mt-2 font-semibold">
                    <div>
                      <span className="text-[10px] text-[var(--muted)]">Amount</span>
                      <p className="font-bold">${selectedLoan.approvedTerms.loanAmount?.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--muted)]">Interest</span>
                      <p className="font-bold">{selectedLoan.approvedTerms.interestRate}%</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-[var(--muted)]">Monthly Payment</span>
                      <p className="font-bold">${selectedLoan.approvedTerms.monthlyPayment}/mo</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Uploaded Documents with In-Browser View & Accept/Reject Actions */}
              <div>
                <h3 className="text-sm font-black text-[var(--ink)] mb-2">
                  Uploaded Documents ({selectedLoan.documents?.length || 0})
                </h3>
                <div className="space-y-2">
                  {selectedLoan.documents?.map((doc) => (
                    <div
                      key={doc._id}
                      className="flex items-center justify-between p-3 rounded-2xl border border-[var(--line)] bg-[var(--white)]"
                    >
                      <div>
                        <strong className="text-[var(--ink)]">{doc.name}</strong>
                        <div className="text-[11px] text-[var(--muted)]">
                          {doc.originalName} • {(doc.size / 1024).toFixed(1)} KB • Status:{" "}
                          <span className="font-bold text-[var(--green)]">{doc.status}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={loanService.getDocumentUrl(doc.path)}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg border border-[var(--line)] p-1.5 text-[var(--muted)] hover:text-[var(--ink)]"
                          title="View In Browser"
                        >
                          <Eye size={15} />
                        </a>
                        <button
                          onClick={() => handleReviewDoc(doc._id, "Accepted")}
                          className="rounded-lg bg-emerald-100 text-emerald-800 px-2 py-1 font-bold text-[10px] hover:bg-emerald-200"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleReviewDoc(doc._id, "Rejected")}
                          className="rounded-lg bg-red-100 text-red-700 px-2 py-1 font-bold text-[10px] hover:bg-red-200"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                  {(!selectedLoan.documents || selectedLoan.documents.length === 0) && (
                    <p className="text-xs text-[var(--muted)] italic">No documents uploaded by borrower yet.</p>
                  )}
                </div>
              </div>

              {/* Internal Staff Notes & Add Note Input */}
              <div>
                <h3 className="text-sm font-black text-[var(--ink)] mb-2">Internal Staff Notes</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
                  {selectedLoan.internalNotes?.map((n, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-[var(--paper)] border border-[var(--line)]">
                      <p className="text-[var(--ink)]">{n.note}</p>
                      <span className="text-[10px] text-[var(--muted)]">
                        — {n.authorName} on {new Date(n.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                  {(!selectedLoan.internalNotes || selectedLoan.internalNotes.length === 0) && (
                    <p className="text-xs text-[var(--muted)] italic">No notes added.</p>
                  )}
                </div>

                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add internal note..."
                    value={newNoteInput}
                    onChange={(e) => setNewNoteInput(e.target.value)}
                    className="flex-1 rounded-xl border border-[var(--line)] px-3 py-2 text-xs outline-none focus:border-[var(--green)]"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-[var(--green)] text-white px-4 py-2 text-xs font-bold hover:bg-[var(--green-dark)]"
                  >
                    Post Note
                  </button>
                </form>
              </div>

              {/* Audit Trail History */}
              <div>
                <h3 className="text-sm font-black text-[var(--ink)] mb-2">Audit Trail & Status History</h3>
                <div className="divide-y divide-[var(--line)] border border-[var(--line)] rounded-2xl p-2 bg-[var(--paper)]/30 max-h-48 overflow-y-auto">
                  {selectedLoan.statusHistory?.map((h, i) => (
                    <div key={i} className="py-2 text-[11px]">
                      <span className="font-bold text-[var(--ink)]">{h.toStatus}</span>
                      <span className="text-[var(--muted)] ml-2">by {h.changedByName}</span>
                      <span className="text-[var(--muted)] float-right">{new Date(h.changedAt).toLocaleString()}</span>
                      {h.note && <div className="text-[var(--muted)] mt-0.5">{h.note}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* APPROVAL TERMS INPUT MODAL                                     */}
      {/* ============================================================== */}
      {approvalModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-3xl bg-[var(--white)] p-6 border border-[var(--line)] shadow-2xl">
            <h3 className="text-lg font-black text-[var(--ink)]">Approve Loan Terms</h3>
            <p className="text-xs text-[var(--muted)] mt-1">
              Enter approved loan parameters. The system will calculate payments and notify the borrower.
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-[var(--muted)] block mb-1">Approved Loan Amount ($)</label>
                <input
                  type="number"
                  value={approvalModal.loanAmount}
                  onChange={(e) => setApprovalModal({ ...approvalModal, loanAmount: e.target.value })}
                  placeholder={selectedLoan?.amountRequested}
                  className="w-full rounded-xl border border-[var(--line)] p-2.5 font-bold outline-none focus:border-[var(--green)]"
                />
              </div>

              <div>
                <label className="font-bold text-[var(--muted)] block mb-1">Annual Interest Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={approvalModal.interestRate}
                  onChange={(e) => setApprovalModal({ ...approvalModal, interestRate: e.target.value })}
                  className="w-full rounded-xl border border-[var(--line)] p-2.5 font-bold outline-none focus:border-[var(--green)]"
                />
              </div>

              <div>
                <label className="font-bold text-[var(--muted)] block mb-1">Repayment Term (Months)</label>
                <input
                  type="number"
                  value={approvalModal.repaymentMonths}
                  onChange={(e) => setApprovalModal({ ...approvalModal, repaymentMonths: e.target.value })}
                  className="w-full rounded-xl border border-[var(--line)] p-2.5 font-bold outline-none focus:border-[var(--green)]"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setApprovalModal({ ...approvalModal, open: false })}
                className="rounded-xl border border-[var(--line)] px-4 py-2 text-xs font-bold text-[var(--muted)]"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveLoan}
                className="rounded-xl bg-[var(--green)] px-4 py-2 text-xs font-bold text-white hover:bg-[var(--green-dark)] shadow-sm"
              >
                Confirm Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* REJECTION REASON DROPDOWN MODAL                                */}
      {/* ============================================================== */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-3xl bg-[var(--white)] p-6 border border-[var(--line)] shadow-2xl">
            <h3 className="text-lg font-black text-red-600">Reject Application</h3>
            <p className="text-xs text-[var(--muted)] mt-1">Select the reason for rejection to notify the customer:</p>

            <select
              value={rejectModal.reason}
              onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
              className="mt-4 w-full rounded-xl border border-[var(--line)] p-2.5 text-xs font-medium outline-none focus:border-red-500"
            >
              <option value="Vehicle title has existing lien or is not clean">Vehicle title has existing lien</option>
              <option value="Vehicle market value is insufficient for requested amount">Insufficient vehicle value</option>
              <option value="Unable to verify income or ability to repay">Unable to verify income</option>
              <option value="Vehicle condition or mileage does not meet lending criteria">Vehicle condition / high mileage</option>
              <option value="Incomplete documentation after multiple requests">Incomplete documentation</option>
            </select>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setRejectModal({ ...rejectModal, open: false })}
                className="rounded-xl border border-[var(--line)] px-4 py-2 text-xs font-bold text-[var(--muted)]"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectLoan}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* REQUEST DOCUMENTS MODAL                                        */}
      {/* ============================================================== */}
      {docRequestModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-3xl bg-[var(--white)] p-6 border border-[var(--line)] shadow-2xl">
            <h3 className="text-lg font-black text-[var(--ink)]">Request Documents</h3>
            <p className="text-xs text-[var(--muted)] mt-1">Select documents required from the borrower:</p>

            <div className="mt-4 space-y-2 text-xs">
              {[
                "Vehicle Title (Pink Slip)",
                "Government Issued ID / Driver License",
                "Proof of Income (Pay Stubs / Bank Statement)",
                "Proof of Residence (Utility Bill)",
                "Vehicle Registration",
              ].map((d) => (
                <label key={d} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={docRequestModal.selectedDocs.includes(d)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setDocRequestModal({
                          ...docRequestModal,
                          selectedDocs: [...docRequestModal.selectedDocs, d],
                        });
                      } else {
                        setDocRequestModal({
                          ...docRequestModal,
                          selectedDocs: docRequestModal.selectedDocs.filter((x) => x !== d),
                        });
                      }
                    }}
                    className="h-4 w-4 rounded border-[var(--line)] text-[var(--green)] focus:ring-[var(--green)]"
                  />
                  <span>{d}</span>
                </label>
              ))}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setDocRequestModal({ ...docRequestModal, open: false })}
                className="rounded-xl border border-[var(--line)] px-4 py-2 text-xs font-bold text-[var(--muted)]"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestDocs}
                className="rounded-xl bg-[var(--green)] px-4 py-2 text-xs font-bold text-white hover:bg-[var(--green-dark)]"
              >
                Send Request to Customer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* WALK-IN CUSTOMER CREATION MODAL                                */}
      {/* ============================================================== */}
      {walkInModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-3xl bg-[var(--white)] p-6 border border-[var(--line)] shadow-2xl">
            <h3 className="text-lg font-black text-[var(--ink)]">New Walk-In Customer</h3>
            <form onSubmit={handleCreateWalkIn} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-[var(--muted)] block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={walkInModal.name}
                  onChange={(e) => setWalkInModal({ ...walkInModal, name: e.target.value })}
                  className="w-full rounded-xl border border-[var(--line)] p-2.5 outline-none focus:border-[var(--green)]"
                />
              </div>
              <div>
                <label className="font-bold text-[var(--muted)] block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={walkInModal.email}
                  onChange={(e) => setWalkInModal({ ...walkInModal, email: e.target.value })}
                  className="w-full rounded-xl border border-[var(--line)] p-2.5 outline-none focus:border-[var(--green)]"
                />
              </div>
              <div>
                <label className="font-bold text-[var(--muted)] block mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={walkInModal.phone}
                  onChange={(e) => setWalkInModal({ ...walkInModal, phone: e.target.value })}
                  className="w-full rounded-xl border border-[var(--line)] p-2.5 outline-none focus:border-[var(--green)]"
                />
              </div>
              <div>
                <label className="font-bold text-[var(--muted)] block mb-1">Office Notes</label>
                <textarea
                  rows={2}
                  value={walkInModal.notes}
                  onChange={(e) => setWalkInModal({ ...walkInModal, notes: e.target.value })}
                  placeholder="In-person walk-in notes..."
                  className="w-full rounded-xl border border-[var(--line)] p-2.5 outline-none focus:border-[var(--green)]"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setWalkInModal({ ...walkInModal, open: false })}
                  className="rounded-xl border border-[var(--line)] px-4 py-2 font-bold text-[var(--muted)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[var(--green)] px-4 py-2 font-bold text-white hover:bg-[var(--green-dark)]"
                >
                  Create Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SEND CUSTOM MESSAGE COMPOSER MODAL                             */}
      {/* ============================================================== */}
      {commComposer.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-3xl bg-[var(--white)] p-6 border border-[var(--line)] shadow-2xl">
            <h3 className="text-lg font-black text-[var(--ink)]">Compose Custom Message</h3>
            <form onSubmit={handleSendCustomMessage} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCommComposer({ ...commComposer, channel: "EMAIL" })}
                  className={`rounded-xl py-2 font-bold ${
                    commComposer.channel === "EMAIL"
                      ? "bg-[var(--green)] text-white"
                      : "border border-[var(--line)] text-[var(--muted)]"
                  }`}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setCommComposer({ ...commComposer, channel: "SMS" })}
                  className={`rounded-xl py-2 font-bold ${
                    commComposer.channel === "SMS"
                      ? "bg-[var(--green)] text-white"
                      : "border border-[var(--line)] text-[var(--muted)]"
                  }`}
                >
                  SMS
                </button>
              </div>

              <div>
                <label className="font-bold text-[var(--muted)] block mb-1">
                  Recipient ({commComposer.channel === "EMAIL" ? "Email Address" : "Phone Number"}) *
                </label>
                <input
                  type="text"
                  required
                  placeholder={commComposer.channel === "EMAIL" ? "customer@example.com" : "+1 (702) 555-0123"}
                  value={commComposer.recipient}
                  onChange={(e) => setCommComposer({ ...commComposer, recipient: e.target.value })}
                  className="w-full rounded-xl border border-[var(--line)] p-2.5 outline-none focus:border-[var(--green)]"
                />
              </div>

              {commComposer.channel === "EMAIL" && (
                <div>
                  <label className="font-bold text-[var(--muted)] block mb-1">Subject</label>
                  <input
                    type="text"
                    value={commComposer.subject}
                    onChange={(e) => setCommComposer({ ...commComposer, subject: e.target.value })}
                    placeholder="Notice regarding your Title Bros loan..."
                    className="w-full rounded-xl border border-[var(--line)] p-2.5 outline-none focus:border-[var(--green)]"
                  />
                </div>
              )}

              <div>
                <label className="font-bold text-[var(--muted)] block mb-1">Message Body *</label>
                <textarea
                  rows={4}
                  required
                  value={commComposer.message}
                  onChange={(e) => setCommComposer({ ...commComposer, message: e.target.value })}
                  placeholder="Type your message here..."
                  className="w-full rounded-xl border border-[var(--line)] p-2.5 outline-none focus:border-[var(--green)]"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCommComposer({ ...commComposer, open: false })}
                  className="rounded-xl border border-[var(--line)] px-4 py-2 font-bold text-[var(--muted)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[var(--green)] px-4 py-2 font-bold text-white hover:bg-[var(--green-dark)]"
                >
                  Send & Log Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PROVISION NEW ADMIN MODAL (SUPER ADMIN ONLY)                   */}
      {/* ============================================================== */}
      {newStaffModal.open && isSuperAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-3xl bg-[var(--white)] p-6 border border-[var(--line)] shadow-2xl">
            <h3 className="text-lg font-black text-[var(--ink)]">Provision Team Member</h3>
            <form onSubmit={handleCreateAdmin} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-[var(--muted)] block mb-1">Staff Full Name *</label>
                <input
                  type="text"
                  required
                  value={newStaffModal.name}
                  onChange={(e) => setNewStaffModal({ ...newStaffModal, name: e.target.value })}
                  className="w-full rounded-xl border border-[var(--line)] p-2.5 outline-none focus:border-[var(--green)]"
                />
              </div>
              <div>
                <label className="font-bold text-[var(--muted)] block mb-1">Staff Email *</label>
                <input
                  type="email"
                  required
                  value={newStaffModal.email}
                  onChange={(e) => setNewStaffModal({ ...newStaffModal, email: e.target.value })}
                  className="w-full rounded-xl border border-[var(--line)] p-2.5 outline-none focus:border-[var(--green)]"
                />
              </div>
              <div>
                <label className="font-bold text-[var(--muted)] block mb-1">Temporary Password *</label>
                <input
                  type="password"
                  required
                  value={newStaffModal.password}
                  onChange={(e) => setNewStaffModal({ ...newStaffModal, password: e.target.value })}
                  className="w-full rounded-xl border border-[var(--line)] p-2.5 outline-none focus:border-[var(--green)]"
                />
              </div>
              <div>
                <label className="font-bold text-[var(--muted)] block mb-1">Assigned Role</label>
                <select
                  value={newStaffModal.role}
                  onChange={(e) => setNewStaffModal({ ...newStaffModal, role: e.target.value })}
                  className="w-full rounded-xl border border-[var(--line)] p-2.5 outline-none focus:border-[var(--green)]"
                >
                  <option value="ADMIN">Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewStaffModal({ ...newStaffModal, open: false })}
                  className="rounded-xl border border-[var(--line)] px-4 py-2 font-bold text-[var(--muted)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[var(--green)] px-4 py-2 font-bold text-white hover:bg-[var(--green-dark)]"
                >
                  Provision Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* DELETE CUSTOMER CONFIRMATION MODAL (SUPER ADMIN ONLY)          */}
      {/* ============================================================== */}
      {deleteCustomerModal.open && isSuperAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-3xl bg-[var(--white)] p-6 border border-red-500/20 shadow-2xl">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-red-100 dark:bg-red-950/50">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-base font-black text-[var(--ink)]">Delete Customer Permanently</h3>
                <p className="text-xs text-[var(--muted)]">Super Admin Action</p>
              </div>
            </div>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Are you sure you want to permanently delete customer{" "}
              <strong className="text-[var(--ink)]">{deleteCustomerModal.customer?.name}</strong> (
              {deleteCustomerModal.customer?.email})?
            </p>
            <div className="mt-3 rounded-2xl bg-red-50 dark:bg-red-950/30 p-3 text-[11px] text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50 space-y-1">
              <p className="font-bold">⚠️ Warning: This action cannot be undone.</p>
              <ul className="list-disc list-inside space-y-0.5 text-[10px]">
                <li>Customer account and login sessions will be terminated.</li>
                <li>All associated loan applications and terms will be deleted.</li>
                <li>All uploaded documents on the server disk will be erased.</li>
                <li>All communication and audit logs will be purged.</li>
              </ul>
            </div>
            <div className="mt-6 flex justify-end gap-2 text-xs">
              <button
                type="button"
                disabled={deleteCustomerModal.deleting}
                onClick={() => setDeleteCustomerModal({ open: false, customer: null, deleting: false })}
                className="rounded-xl border border-[var(--line)] px-4 py-2 font-bold text-[var(--muted)] hover:bg-[var(--paper)] transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteCustomerModal.deleting}
                onClick={handleDeleteCustomer}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700 transition disabled:opacity-50"
              >
                {deleteCustomerModal.deleting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={13} />
                    <span>Confirm Permanent Deletion</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* BLOG POST BUILDER / CMS MODAL                                  */}
      {/* ============================================================== */}
      <BlogBuilderModal
        isOpen={blogModalOpen}
        initialData={editingBlog}
        onClose={() => {
          setBlogModalOpen(false);
          setEditingBlog(null);
        }}
        onSaved={() => {
          setBlogModalOpen(false);
          setEditingBlog(null);
          loadBlogs();
        }}
      />
    </div>
  );
}
