// // src/pages/tests-dashboard/index.jsx
// import React, { useEffect, useMemo, useState } from "react";
// import { AdminSectionTabs, LayoutDashboard } from "../../components";
// import { baseURL } from "../../shared/constants";
// import { Link } from "react-router-dom";
// /**
//  * Tests-only Dashboard
//  * ------------------------------------------------------
//  * - Faqat TESTLAR: list, create, edit, publish/unpublish, delete
//  * - Hech qanday question CRUD yoki linking yo‘q
//  * - TailwindCSS bilan, tashqi lib yo‘q
//  * - Token localStorage("admin_token") dan olinadi; sizda "Bearer ..." bo‘lsa
//  *   o‘sha holicha yuboriladi
//  */

// /* ----------------------------- API Helper ----------------------------- */
// async function apiFetch(path, { method = "GET", json, headers = {} } = {}) {
//   // 1) Tokenni har safar yangidan olamiz (eskirib qolmasin)
//   const token = localStorage.getItem("admin_token") || "";

//   // 2) baseURL (import qilingan) bilan pathni toza birlashtiramiz
//   const buildUrl = (base, p) => {
//     const b = String(base || "").replace(/\/+$/, ""); // ohirgi / larni kes
//     const q = String(p || "").replace(/^\/+/, ""); // boshidagi / larni kes
//     return `${b}/${q}`;
//   };
//   const url = path.startsWith("http") ? path : buildUrl(baseURL, path);

//   const opts = {
//     method,
//     headers: {
//       // Agar backend "Bearer ..." kutsa, shu qatorda Bearer qo‘ying:
//       // Authorization: `Bearer ${token}`,
//       Authorization: `${token}`,
//       ...headers,
//     },
//   };
//   if (json !== undefined) {
//     opts.headers["Content-Type"] = "application/json";
//     opts.body = JSON.stringify(json);
//   }

//   const res = await fetch(url, opts);
//   let data = null;
//   try {
//     data = await res.json();
//   } catch {}
//   if (!res.ok) {
//     const msg = data?.message || data?.error || `HTTP ${res.status}`;
//     const err = new Error(msg);
//     err.status = res.status;
//     err.data = data;
//     throw err;
//   }
//   return data;
// }

// /* ------------------------------- Toasts ------------------------------- */
// const ToastCtx = React.createContext({ pushToast: () => {} });
// function ToastProvider({ children }) {
//   const [toasts, setToasts] = useState([]);
//   function pushToast({ title, desc, type = "info", timeout = 2200 }) {
//     const id = crypto.randomUUID();
//     setToasts((t) => [...t, { id, title, desc, type }]);
//     setTimeout(() => {
//       setToasts((t) => t.filter((x) => x.id !== id));
//     }, timeout);
//   }
//   return (
//     <ToastCtx.Provider value={{ pushToast }}>
//       {children}
//       <div className="fixed inset-x-0 top-3 z-[9999] flex flex-col items-center gap-2 px-3">
//         {toasts.map((t) => (
//           <div
//             key={t.id}
//             className={[
//               "w-full max-w-md rounded-xl border px-4 py-3 shadow-lg",
//               t.type === "success" &&
//                 "border-emerald-200 bg-emerald-50 text-emerald-900",
//               t.type === "error" && "border-rose-200 bg-rose-50 text-rose-900",
//               t.type === "info" && "border-blue-200 bg-blue-50 text-blue-900",
//             ]
//               .filter(Boolean)
//               .join(" ")}
//           >
//             <div className="font-semibold">{t.title}</div>
//             {t.desc && <div className="text-sm opacity-90">{t.desc}</div>}
//           </div>
//         ))}
//       </div>
//     </ToastCtx.Provider>
//   );
// }
// function useToast() {
//   return React.useContext(ToastCtx);
// }

