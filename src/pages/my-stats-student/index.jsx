// // src/pages/my-stats-student/index.jsx
// import { useEffect, useMemo, useState, Fragment } from "react";
// import { clientGetRequest } from "../../request";

// // --- Helpers ---
// function tryParseJSON(str) {
//   try {
//     return JSON.parse(str);
//   } catch {
//     return null;
//   }
// }

// function base64UrlDecode(str) {
//   try {
//     const pad = (s) => s + "===".slice((s.length + 3) % 4);
//     const b64 = pad(str).replace(/-/g, "+").replace(/_/g, "/");
//     return atob(b64);
//   } catch {
//     return "";
//   }
// }

// /** Token ichidan student id ni topish (keng qamrovli) */
// function getIdFromToken() {
//   if (typeof window === "undefined") return null;
//   const candidates = [
//     localStorage.getItem("token"),
//     localStorage.getItem("access_token"),
//     localStorage.getItem("auth_token"),
//   ].filter(Boolean);
//   if (!candidates.length) return null;

//   for (const t of candidates) {
//     const token = String(t);
//     const parts = token.split(".");
//     if (parts.length >= 2) {
//       const payloadStr = base64UrlDecode(parts[1]);
//       const payload = tryParseJSON(payloadStr) || {};
//       const id =
//         payload.id ??
//         payload.student_id ??
//         payload.user_id ??
//         payload?.user?.id ??
//         (typeof payload.sub === "string" && /^\d+$/.test(payload.sub)
//           ? Number(payload.sub)
//           : null);
//       if (id != null) return id;
//     }
//   }
//   return null;
// }

// function fmtDate(iso) {
//   if (!iso) return "—";
//   const d = new Date(iso);
//   return d.toLocaleString(undefined, {
//     year: "numeric",
//     month: "short",
//     day: "2-digit",
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// }

// function fmtDuration(sec) {
//   if (sec == null) return "—";
//   const m = Math.floor(sec / 60);
//   const s = sec % 60;
//   return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
// }

// function Ring({ percent = 0 }) {
//   const p = Math.max(0, Math.min(100, Math.round(percent)));
//   const deg = p * 3.6;
//   return (
//     <div className="relative h-24 w-24 sm:h-28 sm:w-28">
//       <div className="absolute inset-0 rounded-full bg-slate-100" />
//       <div
//         className="absolute inset-0 rounded-full"
//         style={{
//           background: `conic-gradient(#111827 ${deg}deg, #e5e7eb ${deg}deg)`,
//         }}
//       />
//       <div
//         className="absolute inset-0 rounded-full bg-white"
//         style={{
//           mask: "radial-gradient(circle at 50% 50%, transparent 58%, black 59%)",
//           WebkitMask:
//             "radial-gradient(circle at 50% 50%, transparent 58%, black 59%)",
//         }}
//       />
//       <div className="absolute inset-0 grid place-items-center">
//         <div className="text-xl font-bold text-slate-900">{p}%</div>
//       </div>
//     </div>
//   );
// }

// function Chip({ children, tone = "slate" }) {
//   const tones = {
//     slate: "bg-slate-100 text-slate-700 border-slate-200",
//     green: "bg-emerald-100 text-emerald-700 border-emerald-200",
//     rose: "bg-rose-100 text-rose-700 border-rose-200",
//     amber: "bg-amber-100 text-amber-800 border-amber-200",
//     blue: "bg-blue-100 text-blue-700 border-blue-200",
//   };
//   return (
//     <span
//       className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs ${
//         tones[tone] || tones.slate
//       }`}
//     >
//       {children}
//     </span>
//   );
// }

// export const MyStatsStudent = () => {
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState("");
//   const [stats, setStats] = useState(null);
//   const [openTestId, setOpenTestId] = useState(null); // collapsible

//   useEffect(() => {
//     (async () => {
//       try {
//         setErr("");
//         setLoading(true);

//         const id = getIdFromToken();
//         if (id == null) {
//           throw new Error("Token topilmadi yoki token ichida id yo‘q.");
//         }

//         const res = await clientGetRequest(
//           `/students/${encodeURIComponent(id)}/stats`
//         );
//         const payload = res?.data?.data || res?.data || res;
//         setStats(payload);
//       } catch (e) {
//         setErr(
//           e?.response?.data?.message ||
//             e?.message ||
//             "Ma’lumotni olishda xatolik"
//         );
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   const student = stats?.student || null;
//   const totals = stats?.totals || {};
//   const perTest = stats?.per_test || [];
//   const attempts = stats?.attempts || [];

