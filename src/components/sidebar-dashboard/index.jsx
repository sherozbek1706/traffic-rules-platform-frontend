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
      return false;
    }
  });
  const collapsed =
    typeof collapsedProp === "boolean" ? collapsedProp : collapsedInternal;

  function toggleCollapsed() {
    if (onCollapseToggle) return onCollapseToggle();
    setCollapsedInternal((c) => {
      const next = !c;
      if (typeof window !== "undefined") {
        localStorage.setItem("sidebar:collapsed", JSON.stringify(next));
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
        path: "/dashboard-panel-admin/xyz/groups",
        roles: ["admin", "super_admin"],
      },
      {
        id: "group-admins",
        label: "Group Admins",
        icon: HiMiniRectangleGroup,
        path: "/dashboard-panel-admin/xyz/group-admins",
        roles: ["super_admin"],
      },
      {
        id: "students",
        label: "Students",
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

  const isActive = (menuPath) =>
    currentPath === menuPath ||
    (menuPath !== "/dashboard-panel-admin/xyz" &&
      currentPath.startsWith(menuPath + "/"));

  const handleLogout = () => {
    window.localStorage.clear();
    success_notify("Tizimdan chiqdingiz!");
    setTimeout(() => {
      window.location.assign("/dashboard-panel-admin/xyz/login");
    }, 1000);
  };

  // While checking token/role, avoid rendering sidebar to prevent flicker
  if (!token || !role) return null;

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
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
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
            aria-label="Close sidebar"
          >
            <HiX className="h-5 w-5 text-white/80" />
          </button>
        </div>

        {/* Collapse button (desktop) */}
        <div className="px-3">
          <button
            onClick={toggleCollapsed}
            className="
              group flex w-full items-center gap-3 rounded-xl border border-white/10
              bg-white/5 px-3 py-2 text-sm text-white/80 transition
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

        {/* Navigation */}
        <nav className="mt-4 flex-1 space-y-1 px-3">
          {/* Section label */}
          {!collapsed && (
            <div className="px-2 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-white/50">
              Main Menu
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
                  <span className="truncate font-medium">{item.label}</span>
                )}

                {/* Active indicator */}
                {active && (
                  <span className="absolute right-2 h-2 w-2 rounded-full bg-blue-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer / User & Logout */}
        <div className="border-t border-white/10 px-3 py-4">
          {!collapsed && (
            <div className="mb-3 flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
                alt="avatar"
                className="h-9 w-9 rounded-full ring-2 ring-white/20"
              />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">
                  {profile?.first_name} {profile?.last_name}
                </div>
                <div className="text-[11px] text-white/60">
                  {role === "super_admin" ? "SUPER ADMIN" : "ADMIN"}
                </div>
              </div>
            </div>
          )}
          <button
            className="
              group flex w-full items-center gap-3 rounded-xl border border-transparent
              px-3 py-2 text-white/80 transition hover:border-red-400/30
              hover:bg-red-500/15 hover:text-red-200
            "
            onClick={handleLogout}
          >
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-red-500/20 group-hover:bg-red-500/25">
              <HiLogout className="h-5 w-5" />
            </div>
            {!collapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