// /* ----------------------------- Primitives ----------------------------- */
// function cls(...a) {
//   return a.filter(Boolean).join(" ");
// }
// function Spinner({ className = "" }) {
//   return (
//     <svg className={cls("h-5 w-5 animate-spin", className)} viewBox="0 0 24 24">
//       <circle
//         cx="12"
//         cy="12"
//         r="10"
//         stroke="currentColor"
//         strokeWidth="4"
//         fill="none"
//         className="opacity-25"
//       />
//       <path
//         d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z"
//         fill="currentColor"
//         className="opacity-75"
//       />
//     </svg>
//   );
// }
// function Button({
//   children,
//   variant = "default",
//   size = "md",
//   className = "",
//   ...props
// }) {
//   const sizes = {
//     sm: "px-3 py-1.5 text-sm",
//     md: "px-4 py-2 text-sm",
//     lg: "px-5 py-3",
//   };
//   const variants = {
//     default:
//       "bg-neutral-900 text-white hover:bg-neutral-800 focus-visible:ring-neutral-400",
//     ghost:
//       "border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50 focus-visible:ring-neutral-300",
//     danger:
//       "bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-400",
//     success:
//       "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-400",
//     subtle:
//       "bg-neutral-100 text-neutral-800 hover:bg-neutral-200 focus-visible:ring-neutral-300",
//   };
//   return (
//     <button
//       className={cls(
//         "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50",
//         sizes[size],
//         variants[variant],
//         className
//       )}
//       {...props}
//     >
//       {children}
//     </button>
//   );
// }
// function Input({ label, id, required, className = "", ...props }) {
//   return (
//     <label className="grid gap-1.5" htmlFor={id}>
//       {label && (
//         <span className="text-sm font-medium text-neutral-700">
//           {label} {required && <span className="text-rose-600">*</span>}
//         </span>
//       )}
//       <input
//         id={id}
//         required={required}
//         className={cls(
//           "rounded-xl border border-neutral-300 px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-800 focus:ring-2 focus:ring-neutral-300",
//           className
//         )}
//         {...props}
//       />
//     </label>
//   );
// }
// function Textarea({ label, id, required, className = "", ...props }) {
//   return (
//     <label className="grid gap-1.5" htmlFor={id}>
//       {label && (
//         <span className="text-sm font-medium text-neutral-700">
//           {label} {required && <span className="text-rose-600">*</span>}
//         </span>
//       )}
//       <textarea
//         id={id}
//         required={required}
//         className={cls(
//           "min-h-[100px] rounded-xl border border-neutral-300 px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-800 focus:ring-2 focus:ring-neutral-300",
//           className
//         )}
//         {...props}
//       />
//     </label>
//   );
// }
// function Select({ label, id, children, required, className = "", ...props }) {
//   return (
//     <label className="grid gap-1.5" htmlFor={id}>
//       {label && (
//         <span className="text-sm font-medium text-neutral-700">
//           {label} {required && <span className="text-rose-600">*</span>}
//         </span>
//       )}
//       <select
//         id={id}
//         required={required}
//         className={cls(
//           "rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-neutral-800 focus:ring-2 focus:ring-neutral-300",
//           className
//         )}
//         {...props}
//       >
//         {children}
//       </select>
//     </label>
//   );
// }
// function Badge({ children, tone = "gray" }) {
//   const tones = {
//     gray: "bg-neutral-100 text-neutral-800",
//     green: "bg-emerald-100 text-emerald-800",
//     amber: "bg-amber-100 text-amber-800",
//   };
//   return (
//     <span
//       className={cls(
//         "inline-flex items-center rounded-lg px-2 py-1 text-xs font-medium",
//         tones[tone]
//       )}
//     >
//       {children}
//     </span>
//   );
// }
// function Modal({ open, onClose, title, children, footer }) {
//   if (!open) return null;
//   return (
//     <div
//       className="fixed inset-0 z-[9990] grid place-items-center bg-black/40 px-4 py-8"
//       role="dialog"
//       aria-modal="true"
//       aria-label={title || "Dialog"}
//       onClick={(e) => e.target === e.currentTarget && onClose?.()}
//     >
//       <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
//         <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3">
//           <h3 className="text-base font-semibold">{title}</h3>
//           <button
//             className="rounded-full p-1.5 hover:bg-neutral-100"
//             onClick={onClose}
//             aria-label="Close"
//           >
//             ✕
//           </button>
//         </div>
//         <div className="grid gap-4 p-5">{children}</div>
//         <div className="flex items-center justify-end gap-2 border-t border-neutral-200 px-5 py-3">
//           {footer}
//         </div>
//       </div>
//     </div>
//   );
// }

// /* --------------------------- Tests Dashboard --------------------------- */
// export const TestsDashboard = () => {
//   const { pushToast } = useToast();

//   // data
//   const [tests, setTests] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [err, setErr] = useState("");

//   // ui/filters
//   const [q, setQ] = useState("");
//   const [sortKey, setSortKey] = useState("title"); // title | time_limit_sec | status
//   const [sortDir, setSortDir] = useState("asc"); // asc | desc
//   const [page, setPage] = useState(1);
//   const [pageSize, setPageSize] = useState(10);

//   // modal
//   const [openForm, setOpenForm] = useState(false);
//   const [editing, setEditing] = useState(null);
//   const [form, setForm] = useState({
//     title: "",
//     description: "",
//     time_limit_sec: "",
//   });
//   const [saving, setSaving] = useState(false);

//   useEffect(() => {
//     loadTests();
//   }, []);

//   async function loadTests() {
//     setLoading(true);
//     setErr("");
//     try {
//       const res = await apiFetch("/assessments/tests/list");
//       const list = res?.data || res || [];
//       setTests(Array.isArray(list) ? list : []);
//     } catch (e) {
//       setErr(e.message || "Failed to load tests");
//     } finally {
//       setLoading(false);
//     }
//   }

//   const filtered = useMemo(() => {
//     const term = q.trim().toLowerCase();
//     let arr = [...tests];
//     if (term)
//       arr = arr.filter((t) =>
//         String(t.title || "")
//           .toLowerCase()
//           .includes(term)
//       );
//     arr.sort((a, b) => {
//       let av, bv;
//       if (sortKey === "title") {
//         av = (a.title || "").toLowerCase();
//         bv = (b.title || "").toLowerCase();
//       } else if (sortKey === "time_limit_sec") {
//         av = Number(a.time_limit_sec || 0);
//         bv = Number(b.time_limit_sec || 0);
//       } else {
//         const aPub = !!(
//           a.is_published ??
//           a.published ??
//           a.status === "published"
//         );
//         const bPub = !!(
//           b.is_published ??
//           b.published ??
//           b.status === "published"
//         );
//         av = aPub ? 1 : 0;
//         bv = bPub ? 1 : 0;
//       }
//       if (av < bv) return sortDir === "asc" ? -1 : 1;
//       if (av > bv) return sortDir === "asc" ? 1 : -1;
//       return 0;
//     });
//     return arr;
//   }, [tests, q, sortKey, sortDir]);

//   const start = (page - 1) * pageSize;
//   const paged = filtered.slice(start, start + pageSize);
//   const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

//   const publishedCount = tests.filter(
//     (t) => !!(t.is_published ?? t.published ?? t.status === "published")
//   ).length;
//   const stats = {
//     total: tests.length,
//     published: publishedCount,
//     draft: tests.length - publishedCount,
//   };

//   function openCreate() {
//     setEditing(null);
//     setForm({ title: "", description: "", time_limit_sec: "" });
//     setOpenForm(true);
//   }
//   function openEdit(t) {
//     setEditing(t);
//     setForm({
//       title: t.title || "",
//       description: t.description || "",
//       time_limit_sec: String(t.time_limit_sec ?? ""),
//     });
//     setOpenForm(true);
//   }

//   async function submitForm() {
//     // validation
//     if (!form.title.trim()) {
//       pushToast({ title: "Title is required", type: "error" });
//       return;
//     }
//     if (!/^\d+$/.test(String(form.time_limit_sec || ""))) {
//       pushToast({
//         title: "Time limit must be a number (seconds)",
//         type: "error",
//       });
//       return;
//     }

