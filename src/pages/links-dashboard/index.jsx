import React, { useEffect, useMemo, useRef, useState } from "react";
import { LayoutDashboard } from "../../components";

/** =========================================================================
 * LinksDashboard
 * Manage links between Tests and Questions (attach, bulk-add, reorder, remove)
 * Endpoints (base http://localhost:5000):
 *  - POST  /api/v1/assessments/test-questions/add
 *  - POST  /api/v1/assessments/test-questions/bulk-add
 *  - GET   /api/v1/assessments/test-questions/list?test_id=:id
 *  - PUT   /api/v1/assessments/test-questions/edit/:id   (body: { order })
 *  - DELETE/api/v1/assessments/test-questions/remove/:id
 *  - GET   /api/v1/assessments/tests/list
 *  - GET   /api/v1/assessments/tests/one/:id   (includes linked questions & options)
 *  - GET   /api/v1/assessments/questions/list?with_options=false
 * ========================================================================= */

const BASE_URL = "http://localhost:5000";
const TOKEN = localStorage.getItem("admin_token") || ""; // adjust storage if needed

async function apiFetch(
  path,
  { method = "GET", json, formData, headers = {} } = {}
) {
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
  const baseHeaders = {
    Authorization: `${TOKEN}`, // backend examples show raw token (no "Bearer ")
    ...headers,
  };
  const options = { method, headers: baseHeaders };

  if (json !== undefined) {
    options.headers = { ...baseHeaders, "Content-Type": "application/json" };
    options.body = JSON.stringify(json);
  }
  if (formData !== undefined) {
    options.body = formData;
  }

  const res = await fetch(url, options);
  let data = null;
  try {
    data = await res.json();
  } catch {
    // ignore
  }
  if (!res.ok) {
    const message =
      (data && (data.message || data.error)) || `HTTP ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

/* ============================== Tiny Utils =============================== */

const cls = (...p) => p.filter(Boolean).join(" ");
const formatSecs = (s) => {
  const m = Math.floor((s || 0) / 60);
  const sec = (s || 0) % 60;
  return `${m}m ${sec}s`;
};
const truncateMid = (str, max = 140) => {
  if (!str) return "";
  if (str.length <= max) return str;
  const half = Math.floor((max - 3) / 2);
  return `${str.slice(0, half)}…${str.slice(-half)}`;
};
const useDebounced = (value, delay = 300) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
};

/* ============================== Toasts =================================== */

const ToastCtx = React.createContext(null);
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const pushToast = ({ title, desc, type = "info", timeout = 2600 }) => {
    const id = crypto.randomUUID();
    setToasts((t) => [...t, { id, title, desc, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), timeout);
  };
  return (
    <ToastCtx.Provider value={{ pushToast }}>
      {children}
      <div className="fixed inset-x-0 top-2 z-[9999] flex flex-col items-center gap-2 px-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            aria-live="polite"
            className={cls(
              "w-full max-w-md rounded-xl border px-4 py-3 shadow-lg",
              t.type === "success" &&
                "border-emerald-200 bg-emerald-50 text-emerald-900",
              t.type === "error" && "border-rose-200 bg-rose-50 text-rose-900",
              t.type === "info" && "border-blue-200 bg-blue-50 text-blue-900",
              t.type === "warning" &&
                "border-amber-200 bg-amber-50 text-amber-900"
            )}
          >
            <div className="font-semibold">{t.title}</div>
            {t.desc && <div className="text-sm opacity-90">{t.desc}</div>}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
const useToast = () => React.useContext(ToastCtx) || { pushToast: () => {} };

/* ============================== Primitives =============================== */

function Spinner({ className = "" }) {
  return (
    <svg
      className={cls("h-5 w-5 animate-spin", className)}
      viewBox="0 0 24 24"
      role="img"
      aria-label="Loading"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4A4 4 0 008 12H4z"
      />
    </svg>
  );
}

function Button({
  children,
  className = "",
  variant = "default",
  size = "md",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-3 text-base",
  };
  const variants = {
    default:
      "bg-neutral-900 text-white hover:bg-neutral-800 focus-visible:ring-neutral-400",
    ghost:
      "border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50 focus-visible:ring-neutral-300",
    subtle:
      "bg-neutral-100 text-neutral-800 hover:bg-neutral-200 focus-visible:ring-neutral-300",
    success:
      "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-400",
    danger:
      "bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-400",
  };
  return (
    <button
      className={cls(base, sizes[size], variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}

function Input({ id, label, hint, className = "", ...props }) {
  return (
    <label className="grid gap-1.5" htmlFor={id}>
      {label && (
        <span className="text-sm font-medium text-neutral-700">{label}</span>
      )}
      <input
        id={id}
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

function Select({ id, label, children, className = "", ...props }) {
  return (
    <label className="grid gap-1.5" htmlFor={id}>
      {label && (
        <span className="text-sm font-medium text-neutral-700">{label}</span>
      )}
      <select
        id={id}
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

function Badge({ children, tone = "gray", className = "" }) {
  const tones = {
    gray: "bg-neutral-100 text-neutral-800",
    green: "bg-emerald-100 text-emerald-800",
    amber: "bg-amber-100 text-amber-800",
    blue: "bg-blue-100 text-blue-800",
    red: "bg-rose-100 text-rose-800",
  };
  return (
    <span
      className={cls(
        "inline-flex items-center rounded-lg px-2 py-1 text-xs font-medium",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

function EmptyState({ title, desc, action }) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-neutral-300 p-8 text-center">
      <div className="mx-auto grid max-w-md gap-3">
        <div className="mx-auto h-12 w-12 rounded-full bg-neutral-100" />
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-neutral-600">{desc}</p>
        {action}
      </div>
    </div>
  );
}

/* ============================== Modal ==================================== */

function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  maxWidthClass = "max-w-2xl",
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[9990] grid place-items-center bg-black/40 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-label={title || "Dialog"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div
        className={cls("w-full rounded-2xl bg-white shadow-xl", maxWidthClass)}
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-3">
          <h3 className="text-base font-semibold">{title}</h3>
          <button
            aria-label="Close"
            className="rounded-full p-1.5 hover:bg-neutral-100"
            onClick={onClose}
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

/* ============================== Page ===================================== */

function LinksDashboard() {
  const { pushToast } = useToast();

  // Tests / Questions master data
  const [tests, setTests] = useState([]);
  const [testsLoading, setTestsLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);

  // Selection
  const [testId, setTestId] = useState("");
  const selectedTest = useMemo(
    () => tests.find((t) => String(t.id) === String(testId)) || null,
    [tests, testId]
  );

  // Links for chosen test
  const [links, setLinks] = useState([]); // [{id, question_id, order}]
  const [linksLoading, setLinksLoading] = useState(false);

  // Search & selection for bulk add
  const [qSearch, setQSearch] = useState("");
  const qSearchDeb = useDebounced(qSearch, 250);
  const [bulkSelection, setBulkSelection] = useState(new Set());
  const [renderCount, setRenderCount] = useState(300); // progressive render for large lists

  // Paste IDs modal
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");

  // Single attach form
  const [singleAttachId, setSingleAttachId] = useState("");
  const [singleSubmitting, setSingleSubmitting] = useState(false);

  // Confirm remove
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const confirmActionRef = useRef(null);

  // Detail (optional)
  const [testDetail, setTestDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  /* ------------------------------ Loaders -------------------------------- */

  useEffect(() => {
    (async () => {
      try {
        setTestsLoading(true);
        const res = await apiFetch("/api/v1/assessments/tests/list");
        setTests(Array.isArray(res?.data) ? res.data : res || []);
      } catch (e) {
        pushToast({
          title: "Failed to load tests",
          desc: e.message,
          type: "error",
        });
      } finally {
        setTestsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setQuestionsLoading(true);
        const res = await apiFetch(
          "/api/v1/assessments/questions/list?with_options=false"
        );
        setQuestions(Array.isArray(res?.data) ? res.data : res || []);
      } catch (e) {
        pushToast({
          title: "Failed to load questions",
          desc: e.message,
          type: "error",
        });
      } finally {
        setQuestionsLoading(false);
      }
    })();
  }, []);

  // Load links + details when test changes
  useEffect(() => {
    if (!testId) {
      setLinks([]);
      setTestDetail(null);
      return;
    }
    setRenderCount(300);
    loadLinks(testId);
    loadTestDetail(testId);
  }, [testId]);

  async function loadLinks(tid) {
    setLinksLoading(true);
    try {
      const res = await apiFetch(
        `/api/v1/assessments/test-questions/list?test_id=${encodeURIComponent(
          tid
        )}`
      );
      const list = Array.isArray(res?.data) ? res.data : res || [];
      // Normalize orders (fallback to index+1)
      const norm = list
        .map((l, i) => ({
          id: l.id,
          test_id: l.test_id || tid,
          question_id: l.question_id ?? l.question?.id ?? l.qid,
          order: l.order ?? l.position ?? i + 1,
          question: l.question || null,
        }))
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      setLinks(norm);
    } catch (e) {
      pushToast({
        title: "Failed to load links",
        desc: e.message,
        type: "error",
      });
      setLinks([]);
    } finally {
      setLinksLoading(false);
    }
  }

  async function loadTestDetail(tid) {
    setDetailLoading(true);
    try {
      const res = await apiFetch(
        `/api/v1/assessments/tests/one/${encodeURIComponent(tid)}`
      );
      setTestDetail(res?.data || res || null);
    } catch (e) {
      setTestDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }

  /* --------------------------- Derived / Helpers ------------------------- */

  const questionMap = useMemo(() => {
    const map = new Map();
    for (const q of questions) map.set(q.id, q);
    if (testDetail?.questions?.length) {
      for (const q of testDetail.questions)
        map.set(q.id, { ...map.get(q.id), ...q });
    }
    return map;
  }, [questions, testDetail]);

  const filteredQuestions = useMemo(() => {
    const term = qSearchDeb.trim().toLowerCase();
    if (!term) return questions;
    return questions.filter((q) =>
      String(q.content || "")
        .toLowerCase()
        .includes(term)
    );
  }, [questions, qSearchDeb]);

  useEffect(() => {
    if (!pasteOpen) setPasteText("");
  }, [pasteOpen]);

  const alreadyLinkedSet = useMemo(
    () => new Set(links.map((l) => l.question_id)),
    [links]
  );

  function toggleBulk(id, checked) {
    setBulkSelection((prev) => {
      const set = new Set(prev);
      if (checked) set.add(id);
      else set.delete(id);
      return set;
    });
  }
  function selectDisplayed() {
    const ids = filteredQuestions.slice(0, renderCount).map((q) => q.id);
    setBulkSelection((prev) => new Set([...prev, ...ids]));
  }
  function selectAllFiltered() {
    const ids = filteredQuestions.map((q) => q.id);
    setBulkSelection(new Set(ids));
  }
  function clearSelection() {
    setBulkSelection(new Set());
  }

  function parseIdsFromText(text) {
    // Accept numbers separated by comma/space/newline or ranges like 100-250
    const parts = text.split(/[\s,]+/).filter(Boolean);
    const ids = [];
    for (const p of parts) {
      const m = p.match(/^(\d+)\s*-\s*(\d+)$/);
      if (m) {
        const a = Number(m[1]);
        const b = Number(m[2]);
        if (!Number.isNaN(a) && !Number.isNaN(b)) {
          const [start, end] = a <= b ? [a, b] : [b, a];
          for (let x = start; x <= end; x++) ids.push(x);
          continue;
        }
      }
      const n = Number(p);
      if (!Number.isNaN(n)) ids.push(n);
    }
    return Array.from(new Set(ids));
  }

  /* ------------------------------- Actions -------------------------------- */

  async function attachSingle() {
    if (!testId) {
      pushToast({ title: "Select a test first", type: "warning" });
      return;
    }
    const qid = Number(singleAttachId);
    if (!qid) {
      pushToast({ title: "Select a question to attach", type: "warning" });
      return;
    }
    if (alreadyLinkedSet.has(qid)) {
      pushToast({ title: `Question #${qid} already linked`, type: "warning" });
      return;
    }

    setSingleSubmitting(true);
    try {
      const nextOrder = links.length
        ? Math.max(...links.map((l) => l.order || 0)) + 1
        : 1;
      await apiFetch("/api/v1/assessments/test-questions/add", {
        method: "POST",
        json: { test_id: Number(testId), question_id: qid, order: nextOrder },
      });
      pushToast({ title: "Attached", type: "success" });
      setSingleAttachId("");
      await loadLinks(testId);
      await loadTestDetail(testId);
    } catch (e) {
      pushToast({ title: "Attach failed", desc: e.message, type: "error" });
    } finally {
      setSingleSubmitting(false);
    }
  }

  async function bulkAdd(from = "selection") {
    if (!testId) {
      pushToast({ title: "Select a test first", type: "warning" });
      return;
    }
    let ids = [];
    if (from === "selection") {
      ids = Array.from(bulkSelection);
    } else if (from === "paste") {
      ids = parseIdsFromText(pasteText);
    }
    if (!ids.length) {
      pushToast({ title: "No question IDs to add", type: "warning" });
      return;
    }

    // Avoid duplicates (already linked)
    const unique = ids.filter((id) => !alreadyLinkedSet.has(id));
    if (!unique.length) {
      pushToast({ title: "All selected IDs are already linked", type: "info" });
      return;
    }

    try {
      await apiFetch("/api/v1/assessments/test-questions/bulk-add", {
        method: "POST",
        json: { test_id: Number(testId), question_ids: unique },
      });
      pushToast({
        title: `Bulk added ${unique.length}`,
        desc:
          unique.length !== ids.length
            ? `${ids.length - unique.length} skipped (already linked)`
            : undefined,
        type: "success",
      });
      setBulkSelection(new Set());
      setPasteOpen(false);
      setPasteText("");
      await loadLinks(testId);
      await loadTestDetail(testId);
    } catch (e) {
      pushToast({ title: "Bulk add failed", desc: e.message, type: "error" });
    }
  }

  async function removeLink(link) {
    setConfirmText(
      `Remove link #${link.id} (Q#${link.question_id}) from test?`
    );
    confirmActionRef.current = async () => {
      const backup = links;
      setLinks((arr) => arr.filter((l) => l.id !== link.id));
      try {
        await apiFetch(
          `/api/v1/assessments/test-questions/remove/${encodeURIComponent(
            link.id
          )}`,
          { method: "DELETE" }
        );
        pushToast({ title: "Link removed", type: "success" });
        await loadTestDetail(testId);
      } catch (e) {
        pushToast({ title: "Remove failed", desc: e.message, type: "error" });
        setLinks(backup);
      }
    };
    setConfirmOpen(true);
  }

  function swapInArray(arr, i, j) {
    const copy = [...arr];
    const tmp = copy[i];
    copy[i] = copy[j];
    copy[j] = tmp;
    return copy;
  }

  async function moveLink(linkId, dir) {
    const idx = links.findIndex((l) => l.id === linkId);
    if (idx < 0) return;
    const targetIdx = dir === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= links.length) return;

    // Compute new orders by swapping with neighbor
    const a = links[idx];
    const b = links[targetIdx];
    const newAOrder = b.order;
    const newBOrder = a.order;

    // optimistic reorder in UI
    const reordered = swapInArray(links, idx, targetIdx).map((l) =>
      l.id === a.id
        ? { ...l, order: newAOrder }
        : l.id === b.id
        ? { ...l, order: newBOrder }
        : l
    );
    setLinks(reordered);

    try {
      await apiFetch(
        `/api/v1/assessments/test-questions/edit/${encodeURIComponent(a.id)}`,
        { method: "PUT", json: { order: newAOrder } }
      );
      await apiFetch(
        `/api/v1/assessments/test-questions/edit/${encodeURIComponent(b.id)}`,
        { method: "PUT", json: { order: newBOrder } }
      );
    } catch (e) {
      pushToast({ title: "Reorder failed", desc: e.message, type: "error" });
      // reload from server
      await loadLinks(testId);
    }
  }

  /* -------------------------------- Render -------------------------------- */

  return (
    <LayoutDashboard>
      <ToastProvider>
        <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Links: Questions ↔ Test
              </h1>
              <p className="text-sm text-neutral-600">
                Attach thousands of questions efficiently. Bulk select, paste
                IDs, reorder and remove.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="subtle"
                onClick={() => {
                  if (testId) loadLinks(testId);
                  loadTestDetail(testId);
                }}
              >
                ↻ Refresh
              </Button>
            </div>
          </div>

          {/* Test selector */}
          <section className="mb-6 grid gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="grid gap-3 md:grid-cols-2">
              <Select
                id="test-select"
                label="Select Test"
                value={testId}
                onChange={(e) => setTestId(e.target.value)}
              >
                <option value="" disabled>
                  {testsLoading ? "Loading tests…" : "Choose a test"}
                </option>
                {tests.map((t) => (
                  <option key={t.id} value={t.id}>
                    #{t.id} — {t.title}
                  </option>
                ))}
              </Select>

              {selectedTest && (
                <div className="grid gap-1">
                  <div className="text-sm">
                    <span className="font-medium">Title:</span>{" "}
                    {selectedTest.title}
                  </div>
                  <div className="text-xs text-neutral-600">
                    Time limit: {formatSecs(selectedTest.time_limit_sec)}{" "}
                    {selectedTest.is_published || selectedTest.published ? (
                      <Badge tone="green" className="ml-2">
                        Published
                      </Badge>
                    ) : (
                      <Badge tone="amber" className="ml-2">
                        Draft
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick attach single */}
            {selectedTest && (
              <div className="grid gap-3 rounded-xl border border-neutral-200 p-3">
                <div className="text-sm font-semibold">
                  Quick attach (single)
                </div>
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <Select
                    id="single-q"
                    label="Question"
                    value={singleAttachId}
                    onChange={(e) => setSingleAttachId(e.target.value)}
                  >
                    <option value="">Choose a question</option>
                    {questions.slice(0, 200).map((q) => (
                      <option
                        key={q.id}
                        value={q.id}
                        disabled={alreadyLinkedSet.has(q.id)}
                      >
                        #{q.id} — {truncateMid(q.content || "", 80)}
                      </option>
                    ))}
                  </Select>
                  <div className="flex items-end">
                    <Button
                      onClick={attachSingle}
                      disabled={singleSubmitting || !singleAttachId}
                    >
                      {singleSubmitting && <Spinner />}
                      <span>Attach</span>
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-neutral-500">
                  Tip: Use the bulk panel below to select from all{" "}
                  {questions.length} questions with search, or paste IDs.
                </p>
              </div>
            )}
          </section>

          {/* Main content area */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Linked list */}
            <section className="lg:col-span-6 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold">Linked Questions</h2>
                {linksLoading && <Spinner />}
              </div>

              {!testId ? (
                <EmptyState
                  title="No test selected"
                  desc="Choose a test to see its linked questions."
                />
              ) : linksLoading ? (
                <div className="flex items-center gap-3 p-6 text-sm text-neutral-600">
                  <Spinner /> Loading links…
                </div>
              ) : !links.length ? (
                <EmptyState
                  title="No links yet"
                  desc="Attach questions using quick attach or the bulk panel."
                />
              ) : (
                <div className="max-h-[60vh] overflow-y-auto rounded-xl border border-neutral-200">
                  <ul className="divide-y divide-gray-100">
                    {links
                      .slice()
                      .sort((a, b) => (a.order || 0) - (b.order || 0))
                      .map((l, idx) => {
                        const q = questionMap.get(l.question_id);
                        return (
                          <li key={l.id} className="grid gap-2 p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge tone="blue">Link #{l.id}</Badge>
                                  <Badge tone="gray">Q#{l.question_id}</Badge>
                                  <Badge tone="gray">Order {l.order}</Badge>
                                </div>
                                <div className="mt-1 text-sm">
                                  {q ? (
                                    <div className="text-neutral-800">
                                      {truncateMid(q.content || "", 220)}
                                    </div>
                                  ) : (
                                    <span className="text-neutral-500">
                                      Question details unavailable
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex shrink-0 items-center gap-1">
                                <Button
                                  variant="subtle"
                                  size="sm"
                                  onClick={() => moveLink(l.id, "up")}
                                  disabled={idx === 0}
                                  aria-label="Move up"
                                  title="Move up"
                                >
                                  ↑
                                </Button>
                                <Button
                                  variant="subtle"
                                  size="sm"
                                  onClick={() => moveLink(l.id, "down")}
                                  disabled={idx === links.length - 1}
                                  aria-label="Move down"
                                  title="Move down"
                                >
                                  ↓
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => removeLink(l)}
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              )}
            </section>

            {/* Bulk panel */}
            <section className="lg:col-span-6 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold">Bulk Attach</h2>
                <div className="text-xs text-neutral-600">
                  {bulkSelection.size} selected • {filteredQuestions.length}{" "}
                  matching
                </div>
              </div>

              {!testId ? (
                <EmptyState
                  title="Select a test first"
                  desc="Pick a test above to bulk-attach questions to it."
                />
              ) : (
                <>
                  {/* Toolbar */}
                  <div className="mb-3 grid gap-3 md:grid-cols-2">
                    <Input
                      id="q-search"
                      label="Search questions"
                      placeholder="Type to filter by content…"
                      value={qSearch}
                      onChange={(e) => setQSearch(e.target.value)}
                    />
                    <div className="grid gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          variant="subtle"
                          size="sm"
                          onClick={selectDisplayed}
                        >
                          Select displayed
                        </Button>
                        <Button
                          variant="subtle"
                          size="sm"
                          onClick={selectAllFiltered}
                        >
                          Select all filtered
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearSelection}
                        >
                          Clear selection
                        </Button>
                        <Button
                          variant={pasteOpen ? "subtle" : "ghost"}
                          size="sm"
                          onClick={() => setPasteOpen((v) => !v)}
                          aria-expanded={pasteOpen}
                          aria-controls="paste-panel"
                        >
                          Paste IDs
                        </Button>
                      </div>
                      <div className="text-xs text-neutral-500">
                        Large lists (1000–2000): list is virtualized
                        progressively — scroll to load more.
                      </div>
                    </div>
                  </div>

                  {/* Paste IDs panel */}
                  {pasteOpen && (
                    <div
                      id="paste-panel"
                      className="mb-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3"
                    >
                      <div className="grid gap-2">
                        <label
                          htmlFor="bulk-paste"
                          className="text-sm font-medium text-neutral-700"
                        >
                          Paste IDs (comma / space / newline, or ranges like
                          100-250)
                        </label>
                        <textarea
                          id="bulk-paste"
                          rows={3}
                          className="w-full rounded-lg border border-neutral-300 px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-300"
                          placeholder="e.g. 12, 15, 16  100-120"
                          value={pasteText}
                          onChange={(e) => setPasteText(e.target.value)}
                        />
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPasteOpen(false)}
                          >
                            Close
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              const ids = parseIdsFromText(pasteText);
                              if (!ids.length) {
                                pushToast({
                                  title: "No IDs detected",
                                  type: "warning",
                                });
                                return;
                              }
                              // show immediate bulk-add with pasted IDs
                              bulkAdd("paste");
                            }}
                          >
                            Add IDs
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Table of questions to select from */}
                  <div
                    className="max-h-[55vh] overflow-y-auto rounded-xl border border-neutral-200"
                    onScroll={(e) => {
                      const el = e.currentTarget;
                      if (
                        el.scrollTop + el.clientHeight >=
                        el.scrollHeight - 120
                      ) {
                        setRenderCount((n) =>
                          Math.min(filteredQuestions.length, n + 300)
                        );
                      }
                    }}
                  >
                    <table className="w-full table-fixed border-collapse text-sm">
                      <thead className="sticky top-0 z-10 bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-600">
                        <tr>
                          <th className="w-12 px-3 py-2">
                            <input
                              aria-label="Toggle all displayed"
                              type="checkbox"
                              checked={
                                filteredQuestions.slice(0, renderCount).length >
                                  0 &&
                                filteredQuestions
                                  .slice(0, renderCount)
                                  .every((q) => bulkSelection.has(q.id))
                              }
                              onChange={(e) => {
                                const displayed = filteredQuestions
                                  .slice(0, renderCount)
                                  .map((q) => q.id);
                                if (e.target.checked) {
                                  setBulkSelection(
                                    (prev) => new Set([...prev, ...displayed])
                                  );
                                } else {
                                  setBulkSelection((prev) => {
                                    const set = new Set(prev);
                                    displayed.forEach((id) => set.delete(id));
                                    return set;
                                  });
                                }
                              }}
                            />
                          </th>
                          <th className="w-20 px-3 py-2">ID</th>
                          <th className="px-3 py-2">Content</th>
                          <th className="w-28 px-3 py-2">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {questionsLoading ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-3 py-6 text-center text-neutral-600"
                            >
                              <Spinner /> Loading questions…
                            </td>
                          </tr>
                        ) : filteredQuestions.length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-3 py-6 text-center text-neutral-500"
                            >
                              No matches
                            </td>
                          </tr>
                        ) : (
                          filteredQuestions.slice(0, renderCount).map((q) => {
                            const checked = bulkSelection.has(q.id);
                            const disabled = alreadyLinkedSet.has(q.id);
                            return (
                              <tr
                                key={q.id}
                                className="border-t border-neutral-200"
                              >
                                <td className="px-3 py-2 align-top">
                                  <input
                                    type="checkbox"
                                    aria-label={`Select question ${q.id}`}
                                    checked={checked}
                                    disabled={disabled}
                                    onChange={(e) =>
                                      toggleBulk(q.id, e.target.checked)
                                    }
                                  />
                                </td>
                                <td className="px-3 py-2 align-top font-mono text-xs text-neutral-500">
                                  #{q.id}
                                </td>
                                <td className="px-3 py-2 align-top">
                                  <div className="truncate font-medium text-neutral-800">
                                    {truncateMid(q.content || "", 220)}
                                  </div>
                                </td>
                                <td className="px-3 py-2 align-top">
                                  {disabled ? (
                                    <Badge tone="blue">Linked</Badge>
                                  ) : (
                                    <Badge tone="gray">Available</Badge>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {renderCount < filteredQuestions.length && (
                    <div className="mt-2 text-center text-xs text-neutral-500">
                      Showing {renderCount} of {filteredQuestions.length} —
                      scroll for more
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs text-neutral-600">
                      {bulkSelection.size} selected
                      {bulkSelection.size > 0 && (
                        <>
                          {" "}
                          • ready to add to <strong>Test #{testId}</strong>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="success"
                        onClick={() => bulkAdd("selection")}
                        disabled={!bulkSelection.size}
                      >
                        Bulk Attach Selected
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </section>
          </div>

          {/* Optional detail card: show count & meta */}
          {testId && (
            <section className="mt-6 grid gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="blue">Test #{testId}</Badge>
                <Badge tone="gray">{links.length} linked</Badge>
                {detailLoading ? (
                  <span className="inline-flex items-center gap-2 text-xs text-neutral-600">
                    <Spinner /> loading details…
                  </span>
                ) : testDetail?.description ? (
                  <span className="text-xs text-neutral-600">
                    {truncateMid(testDetail.description, 200)}
                  </span>
                ) : null}
              </div>
            </section>
          )}

          {/* Confirm Modal */}
          <Modal
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            title="Please Confirm"
            footer={
              <>
                <Button variant="ghost" onClick={() => setConfirmOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    const fn = confirmActionRef.current;
                    setConfirmOpen(false);
                    if (fn) fn();
                  }}
                >
                  Confirm
                </Button>
              </>
            }
          >
            <p className="text-sm text-neutral-700">{confirmText}</p>
          </Modal>
        </main>
      </ToastProvider>
    </LayoutDashboard>
  );
}

export { LinksDashboard };
export default LinksDashboard;
