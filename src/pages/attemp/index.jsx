import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  clientGetRequest,
  clientPostRequest,
  adminGetRequest,
} from "../../request";

/* ------------------------------- Utils ------------------------------- */
const leftSeconds = (endIso) => {
  if (!endIso) return 0;
  const now = Date.now();
  const end = new Date(endIso).getTime();
  return Math.max(0, Math.floor((end - now) / 1000));
};

// === Exam mode config ===
const MAX_VIOLATIONS = 7; // necha marta chalg‘ish mumkin
const USE_FULLSCREEN = true;

// Harf label (A, B, C, ...)
const letter = (i) => String.fromCharCode(65 + i);

// Fullscreen helpers
const enterFullscreen = async () => {
  try {
    const el = document.documentElement;
    if (el.requestFullscreen) await el.requestFullscreen();
    else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
    else if (el.msRequestFullscreen) await el.msRequestFullscreen();
  } catch {}
};
const exitFullscreen = async () => {
  try {
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      if (document.exitFullscreen) await document.exitFullscreen();
      else if (document.webkitExitFullscreen)
        await document.webkitExitFullscreen();
    }
  } catch {}
};

function computeEndISO(payload) {
  // Prefer explicit end_time if backend provides it
  const end = payload?.end_time || payload?.attempt?.end_time;
  if (end) return end;

  // Otherwise: created_at + time_limit_sec_snapshot
  const createdAt = payload?.created_at || payload?.attempt?.created_at;
  const secs =
    payload?.time_limit_sec_snapshot ??
    payload?.attempt?.time_limit_sec_snapshot ??
    payload?.test?.time_limit_sec ??
    null;
  if (!createdAt || !secs) return null;
  const d = new Date(createdAt);
  d.setSeconds(d.getSeconds() + Number(secs || 0));
  return d.toISOString();
}

function coerceQuestions(raw) {
  const arr = Array.isArray(raw) ? raw.slice() : [];
  // Normalize: prefer `position` as order, fallback to `order`
  arr.forEach((q) => {
    if (q && q.position != null && q.order == null) q.order = q.position;
  });
  arr.sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
  return arr;
}

function extractAnswersFromQuestions(questions) {
  // Convert per-question {answer:{selected_option_id}} into [{question_id, option_id}]
  const out = [];
  (questions || []).forEach((q) => {
    const optId = q?.answer?.selected_option_id ?? q?.answer?.option_id ?? null;
    if (optId != null) out.push({ question_id: q.id, option_id: optId });
  });
  return out;
}

