// import { useState } from "react";
// import LoginDashboardBg from "../../assets/dashboard-login2.jpg";
// import { useDispatch, useSelector } from "react-redux";
// import { loginAdmin } from "../../redux/slice/admin-slice.js";
// import { Errors } from "../../utils/error.jsx";
// import { success_notify } from "../../shared/notify";
// export const LoginDashboard = () => {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");

//   const dispatch = useDispatch();
//   const { status, loading, error } = useSelector((state) => state.admin);

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     dispatch(loginAdmin({ username, password }))
//       .unwrap()
//       .then(({ token }) => {
//         success_notify("Muvaffaqiyatli kirdingiz!");
//         localStorage.setItem("admin_token", token);
//         setTimeout(() => {
//           window.location.assign("/dashboard-panel-admin/xyz/");
//         }, 1500);
//       })
//       .catch((error) => {
//         Errors(error);
//       });
//   };

//   return (
//     <div
//       className="min-h-screen flex items-center justify-center p-4"
//       style={{
//         backgroundImage: `url(${LoginDashboardBg})`,
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//         backgroundRepeat: "no-repeat",
//       }}
//     >
//       {/* Overlay with blur and dark tint */}
//       <div className="absolute inset-0 bg-[#0000001f] backdrop-blur-[3px]"></div>

//       {/* Login Form Container */}
//       <div className="relative z-10 w-full max-w-md">
//         <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
//           {/* Logo/Header */}
//           <div className="text-center mb-8">
//             <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
//               <svg
//                 className="w-8 h-8 text-white"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
//                 />
//               </svg>
//             </div>
//             <h1 className="text-3xl font-bold text-gray-900 mb-2">
//               Login Dashboard
//             </h1>
//             <p className="text-gray-600 text-sm">
//               Admin Paneldan foydalanish uchun tizimga kiring
//             </p>
//           </div>

//           {/* Login Form */}
//           <form className="space-y-6" onSubmit={handleSubmit}>
//             <div>
//               <label
//                 htmlFor="username"
//                 className="block text-sm font-medium text-gray-700 mb-2"
//               >
//                 Username
//               </label>
//               <div className="relative">
//                 <input
//                   id="username"
//                   name="username"
//                   type="text"
//                   required
//                   value={username}
//                   onChange={(e) => setUsername(e.target.value)}
//                   className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
//                   placeholder="Enter your username"
//                 />
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <svg
//                     className="h-5 w-5 text-gray-400"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
//                     />
//                   </svg>
//                 </div>
//               </div>
//             </div>

//             <div>
//               <label
//                 htmlFor="password"
//                 className="block text-sm font-medium text-gray-700 mb-2"
//               >
//                 Password
//               </label>
//               <div className="relative">
//                 <input
//                   id="password"
//                   name="password"
//                   type="password"
//                   required
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
//                   placeholder="Enter your password"
//                 />
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <svg
//                     className="h-5 w-5 text-gray-400"
//                     fill="none"
//                     stroke="currentColor"
//                     viewBox="0 0 24 24"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
//                     />
//                   </svg>
//                 </div>
//               </div>
//             </div>

//             <div className="flex items-center justify-between">
//               {/* <div className="flex items-center">
//                 <input
//                   id="remember-me"
//                   name="remember-me"
//                   type="checkbox"
//                   className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                 />
//                 <label
//                   htmlFor="remember-me"
//                   className="ml-2 block text-sm text-gray-700"
//                 >
//                   Meni eslab qol
//                 </label>
//               </div> */}

//               {/* <a
//                 href="#"
//                 className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
//               >
//                 Forgot password?
//               </a> */}
//             </div>

//             <button
//               type="submit"
//               className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 hover:cursor-pointer shadow-lg"
//             >
//               Login Dashboard
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// src/pages/auth/LoginDashboard.jsx (or your existing file path)
import React, { useEffect, useMemo, useState } from "react";
import LoginDashboardBg from "../../assets/dashboard-login2.jpg";
import { useDispatch, useSelector } from "react-redux";
import { loginAdmin } from "../../redux/slice/admin-slice.js";
import { Errors } from "../../utils/error.jsx";
import { success_notify } from "../../shared/notify";
import {
  HiLockClosed,
  HiUser,
  HiEye,
  HiEyeOff,
  HiInformationCircle,
} from "react-icons/hi";

/**
 * Admin Login (Redesigned)
 * ---------------------------------------------------------------------------
 * - Modern, responsive, glassmorphism look matching the new dashboard UI.
 * - Better UX: visible password toggle, caps-lock hint, loading state,
 *   inline error message, "remember me" for username, accessibility labels.
 * - Keyboard friendly: Enter to submit, focus outlines, proper aria attributes.
 * - Keeps existing auth logic (loginAdmin thunk + token storage key).
 */