//     setSaving(true);
//     try {
//       if (!editing) {
//         // create
//         const payload = {
//           title: form.title.trim(),
//           description: form.description || "",
//           time_limit_sec: Number(form.time_limit_sec || 0),
//           admin_id: 1, // kerak bo‘lsa moslang
//         };
//         await apiFetch("/assessments/tests/add", {
//           method: "POST",
//           json: payload,
//         });
//         pushToast({ title: "Test created", type: "success" });
//       } else {
//         // update
//         const payload = {
//           title: form.title.trim(),
//           description: form.description || "",
//           time_limit_sec: Number(form.time_limit_sec || 0),
//         };
//         await apiFetch(
//           `/assessments/tests/edit/${encodeURIComponent(editing.id)}`,
//           {
//             method: "PUT",
//             json: payload,
//           }
//         );
//         pushToast({ title: "Test updated", type: "success" });
//       }
//       setOpenForm(false); // faqat success bo‘lsa yopiladi
//       await loadTests();
//     } catch (e) {
//       // xato bo‘lsa modal yopilmaydi
//       pushToast({ title: "Save failed", desc: e.message, type: "error" });
//     } finally {
//       setSaving(false);
//     }
//   }

//   async function publish(t) {
//     const optimistic = tests.map((x) =>
//       x.id === t.id
//         ? { ...x, is_published: true, published: true, status: "published" }
//         : x
//     );
//     setTests(optimistic);
//     try {
//       await apiFetch(`/assessments/tests/publish/${encodeURIComponent(t.id)}`, {
//         method: "PATCH",
//       });
//       pushToast({ title: "Published", type: "success" });
//     } catch (e) {
//       pushToast({ title: "Publish failed", desc: e.message, type: "error" });
//       await loadTests();
//     }
//   }
//   async function unpublish(t) {
//     const optimistic = tests.map((x) =>
//       x.id === t.id
//         ? { ...x, is_published: false, published: false, status: "draft" }
//         : x
//     );
//     setTests(optimistic);
//     try {
//       await apiFetch(
//         `/assessments/tests/unpublish/${encodeURIComponent(t.id)}`,
//         { method: "PATCH" }
//       );
//       pushToast({ title: "Unpublished", type: "success" });
//     } catch (e) {
//       pushToast({ title: "Unpublish failed", desc: e.message, type: "error" });
//       await loadTests();
//     }
//   }
//   async function removeTest(t) {
//     if (!window.confirm(`Delete test "${t.title}"?`)) return;
//     const backup = tests;
//     setTests((prev) => prev.filter((x) => x.id !== t.id));
//     try {
//       await apiFetch(`/assessments/tests/remove/${encodeURIComponent(t.id)}`, {
//         method: "DELETE",
//       });
//       pushToast({ title: "Test deleted", type: "success" });
//     } catch (e) {
//       pushToast({ title: "Delete failed", desc: e.message, type: "error" });
//       setTests(backup);
//     }
//   }

//   return (
//     <LayoutDashboard>
//       <ToastProvider>
//         <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
//           <div className="my-4">
//             <AdminSectionTabs />
//           </div>

//           {/* Header */}
//           <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
//             <div>
//               <h1 className="text-2xl font-bold tracking-tight">Tests</h1>
//               <p className="text-sm text-neutral-600">
//                 Create, edit, publish, unpublish, and delete tests.
//               </p>
//             </div>
//             <div className="flex flex-wrap items-center gap-2">
//               <Button variant="subtle" onClick={loadTests}>
//                 ↻ Refresh
//               </Button>
//               <Button onClick={openCreate}>＋ New Test</Button>
//             </div>
//           </div>

//           {/* Stats */}
//           <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
//             <Stat label="Total" value={stats.total} />
//             <Stat label="Published" value={stats.published} />
//             <Stat label="Draft" value={stats.draft} />
//           </section>

//           {/* Toolbar */}
//           <section className="mb-4 rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
//             <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
//               <div className="relative w-full md:max-w-md">
//                 <input
//                   value={q}
//                   onChange={(e) => {
//                     setQ(e.target.value);
//                     setPage(1);
//                   }}
//                   placeholder="Search by title…"
//                   className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200"
//                 />
//                 <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
//                   ⌕
//                 </span>
//               </div>

//               <div className="flex flex-wrap items-center gap-2">
//                 <div className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-2 py-1.5 text-sm">
//                   <span className="text-neutral-500">Sort</span>
//                   <select
//                     value={sortKey}
//                     onChange={(e) => setSortKey(e.target.value)}
//                     className="rounded-md bg-transparent px-1 py-1 outline-none"
//                   >
//                     <option value="title">Title</option>
//                     <option value="time_limit_sec">Time limit</option>
//                     <option value="status">Status</option>
//                   </select>
//                   <div className="h-4 w-px bg-neutral-200" />
//                   <select
//                     value={sortDir}
//                     onChange={(e) => setSortDir(e.target.value)}
//                     className="rounded-md bg-transparent px-1 py-1 outline-none"
//                   >
//                     <option value="asc">Asc</option>
//                     <option value="desc">Desc</option>
//                   </select>
//                 </div>

