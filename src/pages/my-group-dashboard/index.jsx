// import { LayoutDashboard } from "../../components";

// export const MyGroupDashboard = () => {
//   return <LayoutDashboard>My Group Dashboard</LayoutDashboard>;
// };

console.log();

// // src/pages/MyGroupDashboard/index.jsx
// import { useEffect, useState } from "react";
// import { LayoutDashboard } from "../../components";
// // Agar bor bo'lsa shu helperni ishlating, bo'lmasa fetch yo'lini quyida qo'shdim:
// import { adminGetRequest } from "../../request";

// /**
//  * MyGroupDashboard
//  * - /api/v1/admin/my-group endpointidan guruhlar va studentlarni oladi
//  * - super_admin: barcha guruhlar; admin: o'z guruhlari
//  * - Loading, Error, Empty holatlari qo'yilgan
//  */
// export const MyGroupDashboard = () => {
//   const [data, setData] = useState({
//     groups: [],
//     total_groups: 0,
//     total_students: 0,
//   });
//   const [pending, setPending] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     let mounted = true;

//     const run = async () => {
//       try {
//         setPending(true);
//         setError("");

//         // 1) Agar sizda adminGetRequest helper bo'lsa
//         let res;
//         if (typeof adminGetRequest === "function") {
//           res = await adminGetRequest("/admin/my-group");
//         } else {
//           // 2) Yoki oddiy fetch bilan:
//           const rawToken = window.localStorage.getItem("admin_token") || "";
//           const token = rawToken.startsWith("Bearer ")
//             ? rawToken
//             : `Bearer ${rawToken}`;
//           const r = await fetch("/api/v1/admin/my-group", {
//             headers: { Authorization: token },
//           });
//           if (!r.ok) {
//             const msg = await r.text();
//             throw new Error(msg || `HTTP ${r.status}`);
//           }
//           res = { data: await r.json() };
//         }

//         if (!mounted) return;
//         setData(res.data || { groups: [], total_groups: 0, total_students: 0 });
//       } catch (e) {
//         if (!mounted) return;
//         setError(e?.message || "Failed to load data");
//       } finally {
//         if (!mounted) return;
//         setPending(false);
//       }
//     };

//     run();
//     return () => {
//       mounted = false;
//     };
//   }, []);

//   return (
//     <LayoutDashboard>
//       <div className="px-4 py-6">
//         <div className="mb-6">
//           <h1 className="text-2xl font-bold text-white">My Group Dashboard</h1>
//           <p className="text-sm text-gray-400">
//             Sizga biriktirilgan guruhlar va ularning talabalar ro'yxati
//           </p>
//         </div>

//         {/* Stats */}
//         {!pending && !error && (
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
//             <div className="rounded-xl border border-gray-700/50 p-4 bg-gray-800/40">
//               <div className="text-gray-400 text-sm">Jami guruhlar</div>
//               <div className="text-3xl font-semibold text-white">
//                 {data.total_groups}
//               </div>
//             </div>
//             <div className="rounded-xl border border-gray-700/50 p-4 bg-gray-800/40">
//               <div className="text-gray-400 text-sm">Jami studentlar</div>
//               <div className="text-3xl font-semibold text-white">
//                 {data.total_students}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Loading */}
//         {pending && (
//           <div className="space-y-3">
//             {[1, 2, 3].map((i) => (
//               <div
//                 key={i}
//                 className="h-24 rounded-xl bg-gray-800/40 border border-gray-700/50 animate-pulse"
//               />
//             ))}
//           </div>
//         )}

//         {/* Error */}
//         {!pending && error && (
//           <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200">
//             Xatolik: {error}
//           </div>
//         )}

//         {/* Empty */}
//         {!pending && !error && data.groups.length === 0 && (
//           <div className="rounded-xl border border-gray-700/50 bg-gray-800/40 p-6 text-gray-300">
//             Hozircha sizga biriktirilgan guruh topilmadi.
//           </div>
//         )}

//         {/* Groups list */}
//         {!pending && !error && data.groups.length > 0 && (
//           <div className="space-y-6">
//             {data.groups.map((g) => (
//               <div
//                 key={g.group_id}
//                 className="rounded-2xl border border-gray-700/50 bg-gray-800/40 p-5"
//               >
//                 <div className="flex items-start justify-between">
//                   <div>
//                     <h2 className="text-xl font-semibold text-white">
//                       {g.group_name}
//                     </h2>
//                     {g.group_description && (
//                       <p className="text-gray-400 text-sm mt-1">
//                         {g.group_description}
//                       </p>
//                     )}
//                   </div>
//                   <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
//                     {g.students?.length || 0} student
//                   </span>
//                 </div>