export const LoginDashboard = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.admin);

  // -------------------- Local State --------------------
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [remember, setRemember] = useState(true);

  const canSubmit = useMemo(
    () => username.trim().length > 0 && password.length > 0 && !loading,
    [username, password, loading]
  );

  // Prefill username if remembered
  useEffect(() => {
    try {
      const saved = localStorage.getItem("admin_login_username");
      if (saved) setUsername(saved);
    } catch {}
  }, []);

  // -------------------- Handlers --------------------
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    dispatch(loginAdmin({ username, password }))
      .unwrap()
      .then(({ token }) => {
        // Save username if remember is ON
        try {
          if (remember) localStorage.setItem("admin_login_username", username);
          else localStorage.removeItem("admin_login_username");
        } catch {}

        success_notify("Muvaffaqiyatli kirdingiz!");
        localStorage.setItem("admin_token", token); // <-- keep key as-is
        setTimeout(() => {
          window.location.assign("/dashboard-panel-admin/xyz/");
        }, 900);
      })
      .catch((err) => {
        Errors(err);
      });
  };

  const onKeyDown = (e) => {
    setCapsOn(e.getModifierState && e.getModifierState("CapsLock"));
  };

  // -------------------- UI --------------------
  return (
    <div
      className="relative grid min-h-screen grid-cols-1 lg:grid-cols-2"
      style={{
        backgroundImage: `url(${LoginDashboardBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gray-900/70 via-gray-900/40 to-gray-900/70" />

      {/* Left / Branding (hidden on small screens) */}
      <aside className="relative hidden items-center justify-center lg:flex">
        <div className="relative z-10 p-12">
          <div className="mb-6 inline-flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-2 text-white backdrop-blur">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
              <HiLockClosed className="h-5 w-5 text-white" />
            </span>
            <div>
              <div className="text-xl font-bold tracking-tight">AdminPanel</div>
              <div className="text-sm text-white/70">Management System</div>
            </div>
          </div>

          <h1 className="max-w-xl text-4xl font-semibold leading-tight text-white">
            Xavfsiz va tezkor boshqaruv uchun{" "}
            <span className="bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
              Admin Dashboard
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-white/80">
            Tizimga kiring va foydalanuvchilar, testlar hamda savollarni
            boshqaring.
          </p>

          {/* Decorative shapes */}
          <div className="pointer-events-none absolute -right-16 top-10 hidden h-64 w-64 rounded-full bg-gradient-to-tr from-indigo-500/40 to-blue-400/30 blur-3xl lg:block" />
          <div className="pointer-events-none absolute -left-16 bottom-10 hidden h-64 w-64 rounded-full bg-gradient-to-tr from-fuchsia-500/30 to-cyan-400/30 blur-3xl lg:block" />
        </div>
      </aside>

      {/* Right / Form */}
      <section className="relative z-10 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-white/10 bg-white/90 p-6 shadow-2xl backdrop-blur-md sm:p-8">
            {/* Logo compact for mobile */}
            <div className="mb-6 flex items-center gap-3 lg:hidden">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                <HiLockClosed className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">
                  AdminPanel
                </div>
                <div className="text-xs text-gray-500">Management System</div>
              </div>
            </div>

            <header className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                Login Dashboard
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Admin Paneldan foydalanish uchun tizimga kiring
              </p>
            </header>

            {/* Error (inline) */}
            {error ? (
              <div
                role="alert"
                className="mb-4 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-800"
              >
                <HiInformationCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="text-sm">
                  <div className="font-medium">Kirishda xatolik</div>
                  <div className="opacity-90">
                    {/* show a safe string; Errors() already shows toast */}
                    {typeof error === "string"
                      ? error
                      : error?.message || "Noma’lum xatolik yuz berdi."}
                  </div>
                </div>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="grid gap-5">
              {/* Username */}
              <label className="grid gap-1.5" htmlFor="username">
                <span className="text-sm font-medium text-gray-800">
                  Username <span className="text-rose-600">*</span>
                </span>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <HiUser className="h-5 w-5" />
                  </span>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onKeyDown={onKeyDown}
                    className="w-full rounded-xl border border-gray-300 bg-white px-10 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                    placeholder="admin"
                    aria-invalid={!!error}
                  />
                </div>
              </label>

              {/* Password */}
              <label className="grid gap-1.5" htmlFor="password">
                <span className="text-sm font-medium text-gray-800">
                  Password <span className="text-rose-600">*</span>
                </span>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <HiLockClosed className="h-5 w-5" />
                  </span>
                  <input
                    id="password"
                    name="password"
                    type={showPw ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={onKeyDown}
                    className="w-full rounded-xl border border-gray-300 bg-white px-10 py-3 pr-11 text-sm outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:ring-2 focus:ring-gray-200"
                    placeholder="••••••••"
                    aria-invalid={!!error}
                  />
                  <button
                    type="button"
                    aria-label={showPw ? "Hide password" : "Show password"}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                    onClick={() => setShowPw((v) => !v)}
                    tabIndex={0}
                  >
                    {showPw ? (
                      <HiEyeOff className="h-5 w-5" />
                    ) : (
                      <HiEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {capsOn && (
                  <div className="mt-1 flex items-center gap-2 text-xs text-amber-600">
                    <HiInformationCircle className="h-4 w-4" />
                    Caps Lock yoqilgan bo‘lishi mumkin.
                  </div>
                )}
              </label>

              {/* Extras */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <span>Meni eslab qol</span>
                </label>

                {/* Placeholders for future features */}
                {/* <button type="button" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                  Forgot password?
                </button> */}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!canSubmit}
                className={`group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-3 font-medium text-white shadow-lg transition
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                ${
                  canSubmit
                    ? "hover:from-blue-700 hover:to-indigo-800 active:scale-[0.99]"
                    : "opacity-60"
                }
              `}
              >
                {loading ? (
                  <>
                    <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Kirilmoqda…
                  </>
                ) : (
                  "Login Dashboard"
                )}
              </button>

              {/* Hint */}
              <p className="text-center text-xs text-gray-500">
                Xavfsizlik uchun brauzeringizni yopganingizdan so‘ng tizimdan
                chiqishni unutmang.
              </p>
            </form>
          </div>

          {/* Footer tiny note */}
          <div className="mt-4 text-center text-xs text-white/70 lg:text-white/60">
            © {new Date().getFullYear()} AdminPanel • All rights reserved
          </div>
        </div>
      </section>
    </div>
  );
};
