"use client";

/**
 * ==============================================================================
 * Title Bros Authentication Context Provider
 * ==============================================================================
 * Central state management for user authentication, role tracking, modal popup
 * triggers, and automated client-side inactivity timeouts.
 *
 * Supports independent dual-sessions:
 * - Admin session (stored under titlebros_admin_token & titlebros_admin_user)
 * - Customer session (stored under titlebros_customer_token & titlebros_customer_user)
 *
 * This allows administrators to test both the Admin CMS (/admin/*) and the
 * customer portal / application (/portal, /apply) simultaneously in separate tabs
 * without session cross-contamination.
 */

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname ? pathname.includes("/admin") : false;

  // Customer session state
  const [customerUser, setCustomerUser] = useState(null);
  const [customerToken, setCustomerToken] = useState(null);

  // Admin session state
  const [adminUser, setAdminUser] = useState(null);
  const [adminToken, setAdminToken] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  // Popup Modal UI state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState("login"); // 'login' | 'register' | 'forgot'

  // Notification for session expiry / inactivity
  const [inactivityNotice, setInactivityNotice] = useState(null);

  const lastActivityRef = useRef(Date.now());

  // Active user and token based on current route
  const activeUser = isAdminRoute ? adminUser : customerUser;
  const activeToken = isAdminRoute ? adminToken : customerToken;

  /**
   * Save session data to local state and persistent storage
   */
  const handleAuthSuccess = useCallback((payload, forAdmin = false) => {
    const { user: userData, token: jwtToken } = payload;
    lastActivityRef.current = Date.now();

    const isAdmin = forAdmin || userData?.role === "ADMIN" || userData?.role === "SUPER_ADMIN";

    if (isAdmin) {
      setAdminUser(userData);
      setAdminToken(jwtToken);
      if (typeof window !== "undefined") {
        localStorage.setItem("titlebros_admin_token", jwtToken);
        localStorage.setItem("titlebros_admin_user", JSON.stringify(userData));
      }
    } else {
      setCustomerUser(userData);
      setCustomerToken(jwtToken);
      if (typeof window !== "undefined") {
        localStorage.setItem("titlebros_customer_token", jwtToken);
        localStorage.setItem("titlebros_customer_user", JSON.stringify(userData));
      }
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("titlebros_auth_token", jwtToken);
      localStorage.setItem("titlebros_user_data", JSON.stringify(userData));
    }
  }, []);

  /**
   * Update current user profile in state and storage
   */
  const updateUser = useCallback((newUserData) => {
    if (isAdminRoute) {
      setAdminUser((prev) => {
        const updated = { ...prev, ...newUserData };
        if (typeof window !== "undefined") {
          localStorage.setItem("titlebros_admin_user", JSON.stringify(updated));
        }
        return updated;
      });
    } else {
      setCustomerUser((prev) => {
        const updated = { ...prev, ...newUserData };
        if (typeof window !== "undefined") {
          localStorage.setItem("titlebros_customer_user", JSON.stringify(updated));
        }
        return updated;
      });
    }
  }, [isAdminRoute]);

  /**
   * Perform logout and clear state
   */
  const logout = useCallback(async (reason = "") => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn("Logout error:", err);
    } finally {
      if (typeof window !== "undefined") {
        const isAdm = window.location.pathname.includes("/admin");
        if (isAdm) {
          setAdminUser(null);
          setAdminToken(null);
          localStorage.removeItem("titlebros_admin_token");
          localStorage.removeItem("titlebros_admin_user");
        } else {
          setCustomerUser(null);
          setCustomerToken(null);
          localStorage.removeItem("titlebros_customer_token");
          localStorage.removeItem("titlebros_customer_user");
        }
        localStorage.removeItem("titlebros_auth_token");
        localStorage.removeItem("titlebros_user_data");
      }
      if (reason) {
        setInactivityNotice(reason);
      }
    }
  }, []);

  /**
   * Initialize authentication on page mount
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (typeof window === "undefined") return;

        // 1. Load Admin session
        const storedAdminToken = localStorage.getItem("titlebros_admin_token");
        const storedAdminUser = localStorage.getItem("titlebros_admin_user");
        if (storedAdminToken && storedAdminUser) {
          try {
            const parsed = JSON.parse(storedAdminUser);
            if (parsed.role === "ADMIN" || parsed.role === "SUPER_ADMIN") {
              setAdminToken(storedAdminToken);
              setAdminUser(parsed);
            }
          } catch (e) {}
        }

        // 2. Load Customer session
        const storedCustomerToken =
          localStorage.getItem("titlebros_customer_token") ||
          (!storedAdminToken ? localStorage.getItem("titlebros_auth_token") : null);
        const storedCustomerUser =
          localStorage.getItem("titlebros_customer_user") ||
          (!storedAdminToken ? localStorage.getItem("titlebros_user_data") : null);

        if (storedCustomerToken && storedCustomerUser) {
          try {
            const parsed = JSON.parse(storedCustomerUser);
            if (parsed.role === "CUSTOMER") {
              setCustomerToken(storedCustomerToken);
              setCustomerUser(parsed);
            }
          } catch (e) {}
        }
      } catch (e) {
        console.error("Auth init error:", e);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Auto-logout on user inactivity
   * Admins: 15 minutes, Customers: 60 minutes
   */
  useEffect(() => {
    const currentUser = activeUser;
    if (!currentUser) return;

    const isAdmin = currentUser.role === "ADMIN" || currentUser.role === "SUPER_ADMIN";
    const timeoutMinutes = isAdmin ? 15 : 60;
    const timeoutMs = timeoutMinutes * 60 * 1000;

    const updateActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];
    events.forEach((evt) => window.addEventListener(evt, updateActivity, { passive: true }));

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed > timeoutMs) {
        logout(`You have been logged out due to ${timeoutMinutes} minutes of inactivity.`);
      }
    }, 30000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, updateActivity));
      clearInterval(interval);
    };
  }, [activeUser, logout]);

  // Modal open/close helpers
  const openAuthModal = (tab = "login") => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // Customer authentication helpers
  const loginCustomer = async (credentials) => {
    const res = await authService.customerLogin(credentials);
    if (res.success && res.data) {
      handleAuthSuccess(res.data, false);
      closeAuthModal();
    }
    return res;
  };

  const registerCustomer = async (userData) => {
    const res = await authService.customerRegister(userData);
    if (res.success && res.data) {
      handleAuthSuccess(res.data, false);
      closeAuthModal();
    }
    return res;
  };

  // Admin authentication helper
  const loginAdmin = async (credentials) => {
    const res = await authService.adminLogin(credentials);
    if (res.success && res.data) {
      handleAuthSuccess(res.data, true);
    }
    return res;
  };

  const value = {
    // Current route-aware user
    user: activeUser,
    token: activeToken,
    isLoading,
    isAuthenticated: !!activeUser,
    isAdmin: !!(adminUser || (activeUser?.role === "ADMIN" || activeUser?.role === "SUPER_ADMIN")),
    isSuperAdmin: !!(adminUser?.role === "SUPER_ADMIN" || activeUser?.role === "SUPER_ADMIN"),

    // Direct access to distinct sessions
    customerUser,
    customerToken,
    isCustomerAuthenticated: !!customerUser,
    adminUser,
    adminToken,
    isAdminAuthenticated: !!adminUser,

    // Modal controls
    isAuthModalOpen,
    authModalTab,
    openAuthModal,
    closeAuthModal,
    setAuthModalTab,

    // Operations
    loginCustomer,
    registerCustomer,
    loginAdmin,
    logout,
    updateUser,
    inactivityNotice,
    clearInactivityNotice: () => setInactivityNotice(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