//                 {/* Students table */}
//                 <div className="mt-4 overflow-x-auto">
//                   <table className="min-w-full text-sm">
//                     <thead>
//                       <tr className="text-gray-300">
//                         <th className="text-left font-medium py-2 pr-4">#</th>
//                         <th className="text-left font-medium py-2 pr-4">
//                           Full name
//                         </th>
//                         <th className="text-left font-medium py-2 pr-4">
//                           Username
//                         </th>
//                         <th className="text-left font-medium py-2 pr-4">
//                           Phone
//                         </th>
//                         <th className="text-left font-medium py-2">Joined</th>
//                       </tr>
//                     </thead>
//                     <tbody className="divide-y divide-gray-700/50">
//                       {(g.students || []).map((s, idx) => (
//                         <tr key={s.id} className="text-gray-200">
//                           <td className="py-2 pr-4">{idx + 1}</td>
//                           <td className="py-2 pr-4">
//                             {s.first_name} {s.last_name}
//                           </td>
//                           <td className="py-2 pr-4">@{s.username}</td>
//                           <td className="py-2 pr-4">{s.phone_number}</td>
//                           <td className="py-2">
//                             {new Date(s.created_at).toLocaleString()}
//                           </td>
//                         </tr>
//                       ))}
//                       {(!g.students || g.students.length === 0) && (
//                         <tr>
//                           <td className="py-3 text-gray-400" colSpan={5}>
//                             Bu guruhda hozircha student yo‘q.
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </LayoutDashboard>
//   );
// };

let a = "sad";

// import { useEffect, useMemo, useState } from "react";
// import { LayoutDashboard } from "../../components";
// import { adminGetRequest } from "../../request";

// /**
//  * MyGroupDashboard
//  * - /api/v1/admin/my-group endpointidan guruhlar + studentlar ro'yxati
//  * - super_admin: barcha guruhlar; admin: o'ziga biriktirilgan guruhlar
//  * - Dizayn StudentsDashboard'ga mos: header, stats, table/cards, pagination, sort, search
//  */
// export const MyGroupDashboard = () => {
//   // --- Serverdan keladigan ma'lumotlar (groups: [{ group_id, group_name, group_description, students: [...] }]) ---
//   const [data, setData] = useState({
//     groups: [],
//     total_groups: 0,
//     total_students: 0,
//   });

//   // --- UI holatlari ---
//   const [pending, setPending] = useState(true);
//   const [error, setError] = useState("");

//   // --- Jadval/kartalar xatti-harakati ---
//   const [query, setQuery] = useState("");
//   const [sortKey, setSortKey] = useState("group_id"); // group_id | group_name | students_count
//   const [sortDir, setSortDir] = useState("asc"); // asc | desc
//   const [page, setPage] = useState(1);
//   const pageSize = 8;

//   // Har bir guruhni ochish/yopish holati (desktopda row expand, mobilda accordion)
//   const [expanded, setExpanded] = useState(() => new Set());

//   // --- Ma'lumotni yuklash ---
//   const fetchData = async () => {
//     try {
//       setPending(true);
//       setError("");

//       let res;
//       if (typeof adminGetRequest === "function") {
//         res = await adminGetRequest("/admin/my-group");
//       } else {
//         const rawToken = window.localStorage.getItem("admin_token") || "";
//         const token = rawToken.startsWith("Bearer ")
//           ? rawToken
//           : `Bearer ${rawToken}`;
//         const r = await fetch("/api/v1/admin/my-group", {
//           headers: { Authorization: token },
//         });
//         if (!r.ok) {
//           const msg = await r.text();
//           throw new Error(msg || `HTTP ${r.status}`);
//         }
//         res = { data: await r.json() };
//       }

//       setData(res.data || { groups: [], total_groups: 0, total_students: 0 });
//     } catch (e) {
//       setError(e?.message || "Failed to load data");
//     } finally {
//       setPending(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//     // sahifa o'zgarganda expanded set qayta ishlatiladi
//   }, []);

//   // --- Qidiruv (guruh + studentlar) ---
//   const searched = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     if (!q) {
//       // qidiruv yo'q bo'lsa, students_filtered = original students
//       return data.groups.map((g) => ({
//         ...g,
//         students_filtered: g.students || [],
//         matched_count: (g.students || []).length, // qidiruv yo'q: matched = total
//         total_count: (g.students || []).length,
//       }));
//     }

//     // qidiruv bor: guruh nomi/ta'rifi bo'yicha, yoki **istalgan** student mos bo'lsa guruhni chiqaramiz
//     return data.groups
//       .map((g) => {
//         const inGroup =
//           String(g.group_name ?? "")
//             .toLowerCase()
//             .includes(q) ||
//           String(g.group_description ?? "")
//             .toLowerCase()
//             .includes(q);

//         const students = Array.isArray(g.students) ? g.students : [];
//         const students_filtered = students.filter((s) =>
//           [
//             s.first_name,
//             s.last_name,
//             `${s.first_name ?? ""} ${s.last_name ?? ""}`,
//             s.username,
//             s.phone_number,
//           ]
//             .filter(Boolean)
//             .some((v) => String(v).toLowerCase().includes(q))
//         );

//         const matched = inGroup || students_filtered.length > 0;
//         return matched
//           ? {
//               ...g,
//               students_filtered: inGroup ? students : students_filtered, // agar guruh o'zi match qilsa - hammasini ko'rsatamiz
//               matched_count: inGroup
//                 ? students.length
//                 : students_filtered.length,
//               total_count: students.length,
//             }
//           : null;
//       })
//       .filter(Boolean);
//   }, [data.groups, query]);

