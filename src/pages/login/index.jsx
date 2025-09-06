// import { useState } from "react";
// import { clientPostRequest } from "../../request";
// import { success_notify } from "../../shared/notify";
// import { Link } from "react-router-dom";
// import BG from "../../assets/dashboard-login2.jpg";

// export const Login = () => {
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [busy, setBusy] = useState(false);

//   const onSubmit = async (e) => {
//     e.preventDefault();
//     setBusy(true);
//     const res = await clientPostRequest("/students/login", {
//       username,
//       password,
//     });
//     setBusy(false);
//     const token = res?.data?.token;
//     if (token) {
//       localStorage.setItem("token", token);
//       success_notify("Kirish muvaffaqiyatli!");
//       setTimeout(() => {
//         window.location.assign("/");
//       }, 1000);
//     }
//   };

//   return (
//     <div
//       //  className="min-h-screen flex items-center justify-center bg-gray-50 p-6"
//       className="min-h-screen flex items-center justify-center p-4"
//       style={{
//         backgroundImage: `url(${BG})`,
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//         backgroundRepeat: "no-repeat",
//       }}
//     >
//       {/* Overlay with blur and dark tint */}
//       <div className="absolute inset-0 bg-[#0000001f] backdrop-blur-[3px]"></div>

//       <div className="w-full z-10 max-w-md rounded-2xl bg-white p-8 shadow">
//         <h1 className="text-2xl font-semibold text-gray-800">Student Login</h1>
//         <p className="mt-1 text-sm text-gray-500">Hisobingizga kiring.</p>

//         <form onSubmit={onSubmit} className="mt-6 space-y-4">
//           <div>
//             <label className="block text-sm text-gray-700">Username</label>
//             <input
//               className="mt-1 w-full rounded-xl border border-gray-200 p-3 outline-none focus:ring-2 focus:ring-blue-500/40"
//               placeholder="username"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm text-gray-700">Password</label>
//             <input
//               type="password"
//               className="mt-1 w-full rounded-xl border border-gray-200 p-3 outline-none focus:ring-2 focus:ring-blue-500/40"
//               placeholder="••••••••"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={busy}
//             className="w-full rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
//           >
//             {busy ? "Yuklanmoqda..." : "Login"}
//           </button>
//         </form>

//         <p className="mt-4 text-center text-sm text-gray-600">
//           Akkaunt yo‘qmi?{" "}
//           <Link to="/register" className="text-blue-600 hover:underline">
//             Register
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// };

import { useState } from "react";
import { clientPostRequest } from "../../request";
import { success_notify } from "../../shared/notify";
import { Link } from "react-router-dom";
import BG from "../../assets/dashboard-login2.jpg";
import { FiUser, FiLock, FiEye, FiEyeOff, FiLogIn } from "react-icons/fi";

export const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await clientPostRequest("/students/login", {
        username,
        password,
      });
      const token = res?.data?.token;
      if (token) {
        localStorage.setItem("token", token);
        success_notify("Kirish muvaffaqiyatli!");
        setTimeout(() => window.location.assign("/"), 800);
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Kirishda xatolik. Login yoki parolni tekshiring."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen grid lg:grid-cols-2">
      {/* Left: Hero + background */}
      <div
        className="relative hidden lg:block"
        style={{
          backgroundImage: `url(${BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />
        <div className="relative h-full flex items-center justify-center p-12">
          <div className="max-w-xl text-white">
            <div className="inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm tracking-wide">
                Secure Student Portal
              </span>
            </div>
            <h1 className="mt-6 text-4xl font-bold leading-tight">
              Testlarni oson va xavfsiz yeching
            </h1>
            <p className="mt-3 text-white/80">
              Shaxsiy kabinetingiz orqali tayyor testlarga ulaning, vaqt bilan
              raqobat qiling va natijalaringizni kuzating.
            </p>
          </div>
        </div>
      </div>

      {/* Right: Auth Card */}
      <div className="relative flex items-center justify-center p-6 sm:p-10">
        {/* soft background on mobile too */}
        <div
          className="absolute inset-0 -z-10 lg:hidden"
          style={{
            backgroundImage: `url(${BG})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 -z-10 bg-white/70 backdrop-blur-sm lg:bg-transparent" />

        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/80 p-7 shadow-xl backdrop-blur">
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg">
                <FiLogIn className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">
                  Student Login
                </h2>
                <p className="text-sm text-slate-500">Hisobingizga kiring</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Username
              </span>
              <div className="relative">
                <FiUser className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-white px-10 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
              </span>
              <div className="relative">
                <FiLock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPass ? "text" : "password"}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-10 py-3 pr-12 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 hover:bg-slate-100"
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={busy}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {busy && (
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    className="opacity-25"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z"
                  />
                </svg>
              )}
              <span>Login</span>
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-600">
            Akkaunt yo‘qmi?{" "}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:underline"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