//   const avgScore = Number(totals?.avg_score ?? 0);
//   const attemptsCount = Number(totals?.attempts_count ?? 0);
//   const testsTaken = Number(totals?.tests_taken_count ?? 0);
//   const lastAttemptAt = totals?.last_attempt_at || null;

//   const bestRecent = useMemo(() => {
//     if (!attempts?.length) return null;
//     return attempts.reduce(
//       (best, a) => (a.score > (best?.score ?? -1) ? a : best),
//       null
//     );
//   }, [attempts]);

//   return (
//     <Fragment>
//       {loading ? (
//         <div className="rounded-2xl bg-white p-6 shadow">Yuklanmoqda…</div>
//       ) : err ? (
//         <div className="rounded-2xl bg-red-50 p-6 text-red-700 ring-1 ring-red-200 shadow">
//           {err}
//         </div>
//       ) : !stats ? (
//         <div className="rounded-2xl border border-dashed p-8 text-center text-slate-500">
//           Ma’lumot topilmadi.
//         </div>
//       ) : (
//         <div className="grid gap-6 ">
//           {/* Header */}
//           <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
//             <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
//               <div className="flex items-center gap-4">
//                 <Ring percent={avgScore} />
//                 <div>
//                   <h1 className="text-lg sm:text-xl font-semibold text-slate-900">
//                     Mening statistikalarim
//                   </h1>
//                   <p className="text-sm text-slate-600">
//                     {student?.first_name || ""} {student?.last_name || ""}{" "}
//                     {student?.username ? (
//                       <span className="text-slate-400">
//                         • @{student.username}
//                       </span>
//                     ) : null}
//                   </p>
//                   {student?.group_id != null && (
//                     <div className="mt-1">
//                       <Chip tone="blue">Guruh: #{student.group_id}</Chip>
//                     </div>
//                   )}
//                 </div>
//               </div>
//               <div className="flex flex-wrap items-center gap-2">
//                 <Chip>
//                   <span className="font-medium">Urinishlar:</span>{" "}
//                   {attemptsCount}
//                 </Chip>
//                 <Chip tone="green">
//                   <span className="font-medium">Testlar:</span> {testsTaken}
//                 </Chip>
//                 <Chip tone="amber">
//                   <span className="font-medium">O‘rtacha:</span> {avgScore}%
//                 </Chip>
//                 <Chip>
//                   <span className="font-medium">Oxirgi urinish:</span>{" "}
//                   {fmtDate(lastAttemptAt)}
//                 </Chip>
//               </div>
//             </div>
//           </div>

//           {/* Per-test stats */}
//           <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
//             <div className="mb-3 flex items-center justify-between">
//               <h3 className="text-sm font-semibold text-slate-900">
//                 Testlar bo‘yicha natijalar
//               </h3>
//               <span className="text-xs text-slate-500">
//                 Jami: {perTest.length}
//               </span>
//             </div>