//   // --- Sort (guruhlar kesimida) ---
//   const sorted = useMemo(() => {
//     const dir = sortDir === "asc" ? 1 : -1;
//     return [...searched].sort((a, b) => {
//       if (sortKey === "group_id") {
//         return (Number(a.group_id ?? 0) - Number(b.group_id ?? 0)) * dir;
//       }
//       if (sortKey === "group_name") {
//         return (
//           String(a.group_name ?? "").localeCompare(
//             String(b.group_name ?? ""),
//             undefined,
//             {
//               sensitivity: "base",
//             }
//           ) * dir
//         );
//       }
//       // students_count: qidiruv yoqilganda matched_count, aks holda total_count
//       const aCount = query ? a.matched_count : a.total_count;
//       const bCount = query ? b.matched_count : b.total_count;
//       return (Number(aCount) - Number(bCount)) * dir;
//     });
//   }, [searched, sortKey, sortDir, query]);

//   // --- Pagination ---
//   const totalVisible = sorted.length;
//   const totalPages = Math.max(1, Math.ceil(totalVisible / pageSize));
//   const pageData = useMemo(() => {
//     const start = (page - 1) * pageSize;
//     return sorted.slice(start, start + pageSize);
//   }, [sorted, page]);

//   // --- UI helpers ---
//   const toggleSort = (k) => {
//     if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
//     else {
//       setSortKey(k);
//       setSortDir("asc");
//     }
//   };

//   const SortButton = ({ label, k }) => (
//     <button
//       onClick={() => toggleSort(k)}
//       className="inline-flex items-center gap-1 text-left hover:underline"
//     >
//       <span>{label}</span>
//       <span className="text-xs text-gray-400">
//         {sortKey === k ? (sortDir === "asc" ? "▲" : "▼") : ""}
//       </span>
//     </button>
//   );

//   const toggleExpand = (gid) => {
//     setExpanded((prev) => {
//       const next = new Set(prev);
//       if (next.has(gid)) next.delete(gid);
//       else next.add(gid);
//       return next;
//     });
//   };

//   const expandAll = () => {
//     setExpanded(new Set(pageData.map((g) => g.group_id)));
//   };
//   const collapseAll = () => setExpanded(new Set());

//   // --- Loading skeleton ---
//   if (pending) {
//     return (
//       <LayoutDashboard>
//         <div className="px-6 py-10">
//           <div className="h-9 w-56 rounded-lg bg-gray-200 animate-pulse" />
//           <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
//             {Array.from({ length: 3 }).map((_, i) => (
//               <div
//                 key={i}
//                 className="rounded-2xl bg-white/80 ring-1 ring-gray-200/60 p-4"
//               >
//                 <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
//                 <div className="mt-3 h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
//               </div>
//             ))}
//           </div>
//           <div className="mt-6 rounded-2xl bg-white ring-1 ring-gray-200/60 p-4">
//             {Array.from({ length: 5 }).map((_, i) => (
//               <div
//                 key={i}
//                 className="h-10 w-full bg-gray-50 rounded mb-2 animate-pulse"
//               />
//             ))}
//           </div>
//         </div>
//       </LayoutDashboard>
//     );
//   }

//   // --- Error holati ---
//   if (error) {
//     return (
//       <LayoutDashboard>
//         <div className="p-6">
//           <div className="rounded-xl ring-1 ring-red-200 bg-red-50 text-red-700 px-4 py-3">
//             Error: {error}
//           </div>
//           <div className="mt-4">
//             <button
//               onClick={fetchData}
//               className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
//             >
//               Retry
//             </button>
//           </div>
//         </div>
//       </LayoutDashboard>
//     );
//   }

//   return (
//     <LayoutDashboard>
//       <div className="p-6 space-y-6">
//         {/* ----- Header ----- */}
//         <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//           <div>
//             <h1 className="text-3xl font-semibold tracking-tight">My Groups</h1>
//             <p className="text-gray-500">
//               Sizga biriktirilgan guruhlar va ularning talabalar ro&apos;yxati
//             </p>
//           </div>

//           <div className="flex items-center gap-2">
//             {/* Qidiruv */}
//             <div className="relative">
//               <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
//                 <svg
//                   className="h-4 w-4 text-gray-400"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     d="M21 21l-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"
//                   />
//                 </svg>
//               </div>
//               <input
//                 value={query}
//                 onChange={(e) => {
//                   setQuery(e.target.value);
//                   setPage(1);
//                 }}
//                 placeholder="Search by group or student…"
//                 className="w-[300px] rounded-xl ring-1 ring-gray-200 bg-white/60 pl-9 pr-10 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
//               />
//               {query && (
//                 <button
//                   onClick={() => setQuery("")}
//                   className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-gray-100"
//                 >
//                   <svg
//                     className="h-4 w-4 text-gray-500"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       d="M6 18L18 6M6 6l12 12"
//                     />
//                   </svg>
//                 </button>
//               )}
//             </div>