//                 <div className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-2 py-1.5 text-sm">
//                   <span className="text-neutral-500">Per page</span>
//                   <select
//                     value={pageSize}
//                     onChange={(e) => {
//                       setPageSize(Number(e.target.value));
//                       setPage(1);
//                     }}
//                     className="rounded-md bg-transparent px-1 py-1 outline-none"
//                   >
//                     {[5, 10, 20, 50].map((n) => (
//                       <option key={n} value={n}>
//                         {n}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* Content */}
//           <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
//             {loading ? (
//               <div className="flex items-center gap-3 p-8">
//                 <Spinner />
//                 <div className="text-sm text-neutral-600">Loading tests…</div>
//               </div>
//             ) : err ? (
//               <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
//                 {err}
//               </div>
//             ) : !tests.length ? (
//               <Empty
//                 title="No tests yet"
//                 desc="Create your first test to get started."
//                 action={<Button onClick={openCreate}>＋ Create Test</Button>}
//               />
//             ) : (
//               <>
//                 <div className="w-full overflow-auto">
//                   <table className="w-full table-fixed border-collapse text-sm">
//                     <thead>
//                       <tr className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-600">
//                         <th className="w-16 px-3 py-2">ID</th>
//                         <th className="min-w-[220px] px-3 py-2">Title</th>
//                         <th className="w-36 px-3 py-2">Time Limit</th>
//                         <th className="w-28 px-3 py-2">Status</th>
//                         <th className="w-56 px-3 py-2 text-right">Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {paged.map((t) => {
//                         const isPub = !!(
//                           t.is_published ??
//                           t.published ??
//                           t.status === "published"
//                         );
//                         return (
//                           <tr key={t.id} className="border-b last:border-0">
//                             <td className="px-3 py-2 font-mono text-xs text-neutral-500">
//                               {t.id}
//                             </td>
//                             <td className="truncate px-3 py-2 font-medium">
//                               {t.title}
//                             </td>
//                             <td className="px-3 py-2">
//                               {formatSecs(t.time_limit_sec)}
//                             </td>
//                             <td className="px-3 py-2">
//                               {isPub ? (
//                                 <Badge tone="green">Published</Badge>
//                               ) : (
//                                 <Badge tone="amber">Draft</Badge>
//                               )}
//                             </td>
//                             <td className="px-3 py-2">
//                               <div className="flex items-center justify-end gap-2">
//                                 <Button
//                                   variant="ghost"
//                                   onClick={() => openEdit(t)}
//                                 >
//                                   Edit
//                                 </Button>
//                                 {isPub ? (
//                                   <Button
//                                     variant="subtle"
//                                     onClick={() => unpublish(t)}
//                                   >
//                                     Unpublish
//                                   </Button>
//                                 ) : (
//                                   <Button
//                                     variant="success"
//                                     onClick={() => publish(t)}
//                                   >
//                                     Publish
//                                   </Button>
//                                 )}
//                                 <Button
//                                   variant="danger"
//                                   onClick={() => removeTest(t)}
//                                 >
//                                   Delete
//                                 </Button>
//                               </div>
//                             </td>
//                           </tr>
//                         );
//                       })}
//                     </tbody>
//                   </table>
//                 </div>

//                 {/* Pagination */}
//                 <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
//                   <div className="text-sm text-neutral-600">
//                     Page <strong>{page}</strong> of{" "}
//                     <strong>{totalPages}</strong>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <Button
//                       variant="ghost"
//                       onClick={() => setPage((p) => Math.max(1, p - 1))}
//                       disabled={page <= 1}
//                     >
//                       ← Prev
//                     </Button>
//                     <Button
//                       variant="ghost"
//                       onClick={() =>
//                         setPage((p) => Math.min(totalPages, p + 1))
//                       }
//                       disabled={page >= totalPages}
//                     >
//                       Next →
//                     </Button>
//                   </div>
//                 </div>
//               </>
//             )}
//           </section>

//           {/* Create/Edit Modal */}
//           <Modal
//             open={openForm}
//             onClose={() => setOpenForm(false)}
//             title={editing ? "Edit Test" : "Create Test"}
//             footer={
//               <>
//                 <Button variant="ghost" onClick={() => setOpenForm(false)}>
//                   Cancel
//                 </Button>
//                 <Button onClick={submitForm} disabled={saving}>
//                   {saving && <Spinner />}
//                   <span>{editing ? "Save Changes" : "Create Test"}</span>
//                 </Button>
//               </>
//             }
//           >
//             <div className="grid gap-4">
//               <Input
//                 id="t-title"
//                 label="Title"
//                 required
//                 placeholder="e.g., JavaScript Basics Quiz"
//                 value={form.title}
//                 onChange={(e) =>
//                   setForm((f) => ({ ...f, title: e.target.value }))
//                 }
//               />
//               <Textarea
//                 id="t-desc"
//                 label="Description"
//                 placeholder="Optional short description"
//                 value={form.description}
//                 onChange={(e) =>
//                   setForm((f) => ({ ...f, description: e.target.value }))
//                 }
//               />
//               <Input
//                 id="t-time"
//                 label="Time Limit (seconds)"
//                 required
//                 type="number"
//                 min={0}
//                 placeholder="900"
//                 value={form.time_limit_sec}
//                 onChange={(e) =>
//                   setForm((f) => ({ ...f, time_limit_sec: e.target.value }))
//                 }
//               />
//             </div>
//           </Modal>
//         </main>
//       </ToastProvider>
//     </LayoutDashboard>
//   );
// };

// /* ------------------------------ Helpers ------------------------------ */
// function Stat({ label, value }) {
//   return (
//     <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
//       <div className="text-sm text-neutral-500">{label}</div>
//       <div className="mt-2 text-2xl font-bold">{value}</div>
//     </div>
//   );
// }
// function Empty({ title, desc, action }) {
//   return (
//     <div className="grid place-items-center rounded-2xl border border-dashed border-neutral-300 p-8 text-center">
//       <div className="mx-auto grid max-w-md gap-3">
//         <div className="mx-auto h-12 w-12 rounded-full bg-neutral-100" />
//         <h3 className="text-lg font-semibold">{title}</h3>
//         <p className="text-sm text-neutral-600">{desc}</p>
//         {action && <div className="mt-2">{action}</div>}
//       </div>
//     </div>
//   );
// }
// function formatSecs(s) {
//   const m = Math.floor((s || 0) / 60);
//   const sec = (s || 0) % 60;
//   return `${m}m ${sec}s`;
// }

// src/pages/tests-dashboard/index.jsx
// Drop-in improved Tests Dashboard
// - Lists tests with sorting, filtering, pagination
// - Create/Edit includes question_limit + randomize_questions controls
// - Publish/Unpublish/Delete with optimistic updates
// - Manage per-test Recommendations via modal (list/add/edit/delete)
// - Lightweight, Tailwind-only UI; no external UI libs

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AdminSectionTabs, LayoutDashboard } from "../../components";
import { baseURL } from "../../shared/constants";