/* ------------------------------ Component ------------------------------ */
export const Attempt = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [data, setData] = useState(null); // holds { attempt-like fields, questions: [] }
  const [answers, setAnswers] = useState([]); // [{question_id, option_id}]
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [left, setLeft] = useState(0);
  const [idx, setIdx] = useState(0);
  const [busyAnswer, setBusyAnswer] = useState(false);
  const [busyFinish, setBusyFinish] = useState(false);
  const lastAnswerKeyRef = useRef(null); // double-click guard

  const [isFs, setIsFs] = useState(false);
  const [violations, setViolations] = useState(0);
  const [showWarn, setShowWarn] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState(null); // image preview

  // Modal holatlari
  const [showPolicy, setShowPolicy] = useState(false); // imtihon qoidalari / ogohlantirish modali
  const [modalMode, setModalMode] = useState("policy"); // "policy" | "warning"

  // Detect admin context
  const fromState = location.state?.from || "";
  const isAdminQuery =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("admin") === "1";
  const prevPath =
    (typeof window !== "undefined" && sessionStorage.getItem("prevPath")) || "";
  const cameFromAdmin =
    isAdminQuery ||
    (typeof fromState === "string" &&
      fromState.startsWith("/dashboard-panel-admin")) ||
    (typeof prevPath === "string" &&
      prevPath.startsWith("/dashboard-panel-admin"));
  const getFn = cameFromAdmin ? adminGetRequest : clientGetRequest;

  const isFinished = (d) => d?.is_finished ?? d?.attempt?.is_finished ?? false;

  /* ------------------------------- Loader ------------------------------- */
  async function load() {
    setLoading(true);
    setErr("");
    try {
      // 1) Attempt payload
      const res = await getFn(
        `/attempts/attempts/${encodeURIComponent(attemptId)}`
      );
      const raw = res?.data?.data || res?.data || res || null;
      if (!raw) throw new Error("Attempt topilmadi");

      // Ensure we have questions
      let questions = coerceQuestions(
        raw.questions || raw?.attempt?.questions || []
      );

      // If for some reason questions are empty, try to fetch the test to build fallback
      let testId =
        raw?.test_id ?? raw?.attempt?.test_id ?? raw?.test?.id ?? null;
      if ((!questions || !questions.length) && testId) {
        const tRes = await getFn(
          `/assessments/tests/one/${encodeURIComponent(testId)}`
        );
        const testObj = tRes?.data?.data || tRes?.data || tRes;
        const testQuestions = coerceQuestions(testObj?.questions || []);
        questions = testQuestions;
        // Keep in data for title display
        raw.test = raw.test || testObj;
      }

      const derivedAnswers = extractAnswersFromQuestions(questions);

      // Compute end time
      const endIso = computeEndISO(raw);
      const ls = leftSeconds(endIso);

      // Normalize data shape: flatten attempt-like fields on root
      const normalized = {
        id: raw?.id ?? raw?.attempt?.id ?? Number(attemptId),
        test_id: testId ?? null,
        is_finished: raw?.is_finished ?? raw?.attempt?.is_finished ?? false,
        created_at: raw?.created_at ?? raw?.attempt?.created_at ?? null,
        time_limit_sec_snapshot:
          raw?.time_limit_sec_snapshot ??
          raw?.attempt?.time_limit_sec_snapshot ??
          raw?.test?.time_limit_sec ??
          null,
        end_time: endIso,
        test: raw?.test || null,
        questions,
      };

      setData(normalized);
      setAnswers(derivedAnswers);
      setLeft(ls);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, [attemptId, cameFromAdmin]);

  // Timer tick
  useEffect(() => {
    if (!data?.end_time || isFinished(data)) return;
    const t = setInterval(() => setLeft(leftSeconds(data.end_time)), 1000);
    return () => clearInterval(t);
  }, [data]);

  // Auto-finish on timeout
  useEffect(() => {
    if (left === 0 && data && !isFinished(data)) handleFinish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  // Fullscreenga kirish (faqat tugallanmagan bo‘lsa)
  useEffect(() => {
    if (!data || isFinished(data)) return;
    if (USE_FULLSCREEN && !document.fullscreenElement) {
      enterFullscreen();
    }
  }, [data]);

  // Fullscreen status kuzatuvi
  useEffect(() => {
    const onFsChange = () => {
      const active = !!(
        document.fullscreenElement || document.webkitFullscreenElement
      );
      setIsFs(active);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    document.addEventListener("webkitfullscreenchange", onFsChange);
    onFsChange();
    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      document.removeEventListener("webkitfullscreenchange", onFsChange);
    };
  }, []);

  // Chalg‘ish detektori: tab hidden/blur bo‘lsa sanaymiz
  useEffect(() => {
    if (!data || isFinished(data)) return;

    // const bump = () => {
    //   setViolations((v) => {
    //     const nv = v + 1;
    //     setShowWarn(true);
    //     // limitga yetsa — finish
    //     if (nv >= MAX_VIOLATIONS) {
    //       // yakunlashni bir martalik qilib yuboramiz
    //       (async () => {
    //         try {
    //           await clientPostRequest(
    //             `/attempts/attempts/${encodeURIComponent(attemptId)}/finish`,
    //             {}
    //           );
    //           navigate(`/attempts/${attemptId}/result`, { replace: true });
    //         } catch (e) {
    //           console.error(e);
    //         }
    //       })();
    //     }
    //     return nv;
    //   });
    // };

    const bump = () => {
      setViolations((v) => {
        const nv = v + 1;

        // ⚠️ OG'OHLANTIRISH MODALINI OCHAMIZ
        setModalMode("warning");
        setShowPolicy(true);

        // limitga yetsa — finish (mavjud kod)
        if (nv >= MAX_VIOLATIONS) {
          (async () => {
            try {
              await clientPostRequest(
                `/attempts/attempts/${encodeURIComponent(attemptId)}/finish`,
                {}
              );
              navigate(`/attempts/${attemptId}/result`, { replace: true });
            } catch (e) {
              console.error(e);
            }
          })();
        }
        return nv;
      });
    };

    const onVis = () => {
      if (document.visibilityState === "hidden") bump();
    };
    const onBlur = () => bump();

    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("blur", onBlur);

    return () => {
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("blur", onBlur);
    };
  }, [data, attemptId, navigate]);

  // Test tayyor bo‘lganda (unfinished) — qoidalar modalini ochamiz
  useEffect(() => {
    if (!data) return;
    if (!isFinished(data)) {
      setModalMode("policy");
      setShowPolicy(true);
    }
  }, [data]);

  const questions = useMemo(() => data?.questions || [], [data]);
  const total = questions.length;

  const answeredCount = useMemo(
    () =>
      answers.filter((a) => a.option_id != null && a.question_id != null)
        .length,
    [answers]
  );
  const progressPct = total ? Math.round((answeredCount / total) * 100) : 0;
  const current = questions[idx];

  const selectedOptionId = useMemo(() => {
    if (!current) return null;
    const found = answers.find((a) => a.question_id === current.id);
    return found?.option_id ?? null;
  }, [answers, current]);

  // Jump to first unanswered when data changes
  useEffect(() => {
    if (!questions.length) return;
    const firstUnanswered = questions.findIndex(
      (q) => !answers.some((a) => a.question_id === q.id && a.option_id != null)
    );
    if (firstUnanswered >= 0) setIdx(firstUnanswered);
  }, [questions, answers]);

  const fmt = (s) => {
    const m = Math.floor((s || 0) / 60);
    const sec = (s || 0) % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const nextUnansweredIndexWith = (answersList, startIdx) => {
    if (!questions.length) return -1;
    for (let i = startIdx + 1; i < questions.length; i++) {
      const qId = questions[i].id;
      const chosen = answersList.some(
        (a) => a.question_id === qId && a.option_id != null
      );
      if (!chosen) return i;
    }
    for (let i = 0; i <= startIdx; i++) {
      const qId = questions[i].id;
      const chosen = answersList.some(
        (a) => a.question_id === qId && a.option_id != null
      );
      if (!chosen) return i;
    }
    return -1;
  };

  async function handleSelect(questionId, optionId) {
    if (busyAnswer || isFinished(data)) return;

    // If already answered — lock (frontend policy)
    const already = answers.some(
      (a) => a.question_id === questionId && a.option_id != null
    );
    if (already) return;

    // Double-click guard
    const key = `${attemptId}:${questionId}:${optionId}`;
    if (lastAnswerKeyRef.current === key) return;
    lastAnswerKeyRef.current = key;

    try {
      setBusyAnswer(true);
      await clientPostRequest(
        `/attempts/attempts/${encodeURIComponent(attemptId)}/answer`,
        { question_id: questionId, option_id: optionId }
      );

      // Optimistic update + auto-advance
      setAnswers((prev) => {
        const exists = prev.some((x) => x.question_id === questionId);
        const nextAns = exists
          ? prev
          : [...prev, { question_id: questionId, option_id: optionId }];
        const nxt = nextUnansweredIndexWith(nextAns, idx);
        if (nxt === -1) {
          // All answered — finalize
          (async () => {
            try {
              await clientPostRequest(
                `/attempts/attempts/${encodeURIComponent(attemptId)}/finish`,
                {}
              );
              navigate(`/attempts/${attemptId}/result`, { replace: true });
            } catch (e) {
              console.error(e);
            }
          })();
        } else {
          setIdx(nxt);
        }
        return nextAns;
      });
    } catch (e) {
      console.error(e);
    } finally {
      setBusyAnswer(false);
      setTimeout(() => {
        lastAnswerKeyRef.current = null;
      }, 150);
    }
  }

  async function handleFinish() {
    if (busyFinish || isFinished(data)) return;
    try {
      setBusyFinish(true);
      await clientPostRequest(
        `/attempts/attempts/${encodeURIComponent(attemptId)}/finish`,
        {}
      );
      navigate(`/attempts/${attemptId}/result`, { replace: true });
    } catch (e) {
      console.error(e);
    } finally {
      setBusyFinish(false);
    }
  }

  return (
    <Fragment>
      {loading ? (
        <div className="rounded-2xl bg-white p-6 shadow">Yuklanmoqda…</div>
      ) : err ? (
        <div className="rounded-2xl bg-red-50 p-6 text-red-700 ring-1 ring-red-200 shadow">
          {err}
        </div>
      ) : !data ? (
        <div className="rounded-2xl border border-dashed p-8 text-center text-gray-500">
          Ma’lumot topilmadi.
        </div>
      ) : (
        <div className="grid gap-4 min-h-[100svh]">
          {/* Top bar */}
          <div className="sticky top-2 z-10 rounded-2xl border border-slate-200/70 bg-white/90 p-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/70">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-base sm:text-lg font-semibold text-slate-900">
                  {data?.test?.title || "Attempt"}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  Savollar: {total}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-xl px-3 py-1.5 text-xs sm:text-sm font-medium ${
                    isFinished(data)
                      ? "bg-slate-200 text-slate-700"
                      : left <= 15
                      ? "bg-rose-100 text-rose-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {isFinished(data) ? "Finished" : `Qolgan vaqt: ${fmt(left)}`}
                </span>
                {!isFinished(data) && (
                  <button
                    onClick={handleFinish}
                    disabled={busyFinish}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-60"
                  >
                    Finish
                  </button>
                )}
              </div>
            </div>

            {/* Exam-mode banner */}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] text-slate-700">
                {isFs ? "Full screen yoqilgan" : "Full screen o‘chiq"}
              </span>
              {!isFs && !isFinished(data) && (
                <button
                  type="button"
                  onClick={enterFullscreen}
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-[11px] text-slate-800 hover:bg-slate-100"
                >
                  Full screen’ga o‘tish
                </button>
              )}
              <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-[11px] text-amber-700 ring-1 ring-amber-200">
                Ogohlantirishlar: {violations}/{MAX_VIOLATIONS}
              </span>
            </div>

            {/* Warning toast/alert */}
            {showWarn && !isFinished(data) && (
              <div className="mt-2 rounded-xl bg-rose-50 p-2 text-[12px] text-rose-700 ring-1 ring-rose-200">
                Diqqat: test oynasidan chqib ketdingiz yoki fokus yo‘qoldi.
                Bunday holat {MAX_VIOLATIONS - violations} marta qolgan.
              </div>
            )}

            {/* Progress line */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Progress</span>
                <span>
                  {answeredCount}/{total} — {progressPct}%
                </span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-slate-900 transition-all"
                  style={{ width: `${progressPct}%` }}
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progressPct}
                />
              </div>
            </div>
          </div>

          {/* Body */}
          {total ? (
            <div className="grid gap-4 lg:grid-cols-[1fr,360px]">
              {/* Question panel */}
              {/* <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Savol {idx + 1} / {total}
                  </div>
                  {current?.order != null && (
                    <span className="text-[11px] text-slate-400">
                      Order: {current.order}
                    </span>
                  )}
                </div>
                {current?.image_url && (
                  <div className="mb-3">
                    <img
                      src={`${current.image_url}`}
                      alt="Question"
                      className="max-h-[70vh] w-full rounded-xl border border-slate-200 object-contain cursor-zoom-in"
                      onClick={() => setLightboxUrl(current.image_url)}
                    />
                    <div className="mt-1 text-[11px] text-slate-500">
                      Rasmni kattalashtirish uchun bosing
                    </div>
                  </div>
                )}
                {lightboxUrl && (
                  <div
                    className="fixed inset-0 z-50 bg-black/80 p-4"
                    onClick={() => setLightboxUrl(null)}
                  >
                    <div className="mx-auto grid h-full max-w-5xl place-items-center">
                      <img
                        src={lightboxUrl}
                        alt="Preview"
                        className="max-h-[90vh] w-auto rounded-xl object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => setLightboxUrl(null)}
                        className="mt-3 rounded-lg bg-white/90 px-3 py-1 text-sm text-slate-900 hover:bg-white"
                      >
                        Yopish
                      </button>
                    </div>
                  </div>
                )}
                <div className="whitespace-pre-wrap break-words text-slate-900">
                  {current?.content}
                </div>
                <div className="mt-4 grid gap-2">
                  {(current?.options || []).map((o, idxOpt) => {
                    const active = selectedOptionId === o.id;
                    const locked = selectedOptionId !== null; // lock after answer
                    return (
                      <button
                        key={o.id}
                        disabled={isFinished(data) || busyAnswer || locked}
                        onClick={() => handleSelect(current.id, o.id)}
                        className={[
                          "w-full rounded-2xl border px-4 py-3 text-left transition",
                          "grid grid-cols-[28px,1fr] items-start gap-3",
                          active
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-white hover:bg-slate-50",
                          (isFinished(data) || busyAnswer || locked) &&
                            "cursor-not-allowed",
                        ].join(" ")}
                      >
                        <span
                          className={[
                            "mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ring-1",
                            active
                              ? "bg-white/10 text-white ring-white/30"
                              : "bg-slate-100 text-slate-700 ring-slate-200",
                          ].join(" ")}
                        >
                          {letter(idxOpt)}
                        </span>
                        <span className="whitespace-pre-wrap break-words text-sm">
                          {o.content}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-5 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setIdx((i) => Math.max(0, i - 1))}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
                    disabled={idx === 0}
                  >
                    ← Oldingi
                  </button>
                  <div className="hidden sm:block text-xs text-slate-500">
                    Tanlangan: {selectedOptionId ? `#${selectedOptionId}` : "—"}
                  </div>
                  <button
                    onClick={() => setIdx((i) => Math.min(total - 1, i + 1))}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
                    disabled={idx === total - 1}
                  >
                    Keyingi →
                  </button>
                </div>
              </div> */}

              {/* Question panel */}
              {/* <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Savol {idx + 1} / {total}
                  </div>
                  {current?.order != null && (
                    <span className="text-[11px] text-slate-400">
                      Order: {current.order}
                    </span>
                  )}
                </div>

                
                {current ? (
                  <div className="grid gap-4 lg:grid-cols-12 lg:items-start">
                    
                    <section className="lg:col-span-7">
                      {current?.image_url && (
                        <div className="mb-3">
                          <img
                            src={`${current.image_url}`}
                            alt="Question"
                            className="max-h-[70vh] w-full rounded-xl border border-slate-200 object-contain cursor-zoom-in"
                            onClick={() => setLightboxUrl(current.image_url)}
                          />
                          <div className="mt-1 text-[11px] text-slate-500">
                            Rasmni kattalashtirish uchun bosing
                          </div>
                        </div>
                      )}

                      {lightboxUrl && (
                        <div
                          className="fixed inset-0 z-50 bg-black/80 p-4"
                          onClick={() => setLightboxUrl(null)}
                        >
                          <div className="mx-auto grid h-full max-w-5xl place-items-center">
                            <img
                              src={lightboxUrl}
                              alt="Preview"
                              className="max-h-[90vh] w-auto rounded-xl object-contain"
                            />
                            <button
                              type="button"
                              onClick={() => setLightboxUrl(null)}
                              className="mt-3 rounded-lg bg-white/90 px-3 py-1 text-sm text-slate-900 hover:bg-white"
                            >
                              Yopish
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="whitespace-pre-wrap break-words text-slate-900">
                        {current?.content}
                      </div>
                    </section>

                    <section className="lg:col-span-5">
                      <div className="lg:sticky lg:top-20 lg:max-h-[70vh] lg:overflow-auto lg:pr-1">
                        <div className="mt-4 grid gap-2">
                          {(current?.options || []).map((o, idxOpt) => {
                            const active = selectedOptionId === o.id;
                            const locked = selectedOptionId !== null; // lock after answer
                            return (
                              <button
                                key={o.id}
                                disabled={
                                  isFinished(data) || busyAnswer || locked
                                }
                                onClick={() => handleSelect(current.id, o.id)}
                                className={[
                                  "w-full rounded-2xl border px-4 py-3 text-left transition",
                                  "grid grid-cols-[28px,1fr] items-start gap-3",
                                  active
                                    ? "border-slate-900 bg-slate-900 text-white"
                                    : "border-slate-200 bg-white hover:bg-slate-50",
                                  (isFinished(data) || busyAnswer || locked) &&
                                    "cursor-not-allowed",
                                ].join(" ")}
                                role="radio"
                                aria-checked={active}
                              >
                                <span
                                  className={[
                                    "mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ring-1",
                                    active
                                      ? "bg-white/10 text-white ring-white/30"
                                      : "bg-slate-100 text-slate-700 ring-slate-200",
                                  ].join(" ")}
                                >
                                  {letter(idxOpt)}
                                </span>
                                <span className="whitespace-pre-wrap break-words text-sm">
                                  {o.content}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </section>
                  </div>
                ) : (
                  <div className="text-slate-500">Savol topilmadi.</div>
                )}

                <div className="mt-5 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setIdx((i) => Math.max(0, i - 1))}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
                    disabled={idx === 0}
                  >
                    ← Oldingi
                  </button>
                  <div className="hidden sm:block text-xs text-slate-500">
                    Tanlangan: {selectedOptionId ? `#${selectedOptionId}` : "—"}
                  </div>
                  <button
                    onClick={() => setIdx((i) => Math.min(total - 1, i + 1))}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
                    disabled={idx === total - 1}
                  >
                    Keyingi →
                  </button>
                </div>
              </div> */}

              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Savol {idx + 1} / {total}
                  </div>
                  {current?.order != null && (
                    <span className="text-[11px] text-slate-400">
                      Order: {current.order}
                    </span>
                  )}
                </div>

                {/* ---- RESPONSIVE LAYOUT ----
      lg+: chapda rasm; o‘ngda savol (bold) + variantlar (yonma-yon)
      mobil/planshet: rasm → savol → variantlar (stack) */}
                {current ? (
                  <div className="grid gap-4 lg:grid-cols-12 lg:items-start">
                    {/* LEFT: Image only */}
                    <section className="lg:col-span-7">
                      {current?.image_url && (
                        <div className="mb-3">
                          <img
                            src={`${current.image_url}`}
                            alt="Question"
                            className="max-h-[70vh] w-full rounded-xl border border-slate-200 object-contain cursor-zoom-in"
                            onClick={() => setLightboxUrl(current.image_url)}
                          />
                          <div className="mt-1 text-[11px] text-slate-500">
                            Rasmni kattalashtirish uchun bosing
                          </div>
                        </div>
                      )}

                      {/* Lightbox */}
                      {lightboxUrl && (
                        <div
                          className="fixed inset-0 z-50 bg-black/80 p-4"
                          onClick={() => setLightboxUrl(null)}
                        >
                          <div className="mx-auto grid h-full max-w-5xl place-items-center">
                            <img
                              src={lightboxUrl}
                              alt="Preview"
                              className="max-h-[90vh] w-auto rounded-xl object-contain"
                            />
                            <button
                              type="button"
                              onClick={() => setLightboxUrl(null)}
                              className="mt-3 rounded-lg bg-white/90 px-3 py-1 text-sm text-slate-900 hover:bg-white"
                            >
                              Yopish
                            </button>
                          </div>
                        </div>
                      )}
                    </section>

                    {/* RIGHT: Question (bold) + Options (sticky on desktop) */}
                    <section className="lg:col-span-5">
                      <div className="lg:sticky lg:top-20 lg:max-h-[70vh] lg:overflow-auto lg:pr-1">
                        {/* SAVOL MATNI — BOLD, VARIANTLAR TEPASIDA */}
                        <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-900">
                          {current?.content}
                        </h2>

                        {/* VARIANTLAR */}
                        {/* <div
                          className="mt-4 grid gap-2"
                          role="radiogroup"
                          aria-label="Variantlar"
                        >
                          {(current?.options || []).map((o, idxOpt) => {
                            const active = selectedOptionId === o.id;
                            const locked = selectedOptionId !== null; // lock after answer
                            const abLabel = `${letter(idxOpt).toLowerCase()})`; // a) b) c) ...

                            return (
                              <button
                                key={o.id}
                                disabled={
                                  isFinished(data) || busyAnswer || locked
                                }
                                onClick={() => handleSelect(current.id, o.id)}
                                className={[
                                  "w-full rounded-2xl border px-4 py-3 text-left transition",
                                  "grid grid-cols-[auto,1fr] items-start gap-3",
                                  active
                                    ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                                    : "border-slate-200 bg-white hover:bg-slate-50",
                                  (isFinished(data) || busyAnswer || locked) &&
                                    "cursor-not-allowed",
                                ].join(" ")}
                                role="radio"
                                aria-checked={active}
                              >
                                <span
                                  className={[
                                    "mt-[2px] font-mono text-sm",
                                    active ? "text-white/90" : "text-slate-500",
                                  ].join(" ")}
                                >
                                  {abLabel}
                                </span>

                                <span
                                  className={[
                                    "whitespace-pre-wrap break-words text-sm leading-6",
                                    active ? "text-white" : "text-slate-800",
                                  ].join(" ")}
                                >
                                  {o.content}
                                </span>
                              </button>
                            );
                          })}
                        </div> */}

                        {/* VARIANTLAR (timeline-style A/B/C + vertikal chiziq) */}
                        <div
                          className="mt-4 relative pl-12 before:content-[''] before:absolute before:inset-y-0 before:left-6 before:w-px before:bg-slate-200 before:z-0"
                          role="radiogroup"
                          aria-label="Variantlar"
                        >
                          {(current?.options || []).map((o, idxOpt) => {
                            const active = selectedOptionId === o.id;
                            const locked = selectedOptionId !== null; // lock after answer
                            const L = letter(idxOpt); // 'A', 'B', 'C', ...

                            return (
                              <button
                                key={o.id}
                                disabled={
                                  isFinished(data) || busyAnswer || locked
                                }
                                onClick={() => handleSelect(current.id, o.id)}
                                className={[
                                  "relative z-[1] mb-2 w-full rounded-2xl border px-4 py-3 text-left transition",
                                  active
                                    ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                                    : "border-slate-200 bg-white hover:bg-slate-50",
                                  (isFinished(data) || busyAnswer || locked) &&
                                    "cursor-not-allowed",
                                ].join(" ")}
                                role="radio"
                                aria-checked={active}
                              >
                                {/* Chapdagi A/B/C belgisi — vertikal chiziq ustida markazda */}
                                <span
                                  className={[
                                    "absolute -left-10 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ring-1",
                                    active
                                      ? "bg-slate-900 text-white ring-slate-900"
                                      : "bg-white text-slate-700 ring-slate-300",
                                  ].join(" ")}
                                  aria-hidden
                                >
                                  {L}
                                </span>

                                {/* Variant matni */}
                                <span className="block whitespace-pre-wrap break-words text-sm leading-6">
                                  {o.content}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </section>
                  </div>
                ) : (
                  <div className="text-slate-500">Savol topilmadi.</div>
                )}

                {/* Prev / Next */}
                <div className="mt-5 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setIdx((i) => Math.max(0, i - 1))}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
                    disabled={idx === 0}
                  >
                    ← Oldingi
                  </button>
                  <div className="hidden sm:block text-xs text-slate-500">
                    Tanlangan: {selectedOptionId ? `#${selectedOptionId}` : "—"}
                  </div>
                  <button
                    onClick={() => setIdx((i) => Math.min(total - 1, i + 1))}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
                    disabled={idx === total - 1}
                  >
                    Keyingi →
                  </button>
                </div>
              </div>

              {/* Progress panel */}
              <aside className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Savollar
                  </h3>
                  <span className="text-xs text-slate-500">
                    Tanlangan: {answeredCount}/{total}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-5">
                  {questions.map((q, i) => {
                    const chosen = answers.some(
                      (a) => a.question_id === q.id && a.option_id != null
                    );
                    const isCurrent = i === idx;
                    return (
                      <button
                        key={q.id}
                        onClick={() => setIdx(i)}
                        className={[
                          "aspect-[5/4] rounded-lg text-xs font-medium transition",
                          isCurrent
                            ? "bg-slate-900 text-white"
                            : chosen
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                        ].join(" ")}
                        title={chosen ? "Answered" : "Unanswered"}
                        aria-current={isCurrent ? "step" : undefined}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      const nextIdx = questions.findIndex((q, i) => {
                        const chosen = answers.some(
                          (a) => a.question_id === q.id && a.option_id != null
                        );
                        return !chosen && i > idx;
                      });
                      if (nextIdx !== -1) setIdx(nextIdx);
                    }}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-50"
                  >
                    Keyingi javobsiz
                  </button>
                  <button
                    onClick={() => setIdx(0)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-50"
                  >
                    Boshiga qaytish
                  </button>
                </div>
              </aside>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed p-8 text-center text-slate-500">
              Savollar topilmadi.
            </div>
          )}
        </div>
      )}

      {/* ====== Blocking Modal: Exam Policy / Warning ====== */}
      {showPolicy && !isFinished(data) && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200">
            {/* Header */}
            <div className="mb-3 flex items-start justify-between gap-3">
              <h3 className="text-base font-semibold text-slate-900">
                {modalMode === "policy"
                  ? "Imtihon rejimi qoidalari"
                  : "Ogohlantirish"}
              </h3>
              <span className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] text-slate-700">
                {violations}/{MAX_VIOLATIONS}
              </span>
            </div>

            {/* Body */}
            {modalMode === "policy" ? (
              <div className="space-y-2 text-sm text-slate-700">
                <p>
                  Iltimos, test davomida oynani <b>to‘liq ekran</b> holatida
                  saqlang va boshqa dasturni ochmang yoki sahifadan chiqmang.
                </p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>
                    Tabni almashtirish, oynadan chiqish yoki fokusni yo‘qotish
                    ogohlantirish sanaladi.
                  </li>
                  <li>
                    Ogohlantirishlar soni <b>{MAX_VIOLATIONS}</b> ga yetganda
                    test <b>avtomatik yakunlanadi</b>.
                  </li>
                  <li>Suratlarni kattalashtirish uchun ustiga bosing.</li>
                </ul>
                {!isFs && (
                  <div className="rounded-lg bg-amber-50 p-2 text-[12px] text-amber-800 ring-1 ring-amber-200">
                    Hozircha to‘liq ekran o‘chiq. “Tushundim”ni bossangiz,
                    to‘liq ekranga o‘tiladi.
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2 text-sm text-slate-700">
                <p className="text-rose-700 font-medium">
                  Diqqat: fokus oynadan chiqdi yoki sahifa yashirildi.
                </p>
                <p>
                  Iltimos, testni to‘liq ekran holatida davom ettiring va boshqa
                  dasturga o‘tmang. Aks holda yakunlanishi mumkin.
                </p>
                <p>
                  Qolgan imkoniyatlar:{" "}
                  <b>{Math.max(0, MAX_VIOLATIONS - violations)}</b>
                </p>
                {!isFs && (
                  <div className="rounded-lg bg-amber-50 p-2 text-[12px] text-amber-800 ring-1 ring-amber-200">
                    To‘liq ekran o‘chiq. “Tushundim”ni bossangiz, to‘liq ekranga
                    o‘tiladi.
                  </div>
                )}
              </div>
            )}

            {/* Footer actions */}
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={async () => {
                  // qayta full screenga o‘tamiz (agar o‘chiq bo‘lsa)
                  if (USE_FULLSCREEN && !document.fullscreenElement) {
                    await enterFullscreen();
                  }
                  setShowPolicy(false);
                  // modal yopilganda ham sahifaga fokus qaytarish (ixtiyoriy)
                  window.focus?.();
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
              >
                Tushundim
              </button>
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
};