//             {/* Expand/Collapse + Refresh */}
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={expandAll}
//                 className="hidden md:inline-flex items-center gap-2 rounded-xl ring-1 ring-gray-300 px-3.5 py-2.5 text-sm hover:bg-gray-50"
//               >
//                 Expand all
//               </button>
//               <button
//                 onClick={collapseAll}
//                 className="hidden md:inline-flex items-center gap-2 rounded-xl ring-1 ring-gray-300 px-3.5 py-2.5 text-sm hover:bg-gray-50"
//               >
//                 Collapse all
//               </button>
//               <button
//                 onClick={fetchData}
//                 className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2.5 text-sm font-medium text-white shadow-sm ring-1 ring-inset ring-blue-600/20 transition hover:bg-blue-700"
//               >
//                 <svg
//                   className="h-4 w-4"
//                   viewBox="0 0 24 24"
//                   fill="none"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     d="M4 4v6h6M20 20v-6h-6"
//                   />
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     d="M20 4l-5.5 5.5M4 20l5.5-5.5"
//                   />
//                 </svg>
//                 Refresh
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* ----- Metrics (StudentsDashboard uslubida) ----- */}
//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//           <div className="rounded-2xl bg-white/80 backdrop-blur ring-1 ring-gray-200/60 p-4 shadow-sm">
//             <div className="text-xs uppercase text-gray-500">Total groups</div>
//             <div className="mt-1 text-3xl font-semibold">
//               {data.total_groups}
//             </div>
//           </div>
//           <div className="rounded-2xl bg-white/80 backdrop-blur ring-1 ring-gray-200/60 p-4 shadow-sm">
//             <div className="text-xs uppercase text-gray-500">
//               Total students
//             </div>
//             <div className="mt-1 text-3xl font-semibold">
//               {data.total_students}
//             </div>
//           </div>
//           <div className="rounded-2xl bg-white/80 backdrop-blur ring-1 ring-gray-200/60 p-4 shadow-sm">
//             <div className="text-xs uppercase text-gray-500">
//               Visible groups
//             </div>
//             <div className="mt-1 text-3xl font-semibold">{totalVisible}</div>
//           </div>
//         </div>

//         {/* ----- Desktop: Groups table + expandable student tables ----- */}
//         <div className="hidden md:block rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/60">
//           <div className="overflow-x-auto">
//             <table className="min-w-full text-sm">
//               <thead className="bg-gray-50 text-gray-600">
//                 <tr>
//                   <th className="px-6 py-3 text-left font-medium w-24">
//                     <SortButton label="ID" k="group_id" />
//                   </th>
//                   <th className="px-6 py-3 text-left font-medium">
//                     <SortButton label="Group" k="group_name" />
//                   </th>
//                   <th className="px-6 py-3 text-left font-medium">
//                     Description
//                   </th>
//                   <th className="px-6 py-3 text-left font-medium w-40">
//                     <SortButton label="Students" k="students_count" />
//                   </th>
//                   <th className="px-6 py-3 text-left font-medium w-28">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>

//               <tbody className="divide-y divide-gray-100">
//                 {pageData.length === 0 ? (
//                   <tr>
//                     <td
//                       colSpan={5}
//                       className="px-6 py-10 text-center text-gray-500"
//                     >
//                       Guruhlar topilmadi
//                     </td>
//                   </tr>
//                 ) : (
//                   pageData.map((g) => {
//                     const isOpen = expanded.has(g.group_id);
//                     const total = g.total_count ?? (g.students?.length || 0);
//                     const matched = g.matched_count ?? total;
//                     return (
//                       <>
//                         {/* Group row */}
//                         <tr
//                           key={`g-${g.group_id}`}
//                           className="hover:bg-gray-50/60"
//                         >
//                           <td className="px-6 py-4 font-mono text-xs text-gray-500">
//                             {g.group_id}
//                           </td>
//                           <td className="px-6 py-4 font-medium text-gray-900">
//                             {g.group_name}
//                           </td>
//                           <td className="px-6 py-4 text-gray-600">
//                             {g.group_description ? g.group_description : "-"}
//                           </td>
//                           <td className="px-6 py-4 text-gray-700">
//                             {query ? (
//                               <span>
//                                 {matched}{" "}
//                                 <span className="text-gray-400">/ {total}</span>
//                               </span>
//                             ) : (
//                               total
//                             )}
//                           </td>
//                           <td className="px-6 py-4">
//                             <button
//                               onClick={() => toggleExpand(g.group_id)}
//                               className="inline-flex items-center gap-1.5 rounded-lg ring-1 ring-gray-200/60 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
//                             >
//                               <svg
//                                 className={`h-4 w-4 transition-transform ${
//                                   isOpen ? "rotate-180" : ""
//                                 }`}
//                                 viewBox="0 0 24 24"
//                                 fill="none"
//                                 stroke="currentColor"
//                                 strokeWidth="2"
//                               >
//                                 <path
//                                   strokeLinecap="round"
//                                   strokeLinejoin="round"
//                                   d="M19 9l-7 7-7-7"
//                                 />
//                               </svg>
//                               {isOpen ? "Hide students" : "View students"}
//                             </button>
//                           </td>
//                         </tr>

