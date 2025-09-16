// import { Link, useLocation, useNavigate } from "react-router-dom";

// export const NavbarStudent = ({ me }) => {
//   const { pathname } = useLocation();
//   const navigate = useNavigate();
//   const isActive = (p) =>
//     pathname === p ? "text-gray-900" : "text-gray-600 hover:text-gray-900";

//   const logout = () => {
//     localStorage.removeItem("token");
//     navigate("/login");
//   };

//   return (
//     <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-200">
//       <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
//         <div className="flex items-center gap-6">
//           <Link to="/" className="flex items-center gap-2">
//             <div className="h-9 w-9 rounded-xl bg-blue-600 text-white grid place-items-center shadow">
//               <span className="font-bold">S</span>
//             </div>
//             <span className="font-semibold text-gray-900">Student Portal</span>
//           </Link>

//           <nav className="hidden sm:flex items-center gap-4 text-sm">
//             <Link to="/" className={isActive("/")}>
//               Home
//             </Link>
//             <Link to="/tests" className={isActive("/tests")}>
//               Tests
//             </Link>
//             <Link to="/my-stats" className={isActive("/my-stats")}>
//               My Statistics
//             </Link>
//           </nav>
//         </div>

//         <div className="flex items-center gap-3">
//           {me ? (
//             <>
//               <div className="text-right hidden sm:block">
//                 <div className="text-sm font-medium text-gray-900">
//                   {me.first_name} {me.last_name}
//                 </div>
//                 <div className="text-xs text-gray-500">@{me.username}</div>
//               </div>
//               <div className="h-10 w-10 rounded-full bg-gray-200 grid place-items-center text-gray-600">
//                 {String(me.first_name || "U")[0]}
//               </div>
//               <button
//                 onClick={logout}
//                 className="rounded-xl border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
//               >
//                 Logout
//               </button>
//             </>
//           ) : (
//             <div className="flex items-center gap-2 text-sm">
//               <Link
//                 to="/login"
//                 className="rounded-xl border border-gray-300 px-3 py-1.5 hover:bg-gray-50"
//               >
//                 Login
//               </Link>
//               <Link
//                 to="/register"
//                 className="rounded-xl bg-gray-900 text-white px-3 py-1.5 hover:bg-gray-800"
//               >
//                 Register
//               </Link>
//             </div>
//           )}
//         </div>
//       </div>
//     </header>
//   );
// };

import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export const NavbarStudent = ({ me }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isActive = (p) =>
    pathname === p
      ? "text-gray-900 font-medium"
      : "text-gray-600 hover:text-gray-900";

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Mobile drawer state
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const toggle = () => setOpen((v) => !v);
  const closeBtnRef = useRef(null);

  // Close drawer on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock scroll & Esc to close
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      closeBtnRef.current?.focus();
      const onKey = (e) => e.key === "Escape" && setOpen(false);
      window.addEventListener("keydown", onKey);
      return () => {
        document.body.style.overflow = prev;
        window.removeEventListener("keydown", onKey);
      };
    }
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: logo + desktop nav */}
          <div className="flex items-center gap-4">
            {/* Hamburger (<= 940px) */}
            <button
              onClick={toggle}
              className="inline-flex min-[941px]:hidden items-center justify-center h-10 w-10 rounded-lg border border-gray-200 hover:bg-gray-50 active:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Open menu"
              aria-expanded={open}
              aria-controls="mobile-drawer"
            >
              {/* Bars icon */}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5 stroke-gray-700"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <Link to="/" className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-blue-600 text-white grid place-items-center shadow">
                <span className="font-bold">S</span>
              </div>
              <span className="font-semibold text-gray-900">
                Student Portal
              </span>
            </Link>

            {/* Desktop nav (>= 941px) */}
            <nav className="hidden min-[941px]:flex items-center gap-6 text-sm ml-4">
              <Link to="/" className={isActive("/")}>
                Home
              </Link>
              <Link to="/tests" className={isActive("/tests")}>
                Tests
              </Link>
              <Link to="/my-stats" className={isActive("/my-stats")}>
                My Statistics
              </Link>
            </nav>
          </div>

          {/* Right: user/actions */}
          <div className="flex items-center gap-3">
            {me ? (
              <>
                {/* Hide name block on small screens to save space */}
                <div className="text-right hidden max-[940px]:hidden sm:block">
                  <div className="text-sm font-medium text-gray-900">
                    {me.first_name} {me.last_name}
                  </div>
                  <div className="text-xs text-gray-500">@{me.username}</div>
                </div>
                <div className="h-10 w-10 rounded-full bg-gray-200 grid place-items-center text-gray-600">
                  {String(me.first_name || "U")[0]}
                </div>
                <button
                  onClick={logout}
                  className="rounded-xl border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 text-sm">
                <Link
                  to="/login"
                  className="rounded-xl border border-gray-300 px-3 py-1.5 hover:bg-gray-50"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-xl bg-gray-900 text-white px-3 py-1.5 hover:bg-gray-800"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {open && (
        <div
          id="mobile-drawer"
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-40"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={close}
            aria-hidden="true"
          />
          {/* Panel */}
          <aside
            className="absolute inset-y-0 left-0 w-72 max-w-[85%] bg-white shadow-xl border-r border-gray-200
                       transition-transform duration-300 ease-out translate-x-0 will-change-transform"
          >
            {/* Header inside drawer */}
            <div className="h-16 px-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-blue-600 text-white grid place-items-center shadow">
                  <span className="font-bold">S</span>
                </div>
                <span className="font-semibold text-gray-900">Menu</span>
              </div>
              <button
                ref={closeBtnRef}
                onClick={close}
                className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Close menu"
              >
                {/* X icon */}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5 stroke-gray-700"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            {/* User section (optional) */}
            {me && (
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-200 grid place-items-center text-gray-600">
                    {String(me.first_name || "U")[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {me.first_name} {me.last_name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      @{me.username}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Nav items */}
            <nav className="px-2 py-2 text-[15px]">
              <Link
                to="/"
                onClick={close}
                className={`block rounded-lg px-3 py-2 ${isActive(
                  "/"
                )} hover:bg-gray-50`}
              >
                Home
              </Link>
              <Link
                to="/tests"
                onClick={close}
                className={`block rounded-lg px-3 py-2 ${isActive(
                  "/tests"
                )} hover:bg-gray-50`}
              >
                Tests
              </Link>
              <Link
                to="/my-stats"
                onClick={close}
                className={`block rounded-lg px-3 py-2 ${isActive(
                  "/my-stats"
                )} hover:bg-gray-50`}
              >
                My Statistics
              </Link>

              <div className="h-px my-2 bg-gray-200" />

              {me ? (
                <button
                  onClick={() => {
                    close();
                    logout();
                  }}
                  className="w-full text-left block rounded-lg px-3 py-2 text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2 px-1">
                  <Link
                    to="/login"
                    onClick={close}
                    className="text-center rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={close}
                    className="text-center rounded-lg bg-gray-900 text-white px-3 py-2 text-sm hover:bg-gray-800"
                  >
                    Register
                  </Link>
                </div>
              )}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
};
