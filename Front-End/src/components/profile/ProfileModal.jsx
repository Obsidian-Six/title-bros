"use client";

import { useState, useEffect } from "react";
import {
  X,
  User as UserIcon,
  Phone,
  Mail,
  Shield,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Edit2,
  Save,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import authService from "@/services/authService";

export default function ProfileModal({ isOpen, onClose }) {
  const { user, updateUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
      });
      setError("");
      setSuccess("");
      setIsEditing(false);
    }
  }, [user, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !user) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Name cannot be empty.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await authService.updateProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
      });

      if (res.success && res.data) {
        updateUser(res.data);
        setSuccess("Profile details updated successfully!");
        setIsEditing(false);
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--white)] shadow-2xl transition-all">
        <div className="flex items-center justify-between border-b border-[var(--line)] bg-[var(--paper)] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-[var(--green)] text-white text-base font-black shadow">
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <h2 className="text-sm font-black text-[var(--ink)]">Account Details</h2>
              <span className="inline-block rounded-md bg-[var(--green)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--green)]">
                {user.role === "SUPER_ADMIN" ? "Super Admin" : user.role === "ADMIN" ? "Staff Admin" : "Customer Account"}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full text-[var(--muted)] hover:bg-[var(--line)] hover:text-[var(--ink)] transition"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-700">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800">
              <CheckCircle2 size={15} />
              <span>{success}</span>
            </div>
          )}

          {!isEditing ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--paper)] p-4 space-y-3 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-[var(--line)]/60">
                  <span className="text-[var(--muted)] font-medium">Full Name</span>
                  <span className="font-bold text-[var(--ink)]">{user.name}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-[var(--line)]/60">
                  <span className="text-[var(--muted)] font-medium">Email Address</span>
                  <span className="font-bold text-[var(--ink)]">{user.email}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-[var(--line)]/60">
                  <span className="text-[var(--muted)] font-medium">Phone Number</span>
                  <span className="font-bold text-[var(--ink)]">{user.phone || "Not provided"}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-[var(--muted)] font-medium">Account Role</span>
                  <span className="font-bold text-[var(--green)]">{user.role}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[var(--ink)] py-3 text-xs font-bold text-[var(--paper)] hover:bg-black transition"
                >
                  <Edit2 size={14} />
                  <span>Edit Details</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-2xl border border-[var(--line)] px-5 py-3 text-xs font-bold text-[var(--muted)] hover:text-[var(--ink)] transition"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-4 py-2.5 text-xs font-semibold text-[var(--ink)] outline-none focus:border-[var(--green)]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                  Email Address (Login ID)
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full rounded-2xl border border-[var(--line)] bg-zinc-100 dark:bg-zinc-800 px-4 py-2.5 text-xs text-[var(--muted)] cursor-not-allowed"
                />
                <span className="mt-1 block text-[10px] text-[var(--muted)]">Email is tied to your account login</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="(702) 555-0123"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-2xl border border-[var(--line)] bg-[var(--paper)] px-4 py-2.5 text-xs font-semibold text-[var(--ink)] outline-none focus:border-[var(--green)]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[var(--green)] py-3 text-xs font-bold text-white hover:bg-[var(--green-dark)] transition disabled:opacity-60"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>Save Changes</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                  className="rounded-2xl border border-[var(--line)] px-5 py-3 text-xs font-bold text-[var(--muted)] hover:text-[var(--ink)] transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
