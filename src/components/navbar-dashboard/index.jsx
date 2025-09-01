// src/components/Navbar/index.jsx
import React, { useEffect } from "react";
import { HiMenu, HiSearch, HiChevronRight } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, Link } from "react-router-dom";
import { profileAdmin } from "../../redux/slice/admin-slice";

// ---------------------------------------------------------------------------
// New NavbarDashboard
// - Clean, modern topbar
// - Mobile menu button (opens sidebar)
// - Desktop collapse button is managed in Sidebar; here we only expose menu
// - Breadcrumb from route
// - Optional search box (kept minimal; can be extended)
// ---------------------------------------------------------------------------

export const NavbarDashboard = ({ onMenuClick }) => {
  const dispatch = useDispatch();
  const { profile } = useSelector((state) => state.admin);
  const location = useLocation();

  useEffect(() => {
    if (!profile) {
      dispatch(profileAdmin());
    }
  }, [dispatch, profile]);

  // Breadcrumbs based on path after /dashboard-panel-admin/xyz
  const base = "/dashboard-panel-admin/xyz";
  const tail = location.pathname.startsWith(base)
    ? location.pathname.slice(base.length)
    : location.pathname;
  const parts = tail.split("/").filter(Boolean);

  const pretty = (seg) =>
    seg.replace(/-/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());

  return (
    <nav className="sticky top-0 z-[60] flex h-16 items-center justify-between border-b border-gray-200 bg-white/90 px-4 backdrop-blur supports-[backdrop-filter]:bg-white/60 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        {/* Mobile menu */}
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 lg:hidden"
          aria-label="Open sidebar"
        >
          <HiMenu className="h-5 w-5" />
        </button>

        {/* Breadcrumb */}
        <div className="hidden min-w-0 items-center gap-1 text-sm text-gray-600 sm:flex">
          <Link to={base} className="hover:underline">
            Home
          </Link>
          {parts.map((seg, i) => {
            const href = [base, ...parts.slice(0, i + 1)].join("/");
            return (
              <React.Fragment key={i}>
                <HiChevronRight className="mx-1 h-4 w-4 text-gray-400" />
                <Link
                  to={href}
                  className={`truncate hover:underline ${
                    i === parts.length - 1 ? "font-medium text-gray-900" : ""
                  }`}
                >
                  {pretty(seg)}
                </Link>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Optional search (disabled by default; uncomment to use) */}
        {/* <div className="relative hidden md:block">
          <HiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search…"
            className="w-72 rounded-xl border border-gray-300 bg-white px-9 py-2 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
          />
        </div> */}

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <div className="text-sm font-medium text-gray-900">
              {profile?.first_name} {profile?.last_name}
            </div>
            <div className="text-xs text-gray-500">
              {profile?.role === "super_admin" ? "SUPER ADMIN" : "ADMIN"}
            </div>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
              alt="avatar"
              className="h-10 w-10 rounded-full ring-2 ring-white shadow"
            />
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
          </div>
        </div>
      </div>
    </nav>
  );
};