//                         {/* Expanded students row */}
//                         {isOpen && (
//                           <tr
//                             key={`g-expanded-${g.group_id}`}
//                             className="bg-gray-50/40"
//                           >
//                             <td colSpan={5} className="px-6 py-4">
//                               <div className="overflow-x-auto rounded-xl ring-1 ring-gray-200/60 bg-white">
//                                 <table className="min-w-full text-xs">
//                                   <thead className="bg-gray-50 text-gray-600">
//                                     <tr>
//                                       <th className="px-4 py-2 text-left font-medium w-16">
//                                         #
//                                       </th>
//                                       <th className="px-4 py-2 text-left font-medium">
//                                         Full name
//                                       </th>
//                                       <th className="px-4 py-2 text-left font-medium">
//                                         Username
//                                       </th>
//                                       <th className="px-4 py-2 text-left font-medium">
//                                         Phone
//                                       </th>
//                                       <th className="px-4 py-2 text-left font-medium">
//                                         Joined
//                                       </th>
//                                     </tr>
//                                   </thead>
//                                   <tbody className="divide-y divide-gray-100">
//                                     {(g.students_filtered ?? g.students ?? [])
//                                       .length === 0 ? (
//                                       <tr>
//                                         <td
//                                           colSpan={5}
//                                           className="px-4 py-3 text-gray-500"
//                                         >
//                                           Bu guruhda hozircha student yo‘q.
//                                         </td>
//                                       </tr>
//                                     ) : (
//                                       (
//                                         g.students_filtered ??
//                                         g.students ??
//                                         []
//                                       ).map((s, idx) => (
//                                         <tr key={s.id}>
//                                           <td className="px-4 py-2 text-gray-500">
//                                             {idx + 1}
//                                           </td>
//                                           <td className="px-4 py-2 text-gray-900">
//                                             {s.first_name} {s.last_name}
//                                           </td>
//                                           <td className="px-4 py-2 text-gray-700">
//                                             @{s.username}
//                                           </td>
//                                           <td className="px-4 py-2 text-gray-700">
//                                             {s.phone_number}
//                                           </td>
//                                           <td className="px-4 py-2 text-gray-600">
//                                             {s.created_at
//                                               ? new Date(
//                                                   s.created_at
//                                                 ).toLocaleString()
//                                               : "-"}
//                                           </td>
//                                         </tr>
//                                       ))
//                                     )}
//                                   </tbody>
//                                 </table>
//                               </div>
//                             </td>
//                           </tr>
//                         )}
//                       </>
//                     );
//                   })
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination (desktop) */}
//           <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-600">
//             <div>
//               Showing {(page - 1) * pageSize + 1}-
//               {Math.min(page * pageSize, totalVisible)} of {totalVisible}
//             </div>
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={() => setPage((p) => Math.max(1, p - 1))}
//                 disabled={page === 1}
//                 className="rounded-lg ring-1 ring-gray-300 px-3 py-1.5 disabled:opacity-40"
//               >
//                 Prev
//               </button>
//               <span className="font-medium">{page}</span>
//               <button
//                 onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//                 disabled={page === totalPages}
//                 className="rounded-lg ring-1 ring-gray-300 px-3 py-1.5 disabled:opacity-40"
//               >
//                 Next
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* ----- Mobile: Cards/Accordion (StudentsDashboard uslubida) ----- */}
//         <div className="grid md:hidden grid-cols-1 gap-3">
//           {pageData.length === 0 ? (
//             <div className="rounded-xl border bg-white p-4 text-gray-500 text-center">
//               Guruhlar topilmadi
//             </div>
//           ) : (
//             pageData.map((g) => {
//               const isOpen = expanded.has(g.group_id);
//               const total = g.total_count ?? (g.students?.length || 0);
//               const matched = g.matched_count ?? total;
//               const list = g.students_filtered ?? g.students ?? [];
//               return (
//                 <div
//                   key={g.group_id}
//                   className="rounded-2xl bg-white/80 backdrop-blur ring-1 ring-gray-200/60 p-4 shadow-sm"
//                 >
//                   <div className="flex items-start justify-between gap-3">
//                     <div>
//                       <div className="text-xs text-gray-500">#{g.group_id}</div>
//                       <div className="mt-0.5 text-base font-semibold">
//                         {g.group_name}
//                       </div>
//                       <div className="text-xs text-gray-500">
//                         {g.group_description ? g.group_description : "—"}
//                       </div>
//                     </div>
//                     <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
//                       {query ? `${matched}/${total}` : total} students
//                     </span>
//                   </div>

//                   <button
//                     onClick={() => toggleExpand(g.group_id)}
//                     className="mt-3 inline-flex items-center gap-1.5 rounded-lg ring-1 ring-gray-200/60 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
//                   >
//                     <svg
//                       className={`h-4 w-4 transition-transform ${
//                         isOpen ? "rotate-180" : ""
//                       }`}
//                       viewBox="0 0 24 24"
//                       fill="none"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         d="M19 9l-7 7-7-7"
//                       />
//                     </svg>
//                     {isOpen ? "Hide students" : "View students"}
//                   </button>

