// src/components/Sidebar/index.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  HiLogout,
  HiX,
  HiUserGroup,
  HiOutlineChevronDoubleLeft,
  HiOutlineChevronDoubleRight,
} from "react-icons/hi";
import { HiMiniRectangleGroup } from "react-icons/hi2";
import { RiAdminFill } from "react-icons/ri";
import { TbGridDots } from "react-icons/tb";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { FaUsersLine } from "react-icons/fa6";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { jwtDecode } from "jwt-decode";
import { success_notify } from "../../shared/notify";

// ---------------------------------------------------------------------------
// New SidebarDashboard
// - Fully redesigned from scratch
// - Collapsible on desktop (persisted to localStorage)
// - Slide-in drawer on mobile with overlay
// - Role-aware menu (admin / super_admin)
// - Accessible, modern visuals, active indicators
// ---------------------------------------------------------------------------

export const SidebarDashboard = ({
  isOpen, // mobile open/close
  onToggle, // mobile toggle fn
  collapsed: collapsedProp, // optional controlled collapsed state
  onCollapseToggle, // optional parent toggle
}) => {
  const { profile } = useSelector((state) => state.admin);
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  // ---------- Token & Role ----------
  const rawToken = useMemo(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem("admin_token");
  }, []);

  const token = useMemo(() => {
    if (!rawToken) return null;
    return rawToken.startsWith("Bearer ") ? rawToken.slice(7) : rawToken;
  }, [rawToken]);

  const decoded = useMemo(() => {
    try {
      return token ? jwtDecode(token) : null;
    } catch {
      return null;
    }
  }, [token]);

  const role =
    decoded?.role ??
    decoded?.user?.role ??
    decoded?.data?.role ??
    profile?.role ??
    null;

  useEffect(() => {
    const exp = decoded?.exp ? decoded.exp * 1000 : null;
    if (!token || (exp && Date.now() >= exp)) {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("admin_token");
      }
      navigate("/dashboard-panel-admin/xyz/login", { replace: true });
    }
  }, [decoded, token, navigate]);

  // ---------- Collapsed (desktop) ----------
  const [collapsedInternal, setCollapsedInternal] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return JSON.parse(localStorage.getItem("sidebar:collapsed") || "false");
    } catch {
      }
      return next;
    });
  }

  // ---------- Menu items by role ----------
  const allMenuItems = useMemo(
    () => [
      {
        id: "dashboard",
        label: "Dashboard",
        icon: MdOutlineSpaceDashboard,
        path: "/dashboard-panel-admin/xyz",
        roles: ["admin", "super_admin"],
      },
      {
        id: "admins",
        label: "Admins",
        icon: RiAdminFill,
        path: "/dashboard-panel-admin/xyz/admins",
        roles: ["super_admin"],
      },
      {
        id: "groups",
        label: "Groups",
        icon: HiUserGroup,
        path: "/dashboard-panel-admin/xyz/students",
        roles: ["admin", "super_admin"],
      },
      {
        id: "mygroup",
        label: "My Group",
        icon: FaUsersLine,
        path: "/dashboard-panel-admin/xyz/my-group",
        roles: ["admin", "super_admin"],
      },
      {
        id: "other",
        label: "Other",
        icon: TbGridDots,
        path: "/dashboard-panel-admin/xyz/other",
        roles: ["super_admin"],
      },
    ],
    []
  );

  const menuItems = useMemo(() => {
    if (!role) return [];
    return allMenuItems.filter((m) => m.roles.includes(role));
  }, [allMenuItems, role]);


  // Widths must match Layout (expanded: w-80 => 20rem, collapsed: w-20 => 5rem)
  const baseWidthClass = collapsed ? "w-20" : "w-80";

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[99] bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-[100] ${baseWidthClass}
          bg-gradient-to-b from-gray-900 via-gray-850 to-gray-900 text-white
          border-r border-white/10 shadow-2xl
          flex flex-col
        `}
        // allow horizontal scroll for long labels in rare cases
      >
        {/* Header / Brand */}
        <div className="relative flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <MdOutlineSpaceDashboard className="h-6 w-6 text-white" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="truncate text-lg font-bold tracking-tight">
                  AdminPanel
                </div>
                <div className="text-[11px] text-white/60">
                  Management System
                </div>
              </div>
            )}
          </div>

          {/* Mobile close */}
          <button
            onClick={onToggle}
            className="lg:hidden rounded-lg p-2 hover:bg-white/10"
              hover:bg-white/10 hover:text-white
            "
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand" : "Collapse"}
          >
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/10">
              {collapsed ? (
                <HiOutlineChevronDoubleRight className="h-4 w-4" />
              ) : (
                <HiOutlineChevronDoubleLeft className="h-4 w-4" />
              )}
            </div>
            {!collapsed && <span className="font-medium">Sidebar</span>}
          </button>
        </div>

          )}

          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`
                  group relative flex items-center gap-3 rounded-xl px-3 py-2
                  transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30
                  ${
                    active
                      ? "bg-white/12 text-white shadow-inner"
                      : "text-white/70 hover:bg-white/8 hover:text-white"
                  }
                `}
                aria-current={active ? "page" : undefined}
                title={collapsed ? item.label : undefined}
              >
                <div
                  className={`
                    grid h-9 w-9 place-items-center rounded-lg border
                    ${
                      active
                        ? "border-white/30 bg-white/15"
                        : "border-white/10 bg-white/5 group-hover:border-white/20"
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {!collapsed && (
