"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  LoaderCircle,
  RefreshCw,
  Wallet,
  Printer,
} from "lucide-react";
import { API_BASE_URL } from "@/services/loanService";

async function paymentRequest(endpoint, options = {}) {
  const token = typeof window !== "undefined"
    ? localStorage.getItem("titlebros_auth_token") || localStorage.getItem("titlebros_admin_token") || localStorage.getItem("titlebros_customer_token")
    : null;
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(json.message || `Request failed (${response.status})`);
  return json;
}

const money = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const dateLabel = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
};

const todayInputValue = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

const initialPaymentForm = () => ({
  installmentId: "",
  amountReceived: "",
  paymentDate: todayInputValue(),
  paymentMethod: "cash",
  notes: "",
});

const escapeHtml = (value) => String(value ?? "—").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[char]));

export default function RepaymentLedgerPanel({ loanId, loanStatus }) {
  const [ledger, setLedger] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [form, setForm] = useState(initialPaymentForm);

  const loadLedger = useCallback(async (quiet = false) => {
    if (!loanId) return;
    if (quiet) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const response = await paymentRequest(`/payments/loan/${loanId}/ledger`);
      if (!response?.success || !response?.data) {
        throw new Error(response?.message || "Unable to load the loan ledger.");
      }
      setLedger(response.data);
    } catch (err) {
      setError(err?.message || "Unable to load repayment details.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loanId]);

  useEffect(() => {
    loadLedger();
  }, [loadLedger]);

  const installments = useMemo(() => {
    return [...(ledger?.installments || [])].sort(
      (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
    );
  }, [ledger]);

  const selectedInstallment = installments.find(
    (item) => String(item._id) === String(form.installmentId)
  );

  const printReceipt = (payment) => {
    const receiptWindow = window.open("", "_blank", "width=820,height=900");
    if (!receiptWindow) {
      setError("Receipt window was blocked. Allow pop-ups and try again.");
      return;
    }

    const method = String(payment.paymentMethod || "—").replace(/_/g, " ");
    const receiptNumber = payment.receiptNumber || payment._id || "—";
    const receivedBy = payment.receivedBy?.name || payment.receivedByName || "—";
    const loan = ledger?.loan || {};
    const person = loan.borrower || loan.customer || loan.applicant || loan.user || {};
    const personal = loan.personalInformation || loan.personalInfo || {};
    const customerName = [
      person.firstName || personal.firstName || loan.firstName,
      person.lastName || personal.lastName || loan.lastName,
    ].filter(Boolean).join(" ") || person.fullName || person.name || personal.fullName || loan.customerName || "Not provided";
    const loanTypeRaw = loan.loanType || loan.type || loan.loanPurpose || loan.productType || "Loan";
    const loanType = String(loanTypeRaw).replace(/[-_]/g, " ");
    const paymentInstallmentId = payment.installmentId?._id || payment.installmentId || payment.repaymentScheduleInstallment;
    const paymentInstallment = installments.find((item) => String(item._id) === String(paymentInstallmentId));
    const installmentLabel = paymentInstallment?.installmentNumber
      ? `#${paymentInstallment.installmentNumber}`
      : payment.installmentNumber ? `#${payment.installmentNumber}` : "Not linked";
    const currentBalance = summary.remainingBalance ?? summary.remainingAmount ?? loan.remainingBalance ?? loan.balanceRemaining;
    const balanceLabel = currentBalance === undefined || currentBalance === null ? "Not available" : money(currentBalance);
    const html = `<!doctype html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>Payment Receipt ${escapeHtml(receiptNumber)}</title>
      <style>
        *{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;color:#17211d;margin:0;padding:36px;background:#f3f5f4}
        .receipt{max-width:720px;margin:0 auto;background:#fff;border:1px solid #dce4df;border-radius:16px;padding:36px}
        .brand{font-size:25px;font-weight:800;letter-spacing:1px;color:#166534}.sub{color:#64716a;font-size:12px;margin-top:5px}
        .heading{display:flex;justify-content:space-between;gap:20px;border-bottom:2px solid #166534;padding-bottom:22px}
        h1{font-size:21px;margin:26px 0 8px}.muted{color:#64716a;font-size:12px}.amount{font-size:34px;font-weight:800;margin:10px 0 22px;color:#166534}
        .section-title{margin:24px 0 4px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#166534;font-weight:800}
        table{width:100%;border-collapse:collapse;margin-top:12px}td{padding:12px 0;border-bottom:1px solid #e4e9e6;font-size:13px;vertical-align:top}td:first-child{color:#64716a;width:44%}td:last-child{text-align:right;font-weight:700;overflow-wrap:anywhere;text-transform:capitalize}
        .status{display:inline-block;margin-top:20px;padding:8px 12px;background:#dcfce7;color:#166534;border-radius:20px;font-weight:700;font-size:12px;text-transform:capitalize}
        .signature{margin-top:36px;display:grid;grid-template-columns:1fr 1fr;gap:40px}.signature div{border-top:1px solid #9ca9a1;padding-top:8px;color:#64716a;font-size:11px}
        footer{border-top:1px solid #e4e9e6;margin-top:30px;padding-top:16px;color:#64716a;font-size:11px;line-height:1.5}
        .print{margin:20px auto 0;display:block;border:0;border-radius:8px;background:#166534;color:white;padding:12px 18px;font-weight:700;cursor:pointer}
        @page{size:auto;margin:14mm}@media print{body{background:white;padding:0}.receipt{max-width:none;border:0;border-radius:0;padding:0}.print{display:none}.signature{break-inside:avoid}}
        @media(max-width:560px){body{padding:12px}.receipt{padding:22px}.heading{gap:10px}.brand{font-size:20px}.amount{font-size:30px}}
      </style></head><body><main class="receipt">
      <div class="heading"><div><div class="brand">TITLE BROS</div><div class="sub">Official payment receipt</div></div><div style="text-align:right"><div class="muted">RECEIPT NUMBER</div><strong>${escapeHtml(receiptNumber)}</strong></div></div>
      <h1>Payment received</h1><div class="muted">Thank you. Please keep this receipt for your records.</div><div class="amount">${escapeHtml(money(payment.amountReceived))}</div>
      <div class="section-title">Customer & loan details</div><table>
      <tr><td>Customer name</td><td style="text-transform:none">${escapeHtml(customerName)}</td></tr>
      <tr><td>Loan application ID</td><td style="text-transform:none">${escapeHtml(loanId)}</td></tr>
      <tr><td>Loan type</td><td>${escapeHtml(loanType)}</td></tr>
      <tr><td>Installment number</td><td style="text-transform:none">${escapeHtml(installmentLabel)}</td></tr>
      <tr><td>Current remaining balance</td><td style="text-transform:none">${escapeHtml(balanceLabel)}</td></tr></table>
      <div class="section-title">Payment details</div><table>
      <tr><td>Payment date</td><td style="text-transform:none">${escapeHtml(dateLabel(payment.paymentDate))}</td></tr>
      <tr><td>Payment method</td><td>${escapeHtml(method)}</td></tr>
      <tr><td>Payment status</td><td>${escapeHtml(payment.status || "completed")}</td></tr>
      <tr><td>Received by</td><td style="text-transform:none">${escapeHtml(receivedBy)}</td></tr>
      <tr><td>Payment reference</td><td style="text-transform:none">${escapeHtml(payment._id || "—")}</td></tr></table>
      <div class="status">${escapeHtml(payment.status || "completed")}</div>
      <div class="signature"><div>Customer acknowledgement</div><div>Authorized Title Bros representative</div></div>
      <footer>This receipt records the payment shown above. The remaining balance is the current balance when this receipt is generated and may reflect later payments. Please contact Title Bros if any information appears incorrect.</footer>
      <button class="print" onclick="window.print()">Print / Save as PDF</button></main></body></html>`;
    receiptWindow.document.open();
    receiptWindow.document.write(html);
    receiptWindow.document.close();
  };

  const payableInstallments = installments.filter((item) => {
    const remaining = Number(item.remainingAmount || 0) +
      Math.max(0, Number(item.lateFee || 0) - Number(item.lateFeePaid || 0));
    return item.status !== "paid" && remaining > 0;
  });

  useEffect(() => {
    if (!payableInstallments.length) {
      setForm((prev) => ({ ...prev, installmentId: "", amountReceived: "" }));
      return;
    }
    const currentStillPayable = payableInstallments.some(
      (item) => String(item._id) === String(form.installmentId)
    );
    if (!currentStillPayable) {
      const first = payableInstallments[0];
      const balance = Number(first.remainingAmount || 0) +
        Math.max(0, Number(first.lateFee || 0) - Number(first.lateFeePaid || 0));
      setForm((prev) => ({
        ...prev,
        installmentId: String(first._id),
        amountReceived: balance.toFixed(2),
      }));
    }
  }, [ledger, form.installmentId]); // payable installments are derived from ledger

  const summary = ledger?.summary || {};
  const progress = Math.max(0, Math.min(100, Number(summary.paymentProgress || 0)));
  const canRecordPayment = ["approved", "active", "overdue", "in repayment", "in_repayment"].includes(
    String(loanStatus || ledger?.loan?.status || "").toLowerCase().replace(/-/g, " ")
  );

  const handleRecordPayment = async (event) => {
    event.preventDefault();
    if (!loanId || !selectedInstallment || saving) return;

    const amount = Number(form.amountReceived);
    const remaining = Number(selectedInstallment.remainingAmount || 0) +
      Math.max(0, Number(selectedInstallment.lateFee || 0) - Number(selectedInstallment.lateFeePaid || 0));

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a payment amount greater than $0.");
      return;
    }
    if (amount > remaining + 0.001) {
      setError(`Payment cannot exceed the selected installment balance of ${money(remaining)}.`);
      return;
    }
    if (!form.paymentDate || Number.isNaN(new Date(form.paymentDate).getTime())) {
      setError("Choose a valid payment date.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const response = await paymentRequest("/payments", {
        method: "POST",
        body: JSON.stringify({
          loanApplication: loanId,
          // The controller resolves the schedule from loanApplication and saves
          // schedule._id to Payment, so repaymentSchedule is not required here.
          installmentId: form.installmentId,
          amountReceived: amount,
          paymentDate: form.paymentDate,
          paymentMethod: form.paymentMethod,
          notes: form.notes.trim(),
        }),
      });
      if (response?.success === false || !response?.data?.payment) {
        throw new Error(response?.message || "Payment could not be recorded.");
      }
      const receiptNumber = response.data.payment.receiptNumber;
      setSuccess(
        receiptNumber
          ? `Payment recorded successfully. Receipt: ${receiptNumber}. The installment and loan balance have been updated.`
          : "Payment recorded successfully. The installment and loan balance have been updated."
      );
      setForm(initialPaymentForm());
      setShowPaymentForm(false);
      await loadLedger(true);
    } catch (err) {
      setError(err?.message || "Payment could not be recorded.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="rounded-3xl border border-[var(--line)] bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--muted)]">
          <LoaderCircle className="animate-spin" size={18} /> Loading repayment schedule and loan ledger…
        </div>
      </section>
    );
  }

  if (error && !ledger) {
    return (
      <section className="rounded-3xl border border-red-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-3 text-red-700">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <div className="flex-1">
            <h3 className="font-extrabold">Repayment details unavailable</h3>
            <p className="mt-1 text-sm">{error}</p>
            <p className="mt-2 text-xs text-[var(--muted)]">A repayment schedule must exist for this loan before its ledger can be displayed.</p>
            <button type="button" onClick={() => loadLedger()} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[var(--green)] px-4 py-2 text-sm font-bold text-white">
              <RefreshCw size={15} /> Retry
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5 rounded-3xl border border-[var(--line)] bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-[var(--green)]">
            <CalendarDays size={21} />
          </div>
          <div>
            <h2 className="text-base font-black text-[var(--ink)] sm:text-lg">Repayment Schedule & Loan Ledger</h2>
            <p className="mt-0.5 text-xs text-[var(--muted)]">Installments, balances and recorded payments from the backend.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={refreshing} onClick={() => loadLedger(true)} className="inline-flex items-center gap-2 rounded-xl border border-[var(--line)] px-3 py-2 text-xs font-bold text-[var(--ink)] disabled:opacity-50">
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} /> Refresh
          </button>
          {canRecordPayment && payableInstallments.length > 0 && (
            <button type="button" onClick={() => setShowPaymentForm((value) => !value)} className="inline-flex items-center gap-2 rounded-xl bg-[var(--green)] px-3 py-2 text-xs font-bold text-white hover:opacity-90">
              <Wallet size={14} /> {showPaymentForm ? "Close Payment Form" : "Record Payment"}
            </button>
          )}
        </div>
      </div>

      {error && <div role="alert" className="flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle size={17} className="mt-0.5 shrink-0" />{error}</div>}
      {success && <div role="status" className="flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"><CheckCircle2 size={17} className="mt-0.5 shrink-0" />{success}</div>}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard label="Total Scheduled" value={money(summary.totalScheduledAmount)} icon={<CircleDollarSign size={17} />} />
        <SummaryCard label="Total Paid" value={money(summary.totalPaid)} icon={<CheckCircle2 size={17} />} />
        <SummaryCard label="Remaining Balance" value={money(summary.remainingBalance)} icon={<Wallet size={17} />} />
        <SummaryCard label="Overdue Amount" value={money(summary.amountOverdue ?? ledger?.overdue?.amountOverdue)} icon={<Clock3 size={17} />} danger={Boolean(ledger?.overdue?.isOverdue)} />
      </div>

      <div className="rounded-2xl border border-[var(--line)] p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-xs font-bold text-[var(--muted)]">Payment progress</span>
          <span className="text-sm font-black text-[var(--green)]">{progress.toFixed(1)}%</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-gray-100">
          <div className="h-full rounded-full bg-[var(--green)] transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
          <MiniStat label="Installments" value={`${summary.totalInstallments ?? installments.length}`} />
          <MiniStat label="Paid" value={`${summary.installmentsPaid ?? 0}`} />
          <MiniStat label="Partial" value={`${summary.installmentsPartial ?? 0}`} />
          <MiniStat label="Pending / Overdue" value={`${Number(summary.installmentsPending ?? 0)} / ${Number(summary.installmentsOverdue ?? ledger?.overdue?.installmentCount ?? 0)}`} />
        </div>
      </div>

      {showPaymentForm && (
        <form onSubmit={handleRecordPayment} className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 sm:p-5">
          <div>
            <h3 className="font-black text-[var(--ink)]">Record a payment</h3>
            <p className="mt-1 text-xs text-[var(--muted)]">Payment is saved to the backend and allocated to the selected installment.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-xs font-bold text-[var(--muted)]">Installment
              <select required value={form.installmentId} onChange={(e) => {
                const next = payableInstallments.find((item) => String(item._id) === e.target.value);
                const balance = next ? Number(next.remainingAmount || 0) + Math.max(0, Number(next.lateFee || 0) - Number(next.lateFeePaid || 0)) : 0;
                setForm((prev) => ({ ...prev, installmentId: e.target.value, amountReceived: balance.toFixed(2) }));
              }} className="mt-1.5 w-full rounded-xl border border-[var(--line)] bg-white p-3 text-sm font-semibold text-[var(--ink)]">
                {payableInstallments.map((item) => <option key={item._id} value={item._id}>#{item.installmentNumber} · {dateLabel(item.dueDate)} · {money(Number(item.remainingAmount || 0) + Math.max(0, Number(item.lateFee || 0) - Number(item.lateFeePaid || 0)))}</option>)}
              </select>
            </label>
            <label className="text-xs font-bold text-[var(--muted)]">Amount Received (USD)
              <input required type="number" min="0.01" step="0.01" value={form.amountReceived} onChange={(e) => setForm((prev) => ({ ...prev, amountReceived: e.target.value }))} className="mt-1.5 w-full rounded-xl border border-[var(--line)] bg-white p-3 text-sm font-bold text-[var(--ink)]" />
              {selectedInstallment && <span className="mt-1 block font-medium">Remaining: {money(Number(selectedInstallment.remainingAmount || 0) + Math.max(0, Number(selectedInstallment.lateFee || 0) - Number(selectedInstallment.lateFeePaid || 0)))}</span>}
            </label>
            <label className="text-xs font-bold text-[var(--muted)]">Payment Date
              <input required type="date" value={form.paymentDate} onChange={(e) => setForm((prev) => ({ ...prev, paymentDate: e.target.value }))} className="mt-1.5 w-full rounded-xl border border-[var(--line)] bg-white p-3 text-sm font-semibold text-[var(--ink)]" />
            </label>
            <label className="text-xs font-bold text-[var(--muted)]">Payment Method
              <select value={form.paymentMethod} onChange={(e) => setForm((prev) => ({ ...prev, paymentMethod: e.target.value }))} className="mt-1.5 w-full rounded-xl border border-[var(--line)] bg-white p-3 text-sm font-semibold text-[var(--ink)]">
                <option value="cash">Cash</option>
                <option value="money_order">Money Order</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="text-xs font-bold text-[var(--muted)] sm:col-span-2">Notes (optional)
              <input value={form.notes} maxLength={500} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Add payment reference or notes" className="mt-1.5 w-full rounded-xl border border-[var(--line)] bg-white p-3 text-sm font-medium text-[var(--ink)]" />
            </label>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" disabled={saving} onClick={() => setShowPaymentForm(false)} className="rounded-xl border border-[var(--line)] bg-white px-4 py-2.5 text-xs font-bold text-[var(--muted)] disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={saving || !selectedInstallment} className="inline-flex items-center gap-2 rounded-xl bg-[var(--green)] px-4 py-2.5 text-xs font-extrabold text-white disabled:opacity-50">
              {saving ? <LoaderCircle className="animate-spin" size={15} /> : <CreditCard size={15} />}
              {saving ? "Saving Payment…" : "Save Payment"}
            </button>
          </div>
        </form>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="font-black text-[var(--ink)]">Installment schedule</h3>
          <span className="text-xs text-[var(--muted)]">{installments.length} installments</span>
        </div>
        {installments.length === 0 ? <EmptyState text="No installments are available for this repayment schedule." /> : (
          <div className="overflow-x-auto rounded-2xl border border-[var(--line)]">
            <table className="min-w-[760px] w-full text-left text-xs">
              <thead className="bg-[var(--paper)] text-[var(--muted)]"><tr><th className="px-4 py-3 font-extrabold">Installment</th><th className="px-4 py-3 font-extrabold">Due Date</th><th className="px-4 py-3 font-extrabold">Amount Due</th><th className="px-4 py-3 font-extrabold">Paid</th><th className="px-4 py-3 font-extrabold">Remaining</th><th className="px-4 py-3 font-extrabold">Status</th></tr></thead>
              <tbody className="divide-y divide-[var(--line)]">{installments.map((item) => {
                const remaining = Number(item.remainingAmount || 0) + Math.max(0, Number(item.lateFee || 0) - Number(item.lateFeePaid || 0));
                const overdue = item.status !== "paid" && remaining > 0 && new Date(item.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));
                const status = item.status === "paid" || remaining <= 0 ? "Paid" : overdue ? "Overdue" : item.status === "partial" ? "Partial" : "Pending";
                return <tr key={item._id} className="bg-white"><td className="px-4 py-3 font-extrabold text-[var(--ink)]">#{item.installmentNumber}</td><td className="px-4 py-3 text-[var(--ink)]">{dateLabel(item.dueDate)}</td><td className="px-4 py-3 font-bold text-[var(--ink)]">{money(item.amountDue)}</td><td className="px-4 py-3 text-[var(--ink)]">{money(item.amountPaid)}</td><td className="px-4 py-3 font-bold text-[var(--ink)]">{money(remaining)}</td><td className="px-4 py-3"><span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold ${status === "Paid" ? "bg-emerald-100 text-emerald-800" : status === "Overdue" ? "bg-red-100 text-red-700" : status === "Partial" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-700"}`}>{status}</span></td></tr>;
              })}</tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between gap-3"><h3 className="font-black text-[var(--ink)]">Payment history</h3><span className="text-xs text-[var(--muted)]">{ledger?.payments?.length || 0} payments</span></div>
        {!ledger?.payments?.length ? <EmptyState text="No payments have been recorded for this loan yet." /> : (
          <div className="overflow-x-auto rounded-2xl border border-[var(--line)]"><table className="min-w-[680px] w-full text-left text-xs"><thead className="bg-[var(--paper)] text-[var(--muted)]"><tr><th className="px-4 py-3 font-extrabold">Receipt</th><th className="px-4 py-3 font-extrabold">Date</th><th className="px-4 py-3 font-extrabold">Method</th><th className="px-4 py-3 font-extrabold">Received By</th><th className="px-4 py-3 font-extrabold">Amount</th><th className="px-4 py-3 font-extrabold">Status</th><th className="px-4 py-3 font-extrabold">Receipt</th></tr></thead><tbody className="divide-y divide-[var(--line)]">{ledger.payments.map((payment) => <tr key={payment._id}><td className="px-4 py-3 font-extrabold text-[var(--ink)]">{payment.receiptNumber || "—"}</td><td className="px-4 py-3">{dateLabel(payment.paymentDate)}</td><td className="px-4 py-3 capitalize">{String(payment.paymentMethod || "—").replace(/_/g, " ")}</td><td className="px-4 py-3">{payment.receivedBy?.name || payment.receivedByName || "—"}</td><td className="px-4 py-3 font-bold">{money(payment.amountReceived)}</td><td className="px-4 py-3"><span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-extrabold text-emerald-800">{payment.status || "completed"}</span></td><td className="px-4 py-3"><button type="button" onClick={() => printReceipt(payment)} className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-[var(--line)] bg-white px-3 py-2 font-bold text-[var(--ink)] hover:bg-[var(--paper)]"><Printer size={13} /> Receipt PDF</button></td></tr>)}</tbody></table></div>
        )}
      </div>
    </section>
  );
}

function SummaryCard({ label, value, icon, danger = false }) {
  return <div className={`rounded-2xl border p-3 sm:p-4 ${danger ? "border-red-200 bg-red-50" : "border-[var(--line)] bg-white"}`}>
    <div className={`mb-2 flex items-center gap-2 text-xs font-bold ${danger ? "text-red-700" : "text-[var(--muted)]"}`}>{icon}{label}</div>
    <p className={`break-words text-lg font-black sm:text-xl ${danger ? "text-red-700" : "text-[var(--ink)]"}`}>{value}</p>
  </div>;
}

function MiniStat({ label, value }) {
  return <div><p className="text-[10px] font-semibold text-[var(--muted)]">{label}</p><p className="mt-1 font-extrabold text-[var(--ink)]">{value}</p></div>;
}

function EmptyState({ text }) {
  return <div className="rounded-2xl border border-dashed border-[var(--line)] px-4 py-6 text-center text-sm text-[var(--muted)]">{text}</div>;
}