//                   {isOpen && (
//                     <div className="mt-3 divide-y divide-gray-200/70">
//                       {list.length === 0 ? (
//                         <div className="py-2 text-sm text-gray-600">
//                           Bu guruhda hozircha student yo‘q.
//                         </div>
//                       ) : (
//                         list.map((s, idx) => (
//                           <div key={s.id} className="py-2">
//                             <div className="flex items-start justify-between">
//                               <div>
//                                 <div className="text-xs text-gray-500">
//                                   #{idx + 1}
//                                 </div>
//                                 <div className="text-sm font-semibold">
//                                   {s.first_name} {s.last_name}
//                                 </div>
//                                 <div className="text-xs text-gray-500">
//                                   @{s.username}
//                                 </div>
//                               </div>
//                               <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
//                                 {s.phone_number || "-"}
//                               </span>
//                             </div>
//                             <div className="mt-1 text-xs text-gray-500">
//                               {s.created_at
//                                 ? new Date(s.created_at).toLocaleString()
//                                 : "-"}
//                             </div>
//                           </div>
//                         ))
//                       )}
//                     </div>
//                   )}
//                 </div>
//               );
//             })
//           )}

//           {/* Mobile pagination */}
//           <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
//             <button
//               onClick={() => setPage((p) => Math.max(1, p - 1))}
//               disabled={page === 1}
//               className="rounded-lg ring-1 ring-gray-300 px-3 py-1.5 disabled:opacity-40"
//             >
//               Prev
//             </button>
//             <div>
//               Page <span className="font-medium">{page}</span> of {totalPages}
//             </div>
//             <button
//               onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//               disabled={page === totalPages}
//               className="rounded-lg ring-1 ring-gray-300 px-3 py-1.5 disabled:opacity-40"
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       </div>
//     </LayoutDashboard>
//   );
// };

// src/pages/admin/MyGroupDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import { LayoutDashboard } from "../../components";
import { adminGetRequest } from "../../request";
import { StudentStatsPanel } from "../";

