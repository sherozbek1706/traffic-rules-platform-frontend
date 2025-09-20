// // src/components/AdminSectionTabs.jsx
// import React, { useEffect } from "react";
// import { useLocation, useNavigate } from "react-router-dom";

// const PAGES = [
//   { path: "/dashboard-panel-admin/xyz/links", label: "Links" },
//   { path: "/dashboard-panel-admin/xyz/tests", label: "Tests" },
//   { path: "/dashboard-panel-admin/xyz/questions", label: "Questions" },
// ];

// // active index aniqlash (trailing slash, query va h.k. ga chidamli)
// function getActiveIndex(pathname) {
//   const clean = (s) => String(s || "").replace(/\/+$/, "");
//   const p = clean(pathname);
//   const i = PAGES.findIndex((x) => clean(x.path) === p);
//   return i >= 0 ? i : 0;
// }

// export const AdminSectionTabs = () => {
//   const { pathname } = useLocation();
//   const navigate = useNavigate();
//   const active = getActiveIndex(pathname);

//   const go = (i) => navigate(PAGES[i].path);
//   const next = () => go((active + 1) % PAGES.length);
//   const prev = () => go((active + PAGES.length - 1) % PAGES.length);

//   // ixtiyoriy: klaviatura qisqa yo‘llari (Alt+→ / Alt+←)
//   useEffect(() => {
//     const onKey = (e) => {
//       if (e.altKey && e.key === "ArrowRight") {
//         e.preventDefault();
//         next();
//       } else if (e.altKey && e.key === "ArrowLeft") {
//         e.preventDefault();
//         prev();
//       }
//     };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [active]);

//   return (
//     <div className="flex flex-wrap items-center gap-2">
//       {/* Desktop: segmented tabs */}
//       <div
//         role="tablist"
//         aria-label="Admin sections"
//         className="hidden sm:flex items-center gap-1 rounded-xl border border-neutral-200 bg-white p-1 shadow-sm"
//       >
//         {PAGES.map((p, i) => {
//           const isActive = i === active;
//           return (
//             <button
//               key={p.path}
//               role="tab"
//               aria-selected={isActive}
//               onClick={() => go(i)}
//               className={[
//                 "px-3 py-1.5 rounded-lg text-sm transition",
//                 isActive
//                   ? "bg-neutral-900 text-white"
//                   : "text-neutral-700 hover:bg-neutral-50",
//               ].join(" ")}
//             >
//               {p.label}
//             </button>
//           );
//         })}
//       </div>

//       {/* Mobile: dropdown */}
//       <div className="sm:hidden">
//         <select
//           value={active}
//           onChange={(e) => go(Number(e.target.value))}
//           className="rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200"
//           aria-label="Select section"
//         >
//           {PAGES.map((p, i) => (
//             <option key={p.path} value={i}>
//               {p.label}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Single-button navigation (cycle) */}
//       <div className="inline-flex items-center gap-2">
//         <button
//           onClick={prev}
//           className="hidden sm:inline-flex rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-800 hover:bg-neutral-50"
//           title="Previous (Alt+←)"
//         >
//           ← Prev
//         </button>
//         <button
//           onClick={next}
//           className="rounded-xl bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800"
//           title="Next (Alt+→)"
//         >
//           Next →
//         </button>
//       </div>
//     </div>
//   );
// };

// src/components/AdminSectionTabs.jsx
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const PAGES = [
  { path: "/dashboard-panel-admin/xyz/questions", label: "Questions" },
  { path: "/dashboard-panel-admin/xyz/tests", label: "Tests" },
  { path: "/dashboard-panel-admin/xyz/links", label: "Links" },
];

function getActiveIndex(pathname) {
  const clean = (s) => String(s || "").replace(/\/+$/, "");
  const p = clean(pathname);
  const i = PAGES.findIndex((x) => clean(x.path) === p);
  return i >= 0 ? i : 0;
}

export const AdminSectionTabs = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const active = getActiveIndex(pathname);

  const go = (i) => navigate(PAGES[i].path);
  const next = () => go((active + 1) % PAGES.length);
  const prev = () => go((active + PAGES.length - 1) % PAGES.length);

  useEffect(() => {
    const onKey = (e) => {
      if (e.altKey && e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.altKey && e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);

  return (
    // 1) Mobil: ustma-ust, Desktop: yonma-yon
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      {/* Desktop: segmented tabs */}
      <div
        role="tablist"
        aria-label="Admin sections"
        className="hidden sm:flex items-center gap-1 rounded-xl border border-neutral-200 bg-white p-1 shadow-sm"
      >
        {PAGES.map((p, i) => {
          const isActive = i === active;
          return (
            <button
              key={p.path}
              role="tab"
              aria-selected={isActive}
              onClick={() => go(i)}
              className={[
                "px-3 py-1.5 rounded-lg text-sm transition",
                isActive
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-700 hover:bg-neutral-50",
              ].join(" ")}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Mobile: dropdown (endi full width) */}
      <div className="sm:hidden w-full">
        <select
          value={active}
          onChange={(e) => go(Number(e.target.value))}
          className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200"
          aria-label="Select section"
        >
          {PAGES.map((p, i) => (
            <option key={p.path} value={i}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* Single-button navigation (cycle) */}
      {/* <div className="inline-flex items-center gap-2 w-full sm:w-auto">
        <button
          onClick={prev}
          className="hidden sm:inline-flex rounded-xl border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-800 hover:bg-neutral-50"
          title="Previous (Alt+←)"
        >
          ← Prev
        </button>
        <button
          onClick={next}
          className="w-full sm:w-auto rounded-xl bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800"
          title="Next (Alt+→)"
        >
          Next →
        </button>
      </div> */}
    </div>
  );
};
