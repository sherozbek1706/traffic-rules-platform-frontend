// import { useEffect, useState } from "react";
// import { clientGetRequest, clientPostRequest } from "../../request";
// import { success_notify } from "../../shared/notify";
// import { useNavigate, Link } from "react-router-dom";
// import BG from "../../assets/dashboard-login2.jpg";

// export const Register = () => {
//   const [form, setForm] = useState({
//     first_name: "",
//     last_name: "",
//     phone_number: "",
//     username: "",
//     password: "",
//     group_id: "", // tanlanmasa bo'sh string
//   });
//   const [busy, setBusy] = useState(false);
//   const [serverError, setServerError] = useState("");

//   // Groups state
//   const [groups, setGroups] = useState([]);
//   const [groupsLoading, setGroupsLoading] = useState(false);
//   const [groupsError, setGroupsError] = useState("");

//   const navigate = useNavigate();

//   const loadGroups = async () => {
//     try {
//       setGroupsLoading(true);
//       setGroupsError("");
//       const res = await clientGetRequest("/groups/list");
//       const list = Array.isArray(res?.data)
//         ? res.data
//         : res?.data?.result ?? [];
//       setGroups(list);
//     } catch (e) {
//       setGroupsError(e?.message || "Guruhlar ro'yxatini yuklashda xatolik");
//     } finally {
//       setGroupsLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadGroups();
//   }, []);