//             {perTest.length === 0 ? (
//               <div className="rounded-xl border border-dashed p-6 text-center text-sm text-slate-500">
//                 Hali testlar bo‘yicha statistika yo‘q.
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {perTest.map((t) => {
//                   const open = openTestId === t.test_id;
//                   const tone =
//                     t.avg_score >= 90
//                       ? "border-emerald-200 bg-emerald-50/40"
//                       : t.avg_score >= 70
//                       ? "border-lime-200 bg-lime-50/40"
//                       : t.avg_score >= 50
//                       ? "border-amber-200 bg-amber-50/40"
//                       : "border-rose-200 bg-rose-50/40";
//                   return (
//                     <div
//                       key={t.test_id}
//                       className={`rounded-2xl border p-4 sm:p-5 transition ${tone}`}
//                     >
//                       <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
//                         <div className="min-w-0 flex-1">
//                           <div className="text-sm font-semibold text-slate-900 line-clamp-2">
//                             {t.test_title || `Test #${t.test_id}`}
//                           </div>
//                           <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
//                             <Chip>Urinishlar: {t.attempts_count}</Chip>
//                             <Chip tone="amber">O‘rtacha: {t.avg_score}%</Chip>
//                             <Chip tone="green">
//                               Eng yaxshi: {t.best_score}%
//                             </Chip>
//                             <Chip>Oxirgisi: {t.last_score}%</Chip>
//                             <Chip>
//                               Oxirgi urinish: {fmtDate(t.last_attempt_at)}
//                             </Chip>
//                           </div>
//                         </div>

//                         <button
//                           onClick={() => setOpenTestId(open ? null : t.test_id)}
//                           className="self-start rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs hover:bg-slate-50"
//                         >
//                           {open ? "Yopish ↑" : "Ko‘rish ↓"}
//                         </button>
//                       </div>

//                       {open && (
//                         <div className="mt-4 rounded-xl border border-slate-200 bg-white overflow-hidden">
//                           <div className="overflow-x-auto">
//                             <table className="min-w-full text-sm">
//                               <thead>
//                                 <tr className="bg-slate-50 text-slate-600">
//                                   <th className="px-4 py-3 text-left font-medium border-b border-slate-200">
//                                     Urinish
//                                   </th>
//                                   <th className="px-4 py-3 text-left font-medium border-b border-slate-200">
//                                     Boshlanish
//                                   </th>
//                                   <th className="px-4 py-3 text-left font-medium border-b border-slate-200">
//                                     Tugash
//                                   </th>
//                                   <th className="px-4 py-3 text-left font-medium border-b border-slate-200">
//                                     Davomiylik
//                                   </th>
//                                   <th className="px-4 py-3 text-left font-medium border-b border-slate-200">
//                                     To'g'ri javoblar
//                                   </th>
//                                   <th className="px-4 py-3 text-left font-medium border-b border-slate-200">
//                                     Foiz
//                                   </th>
//                                   <th className="px-4 py-3 text-left font-medium border-b border-slate-200">
//                                     Holat
//                                   </th>
//                                 </tr>
//                               </thead>
//                               <tbody>
//                                 {(t.attempts || []).map((a, index) => (
//                                   <tr
//                                     key={a.id}
//                                     className={
//                                       index % 2 === 0
//                                         ? "bg-white"
//                                         : "bg-slate-50"
//                                     }
//                                   >
//                                     <td className="px-4 py-3 border-b border-slate-100">
//                                       #{a.id}
//                                     </td>
//                                     <td className="px-4 py-3 border-b border-slate-100">
//                                       {fmtDate(a.start_time)}
//                                     </td>
//                                     <td className="px-4 py-3 border-b border-slate-100">
//                                       {fmtDate(a.end_time)}
//                                     </td>
//                                     <td className="px-4 py-3 border-b border-slate-100">
//                                       {fmtDuration(a.duration_sec)}
//                                     </td>
//                                     <td className="px-4 py-3 border-b border-slate-100">
//                                       {a.correct_count}/{a.answered_count}
//                                     </td>
//                                     <td className="px-4 py-3 border-b border-slate-100">
//                                       <span className="font-semibold">
//                                         {a.score}%
//                                       </span>
//                                     </td>
//                                     <td className="px-4 py-3 border-b border-slate-100">
//                                       {a.is_finished ? (
//                                         <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs text-emerald-700 ring-1 ring-emerald-200">
//                                           Yakunlangan
//                                         </span>
//                                       ) : (
//                                         <span className="rounded-md bg-amber-100 px-2 py-1 text-xs text-amber-700 ring-1 ring-amber-200">
//                                           Faol
//                                         </span>
//                                       )}
//                                     </td>
//                                   </tr>
//                                 ))}
//                               </tbody>
//                             </table>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>

//           {/* Recent attempts (flat) */}
//           <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
//             <div className="mb-3 flex items-center justify-between">
//               <h3 className="text-sm font-semibold text-slate-900">
//                 Oxirgi urinishlar
//               </h3>
//               {bestRecent && (
//                 <span className="text-xs text-slate-500">
//                   Eng yaxshi:{" "}
//                   <span className="font-semibold">{bestRecent.score}%</span> (#
//                   {bestRecent.id})
//                 </span>
//               )}
//             </div>

//             {attempts.length === 0 ? (
//               <div className="rounded-xl border border-dashed p-6 text-center text-sm text-slate-500">
//                 Hali urinishlar yo‘q.
//               </div>
//             ) : (
//               <div className="overflow-x-auto">
//                 <table className="min-w-full text-sm">
//                   <thead>
//                     <tr className="bg-slate-50 text-slate-600">
//                       <th className="px-3 py-2 text-left font-medium">
//                         Attempt
//                       </th>
//                       <th className="px-3 py-2 text-left font-medium">Test</th>
//                       <th className="px-3 py-2 text-left font-medium">
//                         Boshlanish
//                       </th>
//                       <th className="px-3 py-2 text-left font-medium">
//                         Tugash
//                       </th>
//                       <th className="px-3 py-2 text-left font-medium">
//                         Davomiylik
//                       </th>
//                       <th className="px-3 py-2 text-left font-medium">
//                         To‘g‘ri/Jami
//                       </th>
//                       <th className="px-3 py-2 text-left font-medium">Score</th>
//                       <th className="px-3 py-2 text-left font-medium">Holat</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {attempts.map((a) => (
//                       <tr key={a.id} className="border-t">
//                         <td className="px-3 py-2">#{a.id}</td>
//                         <td className="px-3 py-2">
//                           {a.test_title || `Test #${a.test_id}`}
//                         </td>
//                         <td className="px-3 py-2">{fmtDate(a.start_time)}</td>
//                         <td className="px-3 py-2">{fmtDate(a.end_time)}</td>
//                         <td className="px-3 py-2">
//                           {fmtDuration(a.duration_sec)}
//                         </td>
//                         <td className="px-3 py-2">
//                           <span className="tabular-nums">
//                             {a.correct_count}/{a.answered_count}
//                           </span>
//                         </td>
//                         <td className="px-3 py-2">
//                           <span
//                             className={`font-semibold ${
//                               a.score >= 90
//                                 ? "text-emerald-700"
//                                 : a.score >= 70
//                                 ? "text-lime-700"
//                                 : a.score >= 50
//                                 ? "text-amber-700"
//                                 : "text-rose-700"
//                             }`}
//                           >
//                             {a.score}%
//                           </span>
//                         </td>
//                         <td className="px-3 py-2">
//                           {a.is_finished ? (
//                             <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700 ring-1 ring-emerald-200">
//                               finished
//                             </span>
//                           ) : (
//                             <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs text-amber-700 ring-1 ring-amber-200">
//                               active
//                             </span>
//                           )}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </Fragment>
//   );
// };

// src/pages/my-stats-student/index.jsx
import { useEffect, useMemo, useState, Fragment } from "react";
import { clientGetRequest } from "../../request";

// --- Helpers ---
function tryParseJSON(str) {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

function base64UrlDecode(str) {
  try {
    const pad = (s) => s + "===".slice((s.length + 3) % 4);
    const b64 = pad(str).replace(/-/g, "+").replace(/_/g, "/");
    return atob(b64);
  } catch {
    return "";
  }
}

/** Token ichidan student id ni topish (keng qamrovli) */
function getIdFromToken() {
  if (typeof window === "undefined") return null;
  const candidates = [
    localStorage.getItem("token"),
    localStorage.getItem("access_token"),
    localStorage.getItem("auth_token"),
  ].filter(Boolean);
  if (!candidates.length) return null;

  for (const t of candidates) {
    const token = String(t);
    const parts = token.split(".");
    if (parts.length >= 2) {
      const payloadStr = base64UrlDecode(parts[1]);
      const payload = tryParseJSON(payloadStr) || {};
      const id =
        payload.id ??
        payload.student_id ??
        payload.user_id ??
        payload?.user?.id ??
        (typeof payload.sub === "string" && /^\d+$/.test(payload.sub)
          ? Number(payload.sub)
          : null);
      if (id != null) return id;
    }
  }
  return null;
}

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtDuration(sec) {
  if (sec == null) return "—";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// function Ring({ percent = 0 }) {
//   const p = Math.max(0, Math.min(100, Math.round(percent)));
//   const deg = p * 3.6;
//   return (
//     <div className="relative h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 shrink-0">
//       <div className="absolute inset-0 rounded-full bg-slate-100" />
//       <div
//         className="absolute inset-0 rounded-full"
//         style={{
//           background: `conic-gradient(#111827 ${deg}deg, #e5e7eb ${deg}deg)`,
//         }}
//       />
//       <div
//         className="absolute inset-0 rounded-full bg-white"
//         style={{
//           mask: "radial-gradient(circle at 50% 50%, transparent 58%, black 59%)",
//           WebkitMask:
//             "radial-gradient(circle at 50% 50%, transparent 58%, black 59%)",
//         }}
//       />
//       <div className="absolute inset-0 grid place-items-center">
//         <div className="text-lg md:text-xl font-bold text-slate-900">{p}%</div>
//       </div>
//     </div>
//   );
// }

function Ring2({ percent = 0, label = "O‘rtacha" }) {
  const p = Math.max(0, Math.min(100, Math.round(percent)));
  const deg = p * 3.6;

  // Ranglar: past = rose, o‘rtacha = amber, yaxshi = emerald
  let accent = "#ef4444"; // rose-500
  if (p >= 70 && p < 90) accent = "#f59e0b"; // amber-500
  if (p >= 90) accent = "#10b981"; // emerald-500

  const track = "#e5e7eb"; // slate-200

  return (
    <div className="shrink-0">
      {/* --- Mobile (<640px): kompakt progress pill --- */}
      <div className="sm:hidden w-[min(240px,80vw)]">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-slate-500">{label}</span>
            <span
              className="text-sm font-semibold"
              style={{ color: accent }}
              aria-live="polite"
            >
              {p}%
            </span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${p}%`,
                background: `linear-gradient(90deg, ${accent}, ${accent})`,
              }}
            />
          </div>
        </div>
      </div>

      {/* --- Tablet/Desktop (>=640px): halqali progress --- */}
      <div
        className="relative hidden sm:block h-20 w-20 md:h-28 md:w-28"
        role="img"
        aria-label={`${label}: ${p}%`}
        title={`${label}: ${p}%`}
      >
        {/* Track */}
        <div className="absolute inset-0 rounded-full bg-slate-100" />

        {/* Progress (conic) */}
        <div
          className="absolute inset-0 rounded-full transition-[background] duration-500"
          style={{
            background: `conic-gradient(${accent} ${deg}deg, ${track} ${deg}deg)`,
          }}
        />

        {/* Donut mask (teshik) */}
        <div
          className="absolute inset-0 rounded-full bg-white"
          style={{
            mask: "radial-gradient(circle at 50% 50%, transparent 62%, black 63%)",
            WebkitMask:
              "radial-gradient(circle at 50% 50%, transparent 62%, black 63%)",
          }}
        />

        {/* Markaziy matn */}
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center leading-tight">
            <div className="text-[10px] md:text-xs font-medium text-slate-500">
              {label}
            </div>
            <div
              className="text-lg md:text-xl font-bold"
              style={{ color: accent }}
            >
              {p}%
            </div>
          </div>
        </div>

        {/* Ingichka halqa cheti (aniqlik uchun) */}
        <div className="absolute inset-0 rounded-full ring-1 ring-slate-200" />
      </div>
    </div>
  );
}

function Ring({ percent = 0, label = "O‘rtacha" }) {
  const p = Math.max(0, Math.min(100, Math.round(percent)));
  const deg = p * 3.6;

  let accent = "#ef4444"; // <70
  if (p >= 70 && p < 90) accent = "#f59e0b"; // 70-89
  if (p >= 90) accent = "#10b981"; // 90+

  const track = "#e5e7eb";

  return (
    <div className="shrink-0 w-full sm:w-auto">
      {/* MOBILE: full-width progress pill */}
      <div className="sm:hidden w-full">
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-slate-500">{label}</span>
            <span className="text-sm font-semibold text-black">
              {/* <span className="text-sm font-semibold" style={{ color: accent }}> */}
              {p}%
            </span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${p}%`, background: accent }}
            />
          </div>
        </div>
      </div>

      {/* DESKTOP: donut */}
      <div
        className="relative hidden sm:block h-20 w-20 md:h-28 md:w-28"
        role="img"
        aria-label={`${label}: ${p}%`}
        title={`${label}: ${p}%`}
      >
        <div className="absolute inset-0 rounded-full bg-slate-100" />
        <div
          className="absolute inset-0 rounded-full transition-[background] duration-500"
          style={{
            background: `conic-gradient(${accent} ${deg}deg, ${track} ${deg}deg)`,
          }}
        />
        <div
          className="absolute inset-0 rounded-full bg-white"
          style={{
            mask: "radial-gradient(circle at 50% 50%, transparent 62%, black 63%)",
            WebkitMask:
              "radial-gradient(circle at 50% 50%, transparent 62%, black 63%)",
          }}
        />
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center leading-tight">
            <div className="text-[10px] md:text-xs font-medium text-slate-500">
              {label}
            </div>
            <div
              className="text-lg md:text-xl font-bold text-black"
              // style={{ color: accent }}
            >
              {p}%
            </div>
          </div>
        </div>
        <div className="absolute inset-0 rounded-full ring-1 ring-slate-200" />
      </div>
    </div>
  );
}

function Chip({ children, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    green: "bg-emerald-100 text-emerald-700 border-emerald-200",
    rose: "bg-rose-100 text-rose-700 border-rose-200",
    amber: "bg-amber-100 text-amber-800 border-amber-200",
    blue: "bg-blue-100 text-blue-700 border-blue-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs ${
        tones[tone] || tones.slate
      }`}
    >
      {children}
    </span>
  );
}

/** Mobil uchun ixcham urinish kartochkasi */
function AttemptCard({ a }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-medium text-slate-900">#{a.id}</div>
          <div className="mt-1 grid grid-cols-1 gap-x-4 gap-y-1 text-slate-600">
            <div className="whitespace-nowrap">
              <span className="text-xs text-slate-500">Boshlanish: </span>
              {fmtDate(a.start_time)}
            </div>
            <div className="whitespace-nowrap">
              <span className="text-xs text-slate-500">Tugash: </span>
              {fmtDate(a.end_time)}
            </div>
            <div>
              <span className="text-xs text-slate-500">Davomiylik: </span>
              {fmtDuration(a.duration_sec)}
            </div>
            <div>
              <span className="text-xs text-slate-500">To‘g‘ri/Jami: </span>
              <span className="tabular-nums">
                {a.correct_count}/{a.answered_count}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <div
            className={`text-sm font-semibold ${
              a.score >= 90
                ? "text-emerald-700"
                : a.score >= 70
                ? "text-lime-700"
                : a.score >= 50
                ? "text-amber-700"
                : "text-rose-700"
            }`}
          >
            {a.score}%
          </div>
          <div className="mt-1">
            {a.is_finished ? (
              <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700 ring-1 ring-emerald-200">
                finished
              </span>
            ) : (
              <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs text-amber-700 ring-1 ring-amber-200">
                active
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const MyStatsStudent = () => {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [stats, setStats] = useState(null);
  const [openTestId, setOpenTestId] = useState(null); // collapsible

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        setLoading(true);

        const id = getIdFromToken();
        if (id == null) {
          throw new Error("Token topilmadi yoki token ichida id yo‘q.");
        }

        const res = await clientGetRequest(
          `/students/${encodeURIComponent(id)}/stats`
        );
        const payload = res?.data?.data || res?.data || res;
        setStats(payload);
      } catch (e) {
        setErr(
          e?.response?.data?.message ||
            e?.message ||
            "Ma’lumotni olishda xatolik"
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const student = stats?.student || null;
  const totals = stats?.totals || {};
  const perTest = stats?.per_test || [];
  const attempts = stats?.attempts || [];

  const avgScore = Number(totals?.avg_score ?? 0);
  const attemptsCount = Number(totals?.attempts_count ?? 0);
  const testsTaken = Number(totals?.tests_taken_count ?? 0);
  const lastAttemptAt = totals?.last_attempt_at || null;

  const bestRecent = useMemo(() => {
    if (!attempts?.length) return null;
    return attempts.reduce(
      (best, a) => (a.score > (best?.score ?? -1) ? a : best),
      null
    );
  }, [attempts]);

  return (
    <Fragment>
      {loading ? (
        <div className="rounded-2xl bg-white p-6 shadow">Yuklanmoqda…</div>
      ) : err ? (
        <div className="rounded-2xl bg-red-50 p-6 text-red-700 ring-1 ring-red-200 shadow">
          {err}
        </div>
      ) : !stats ? (
        <div className="rounded-2xl border border-dashed p-8 text-center text-slate-500">
          Ma’lumot topilmadi.
        </div>
      ) : (
        <div className="mx-auto max-w-6xl px-3 sm:px-6 lg:px-8 grid gap-6">
          {/* Header */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
            {/* <div className="flex items-center gap-4">
                <Ring percent={avgScore} />
                <div className="min-w-0">
                  <h1 className="text-base sm:text-lg md:text-xl font-semibold text-slate-900">
                    Mening statistikalarim
                  </h1>
                  <p className="text-sm text-slate-600">
                    {student?.first_name || ""} {student?.last_name || ""}{" "}
                    {student?.username ? (
                      <span className="text-slate-400">
                        • @{student.username}
                      </span>
                    ) : null}
                  </p>
                  {student?.group_id != null && (
                    <div className="mt-1">
                      <Chip tone="blue">Guruh: #{student.group_id}</Chip>
                    </div>
                  )}
                </div>
              </div> */}
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* <div className="flex items-center gap-3 sm:gap-4">
                <Ring percent={avgScore} />
                <div className="min-w-0">
                  <h1 className="text-base sm:text-lg md:text-xl font-semibold text-slate-900">
                    Mening statistikalarim
                  </h1>
                  <p className="text-sm text-slate-600">
                    {student?.first_name || ""} {student?.last_name || ""}{" "}
                    {student?.username ? (
                      <span className="text-slate-400">
                        • @{student.username}
                      </span>
                    ) : null}
                  </p>
                  {student?.group_id != null && (
                    <div className="mt-1">
                      <Chip tone="blue">Guruh: #{student.group_id}</Chip>
                    </div>
                  )}
                </div>
              </div> */}

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full">
                <div className="w-full sm:w-auto">
                  <Ring percent={avgScore} />
                </div>

                <div className="min-w-0">
                  <h1 className="text-base sm:text-lg md:text-xl font-semibold text-slate-900">
                    Mening statistikalarim
                  </h1>
                  <p className="text-sm text-slate-600">
                    {student?.first_name || ""} {student?.last_name || ""}{" "}
                    {student?.username ? (
                      <span className="text-slate-400">
                        • @{student.username}
                      </span>
                    ) : null}
                  </p>
                  {student?.group_id != null && (
                    <div className="mt-1">
                      <Chip tone="blue">Guruh: #{student.group_id}</Chip>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex w-full sm:w-auto flex-wrap items-center gap-2">
                <Chip>
                  <span className="font-medium">Urinishlar:</span>{" "}
                  {attemptsCount}
                </Chip>
                <Chip tone="green">
                  <span className="font-medium">Testlar:</span> {testsTaken}
                </Chip>
                <Chip tone="amber">
                  <span className="font-medium">O‘rtacha:</span> {avgScore}%
                </Chip>
                <Chip>
                  <span className="font-medium">Oxirgi urinish:</span>{" "}
                  <span className="whitespace-nowrap">
                    {fmtDate(lastAttemptAt)}
                  </span>
                </Chip>
              </div>
            </div>
          </div>

          {/* Per-test stats */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">
                Testlar bo‘yicha natijalar
              </h3>
              <span className="text-xs text-slate-500">
                Jami: {perTest.length}
              </span>
            </div>

            {perTest.length === 0 ? (
              <div className="rounded-xl border border-dashed p-6 text-center text-sm text-slate-500">
                Hali testlar bo‘yicha statistika yo‘q.
              </div>
            ) : (
              <div className="space-y-4">
                {perTest.map((t) => {
                  const open = openTestId === t.test_id;
                  const tone =
                    t.avg_score >= 90
                      ? "border-emerald-200 bg-emerald-50/40"
                      : t.avg_score >= 70
                      ? "border-lime-200 bg-lime-50/40"
                      : t.avg_score >= 50
                      ? "border-amber-200 bg-amber-50/40"
                      : "border-rose-200 bg-rose-50/40";
                  return (
                    <div
                      key={t.test_id}
                      className={`rounded-2xl border p-4 sm:p-5 transition ${tone}`}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-slate-900 line-clamp-2">
                            {t.test_title || `Test #${t.test_id}`}
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                            <Chip>Urinishlar: {t.attempts_count}</Chip>
                            <Chip tone="amber">O‘rtacha: {t.avg_score}%</Chip>
                            <Chip tone="green">
                              Eng yaxshi: {t.best_score}%
                            </Chip>
                            <Chip>Oxirgisi: {t.last_score}%</Chip>
                            <Chip>
                              Oxirgi urinish:{" "}
                              <span className="whitespace-nowrap">
                                {fmtDate(t.last_attempt_at)}
                              </span>
                            </Chip>
                          </div>
                        </div>

                        <button
                          onClick={() => setOpenTestId(open ? null : t.test_id)}
                          className="self-start rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs hover:bg-slate-50"
                        >
                          {open ? "Yopish ↑" : "Ko‘rish ↓"}
                        </button>
                      </div>

                      {open && (
                        <div className="mt-4">
                          {/* Mobil: kartochkalar */}
                          <div className="grid gap-2 md:hidden">
                            {(t.attempts || []).map((a) => (
                              <AttemptCard key={a.id} a={a} />
                            ))}
                          </div>

                          {/* md+ : jadval */}
                          <div className="hidden md:block rounded-xl border border-slate-200 bg-white overflow-hidden">
                            <div className="overflow-x-auto">
                              <table className="min-w-full text-sm">
                                <thead>
                                  <tr className="bg-slate-50 text-slate-600">
                                    <th className="px-4 py-3 text-left font-medium border-b border-slate-200">
                                      Urinish
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium border-b border-slate-200">
                                      Boshlanish
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium border-b border-slate-200">
                                      Tugash
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium border-b border-slate-200">
                                      Davomiylik
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium border-b border-slate-200">
                                      To'g'ri javoblar
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium border-b border-slate-200">
                                      Foiz
                                    </th>
                                    <th className="px-4 py-3 text-left font-medium border-b border-slate-200">
                                      Holat
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(t.attempts || []).map((a, index) => (
                                    <tr
                                      key={a.id}
                                      className={
                                        index % 2 === 0
                                          ? "bg-white"
                                          : "bg-slate-50"
                                      }
                                    >
                                      <td className="px-4 py-3 border-b border-slate-100">
                                        #{a.id}
                                      </td>
                                      <td className="px-4 py-3 border-b border-slate-100 whitespace-nowrap">
                                        {fmtDate(a.start_time)}
                                      </td>
                                      <td className="px-4 py-3 border-b border-slate-100 whitespace-nowrap">
                                        {fmtDate(a.end_time)}
                                      </td>
                                      <td className="px-4 py-3 border-b border-slate-100">
                                        {fmtDuration(a.duration_sec)}
                                      </td>
                                      <td className="px-4 py-3 border-b border-slate-100">
                                        {a.correct_count}/{a.answered_count}
                                      </td>
                                      <td className="px-4 py-3 border-b border-slate-100">
                                        <span className="font-semibold">
                                          {a.score}%
                                        </span>
                                      </td>
                                      <td className="px-4 py-3 border-b border-slate-100">
                                        {a.is_finished ? (
                                          <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs text-emerald-700 ring-1 ring-emerald-200">
                                            Yakunlangan
                                          </span>
                                        ) : (
                                          <span className="rounded-md bg-amber-100 px-2 py-1 text-xs text-amber-700 ring-1 ring-amber-200">
                                            Faol
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent attempts (flat) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">
                Oxirgi urinishlar
              </h3>
              {bestRecent && (
                <span className="text-xs text-slate-500">
                  Eng yaxshi:{" "}
                  <span className="font-semibold">{bestRecent.score}%</span> (#
                  {bestRecent.id})
                </span>
              )}
            </div>

            {attempts.length === 0 ? (
              <div className="rounded-xl border border-dashed p-6 text-center text-sm text-slate-500">
                Hali urinishlar yo‘q.
              </div>
            ) : (
              <>
                {/* Mobil: kartochkalar */}
                <div className="grid gap-2 md:hidden">
                  {attempts.map((a) => (
                    <AttemptCard key={a.id} a={a} />
                  ))}
                </div>

                {/* md+ : jadval */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600">
                        <th className="px-3 py-2 text-left font-medium">
                          Attempt
                        </th>
                        <th className="px-3 py-2 text-left font-medium">
                          Test
                        </th>
                        <th className="px-3 py-2 text-left font-medium">
                          Boshlanish
                        </th>
                        <th className="px-3 py-2 text-left font-medium">
                          Tugash
                        </th>
                        <th className="px-3 py-2 text-left font-medium">
                          Davomiylik
                        </th>
                        <th className="px-3 py-2 text-left font-medium">
                          To‘g‘ri/Jami
                        </th>
                        <th className="px-3 py-2 text-left font-medium">
                          Score
                        </th>
                        <th className="px-3 py-2 text-left font-medium">
                          Holat
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {attempts.map((a) => (
                        <tr key={a.id} className="border-t border-slate-200">
                          <td className="px-3 py-2">#{a.id}</td>
                          <td className="px-3 py-2">
                            {a.test_title || `Test #${a.test_id}`}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {fmtDate(a.start_time)}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {fmtDate(a.end_time)}
                          </td>
                          <td className="px-3 py-2">
                            {fmtDuration(a.duration_sec)}
                          </td>
                          <td className="px-3 py-2">
                            <span className="tabular-nums">
                              {a.correct_count}/{a.answered_count}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <span
                              className={`font-semibold ${
                                a.score >= 90
                                  ? "text-emerald-700"
                                  : a.score >= 70
                                  ? "text-lime-700"
                                  : a.score >= 50
                                  ? "text-amber-700"
                                  : "text-rose-700"
                              }`}
                            >
                              {a.score}%
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            {a.is_finished ? (
                              <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700 ring-1 ring-emerald-200">
                                finished
                              </span>
                            ) : (
                              <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs text-amber-700 ring-1 ring-amber-200">
                                active
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </Fragment>
  );
};
