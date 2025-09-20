import { useEffect, useMemo, useState, useRef } from "react";
import { AdminSectionTabs, LayoutDashboard } from "../../components";
import {
  adminGetRequest,
  adminPostRequest,
  adminPutRequest,
  adminDeleteRequest,
} from "../../request";
import { AnimatePresence, motion } from "framer-motion";

// ---- Helpers ----
function emptyForm() {
  return {
    id: null,
    content: "",
    admin_id: 1,
    image: null,
    image_url: "",
    options: [
      { id: null, content: "", is_correct: false, explanation: "" },
      { id: null, content: "", is_correct: false, explanation: "" },
    ],
  };
}

export const QuestionsDashboard = () => {
  // ---- State ----
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [submitting, setSubmitting] = useState(false);

  const fileUrlRef = useRef(null);

  // ---- Derived ----
  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter((x) => stripHtml(x.content).toLowerCase().includes(q));
  }, [items, query]);

  const total = filtered.length;
  const pagesCount = Math.max(1, Math.ceil(total / pageSize));
  const paged = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    // reset pagination when filters change
    setPage(1);
  }, [query, pageSize]);

  useEffect(() => {
    // ESC to close modal
    const onKey = (e) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  useEffect(() => {
    // revoke previous object URL to avoid memory leaks
    return () => {
      if (fileUrlRef.current) URL.revokeObjectURL(fileUrlRef.current);
    };
  }, []);

  // ---- API ----
  async function load() {
    setLoading(true);
    try {
      const res = await adminGetRequest(
        `/assessments/questions/list?with_options=true`
      );
      const data = res?.data || [];
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setModalOpen(true);
  }

  function openEdit(q) {
    setEditing(q);
    setForm({
      id: q.id,
      content: q.content || "",
      admin_id: q.admin_id ?? 1,
      image: null,
      image_url: q.image_url || "",
      options: (q.options || []).map((o) => ({
        id: o.id ?? null,
        content: o.content || "",
        is_correct: !!o.is_correct,
        explanation: o.explanation || "",
      })),
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm());
  }

  // ---- Form helpers ----
  function setOption(idx, patch) {
    setForm((f) => {
      const next = { ...f };
      next.options = [...f.options];
      next.options[idx] = { ...next.options[idx], ...patch };
      return next;
    });
  }

  function addOption() {
    setForm((f) => ({
      ...f,
      options: [
        ...f.options,
        { id: null, content: "", is_correct: false, explanation: "" },
      ],
    }));
  }

  function removeOption(idx) {
    setForm((f) => ({ ...f, options: f.options.filter((_, i) => i !== idx) }));
  }

  function markCorrect(idx) {
    setForm((f) => ({
      ...f,
      options: f.options.map((o, i) => ({ ...o, is_correct: i === idx })),
    }));
  }

  function onFile(e) {
    const file = e.target.files?.[0] || null;
    setForm((f) => {
      const url = file ? URL.createObjectURL(file) : f.image_url;
      if (fileUrlRef.current) URL.revokeObjectURL(fileUrlRef.current);
      fileUrlRef.current = file ? url : null;
      return { ...f, image: file, image_url: file ? url : f.image_url };
    });
  }

  function validate() {
    const errs = [];
    if (!stripHtml(form.content).trim()) errs.push("Savol matni kerak");
    if (form.options.length < 2)
      errs.push("Kamida 2 ta variant bo'lishi kerak");
    const correctCount = form.options.filter((o) => o.is_correct).length;
    if (correctCount !== 1) errs.push("Aynan 1 ta to'g'ri javob belgilang");
    if (errs.length) throw new Error(errs.join(""));
  }

  async function onSubmit(e) {
    e?.preventDefault?.();
    try {
      validate();
    } catch (err) {
      alert(err.message || String(err));
      return;
    }

    try {
      setSubmitting(true);
      let res;
      if (form.image) {
        const fd = new FormData();
        fd.append("content", form.content);
        fd.append("admin_id", String(form.admin_id ?? 1));
        fd.append(
          "options",
          JSON.stringify(form.options.map(({ id, ...rest }) => rest))
        );
        fd.append("image", form.image);

        if (editing) {
          res = await adminPutRequest(
            `/assessments/questions/edit/${form.id}`,
            fd,
            { headers: { "Content-Type": "multipart/form-data" } }
          );
        } else {
          res = await adminPostRequest(`/assessments/questions/add`, fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
      } else {
        const payload = {
          content: form.content,
          admin_id: form.admin_id ?? 1,
          options: form.options,
        };
        if (editing) {
          res = await adminPutRequest(
            `/assessments/questions/edit/${form.id}`,
            payload
          );
        } else {
          res = await adminPostRequest(`/assessments/questions/add`, payload);
        }
      }

      if (res?.data) {
        closeModal();
        await load();
      }
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || err.message || "Xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  }

  async function onDelete(q) {
    if (!confirm("Ushbu savolni o'chirasizmi?")) return;
    setLoading(true);
    try {
      await adminDeleteRequest(`/assessments/questions/remove/${q.id}`);
      await load();
    } catch (err) {
      console.error(err);
      alert(
        err?.response?.data?.message || err.message || "O'chirishda xatolik"
      );
    } finally {
      setLoading(false);
    }
  }

  // ---- UI ----
  return (
    <LayoutDashboard>
      <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        {/* <div className="p-6 space-y-6"> */}
        <div className="my-4">
          <AdminSectionTabs />
        </div>

        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Questions</h1>
            <p className="text-sm text-neutral-500">
              Barcha savollar, rasm va variantlar bilan.
            </p>
          </div>

          <div className="flex w-full items-center flex-col lg:flex-row gap-3 sm:w-auto">
            <div className="relative w-full sm:w-72">
              <input
                className="w-full rounded-xl border border-neutral-200 bg-white/60 px-10 py-2.5 text-sm outline-none ring-0 transition focus:border-neutral-300 focus:shadow-sm focus:shadow-neutral-200 dark:border-neutral-800 dark:bg-neutral-900"
                placeholder="Search content…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            </div>
            <button
              onClick={openCreate}
              className="w-full lg:w-[180px] inline-flex items-center justify-center rounded-xl bg-gradient-to-tr from-neutral-900 to-neutral-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm ring-1 ring-black/5 transition hover:opacity-95 active:opacity-90 dark:from-white dark:to-neutral-200 dark:text-neutral-900"
            >
              <PlusIcon className="mr-2 h-4 w-4" /> New Question
            </button>
          </div>
        </header>

        {/* Stats & Controls */}
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="text-sm text-neutral-500">{total} results</div>
          <div className="flex items-center gap-2">
            <select
              className="rounded-lg border border-neutral-200 bg-white/60 px-3 py-2 text-sm outline-none transition focus:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}/page
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table / List */}
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <table className="hidden w-full md:table">
            <thead className="bg-neutral-50/60 text-left text-sm text-neutral-500 dark:bg-neutral-900/50">
              <tr>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Content</th>
                <th className="px-4 py-3 font-medium">Image</th>
                <th className="px-4 py-3 font-medium">Options</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-neutral-500"
                  >
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && paged.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-sm text-neutral-500"
                  >
                    No questions
                  </td>
                </tr>
              )}
              {paged.map((q) => (
                <tr
                  key={q.id}
                  className="align-top border-t border-neutral-100 dark:border-neutral-900"
                >
                  <td className="px-4 py-4 font-mono text-xs text-neutral-600 dark:text-neutral-400">
                    {q.id}
                  </td>
                  <td className="px-4 py-4">
                    <div
                      className="line-clamp-3 text-sm text-neutral-800 dark:text-neutral-200"
                      dangerouslySetInnerHTML={{ __html: q.content }}
                    />
                  </td>
                  <td className="px-4 py-4">
                    {q.image_url ? (
                      <img
                        src={q.image_url}
                        alt="question"
                        className="h-16 w-24 rounded-lg object-cover ring-1 ring-black/5"
                      />
                    ) : (
                      <span className="text-sm text-neutral-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <ul className="list-disc space-y-1 pl-5 text-[13px] text-neutral-700 dark:text-neutral-300">
                      {(q.options || []).slice(0, 3).map((o) => (
                        <li
                          key={o.id}
                          className={
                            o.is_correct
                              ? "font-semibold text-emerald-600 dark:text-emerald-400"
                              : ""
                          }
                        >
                          <span
                            dangerouslySetInnerHTML={{ __html: o.content }}
                          />
                          {o.is_correct ? " ✓" : ""}
                        </li>
                      ))}
                      {(q.options || []).length > 3 && <li>…</li>}
                    </ul>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => openEdit(q)}
                        className="inline-flex items-center rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-800 shadow-sm hover:bg-neutral-50 active:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
                      >
                        <EditIcon className="mr-1.5 h-4 w-4" /> Edit
                      </button>
                      <button
                        onClick={() => onDelete(q)}
                        className="inline-flex items-center rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm ring-1 ring-black/5 hover:bg-rose-700 active:bg-rose-800"
                      >
                        <TrashIcon className="mr-1.5 h-4 w-4" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile Cards */}
          <div className="grid gap-3 p-3 md:hidden">
            {loading && <CardSkeleton />}
            {!loading && paged.length === 0 && (
              <div className="rounded-xl border border-neutral-200 bg-white p-5 text-center text-sm text-neutral-500 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                No questions
              </div>
            )}
            {paged.map((q) => (
              <div
                key={q.id}
                className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-xs text-neutral-500">
                    #{q.id}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(q)}
                      className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(q)}
                      className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <div
                    className="text-sm text-neutral-800 dark:text-neutral-200"
                    dangerouslySetInnerHTML={{ __html: q.content }}
                  />
                  {q.image_url && (
                    <img
                      src={q.image_url}
                      className="h-36 w-full rounded-lg object-cover"
                    />
                  )}
                  <ul className="list-disc space-y-1 pl-5 text-[13px] text-neutral-700 dark:text-neutral-300">
                    {(q.options || []).slice(0, 3).map((o) => (
                      <li
                        key={o.id}
                        className={
                          o.is_correct
                            ? "font-semibold text-emerald-600 dark:text-emerald-400"
                            : ""
                        }
                      >
                        <span dangerouslySetInnerHTML={{ __html: o.content }} />
                        {o.is_correct ? " ✓" : ""}
                      </li>
                    ))}
                    {(q.options || []).length > 3 && <li>…</li>}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-1">
          <button
            className="inline-flex items-center rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm shadow-sm disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          {Array.from({ length: pagesCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`h-9 min-w-9 rounded-lg border px-3 text-sm shadow-sm transition ${
                page === i + 1
                  ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                  : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="inline-flex items-center rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm shadow-sm disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900"
            disabled={page >= pagesCount}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={closeModal}
            />

            <div className="absolute inset-0 grid place-items-center p-4">
              <motion.div
                role="dialog"
                aria-modal
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 24, opacity: 0 }}
                className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl ring-1 ring-black/5 dark:border-neutral-800 dark:bg-neutral-950"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Sticky header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-100 bg-white/70 px-5 py-4 backdrop-blur-md dark:border-neutral-900 dark:bg-neutral-950/70">
                  <h2 className="text-lg font-semibold">
                    {editing ? "Edit Question" : "New Question"}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={closeModal}
                      className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm shadow-sm hover:bg-neutral-50 active:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={onSubmit}
                      disabled={submitting}
                      className="inline-flex items-center rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-sm ring-1 ring-black/5 hover:opacity-95 disabled:opacity-60 dark:bg-white dark:text-neutral-900"
                    >
                      {submitting ? "Saving…" : "Save"}
                    </button>
                  </div>
                </div>

                <div className="max-h-[75vh] w-full overflow-y-auto p-5">
                  <div className="grid gap-5 md:grid-cols-5">
                    {/* Content */}
                    <div className="md:col-span-3 space-y-3">
                      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Content (HTML allowed)
                      </label>
                      <textarea
                        className="min-h-[160px] w-full rounded-xl border border-neutral-200 bg-white/60 p-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-300 focus:shadow-sm focus:shadow-neutral-200 dark:border-neutral-800 dark:bg-neutral-900"
                        value={form.content}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, content: e.target.value }))
                        }
                        placeholder="<p>Your question HTML…</p>"
                      />
                    </div>

                    {/* Image */}
                    <div className="md:col-span-2 space-y-3">
                      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Image (optional)
                      </label>
                      <div className="flex items-center gap-4">
                        <label className="flex h-24 w-full cursor-pointer items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-white/60 text-sm text-neutral-500 transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={onFile}
                            className="hidden"
                          />
                          <span className="px-3 text-center">
                            Drop or click to upload
                          </span>
                        </label>
                        {(form.image_url || editing?.image_url) && (
                          <div className="relative h-24 w-40 overflow-hidden rounded-xl ring-1 ring-black/5">
                            <img
                              src={form.image_url || editing?.image_url}
                              alt="preview"
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Options
                      </label>
                      <button
                        onClick={addOption}
                        className="inline-flex items-center rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm shadow-sm hover:bg-neutral-50 active:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900"
                      >
                        <PlusIcon className="mr-1.5 h-4 w-4" /> Add option
                      </button>
                    </div>

                    <div className="grid gap-3">
                      {form.options.map((o, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="correct"
                              checked={!!o.is_correct}
                              onChange={() => markCorrect(idx)}
                              className="h-4 w-4 accent-neutral-900"
                            />
                            <span className="text-xs text-neutral-500">
                              Correct
                            </span>
                            <div className="ml-auto flex items-center gap-2">
                              <button
                                onClick={() => removeOption(idx)}
                                disabled={form.options.length <= 2}
                                className="inline-flex items-center rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs shadow-sm disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950"
                              >
                                <TrashIcon className="mr-1 h-3.5 w-3.5" />{" "}
                                Remove
                              </button>
                            </div>
                          </div>
                          <div className="mt-3 grid gap-2">
                            <textarea
                              className="min-h-[80px] w-full rounded-lg border border-neutral-200 bg-white/60 p-2.5 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-300 focus:shadow-sm focus:shadow-neutral-200 dark:border-neutral-800 dark:bg-neutral-950"
                              placeholder="<p>Option HTML…</p>"
                              value={o.content}
                              onChange={(e) =>
                                setOption(idx, { content: e.target.value })
                              }
                            />
                            <input
                              className="w-full rounded-lg border border-neutral-200 bg-white/60 p-2.5 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-300 focus:shadow-sm focus:shadow-neutral-200 dark:border-neutral-800 dark:bg-neutral-950"
                              placeholder="Explanation (optional)"
                              value={o.explanation || ""}
                              onChange={(e) =>
                                setOption(idx, { explanation: e.target.value })
                              }
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </LayoutDashboard>
  );
};

// ---- Little Components ----
function CardSkeleton() {
  return (
    <div className="animate-pulse space-y-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
      <div className="h-4 w-24 rounded bg-neutral-200/70 dark:bg-neutral-800" />
      <div className="h-4 w-3/4 rounded bg-neutral-200/70 dark:bg-neutral-800" />
      <div className="h-24 w-full rounded bg-neutral-200/70 dark:bg-neutral-800" />
    </div>
  );
}

function SearchIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M21 21l-4.3-4.3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function PlusIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EditIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 20h9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M3 6h18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M10 11v6M14 11v6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// ---- Utils ----
function stripHtml(html) {
  if (!html) return "";
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}
