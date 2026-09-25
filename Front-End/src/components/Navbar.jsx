"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useParams, usePathname } from "next/navigation";
import { useMessages } from "next-intl";
import { Menu, X, Phone, ArrowUpRight, LogIn, LogOut, User as UserIcon, FileText } from "lucide-react";

import Button from "./common/Button";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import ProfileModal from "@/components/profile/ProfileModal";
import loanService from "@/services/loanService";

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [unreadActionCount, setUnreadActionCount] = useState(0);
  const dropdownRef = useRef(null);
  const { user, isAuthenticated, openAuthModal, logout } = useAuth();

  // Check for pending document action requests on customer accounts (live polling every 5s)
  useEffect(() => {
    let intervalId;

    const fetchPendingActions = () => {
      if (!isAuthenticated || user?.role !== "CUSTOMER") {
        setUnreadActionCount(0);
        return;
      }
      if (typeof document !== "undefined" && document.visibilityState !== "visible") {
        return;
      }

      loanService
        .getMyApplications()
        .then((res) => {
          if (res.success && Array.isArray(res.data)) {
            const pendingActions = res.data.filter(
              (app) =>
                app.status === "Pending Documents" ||
                (app.requestedDocuments?.length > 0 &&
                  app.status !== "Approved" &&
                  app.status !== "Rejected")
            ).length;
            setUnreadActionCount(pendingActions);
          }
        })
        .catch(() => {});
    };

    if (isAuthenticated && user?.role === "CUSTOMER") {
      fetchPendingActions();
      intervalId = setInterval(fetchPendingActions, 5000);
    } else {
      setUnreadActionCount(0);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isAuthenticated, user]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Hide the public customer navbar completely on Admin CMS & Admin Login pages
  const { locale } = useParams();
  const messages = useMessages();

  const navItems = messages.navbar.navItems;

  const localizedHref = (href) => {
    if (href === "/") {
      return `/${locale}`;
    }

    return `/${locale}${href}`;
  };
  if (pathname && pathname.includes("/admin")) {
    return null;
  }


  return (
    <header className="fixed left-0 top-0 z-50 w-full px-3 py-3">
      <div className="container-x">
        <div className="glass flex h-[68px] items-center justify-between rounded-full px-3 pl-5">
          {/* LOGO */}
          <Link
            href={`/${locale}`}
            className="flex items-center gap-3"
            onClick={() => setOpen(false)}
          >
            <Image
              width={1000}
              height={1000}
              src="/images/TB.png"
              alt="Title Bros Loans"
              className="h-11 w-11 rounded-full bg-white object-contain"
            />

            <span className="hidden text-sm font-black tracking-tight text-[var(--ink)] sm:block">
              {messages.navbar.brand.title}{" "}
              <span className="text-[var(--green)]">
                {messages.navbar.brand.highlight}
              </span>
            </span>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden items-center gap-7 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={localizedHref(item.href)}
                className="text-[13px] font-bold text-[var(--muted)] transition hover:text-[var(--ink)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* DESKTOP ACTIONS */}
          <div className="hidden items-center gap-2 sm:flex">
            <LanguageToggle />
            <ThemeToggle />

            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="relative grid h-10 w-10 place-items-center rounded-full bg-[var(--green)] text-white text-sm font-black shadow-sm ring-2 ring-[var(--line)] hover:ring-[var(--green)] transition cursor-pointer select-none"
                  title={`${user?.name} (${user?.role})`}
                  aria-label="User menu"
                >
                  {user?.name?.[0]?.toUpperCase() || "U"}
                  {unreadActionCount > 0 && (
                    <span className="absolute -top-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-red-600 text-[10px] font-black text-white shadow-md ring-2 ring-white animate-pulse">
                      {unreadActionCount}
                    </span>
                  )}
                </button>

                {/* DROPDOWN MENU */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-12 z-50 w-64 rounded-3xl border border-[var(--line)] bg-[var(--white)] p-2 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* User Header */}
                    <div className="border-b border-[var(--line)] p-3 pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-[var(--green)] text-white text-xs font-black shrink-0">
                          {user?.name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-black text-[var(--ink)]">
                            {user?.name}
                          </p>
                          <p className="truncate text-[10px] text-[var(--muted)]">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="inline-block rounded-md bg-[var(--green)]/10 px-2 py-0.5 text-[9px] font-black text-[var(--green)]">
                          {user?.role === "SUPER_ADMIN"
                            ? "👑 Super Admin"
                            : user?.role === "ADMIN"
                            ? "🛡️ Staff Admin"
                            : "👤 Customer Account"}
                        </span>
                      </div>
                    </div>

                    {/* Options */}
                    <div className="py-1 space-y-0.5 text-xs font-bold text-[var(--ink)]">
                      {/* Option 1: Profile & Edit Details */}
                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          setProfileModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-left transition hover:bg-[var(--paper)] hover:text-[var(--green)]"
                      >
                        <UserIcon size={15} className="text-[var(--green)]" />
                        <span>My Profile & Edit</span>
                      </button>

                      {/* Option 2: My Applications / Portal / CMS */}
                      <Link
                        href={
                          user?.role === "SUPER_ADMIN" || user?.role === "ADMIN"
                            ? `/${locale}/admin/dashboard`
                            : `/${locale}/portal`
                        }
                        onClick={() => setDropdownOpen(false)}
                        className="w-full flex items-center justify-between rounded-2xl px-3 py-2.5 text-left transition hover:bg-[var(--paper)] hover:text-[var(--green)]"
                      >
                        <div className="flex items-center gap-2.5">
                          <FileText size={15} className="text-[var(--green)]" />
                          <span>
                            {user?.role === "SUPER_ADMIN" || user?.role === "ADMIN"
                              ? "Admin Dashboard"
                              : "My Applications"}
                          </span>
                        </div>
                        {unreadActionCount > 0 && (
                          <span className="rounded-full bg-red-600 px-2 py-0.5 text-[9px] font-black text-white animate-pulse">
                            {unreadActionCount} Action
                          </span>
                        )}
                      </Link>
                    </div>

                    {/* Option 3: Sign Out */}
                    <div className="border-t border-[var(--line)] pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-left text-xs font-bold text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/30"
                      >
                        <LogOut size={15} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => openAuthModal("login")}
                className="btn-ghost !min-h-[44px] !px-4 flex items-center gap-1.5 text-xs font-bold text-[var(--ink)] transition hover:text-[var(--green)] cursor-pointer"
              >
                <LogIn size={15} />
                <span>Sign In</span>
              </button>
            )}

            <a
              href="tel:+17025550123"
              className="btn-ghost !min-h-[44px] !px-4"
            >
              <Phone size={15} />
              <span className="hidden xl:inline">{messages.navbar.call}</span>
            </a>

            <Button href={`/${locale}/apply`} icon={ArrowUpRight}>
              {messages.navbar.applyNow}
            </Button>
          </div>

          {/* MOBILE ACTIONS */}
          <div className="flex items-center gap-2 sm:hidden">
            <LanguageToggle />
            <ThemeToggle />

            <button
              type="button"
              className="grid h-11 w-11 place-items-center rounded-full bg-[var(--ink)] text-[var(--paper)]"
              onClick={() => setOpen(!open)}
              aria-label={
                open ? messages.navbar.closeMenu : messages.navbar.openMenu
              }
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {open && (
          <div className="glass mt-2 rounded-[28px] p-4 lg:hidden">
            <div className="flex flex-col">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={localizedHref(item.href)}
                  onClick={() => setOpen(false)}
                  className="border-b border-[var(--line)] px-3 py-4 text-sm font-bold text-[var(--ink)] last:border-0"
                >
                  {item.label}
                </Link>
              ))}

              <div className="mt-3 flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      href={user?.role === "SUPER_ADMIN" || user?.role === "ADMIN" ? `/${locale}/admin/dashboard` : `/${locale}/portal`}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--green)]/30 bg-[var(--green)]/10 py-3 text-xs font-bold text-[var(--green)]"
                    >
                      <FileText size={16} />
                      <span>
                        {user?.role === "SUPER_ADMIN" || user?.role === "ADMIN"
                          ? "Go to Admin Dashboard"
                          : "Go to My Loan Portal"}
                      </span>
                      {unreadActionCount > 0 && (
                        <span className="rounded-full bg-red-600 px-2 py-0.5 text-[9px] font-black text-white animate-pulse">
                          {unreadActionCount} Action
                        </span>
                      )}
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        setProfileModalOpen(true);
                      }}
                      className="flex items-center justify-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--paper)] py-3 text-xs font-bold text-[var(--ink)]"
                    >
                      <UserIcon size={16} className="text-[var(--green)]" />
                      <span>My Profile & Edit Details</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setOpen(false);
                      }}
                      className="flex items-center justify-center gap-2 rounded-2xl border border-red-500/20 bg-red-50 py-3 text-xs font-bold text-red-600 dark:bg-red-950/30"
                    >
                      <LogOut size={16} />
                      <span>Sign Out ({user?.name})</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      openAuthModal("login");
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--paper)] py-3 text-xs font-bold text-[var(--ink)] cursor-pointer"
                  >
                    <LogIn size={16} />
                    <span>Sign In to Account</span>
                  </button>
                )}

                <Link
                  href={`/${locale}/apply`}
                  onClick={() => setOpen(false)}
                  className="btn-primary flex items-center justify-center gap-2"
                >
                  {messages.navbar.applyNow}
                  <ArrowUpRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Account Profile & Edit Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </header>
  );
}