/* ----------------------------- API Helper ----------------------------- */
async function apiFetch(path, { method = "GET", json, headers = {} } = {}) {
  const token = localStorage.getItem("admin_token") || ""; // raw token (no Bearer)
  const buildUrl = (base, p) => {
    const b = String(base || "").replace(/\/+$/, "");
    const q = String(p || "").replace(/^\/+/, "");
    return `${b}/${q}`;
  };
  const url = path.startsWith("http") ? path : buildUrl(baseURL, path);
  const opts = {
    method,
    headers: {
      Authorization: `${token}`,
      ...headers,
    },
  };
  if (json !== undefined) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(json);
  }
  const res = await fetch(url, opts);
  let data = null;
  try {
    data = await res.json();
  } catch {}
  if (!res.ok) {
    const msg = data?.message || data?.error || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

/* ------------------------------- Toasts ------------------------------- */
const ToastCtx = React.createContext({ pushToast: () => {} });
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  function pushToast({ title, desc, type = "info", timeout = 2200 }) {
    const id = crypto.randomUUID();
    setToasts((t) => [...t, { id, title, desc, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), timeout);
  }
  return (
    <ToastCtx.Provider value={{ pushToast }}>
      {children}
      <div className="fixed inset-x-0 top-3 z-[9999] flex flex-col items-center gap-2 px-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              "w-full max-w-md rounded-xl border px-4 py-3 shadow-lg",
              t.type === "success" &&
                "border-emerald-200 bg-emerald-50 text-emerald-900",
              t.type === "error" && "border-rose-200 bg-rose-50 text-rose-900",
              t.type === "info" && "border-blue-200 bg-blue-50 text-blue-900",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <div className="font-semibold">{t.title}</div>
            {t.desc && <div className="text-sm opacity-90">{t.desc}</div>}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
function useToast() {
  return React.useContext(ToastCtx);
}

/* ----------------------------- Primitives ----------------------------- */
function cls(...a) {
  return a.filter(Boolean).join(" ");
}
function Spinner({ className = "" }) {
  return (
    <svg className={cls("h-5 w-5 animate-spin", className)} viewBox="0 0 24 24">
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
        d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z"
        fill="currentColor"
        className="opacity-75"
      />
    </svg>
  );
}
function Button({
  children,
  variant = "default",
  size = "md",
  className = "",
  ...props
}) {
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-3",
  };
  const variants = {
    default:
      "bg-neutral-900 text-white hover:bg-neutral-800 focus-visible:ring-neutral-400",
    ghost:
      "border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50 focus-visible:ring-neutral-300",
    danger:
      "bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-400",
    success:
      "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-400",
    subtle:
      "bg-neutral-100 text-neutral-800 hover:bg-neutral-200 focus-visible:ring-neutral-300",
  };
  return (
    <button
      className={cls(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50",
        sizes[size],
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
function Input({ label, id, required, hint, className = "", ...props }) {
  return (
    <label className="grid gap-1.5" htmlFor={id}>
      {label && (
        <span className="text-sm font-medium text-neutral-700">
          {label} {required && <span className="text-rose-600">*</span>}
        </span>
      )}
      <input
        id={id}
        required={required}
        className={cls(
          "rounded-xl border border-neutral-300 px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-800 focus:ring-2 focus:ring-neutral-300",
          className
        )}
        {...props}
      />
      {hint && <span className="text-xs text-neutral-500">{hint}</span>}
    </label>
  );
}
function Textarea({ label, id, required, hint, className = "", ...props }) {
  return (
    <label className="grid gap-1.5" htmlFor={id}>
      {label && (
        <span className="text-sm font-medium text-neutral-700">
          {label} {required && <span className="text-rose-600">*</span>}
        </span>
      )}
      <textarea
        id={id}
        required={required}
        className={cls(
          "min-h-[100px] rounded-xl border border-neutral-300 px-3 py-2 text-sm shadow-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-800 focus:ring-2 focus:ring-neutral-300",
          className
        )}
        {...props}
      />
      {hint && <span className="text-xs text-neutral-500">{hint}</span>}
    </label>
  );
}
function Select({ label, id, children, required, className = "", ...props }) {
  return (
    <label className="grid gap-1.5" htmlFor={id}>
      {label && (
        <span className="text-sm font-medium text-neutral-700">
          {label} {required && <span className="text-rose-600">*</span>}
        </span>
      )}
      <select
        id={id}
        required={required}
        className={cls(
          "rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-neutral-800 focus:ring-2 focus:ring-neutral-300",
          className
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
function Switch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange?.(!checked)}
      className={cls(
        "inline-flex items-center gap-2 rounded-full border px-2 py-1",
        checked
          ? "border-emerald-300 bg-emerald-50 text-emerald-800"
          : "border-neutral-300 bg-white text-neutral-700"
      )}
      aria-pressed={checked}
    >
      <span
        className={cls(
          "h-4 w-4 rounded-full",
          checked ? "bg-emerald-500" : "bg-neutral-300"
        )}
      />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
function Badge({ children, tone = "gray" }) {
  const tones = {
    gray: "bg-neutral-100 text-neutral-800",
    green: "bg-emerald-100 text-emerald-800",
    amber: "bg-amber-100 text-amber-800",
  };
  return (
    <span
      className={cls(
        "inline-flex items-center rounded-lg px-2 py-1 text-xs font-medium",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}
function Modal({ open, onClose, title, children, footer, size = "md" }) {
  if (!open) return null;
  const sizes = { sm: "max-w-lg", md: "max-w-2xl", lg: "max-w-4xl" };
  return (
    <div
      className="fixed inset-0 z-[9990] grid place-items-center bg-black/40 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-label={title || "Dialog"}
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div
        className={cls(
          "w-full overflow-hidden rounded-2xl bg-white shadow-xl",
          sizes[size]
        )}
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3">
          <h3 className="text-base font-semibold">{title}</h3>
          <button
            className="rounded-full p-1.5 hover:bg-neutral-100"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="grid gap-4 p-5">{children}</div>
        <div className="flex items-center justify-end gap-2 border-t border-neutral-200 px-5 py-3">
          {footer}
        </div>
      </div>
    </div>
  );
}

/* --------------------- Recommendations Manager ---------------------- */
function RecommendationsManager({ test, open, onClose }) {
  const { pushToast } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    video_link: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) load();
  }, [open]);

  async function load() {
    if (!test) return;
    setLoading(true);
    setErr("");
    try {
      const res = await apiFetch(
        `/assessments/tests/${encodeURIComponent(test.id)}/recommendations`
      );
      const list = res?.data || res || [];
      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      setErr(e.message || "Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  }
  function openCreate() {
    setEditing(null);
    setForm({ title: "", description: "", video_link: "" });
  }
  function openEdit(it) {
    setEditing(it);
    setForm({
      title: it.title || "",
      description: it.description || "",
      video_link: it.video_link || "",
    });
  }

  async function save() {
    if (!form.title.trim()) {
      pushToast({ title: "Title required", type: "error" });
      return;
    }
    if (form.video_link && !/^https?:\/\//i.test(form.video_link)) {
      pushToast({ title: "Video link must be a URL", type: "error" });
      return;
    }
    setSaving(true);
    try {
      if (!editing) {
        await apiFetch(
          `/assessments/tests/${encodeURIComponent(test.id)}/recommendations`,
          { method: "POST", json: form }
        );
        pushToast({ title: "Recommendation created", type: "success" });
      } else {
        await apiFetch(
          `/assessments/tests/${encodeURIComponent(
            test.id
          )}/recommendations/${encodeURIComponent(editing.id)}`,
          { method: "PUT", json: form }
        );
        pushToast({ title: "Recommendation updated", type: "success" });
      }
      await load();
      setEditing(null);
      setForm({ title: "", description: "", video_link: "" });
    } catch (e) {
      pushToast({ title: "Save failed", desc: e.message, type: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function remove(it) {
    if (!window.confirm(`Delete recommendation "${it.title}"?`)) return;
    const backup = items;
    setItems((prev) => prev.filter((x) => x.id !== it.id));
    try {
      await apiFetch(
        `/assessments/tests/${encodeURIComponent(
          test.id
        )}/recommendations/${encodeURIComponent(it.id)}`,
        { method: "DELETE" }
      );
      pushToast({ title: "Deleted", type: "success" });
    } catch (e) {
      pushToast({ title: "Delete failed", desc: e.message, type: "error" });
      setItems(backup);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Recommendations · ${test?.title ?? ""}`}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button onClick={save} disabled={saving}>
            <>
              {saving && <Spinner />}
              <span>{editing ? "Save Changes" : "Create"}</span>
            </>
          </Button>
        </>
      }
    >
      {/* Form */}
      <div className="grid gap-3 rounded-xl border border-neutral-200 p-4">
        <Input
          id="r-title"
          label="Title"
          required
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        />
        <Textarea
          id="r-desc"
          label="Description"
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
        />
        <Input
          id="r-link"
          label="Video link"
          placeholder="https://..."
          value={form.video_link}
          onChange={(e) =>
            setForm((f) => ({ ...f, video_link: e.target.value }))
          }
        />
        <div className="flex items-center gap-2">
          {!editing ? (
            <Button variant="success" onClick={save} disabled={saving}>
              {saving && <Spinner />} Create
            </Button>
          ) : (
            <Button onClick={save} disabled={saving}>
              {saving && <Spinner />} Save changes
            </Button>
          )}
          {editing && (
            <Button
              variant="ghost"
              onClick={() => {
                setEditing(null);
                setForm({ title: "", description: "", video_link: "" });
              }}
            >
              Cancel edit
            </Button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="mt-4">
        {loading ? (
          <div className="flex items-center gap-3 p-3">
            <Spinner />
            <span className="text-sm text-neutral-600">Loading…</span>
          </div>
        ) : err ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-900">
            {err}
          </div>
        ) : !items.length ? (
          <div className="rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-600">
            No recommendations yet.
          </div>
        ) : (
          <ul className="grid gap-2">
            {items.map((it) => (
              <li
                key={it.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-neutral-200 p-3"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium">{it.title}</div>
                  {it.description && (
                    <div className="truncate text-sm text-neutral-600 w-96">
                      {it.description}
                    </div>
                  )}
                  {it.video_link && (
                    <a
                      href={it.video_link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-700 underline break-all"
                    >
                      {it.video_link}
                    </a>
                  )}
                </div>
                <div className="shrink-0 space-x-2">
                  <Button variant="ghost" onClick={() => openEdit(it)}>
                    Edit
                  </Button>
                  <Button variant="danger" onClick={() => remove(it)}>
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}

/* --------------------------- Tests Dashboard --------------------------- */
export const TestsDashboard = () => {
  const { pushToast } = useToast();

  // data
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // ui/filters
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all"); // all | published | draft
  const [sortKey, setSortKey] = useState("title"); // title | time_limit_sec | status
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // modals
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    time_limit_sec: "",
    question_limit: "",
    randomize_questions: true,
  });
  const [saving, setSaving] = useState(false);

  const [recTest, setRecTest] = useState(null); // test object for recommendations
  const [recOpen, setRecOpen] = useState(false);

  // debounce search
  const qRef = useRef(q);
  useEffect(() => {
    qRef.current = q;
    const id = setTimeout(() => setQ(qRef.current), 250);
    return () => clearTimeout(id);
  }, [q]);

  useEffect(() => {
    loadTests();
  }, []);

  async function loadTests() {
    setLoading(true);
    setErr("");
    try {
      const res = await apiFetch("/assessments/tests/list");
      const list = res?.data || res || [];
      setTests(Array.isArray(list) ? list : []);
    } catch (e) {
      setErr(e.message || "Failed to load tests");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    let arr = Array.isArray(tests) ? [...tests] : [];
    if (term)
      arr = arr.filter((t) =>
        String(t.title || "")
          .toLowerCase()
          .includes(term)
      );
    if (status !== "all") {
      arr = arr.filter((t) => {
        const isPub = !!(
          t.is_published ??
          t.published ??
          t.status === "published"
        );
        return status === "published" ? isPub : !isPub;
      });
    }
    arr.sort((a, b) => {
      let av, bv;
      if (sortKey === "title") {
        av = (a.title || "").toLowerCase();
        bv = (b.title || "").toLowerCase();
      } else if (sortKey === "time_limit_sec") {
        av = Number(a.time_limit_sec || 0);
        bv = Number(b.time_limit_sec || 0);
      } else {
        const ap = !!(
          a.is_published ??
          a.published ??
          a.status === "published"
        );
        const bp = !!(
          b.is_published ??
          b.published ??
          b.status === "published"
        );
        av = ap ? 1 : 0;
        bv = bp ? 1 : 0;
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [tests, q, status, sortKey, sortDir]);

  const start = (page - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const publishedCount = tests.filter(
    (t) => !!(t.is_published ?? t.published ?? t.status === "published")
  ).length;
  const stats = {
    total: tests.length,
    published: publishedCount,
    draft: tests.length - publishedCount,
  };

  function openCreate() {
    setEditing(null);
    setForm({
      title: "",
      description: "",
      time_limit_sec: "",
      question_limit: "",
      randomize_questions: true,
    });
    setOpenForm(true);
  }
  function openEdit(t) {
    setEditing(t);
    setForm({
      title: t.title || "",
      description: t.description || "",
      time_limit_sec: String(t.time_limit_sec ?? ""),
      question_limit: t.question_limit != null ? String(t.question_limit) : "",
      randomize_questions: t.randomize_questions !== false,
    });
    setOpenForm(true);
  }

  async function submitForm() {
    if (!form.title.trim()) {
      pushToast({ title: "Title is required", type: "error" });
      return;
    }
    const timeOk =
      form.time_limit_sec === "" || /^\d+$/.test(String(form.time_limit_sec));
    if (!timeOk) {
      pushToast({
        title: "Time limit must be a number (seconds)",
        type: "error",
      });
      return;
    }
    const limitOk =
      form.question_limit === "" || /^\d+$/.test(String(form.question_limit));
    if (!limitOk) {
      pushToast({ title: "Question limit must be a number", type: "error" });
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description || "",
      time_limit_sec:
        form.time_limit_sec === "" ? null : Number(form.time_limit_sec),
      question_limit:
        form.question_limit === "" ? null : Number(form.question_limit),
      randomize_questions: !!form.randomize_questions,
    };

    setSaving(true);
    try {
      if (!editing) {
        // If your backend requires admin_id, add here: payload.admin_id = ...
        await apiFetch("/assessments/tests/add", {
          method: "POST",
          json: { ...payload, admin_id: 1 },
        });
        pushToast({ title: "Test created", type: "success" });
      } else {
        await apiFetch(
          `/assessments/tests/edit/${encodeURIComponent(editing.id)}`,
          { method: "PUT", json: payload }
        );
        pushToast({ title: "Test updated", type: "success" });
      }
      setOpenForm(false);
      await loadTests();
    } catch (e) {
      pushToast({ title: "Save failed", desc: e.message, type: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function publish(t) {
    const optimistic = tests.map((x) =>
      x.id === t.id
        ? { ...x, is_published: true, published: true, status: "published" }
        : x
    );
    setTests(optimistic);
    try {
      await apiFetch(`/assessments/tests/publish/${encodeURIComponent(t.id)}`, {
        method: "PATCH",
      });
      pushToast({ title: "Published", type: "success" });
    } catch (e) {
      pushToast({ title: "Publish failed", desc: e.message, type: "error" });
      await loadTests();
    }
  }
  async function unpublish(t) {
    const optimistic = tests.map((x) =>
      x.id === t.id
        ? { ...x, is_published: false, published: false, status: "draft" }
        : x
    );
    setTests(optimistic);
    try {
      await apiFetch(
        `/assessments/tests/unpublish/${encodeURIComponent(t.id)}`,
        { method: "PATCH" }
      );
      pushToast({ title: "Unpublished", type: "success" });
    } catch (e) {
      pushToast({ title: "Unpublish failed", desc: e.message, type: "error" });
      await loadTests();
    }
  }
  async function removeTest(t) {
    if (!window.confirm(`Delete test "${t.title}"?`)) return;
    const backup = tests;
    setTests((prev) => prev.filter((x) => x.id !== t.id));
    try {
      await apiFetch(`/assessments/tests/remove/${encodeURIComponent(t.id)}`, {
        method: "DELETE",
      });
      pushToast({ title: "Test deleted", type: "success" });
    } catch (e) {
      pushToast({ title: "Delete failed", desc: e.message, type: "error" });
      setTests(backup);
    }
  }

  function openRecs(t) {
    setRecTest(t);
    setRecOpen(true);
  }

  return (
    <LayoutDashboard>
      <ToastProvider>
        <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          <div className="my-4">
            <AdminSectionTabs />
          </div>

          {/* Header */}
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Tests</h1>
              <p className="text-sm text-neutral-600">
                Create, edit, publish, and manage per-test recommendations.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="subtle" onClick={loadTests}>
                ↻ Refresh
              </Button>
              <Button onClick={openCreate}>＋ New Test</Button>
            </div>
          </div>

          {/* Stats */}
          <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Stat label="Total" value={stats.total} />
            <Stat label="Published" value={stats.published} />
            <Stat label="Draft" value={stats.draft} />
          </section>

          {/* Toolbar */}
          <section className="mb-4 rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative w-full sm:max-w-md">
                  <input
                    value={q}
                    onChange={(e) => {
                      setQ(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search by title…"
                    className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-200"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                    ⌕
                  </span>
                </div>
                <div className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-2 py-1.5 text-sm">
                  <span className="text-neutral-500">Status</span>
                  <select
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value);
                      setPage(1);
                    }}
                    className="rounded-md bg-transparent px-1 py-1 outline-none"
                  >
                    <option value="all">All</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-2 py-1.5 text-sm">
                  <span className="text-neutral-500">Sort</span>
                  <select
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value)}
                    className="rounded-md bg-transparent px-1 py-1 outline-none"
                  >
                    <option value="title">Title</option>
                    <option value="time_limit_sec">Time limit</option>
                    <option value="status">Status</option>
                  </select>
                  <div className="h-4 w-px bg-neutral-200" />
                  <select
                    value={sortDir}
                    onChange={(e) => setSortDir(e.target.value)}
                    className="rounded-md bg-transparent px-1 py-1 outline-none"
                  >
                    <option value="asc">Asc</option>
                    <option value="desc">Desc</option>
                  </select>
                </div>

                <div className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-2 py-1.5 text-sm">
                  <span className="text-neutral-500">Per page</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                    className="rounded-md bg-transparent px-1 py-1 outline-none"
                  >
                    {[5, 10, 20, 50].map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Content */}
          <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            {loading ? (
              <div className="flex items-center gap-3 p-8">
                <Spinner />
                <div className="text-sm text-neutral-600">Loading tests…</div>
              </div>
            ) : err ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-900 flex items-center justify-between">
                <span>{err}</span>
                <Button variant="ghost" onClick={loadTests}>
                  Retry
                </Button>
              </div>
            ) : !tests.length ? (
              <Empty
                title="No tests yet"
                desc="Create your first test to get started."
                action={<Button onClick={openCreate}>＋ Create Test</Button>}
              />
            ) : (
              <>
                <div className="w-full overflow-auto">
                  <table className="w-full table-fixed border-collapse text-sm">
                    <thead>
                      <tr className="bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-600">
                        <th className="w-16 px-3 py-2">ID</th>
                        <th className="min-w-[220px] px-3 py-2">Title</th>
                        <th className="w-24 px-3 py-2">Limit</th>
                        <th className="w-28 px-3 py-2">Random?</th>
                        <th className="w-36 px-3 py-2">Time Limit</th>
                        <th className="w-28 px-3 py-2">Status</th>
                        <th className="w-[320px] px-3 py-2 text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paged.map((t) => {
                        const isPub = !!(
                          t.is_published ??
                          t.published ??
                          t.status === "published"
                        );
                        return (
                          <tr
                            key={t.id}
                            className="border-b  border-neutral-200 last:border-0"
                          >
                            <td className="px-3 py-2 font-mono text-xs text-neutral-500">
                              {t.id}
                            </td>
                            <td
                              className="truncate px-3 py-2 font-medium"
                              title={t.title}
                            >
                              {t.title}
                            </td>
                            <td className="px-3 py-2">
                              {t.question_limit ?? "—"}
                            </td>
                            <td className="px-3 py-2">
                              {t.randomize_questions !== false ? (
                                <Badge tone="green">Yes</Badge>
                              ) : (
                                <Badge tone="amber">No</Badge>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              {formatSecs(t.time_limit_sec)}
                            </td>
                            <td className="px-3 py-2">
                              {isPub ? (
                                <Badge tone="green">Published</Badge>
                              ) : (
                                <Badge tone="amber">Draft</Badge>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex flex-wrap items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  onClick={() => openEdit(t)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  onClick={() => openRecs(t)}
                                >
                                  Recommendations
                                </Button>
                                {isPub ? (
                                  <Button
                                    variant="subtle"
                                    onClick={() => unpublish(t)}
                                  >
                                    Unpublish
                                  </Button>
                                ) : (
                                  <Button
                                    variant="success"
                                    onClick={() => publish(t)}
                                  >
                                    Publish
                                  </Button>
                                )}
                                <Button
                                  variant="danger"
                                  onClick={() => removeTest(t)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
                  <div className="text-sm text-neutral-600">
                    Page <strong>{page}</strong> of{" "}
                    <strong>{totalPages}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                    >
                      ← Prev
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page >= totalPages}
                    >
                      Next →
                    </Button>
                  </div>
                </div>
              </>
            )}
          </section>

          {/* Create/Edit Modal */}
          <Modal
            open={openForm}
            onClose={() => setOpenForm(false)}
            title={editing ? "Edit Test" : "Create Test"}
            footer={
              <>
                <Button variant="ghost" onClick={() => setOpenForm(false)}>
                  Cancel
                </Button>
                <Button onClick={submitForm} disabled={saving}>
                  {saving && <Spinner />}
                  <span>{editing ? "Save Changes" : "Create Test"}</span>
                </Button>
              </>
            }
          >
            <div className="grid gap-4">
              <Input
                id="t-title"
                label="Title"
                required
                placeholder="e.g., JavaScript Basics Quiz"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
              />
              <Textarea
                id="t-desc"
                label="Description"
                placeholder="Optional short description"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
              <div className="grid gap-4 sm:grid-cols-3">
                <Input
                  id="t-time"
                  label="Time Limit (seconds)"
                  type="number"
                  min={0}
                  placeholder="900"
                  value={form.time_limit_sec}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, time_limit_sec: e.target.value }))
                  }
                  hint="Leave empty for no time limit."
                />
                <Input
                  id="t-limit"
                  label="Question Limit"
                  type="number"
                  min={1}
                  placeholder="40"
                  value={form.question_limit}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, question_limit: e.target.value }))
                  }
                  hint="Empty = show all questions."
                />
                <div className="grid content-end">
                  <Switch
                    checked={!!form.randomize_questions}
                    onChange={(v) =>
                      setForm((f) => ({ ...f, randomize_questions: v }))
                    }
                    label="Randomize questions"
                  />
                </div>
              </div>
            </div>
          </Modal>
        </main>

        {/* Recommendations modal */}
        {recTest && (
          <RecommendationsManager
            test={recTest}
            open={recOpen}
            onClose={() => setRecOpen(false)}
          />
        )}
      </ToastProvider>
    </LayoutDashboard>
  );
};

/* ------------------------------ Helpers ------------------------------ */
function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="text-sm text-neutral-500">{label}</div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </div>
  );
}
function Empty({ title, desc, action }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-neutral-300 p-8 text-center">
      <div className="mx-auto grid max-w-md gap-3">
        <div className="mx-auto h-12 w-12 rounded-full bg-neutral-100" />
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-neutral-600">{desc}</p>
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  );
}
function formatSecs(s) {
  const sec = Number(s || 0);
  if (!sec) return "—";
  const m = Math.floor(sec / 60);
  const r = sec % 60;
  return `${m}m ${r}s`;
}
