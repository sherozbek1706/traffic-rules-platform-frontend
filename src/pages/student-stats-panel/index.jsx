// src/pages/admin/StudentStatsPanel.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { adminGetRequest } from "../../request";

export const StudentStatsPanel = ({ open, onClose, student }) => {
  const [data, setData] = useState(null);
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState("");

  // per-test accordion holati
  const [expandedTests, setExpandedTests] = useState(() => new Set());

  useEffect(() => {
    if (!open || !student?.id) return;

    const run = async () => {
      try {
        setPending(true);
        setErr("");
        let res;
        if (typeof adminGetRequest === "function") {
          res = await adminGetRequest(`/students/${student.id}/stats`);
        }
        // kelgan struktura: { data: { student, totals, per_test, attempts } }
        setData(res?.data || res);
      } catch (e) {
        setErr(e?.message || "Failed to load stats");
      } finally {
        setPending(false);
      }
    };

    run();
  }, [open, student?.id]);

  const totals = data?.totals || {};
  const perTest = useMemo(() => data?.per_test || [], [data]);
  const attempts = useMemo(() => data?.attempts || [], [data]);

  const toggleTest = (testId) => {
    setExpandedTests((prev) => {
      const next = new Set(prev);
      if (next.has(testId)) next.delete(testId);
      else next.add(testId);
      return next;
    });
  };

  return (
    <div
      className={[
        "fixed inset-0 z-[60] transition",
        open ? "pointer-events-auto" : "pointer-events-none",
      ].join(" ")}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        className={[
          "absolute inset-0 bg-black/30 transition-opacity",
          open ? "opacity-100" : "opacity-0",
        ].join(" ")}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={[
          "absolute right-0 top-0 h-full w-full max-w-5xl bg-white shadow-xl ring-1 ring-slate-200",
          "transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
          "flex flex-col",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-neutral-200">
          <div className="min-w-0">
            <div className="text-xs text-slate-500 truncate">
              Student #{student?.id}
            </div>
            <h2 className="text-lg font-semibold text-slate-900 truncate">
              {student?.first_name} {student?.last_name}
            </h2>
            <div className="text-xs text-slate-500 truncate">
              @{student?.username}{" "}
              {student?.group_name ? `• ${student.group_name}` : ""}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Loading / Error */}
          {pending && (
            <div className="space-y-3">
              <div className="h-8 w-40 bg-slate-200 rounded animate-pulse" />
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-xl ring-1 ring-slate-200 p-4">
                    <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
                    <div className="mt-2 h-6 w-16 bg-slate-100 rounded animate-pulse" />
                  </div>
                ))}
              </div>
              <div className="h-10 bg-slate-100 rounded animate-pulse" />
              <div className="h-40 bg-slate-100 rounded animate-pulse" />
            </div>
          )}

          {err && !pending && (
            <div className="rounded-xl bg-red-50 text-red-700 ring-1 ring-red-200 px-4 py-3">
              {err}
            </div>
          )}

          {!pending && !err && data && (
            <>
              {/* KPIs */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-3">
                  Overview
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <KPI label="Attempts" value={totals.attempts_count ?? 0} />
                  <KPI
                    label="Tests taken"
                    value={totals.tests_taken_count ?? 0}
                  />
                  <KPI
                    label="Avg score"
                    value={
                      totals.avg_score != null
                        ? Number(totals.avg_score).toFixed(1)
                        : "0.0"
                    }
                  />
                  <KPI
                    label="Last attempt"
                    value={
                      totals.last_attempt_at
                        ? new Date(totals.last_attempt_at).toLocaleString()
                        : "—"
                    }
                    mono={false}
                  />
                </div>
              </div>

              {/* Per-test table with expandable rows */}
              <div className="rounded-2xl bg-white ring-1 ring-slate-200 overflow-hidden">
                <div className="px-4 sm:px-5 py-3 border-b  border-neutral-200">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Per test summary
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium">
                          Test
                        </th>
                        <th className="px-4 py-2 text-left font-medium">
                          Attempts
                        </th>
                        <th className="px-4 py-2 text-left font-medium">Avg</th>
                        <th className="px-4 py-2 text-left font-medium">
                          Best
                        </th>
                        <th className="px-4 py-2 text-left font-medium">
                          Last score
                        </th>
                        <th className="px-4 py-2 text-left font-medium">
                          Last attempt
                        </th>
                        <th className="px-4 py-2 text-left font-medium w-24">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {perTest.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-4 py-6 text-center text-slate-500"
                          >
                            Hali attempt yo‘q
                          </td>
                        </tr>
                      ) : (
                        perTest.map((t) => {
                          const isOpen = expandedTests.has(t.test_id);
                          return (
                            <>
                              <tr
                                key={t.test_id}
                                className="hover:bg-slate-50/40"
                              >
                                <td className="px-4 py-2 font-medium text-slate-900">
                                  {t.test_title || `#${t.test_id}`}
                                </td>
                                <td className="px-4 py-2">
                                  {t.attempts_count ?? 0}
                                </td>
                                <td className="px-4 py-2">
                                  {Number(t.avg_score ?? 0).toFixed(1)}
                                </td>
                                <td className="px-4 py-2">
                                  {Number(t.best_score ?? 0).toFixed(1)}
                                </td>
                                <td className="px-4 py-2">
                                  {t.last_score != null
                                    ? Number(t.last_score).toFixed(1)
                                    : "—"}
                                </td>
                                <td className="px-4 py-2 text-slate-600">
                                  {t.last_attempt_at
                                    ? new Date(
                                        t.last_attempt_at
                                      ).toLocaleString()
                                    : "—"}
                                </td>
                                <td className="px-4 py-2">
                                  <button
                                    onClick={() => toggleTest(t.test_id)}
                                    className="inline-flex items-center gap-1 rounded-lg ring-1 ring-slate-200 px-2.5 py-1 text-xs hover:bg-slate-50"
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
                                    {isOpen ? "Hide" : "View"}
                                  </button>
                                </td>
                              </tr>

                              {isOpen &&
                                Array.isArray(t.attempts) &&
                                t.attempts.length > 0 && (
                                  <tr className="bg-slate-50/30">
                                    <td colSpan={7} className="px-4 py-2">
                                      <div className="overflow-x-auto rounded-xl ring-1 ring-slate-200 bg-white">
                                        <table className="min-w-full text-xs">
                                          <thead className="bg-slate-50 text-slate-600">
                                            <tr>
                                              <th className="px-3 py-2 text-left font-medium w-16">
                                                #
                                              </th>
                                              <th className="px-3 py-2 text-left font-medium">
                                                Start
                                              </th>
                                              <th className="px-3 py-2 text-left font-medium">
                                                Score
                                              </th>
                                              <th className="px-3 py-2 text-left font-medium">
                                                Correct / Answered
                                              </th>
                                              <th className="px-3 py-2 text-left font-medium">
                                                Status
                                              </th>
                                              {/* <th className="px-3 py-2 text-left font-medium w-28">
                                                Open
                                              </th> */}
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-100">
                                            {t.attempts
                                              .slice() // nusxa
                                              .sort((a, b) => b.id - a.id) // eng so‘nggi birinchi
                                              .map((a, i) => (
                                                <tr
                                                  key={a.id}
                                                  className="hover:bg-slate-50"
                                                >
                                                  <td className="px-3 py-2 text-slate-500">
                                                    {i + 1}
                                                  </td>
                                                  <td className="px-3 py-2">
                                                    {a.start_time
                                                      ? new Date(
                                                          a.start_time
                                                        ).toLocaleString()
                                                      : "—"}
                                                  </td>
                                                  <td className="px-3 py-2">
                                                    <ScoreBadge
                                                      score={a.score}
                                                    />
                                                  </td>
                                                  <td className="px-3 py-2 text-slate-700">
                                                    {a.correct_count}/
                                                    {a.answered_count}
                                                  </td>
                                                  <td className="px-3 py-2">
                                                    <span
                                                      className={[
                                                        "rounded px-2 py-0.5 text-[11px] font-medium border",
                                                        a.is_finished
                                                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                          : "bg-amber-50 text-amber-700 border-amber-200",
                                                      ].join(" ")}
                                                    >
                                                      {a.is_finished
                                                        ? "Finished"
                                                        : "In progress"}
                                                    </span>
                                                  </td>
                                                  {/* <td className="px-3 py-2">
                                                    {a.is_finished ? (
                                                      <Link
                                                        to={`/attempts/${a.id}/result`}
                                                        className="inline-flex items-center rounded-lg bg-slate-900 text-white px-2.5 py-1 hover:bg-black"
                                                      >
                                                        Result
                                                      </Link>
                                                    ) : (
                                                      <Link
                                                        to={`/attempts/${a.id}`}
                                                        className="inline-flex items-center rounded-lg ring-1 ring-slate-200 px-2.5 py-1 text-slate-700 hover:bg-slate-50"
                                                      >
                                                        Open
                                                      </Link>
                                                    )}
                                                  </td> */}
                                                </tr>
                                              ))}
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
              </div>

              {/* Recent attempts (flatten) */}
              <div className="rounded-2xl bg-white ring-1 ring-slate-200 overflow-hidden">
                <div className="px-4 sm:px-5 py-3 border-b  border-neutral-200">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Recent attempts
                  </h3>
                </div>
                {attempts.length === 0 ? (
                  <div className="p-5 text-slate-600">Hali attempt yo‘q</div>
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {attempts
                      .slice()
                      .sort((a, b) =>
                        (b.start_time || "").localeCompare(a.start_time || "")
                      )
                      .slice(0, 15)
                      .map((a) => (
                        <li key={a.id} className="p-4 sm:p-5">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-slate-900 truncate">
                                {a.test_title || `Test #${a.test_id}`}
                              </div>
                              <div className="text-xs text-slate-500">
                                {a.start_time
                                  ? new Date(a.start_time).toLocaleString()
                                  : "—"}{" "}
                                {a.duration_sec != null
                                  ? `• ${a.duration_sec}s`
                                  : ""}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <ScoreBadge score={a.score} />
                              <span className="text-xs text-slate-500">
                                {a.correct_count}/{a.answered_count} correct
                              </span>
                              {/* {a.is_finished ? (
                                <Link
                                  to={`/attempts/${a.id}/result`}
                                  className="rounded-lg bg-slate-900 text-white px-2.5 py-1 text-xs hover:bg-black"
                                >
                                  Result
                                </Link>
                              ) : (
                                <Link
                                  to={`/attempts/${a.id}`}
                                  className="rounded-lg ring-1 ring-slate-200 px-2.5 py-1 text-xs hover:bg-slate-50"
                                >
                                  Open
                                </Link>
                              )} */}
                            </div>
                          </div>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  );
};

const KPI = ({ label, value, mono = true }) => (
  <div className="rounded-xl bg-white ring-1 ring-slate-200 p-4">
    <div className="text-[11px] uppercase tracking-wide text-slate-500">
      {label}
    </div>
    <div
      className={[
        "mt-1 text-2xl font-semibold",
        mono ? "tabular-nums" : "",
      ].join(" ")}
    >
      {value}
    </div>
  </div>
);

const ScoreBadge = ({ score }) => {
  const val =
    score == null ? null : Number.isFinite(+score) ? Number(score) : null;
  const tone =
    val == null
      ? "bg-slate-100 text-slate-700 border border-slate-200"
      : val >= 80
      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
      : val >= 50
      ? "bg-amber-100 text-amber-800 border border-amber-200"
      : "bg-rose-100 text-rose-800 border border-rose-200";
  return (
    <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${tone}`}>
      {val == null ? "—" : `${val.toFixed(1)}`}
    </span>
  );
};
