import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { LayoutDashboard } from "../../components";

/**
 * OtherDashboard
 * -----------------------------------------------------------------------------
 * This page is designed to host navigation "buttons" (links) that don't fit
 * inside the main sidebar. Each item has: icon, name, and a `to` route.
 *
 * - Uses <Link> from react-router-dom for client-side navigation.
 * - Fully responsive grid of button-cards with accessible focus styles.
 * - Includes a quick search to filter actions when there are many.
 * - All code (including a compact icon set) is self-contained in this file.
 *
 * Adjust/extend the ACTIONS array below to match your routes.
 */

// -------------------------------- Icons -----------------------------------
// Small inline SVG icon set (no external deps). Add more as needed.
// ICONS and ACTIONS for protected dashboard routes
// Usage example:
//   import { ICONS, ACTIONS } from "./wherever";
//   <Icon name="home" /> or ACTIONS.map(({icon, name, to}) => ...)

// ----------------------------- ICONS ---------------------------------------
const ICONS = {
  home: (props) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M3 10.5 12 3l9 7.5V20a2 2 0 0 1-2 2h-4v-6H9v6H5a2 2 0 01-2-2v-9.5Z"
        fill="currentColor"
      />
    </svg>
  ),
  students: (props) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M12 3 2 8l10 5 8-4v6h2V8L12 3Z" fill="currentColor" />
      <path
        d="M6 14.5a6 6 0 0 1 12 0v2.5a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-2.5Z"
        fill="currentColor"
        opacity=".5"
      />
    </svg>
  ),
  admins: (props) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M12 2a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z" fill="currentColor" />
      <path d="M4 20a8 8 0 0 1 16 0v1H4v-1Z" fill="currentColor" opacity=".5" />
      <path d="M19 2.5 22 5l-6.5 6.5-2.5-2.5L19 2.5Z" fill="currentColor" />
    </svg>
  ),
  groups: (props) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <circle cx="8" cy="8" r="3" fill="currentColor" />
      <circle cx="16" cy="8" r="3" fill="currentColor" opacity=".7" />
      <path
        d="M3 19a5 5 0 0 1 5-5h0a5 5 0 0 1 5 5v1H3v-1Z"
        fill="currentColor"
      />
      <path
        d="M11 19a5 5 0 0 1 5-5h0a5 5 0 0 1 5 5v1h-10v-1Z"
        fill="currentColor"
        opacity=".5"
      />
    </svg>
  ),
  questions: (props) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M4 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v11l-4 3-4-3-4 3V5Z"
        fill="currentColor"
        opacity=".25"
      />
      <path
        d="M12 7a3 3 0 0 1 3 3c0 1.8-1.5 2.2-2.2 2.7-.4.3-.8.6-.8 1.3V15h-2v-.3c0-1.3.7-2.1 1.4-2.6.6-.4 1.6-.7 1.6-1.6a1 1 0 1 0-2 0H8a4 4 0 0 1 4-3Zm1 8h-2v2h2v-2Z"
        fill="currentColor"
      />
    </svg>
  ),
  tests: (props) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <rect
        x="4"
        y="3"
        width="16"
        height="18"
        rx="2"
        fill="currentColor"
        opacity=".25"
      />
      <path d="M8 7h8v2H8V7Zm0 4h8v2H8v-2Zm0 4h5v2H8v-2Z" fill="currentColor" />
      <path d="M7 3v2h10V3H7Z" fill="currentColor" />
    </svg>
  ),
  links: (props) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M14 7h3a5 5 0 1 1 0 10h-3a1 1 0 1 1 0-2h3a3 3 0 1 0 0-6h-3a1 1 0 1 1 0-2ZM7 7h3a1 1 0 1 1 0 2H7a3 3 0 1 0 0 6h3a1 1 0 1 1 0 2H7a5 5 0 0 1 0-10Z"
        fill="currentColor"
      />
      <path d="M9 11h6a1 1 0 1 1 0 2H9a1 1 0 1 1 0-2Z" fill="currentColor" />
    </svg>
  ),
  myGroup: (props) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <circle cx="12" cy="8" r="3.5" fill="currentColor" />
      <path d="M5 20a7 7 0 0 1 14 0v1H5v-1Z" fill="currentColor" opacity=".5" />
      <path
        d="M18 5l1 2 2 .3-1.5 1.5.4 2.2-1.9-1-1.9 1 .4-2.2L16 7.3 18 7l1-2Z"
        fill="currentColor"
      />
    </svg>
  ),
  other: (props) => (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <circle cx="6" cy="6" r="2" fill="currentColor" />
      <circle cx="12" cy="6" r="2" fill="currentColor" />
      <circle cx="18" cy="6" r="2" fill="currentColor" />
      <circle cx="6" cy="12" r="2" fill="currentColor" />
  {
    icon: "home",
    name: "Home",
    to: "/dashboard-panel-admin/xyz",
  },
  {
    icon: "students",
    name: "Students",
    to: "/dashboard-panel-admin/xyz/students",
  },
  {
    icon: "admins",
    name: "Admins",
    to: "/dashboard-panel-admin/xyz/admins",
  },
  {
    icon: "groups",
    to: "/dashboard-panel-admin/xyz/links",
  },
  {
    icon: "myGroup",
    name: "My Group",
    to: "/dashboard-panel-admin/xyz/my-group",
  },
  {
    icon: "other",
    name: "Other",
    to: "/dashboard-panel-admin/xyz/other",
  },
  {
    icon: "groupAdmins",
    name: "Group Admins",
  return <Comp className={className} />;
}

function ActionCard({ icon, name, to }) {
  return (
    <Link
      to={to}
      className="
        group relative block rounded-2xl border border-neutral-200 bg-white p-4
        shadow-sm transition hover:shadow-md focus:outline-none
        focus-visible:ring-2 focus-visible:ring-neutral-300
      "
      role="button"
      aria-label={`${name}. Go to ${to}`}
    >
      <div className="flex items-center gap-3">
        <div
          className="
            grid h-10 w-10 shrink-0 place-items-center rounded-xl
            bg-neutral-100 text-neutral-800 transition
            group-hover:bg-neutral-900 group-hover:text-white
          "
        >
          <Icon name={icon} />
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-neutral-900">
            {name}
          </div>
          <div className="truncate text-xs text-neutral-500">{to}</div>
        </div>
        <div className="ml-auto opacity-0 transition group-hover:opacity-100">
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 text-neutral-400 group-hover:text-neutral-700"
            aria-hidden="true"
          >
            <path
              d="M13 5l7 7-7 7M4 12h16"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
}

// --------------------------------- Page -----------------------------------
export const OtherDashboard = () => {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ACTIONS;
    return ACTIONS.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.to.toLowerCase().includes(q) ||
        a.icon.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <LayoutDashboard>
      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">More Actions</h1>
            <p className="text-sm text-neutral-600">
              Sidebarga sig&rsquo;may qolgan tugmalar shu yerda. Har bir element{" "}
              <code className="rounded bg-neutral-100 px-1 py-0.5">icon</code>,{" "}
              <code className="rounded bg-neutral-100 px-1 py-0.5">name</code>,
              va <code className="rounded bg-neutral-100 px-1 py-0.5">to</code>{" "}
              ni o‘z ichiga oladi.
            </p>
          </div>

          {/* Quick search */}
          <div className="w-full max-w-sm">
            <label htmlFor="quick-search" className="sr-only">
              Search actions
            </label>
            <div className="relative">
              <input
                id="quick-search"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, path, or icon…"
                className="
                  w-full rounded-xl border border-neutral-300 bg-white px-3 py-2
                  text-sm shadow-sm outline-none transition placeholder:text-neutral-400
                  focus:border-neutral-800 focus:ring-2 focus:ring-neutral-300
                "
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                ⌕
              </span>
            </div>
          </div>
        </div>

        {/* Grid of link buttons */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-300 p-8 text-center">
            <div className="mx-auto grid max-w-md gap-3">
              <div className="mx-auto h-12 w-12 rounded-full bg-neutral-100" />
              <h3 className="text-lg font-semibold">Hech narsa topilmadi</h3>
              <p className="text-sm text-neutral-600">
                Boshqa so‘z bilan qidiring yoki quyidagi ACTIONS ro‘yxatini
                kengaytiring.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((item) => (
              <ActionCard key={item.to} {...item} />
            ))}
          </div>
        )}
      </main>
    </LayoutDashboard>
  );
};