//   const onChange = (e) => {
//     setServerError("");
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const onSubmit = async (e) => {
//     e.preventDefault();
//     setServerError("");
//     setBusy(true);
//     // group_id: tanlanmasa null, tanlansa Number
//     const payload = {
//       ...form,
//       group_id: form.group_id === "" ? null : Number(form.group_id),
//     };

//     try {
//       const res = await clientPostRequest("/students/register", payload);
//       if (res?.data) {
//         success_notify("Ro‘yxatdan o‘tildi! Endi login qiling.");
//         navigate("/login");
//       }
//     } catch (err) {
//       setServerError(
//         err?.response?.data?.message ||
//           err?.message ||
//           "Ro‘yxatdan o‘tishda xatolik yuz berdi"
//       );
//     } finally {
//       setBusy(false);
//     }
//   };

//   return (
//     <div
//       // className="min-h-screen flex items-center justify-center bg-gray-500 p-4 sm:p-6"
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

//       <div className="w-full z-10 max-w-xl rounded-2xl bg-white p-6 sm:p-8 shadow">
//         <h1 className="text-2xl font-semibold text-gray-800">
//           Student Register
//         </h1>
//         <p className="mt-1 text-sm text-gray-500">Yangi profil yarating.</p>

//         {serverError && (
//           <div className="mt-4 rounded-xl bg-red-50 text-red-700 ring-1 ring-red-200 px-4 py-3 text-sm">
//             {serverError}
//           </div>
//         )}

//         <form
//           onSubmit={onSubmit}
//           className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4"
//         >
//           <div>
//             <label className="block text-sm text-gray-700">First name</label>
//             <input
//               name="first_name"
//               value={form.first_name}
//               onChange={onChange}
//               required
//               className="mt-1 w-full rounded-xl border border-gray-200 p-3 outline-none focus:ring-2 focus:ring-blue-500/40"
//             />
//           </div>
//           <div>
//             <label className="block text-sm text-gray-700">Last name</label>
//             <input
//               name="last_name"
//               value={form.last_name}
//               onChange={onChange}
//               required
//               className="mt-1 w-full rounded-xl border border-gray-200 p-3 outline-none focus:ring-2 focus:ring-blue-500/40"
//             />
//           </div>

//           <div className="md:col-span-2">
//             <label className="block text-sm text-gray-700">Phone number</label>
//             <input
//               name="phone_number"
//               value={form.phone_number}
//               onChange={onChange}
//               required
//               placeholder="+99890..."
//               className="mt-1 w-full rounded-xl border border-gray-200 p-3 outline-none focus:ring-2 focus:ring-blue-500/40"
//             />
//           </div>

//           <div>
//             <label className="block text-sm text-gray-700">Username</label>
//             <input
//               name="username"
//               value={form.username}
//               onChange={onChange}
//               required
//               className="mt-1 w-full rounded-xl border border-gray-200 p-3 outline-none focus:ring-2 focus:ring-blue-500/40"
//             />
//           </div>
//           <div>
//             <label className="block text-sm text-gray-700">Password</label>
//             <input
//               type="password"
//               name="password"
//               value={form.password}
//               onChange={onChange}
//               required
//               className="mt-1 w-full rounded-xl border border-gray-200 p-3 outline-none focus:ring-2 focus:ring-blue-500/40"
//             />
//           </div>

//           {/* Group select (optional) */}
//           <div className="md:col-span-2">
//             <label className="block text-sm text-gray-700">
//               Group (ixtiyoriy)
//             </label>

//             {groupsError ? (
//               <div className="mt-1 flex items-center gap-2">
//                 <div className="text-sm text-red-600">{groupsError}</div>
//                 <button
//                   type="button"
//                   onClick={loadGroups}
//                   className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
//                 >
//                   Qayta urinish
//                 </button>
//               </div>
//             ) : (
//               <select
//                 name="group_id"
//                 value={form.group_id}
//                 onChange={onChange}
//                 disabled={groupsLoading}
//                 className="mt-1 w-full rounded-xl border border-gray-200 p-3 outline-none focus:ring-2 focus:ring-blue-500/40 bg-white"
//               >
//                 <option value="">
//                   {groupsLoading
//                     ? "Yuklanmoqda..."
//                     : "Guruh tanlang (ixtiyoriy)"}
//                 </option>
//                 {!groupsLoading &&
//                   groups.map((g) => (
//                     <option key={g.id} value={g.id}>
//                       {g.name} (#{g.id})
//                     </option>
//                   ))}
//               </select>
//             )}
//             <p className="mt-1 text-xs text-gray-500">
//               Agar hozir guruhingiz noma’lum bo‘lsa, bu maydonni bo‘sh
//               qoldiring.
//             </p>
//           </div>

//           <div className="md:col-span-2">
//             <button
//               type="submit"
//               disabled={busy}
//               className="w-full rounded-xl bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
//             >
//               {busy ? "Yuklanmoqda..." : "Register"}
//             </button>
//           </div>
//         </form>

//         <p className="mt-4 text-center text-sm text-gray-600">
//           Allaqachon akkaunt bormi?{" "}
//           <Link to="/login" className="text-blue-600 hover:underline">
//             Login
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// };

import { useEffect, useState } from "react";
import { clientGetRequest, clientPostRequest } from "../../request";
import { success_notify } from "../../shared/notify";
import { useNavigate, Link } from "react-router-dom";
import BG from "../../assets/dashboard-login2.jpg";
import {
  FiUser,
  FiPhone,
  FiLock,
  FiUsers,
  FiEye,
  FiEyeOff,
  FiUserPlus,
} from "react-icons/fi";

export const Register = () => {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    username: "",
    password: "",
    group_id: "",
  });
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Groups
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupsError, setGroupsError] = useState("");

  const navigate = useNavigate();

  const loadGroups = async () => {
    try {
      setGroupsLoading(true);
      setGroupsError("");
      const res = await clientGetRequest("/groups/list");
      const list = Array.isArray(res?.data)
        ? res.data
        : res?.data?.result ?? [];
      setGroups(list);
    } catch (e) {
      setGroupsError(e?.message || "Guruhlar ro‘yxatini yuklashda xatolik");
    } finally {
      setGroupsLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, []);

  const onChange = (e) => {
    setServerError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setServerError("");
    setBusy(true);
    const payload = {
      ...form,
      group_id: form.group_id === "" ? null : Number(form.group_id),
    };
    try {
      const res = await clientPostRequest("/students/register", payload);
      if (res?.data) {
        success_notify("Ro‘yxatdan o‘tildi! Endi login qiling.");
        navigate("/login");
      }
    } catch (err) {
      setServerError(
        err?.response?.data?.message ||
          err?.message ||
          "Ro‘yxatdan o‘tishda xatolik yuz berdi"
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen grid lg:grid-cols-2">
      {/* Left banner */}
      <div
        className="relative hidden lg:block"
        style={{
          backgroundImage: `url(${BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />
        <div className="relative h-full p-12 flex items-center">
          <div className="max-w-xl text-white">
            <div className="inline-flex items-center gap-3 rounded-full bg-white/10 px-4 py-2 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-sm tracking-wide">Create your account</span>
            </div>
            <h1 className="mt-6 text-4xl font-bold leading-tight">
              Bir necha qadamda tizimga qo‘shiling
            </h1>
            <p className="mt-3 text-white/80">
              Profilingizni yarating, guruhni tanlang va testlar bo‘limiga
              kiring.
            </p>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="relative flex items-center justify-center p-6 sm:p-10">
        <div
          className="absolute inset-0 -z-10 lg:hidden"
          style={{
            backgroundImage: `url(${BG})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 -z-10 bg-white/70 backdrop-blur-sm lg:bg-transparent" />

        <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white/80 p-6 sm:p-8 shadow-xl backdrop-blur">
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-white shadow-lg">
                <FiUserPlus className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">
                  Student Register
                </h2>
                <p className="text-sm text-slate-500">Yangi profil yarating</p>
              </div>
            </div>
          </div>

          {serverError && (
            <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {serverError}
            </div>
          )}

          <form
            onSubmit={onSubmit}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            {/* First name */}
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                First name
              </span>
              <div className="relative">
                <FiUser className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  name="first_name"
                  value={form.first_name}
                  onChange={onChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white px-10 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </label>

            {/* Last name */}
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Last name
              </span>
              <div className="relative">
                <FiUser className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  name="last_name"
                  value={form.last_name}
                  onChange={onChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white px-10 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </label>

            {/* Phone */}
            <label className="md:col-span-2 block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Phone number
              </span>
              <div className="relative">
                <FiPhone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  name="phone_number"
                  value={form.phone_number}
                  onChange={onChange}
                  required
                  placeholder="+99890..."
                  className="w-full rounded-2xl border border-slate-200 bg-white px-10 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </label>

            {/* Username */}
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Username
              </span>
              <div className="relative">
                <FiUser className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  name="username"
                  value={form.username}
                  onChange={onChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white px-10 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
              </div>
            </label>

            {/* Password */}
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Password
              </span>
              <div className="relative">
                <FiLock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white px-10 py-3 pr-12 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
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

            {/* Group select */}
            <label className="md:col-span-2 block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">
                Group (ixtiyoriy)
              </span>

              {groupsError ? (
                <div className="mt-1 flex items-center gap-2">
                  <div className="text-sm text-rose-600">{groupsError}</div>
                  <button
                    type="button"
                    onClick={loadGroups}
                    className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
                  >
                    Qayta urinish
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <FiUsers className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    name="group_id"
                    value={form.group_id}
                    onChange={onChange}
                    disabled={groupsLoading}
                    className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-10 py-3 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                  >
                    <option value="">
                      {groupsLoading
                        ? "Yuklanmoqda..."
                        : "Guruh tanlang (ixtiyoriy)"}
                    </option>
                    {!groupsLoading &&
                      groups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name} (#{g.id})
                        </option>
                      ))}
                  </select>
                </div>
              )}
              <p className="mt-1 text-xs text-slate-500">
                Agar hozir guruhingiz noma’lum bo‘lsa, bu maydonni bo‘sh
                qoldiring.
              </p>
            </label>

            {/* Submit */}
            <div className="md:col-span-2">
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
                <span>Register</span>
              </button>
            </div>
          </form>

          <p className="mt-5 text-center text-sm text-slate-600">
            Allaqachon akkaunt bormi?{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