export const MyGroupDashboard = () => {
  const [data, setData] = useState({
    groups: [],
    total_groups: 0,
    total_students: 0,
  });

  const [pending, setPending] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("group_id");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [expanded, setExpanded] = useState(() => new Set());

  // Stats panel state
  const [statsOpen, setStatsOpen] = useState(false);
  const [statsStudent, setStatsStudent] = useState(null);

  const fetchData = async () => {
    try {
      setPending(true);
      setError("");
      let res;
      if (typeof adminGetRequest === "function") {
        res = await adminGetRequest("/admin/my-group");
      } else {
        const rawToken = window.localStorage.getItem("admin_token") || "";
        const token = rawToken.startsWith("Bearer ")
          ? rawToken
          : `Bearer ${rawToken}`;
        const r = await fetch("/api/v1/admin/my-group", {
          headers: { Authorization: token },
        });
        if (!r.ok) throw new Error((await r.text()) || `HTTP ${r.status}`);
        res = { data: await r.json() };
      }
      setData(res.data || { groups: [], total_groups: 0, total_students: 0 });
    } catch (e) {
      setError(e?.message || "Failed to load data");
    } finally {
      setPending(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return data.groups.map((g) => ({
        ...g,
        students_filtered: g.students || [],
        matched_count: (g.students || []).length,
        total_count: (g.students || []).length,
      }));
    }

    return data.groups
      .map((g) => {
        const inGroup =
          String(g.group_name ?? "")
            .toLowerCase()
            .includes(q) ||
          String(g.group_description ?? "")
            .toLowerCase()
            .includes(q);

        const students = Array.isArray(g.students) ? g.students : [];
        const students_filtered = students.filter((s) =>
          [
            s.first_name,
            s.last_name,
            `${s.first_name ?? ""} ${s.last_name ?? ""}`,
            s.username,
            s.phone_number,
          ]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(q))
        );

        const matched = inGroup || students_filtered.length > 0;
        return matched
          ? {
              ...g,
              students_filtered: inGroup ? students : students_filtered,
              matched_count: inGroup
                ? students.length
                : students_filtered.length,
              total_count: students.length,
            }
          : null;
      })
      .filter(Boolean);
  }, [data.groups, query]);

  const sorted = useMemo(() => {
    const dir = sortDir === "asc" ? 1 : -1;
    return [...searched].sort((a, b) => {
      if (sortKey === "group_id") {
        return (Number(a.group_id ?? 0) - Number(b.group_id ?? 0)) * dir;
      }
      if (sortKey === "group_name") {
        return (
          String(a.group_name ?? "").localeCompare(
            String(b.group_name ?? ""),
            undefined,
            { sensitivity: "base" }
          ) * dir
        );
      }
      const aCount = query ? a.matched_count : a.total_count;
      const bCount = query ? b.matched_count : b.total_count;
      return (Number(aCount) - Number(bCount)) * dir;
    });
  }, [searched, sortKey, sortDir, query]);

  const totalVisible = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalVisible / pageSize));
  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page]);

  const toggleSort = (k) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir("asc");
    }
  };

  const SortButton = ({ label, k }) => (
    <button
      onClick={() => toggleSort(k)}
      className="inline-flex items-center gap-1 text-left hover:underline"
    >
      <span>{label}</span>
      <span className="text-xs text-gray-400">
        {sortKey === k ? (sortDir === "asc" ? "▲" : "▼") : ""}
      </span>
    </button>
  );

  const toggleExpand = (gid) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(gid)) next.delete(gid);
      else next.add(gid);
      return next;
    });
  };

  const openStats = (student) => {
    setStatsStudent(student);
    setStatsOpen(true);
  };

  const closeStats = () => {
    setStatsOpen(false);
    setTimeout(() => setStatsStudent(null), 300);
  };

  // Loading
  if (pending) {
    return (
      <LayoutDashboard>
        <div className="px-6 py-10">
          <div className="h-9 w-56 rounded-lg bg-gray-200 animate-pulse" />
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white/80 ring-1 ring-gray-200/60 p-4"
              >
                <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="mt-3 h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl bg-white ring-1 ring-gray-200/60 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-10 w-full bg-gray-50 rounded mb-2 animate-pulse"
              />
            ))}
          </div>
        </div>
      </LayoutDashboard>
    );
  }

  // Error
  if (error) {
    return (
      <LayoutDashboard>
        <div className="p-6">
          <div className="rounded-xl ring-1 ring-red-200 bg-red-50 text-red-700 px-4 py-3">
            Error: {error}
          </div>
          <div className="mt-4">
            <button
              onClick={fetchData}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </LayoutDashboard>
    );
  }

  return (
    <LayoutDashboard>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl font-semibold tracking-tight">My Groups</h1>
            <p className="text-gray-500 truncate">
              Sizga biriktirilgan guruhlar va ularning talabalar ro‘yxati
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                <svg
                  className="h-4 w-4 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"
                  />
                </svg>
              </div>
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by group or student…"
                className="w-[300px] rounded-xl ring-1 ring-gray-200 bg-white/60 pl-9 pr-10 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-gray-100"
                >
                  <svg
                    className="h-4 w-4 text-gray-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>

            <button
              onClick={fetchData}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2.5 text-sm font-medium text-white shadow-sm ring-1 ring-inset ring-blue-600/20 transition hover:bg-blue-700"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v6h6M20 20v-6h-6"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20 4l-5.5 5.5M4 20l5.5-5.5"
                />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard label="Total groups" value={data.total_groups} />
          <MetricCard label="Total students" value={data.total_students} />
          <MetricCard label="Visible groups" value={totalVisible} />
        </div>

        {/* Desktop table */}
        <div className="hidden md:block rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/60">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left font-medium w-24">
                    <SortButton label="ID" k="group_id" />
                  </th>
                  <th className="px-6 py-3 text-left font-medium">
                    <SortButton label="Group" k="group_name" />
                  </th>
                  <th className="px-6 py-3 text-left font-medium">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left font-medium w-40">
                    <SortButton label="Students" k="students_count" />
                  </th>
                  <th className="px-6 py-3 text-left font-medium w-28">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {pageData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      Guruhlar topilmadi
                    </td>
                  </tr>
                ) : (
                  pageData.map((g) => {
                    const isOpen = expanded.has(g.group_id);
                    const total = g.total_count ?? (g.students?.length || 0);
                    const matched = g.matched_count ?? total;

                    return (
                      <>
                        <tr
                          key={`g-${g.group_id}`}
                          className="hover:bg-gray-50/60"
                        >
                          <td className="px-6 py-4 font-mono text-xs text-gray-500">
                            {g.group_id}
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {g.group_name}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {g.group_description || "-"}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            {query ? (
                              <span>
                                {matched}{" "}
                                <span className="text-gray-400">/ {total}</span>
                              </span>
                            ) : (
                              total
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => toggleExpand(g.group_id)}
                              className="inline-flex items-center gap-1.5 rounded-lg ring-1 ring-gray-200/60 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                            >
                              <svg
                                className={`h-4 w-4 transition-transform ${
                                  isOpen ? "rotate-180" : ""
                                }`}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                              {isOpen ? "Hide students" : "View students"}
                            </button>
                          </td>
                        </tr>

                        {isOpen && (
                          <tr
                            key={`g-expanded-${g.group_id}`}
                            className="bg-gray-50/40"
                          >
                            <td colSpan={5} className="px-6 py-4">
                              <div className="overflow-x-auto rounded-xl ring-1 ring-gray-200/60 bg-white">
                                <table className="min-w-full text-xs">
                                  <thead className="bg-gray-50 text-gray-600">
                                    <tr>
                                      <th className="px-4 py-2 text-left font-medium w-12">
                                        #
                                      </th>
                                      <th className="px-4 py-2 text-left font-medium">
                                        Full name
                                      </th>
                                      <th className="px-4 py-2 text-left font-medium">
                                        Username
                                      </th>
                                      <th className="px-4 py-2 text-left font-medium">
                                        Phone
                                      </th>
                                      <th className="px-4 py-2 text-left font-medium">
                                        Joined
                                      </th>
                                      <th className="px-4 py-2 text-left font-medium w-28">
                                        Stats
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                    {(g.students_filtered ?? g.students ?? [])
                                      .length === 0 ? (
                                      <tr>
                                        <td
                                          colSpan={6}
                                          className="px-4 py-3 text-gray-500"
                                        >
                                          Bu guruhda hozircha student yo‘q.
                                        </td>
                                      </tr>
                                    ) : (
                                      (
                                        g.students_filtered ??
                                        g.students ??
                                        []
                                      ).map((s, idx) => (
                                        <tr
                                          key={s.id}
                                          className="hover:bg-gray-50"
                                        >
                                          <td className="px-4 py-2 text-gray-500">
                                            {idx + 1}
                                          </td>
                                          <td className="px-4 py-2 text-gray-900">
                                            {s.first_name} {s.last_name}
                                          </td>
                                          <td className="px-4 py-2 text-gray-700">
                                            @{s.username}
                                          </td>
                                          <td className="px-4 py-2 text-gray-700">
                                            {s.phone_number}
                                          </td>
                                          <td className="px-4 py-2 text-gray-600">
                                            {s.created_at
                                              ? new Date(
                                                  s.created_at
                                                ).toLocaleString()
                                              : "-"}
                                          </td>
                                          <td className="px-4 py-2">
                                            <button
                                              onClick={() =>
                                                openStats({
                                                  id: s.id,
                                                  first_name: s.first_name,
                                                  last_name: s.last_name,
                                                  username: s.username,
                                                  group_name: g.group_name,
                                                })
                                              }
                                              className="inline-flex items-center gap-1 rounded-lg bg-slate-900 text-white px-3 py-1.5 hover:bg-black"
                                            >
                                              Stats
                                            </button>
                                          </td>
                                        </tr>
                                      ))
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination (desktop) */}
          <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-600">
            <div>
              Showing {(page - 1) * pageSize + 1}-
              {Math.min(page * pageSize, totalVisible)} of {totalVisible}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg ring-1 ring-gray-300 px-3 py-1.5 disabled:opacity-40"
              >
                Prev
              </button>
              <span className="font-medium">{page}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg ring-1 ring-gray-300 px-3 py-1.5 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="grid md:hidden grid-cols-1 gap-3">
          {pageData.length === 0 ? (
            <div className="rounded-xl border bg-white p-4 text-gray-500 text-center">
              Guruhlar topilmadi
            </div>
          ) : (
            pageData.map((g) => {
              const isOpen = expanded.has(g.group_id);
              const total = g.total_count ?? (g.students?.length || 0);
              const matched = g.matched_count ?? total;
              const list = g.students_filtered ?? g.students ?? [];
              return (
                <div
                  key={g.group_id}
                  className="rounded-2xl bg-white/80 backdrop-blur ring-1 ring-gray-200/60 p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs text-gray-500">#{g.group_id}</div>
                      <div className="mt-0.5 text-base font-semibold">
                        {g.group_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {g.group_description ? g.group_description : "—"}
                      </div>
                    </div>
                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                      {query ? `${matched}/${total}` : total} students
                    </span>
                  </div>

                  <button
                    onClick={() => toggleExpand(g.group_id)}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg ring-1 ring-gray-200/60 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <svg
                      className={`h-4 w-4 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                    {isOpen ? "Hide students" : "View students"}
                  </button>

                  {isOpen && (
                    <div className="mt-3 divide-y divide-gray-200/70">
                      {list.length === 0 ? (
                        <div className="py-2 text-sm text-gray-600">
                          Bu guruhda hozircha student yo‘q.
                        </div>
                      ) : (
                        list.map((s, idx) => (
                          <div key={s.id} className="py-2">
                            <div className="flex items-start justify-between">
                              <div className="min-w-0">
                                <div className="text-xs text-gray-500">
                                  #{idx + 1}
                                </div>
                                <div className="text-sm font-semibold truncate">
                                  {s.first_name} {s.last_name}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  @{s.username}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                                  {s.phone_number || "-"}
                                </span>
                                <button
                                  onClick={() =>
                                    openStats({
                                      id: s.id,
                                      first_name: s.first_name,
                                      last_name: s.last_name,
                                      username: s.username,
                                      group_name: g.group_name,
                                    })
                                  }
                                  className="rounded-lg bg-slate-900 text-white px-3 py-1.5 text-xs hover:bg-black"
                                >
                                  Stats
                                </button>
                              </div>
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                              {s.created_at
                                ? new Date(s.created_at).toLocaleString()
                                : "-"}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Mobile pagination */}
          <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg ring-1 ring-gray-300 px-3 py-1.5 disabled:opacity-40"
            >
              Prev
            </button>
            <div>
              Page <span className="font-medium">{page}</span> of {totalPages}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg ring-1 ring-gray-300 px-3 py-1.5 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Stats drawer */}
      <StudentStatsPanel
        open={statsOpen}
        onClose={closeStats}
        student={statsStudent}
      />
    </LayoutDashboard>
  );
};

const MetricCard = ({ label, value }) => (
  <div className="rounded-2xl bg-white/80 backdrop-blur ring-1 ring-gray-200/60 p-4 shadow-sm">
    <div className="text-[11px] uppercase tracking-wide text-gray-500">
      {label}
    </div>
    <div className="mt-1 text-3xl font-semibold tabular-nums">{value}</div>
  </div>
);
