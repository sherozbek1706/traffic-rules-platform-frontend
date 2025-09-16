// import { useEffect, useMemo, useState, Fragment, useRef } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { clientGetRequest, clientPostRequest } from "../../request";

// const leftSeconds = (endIso) => {
//   const now = Date.now();
//   const end = new Date(endIso).getTime();
//   return Math.max(0, Math.floor((end - now) / 1000));
// };

// export const Attempt = () => {
//   const { attemptId } = useParams();
//   const navigate = useNavigate();

//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState("");
//   const [left, setLeft] = useState(0);
//   const [idx, setIdx] = useState(0);
//   const [busyAnswer, setBusyAnswer] = useState(false);
//   const [busyFinish, setBusyFinish] = useState(false);

//   // double-click guard (tez-tez bosishdan himoya)
//   const lastAnswerKeyRef = useRef(null);

//   // attempt + (agar kerak bo'lsa) test savollarini yuklash
//   const load = async () => {
//     try {
//       setErr("");
//       setLoading(true);

//       // 1) Attempt’ni olib kelamiz
//       const res = await clientGetRequest(`/attempts/attempts/${attemptId}`);
//       const payload = res?.data?.data || res?.data || res;

//       // timer
//       const end = payload?.attempt?.end_time || payload?.end_time;
//       if (end) setLeft(leftSeconds(end));

//       // 2) Attempt ichidan test_id ni topamiz
//       const testId =
//         payload?.attempt?.test_id ??
//         payload?.test_id ??
//         payload?.test?.id ??
//         null;

//       // 3) Agar savollar attempt javobida yo'q bo'lsa — test bo'yicha olib kelamiz
//       let questions = payload?.questions || payload?.attempt?.questions || [];

//       if ((!questions || !questions.length) && testId) {
//         const tRes = await clientGetRequest(
//           `/assessments/tests/one/${encodeURIComponent(testId)}`
//         );
//         const testObj = tRes?.data?.data || tRes?.data || tRes;
//         const testQuestions = Array.isArray(testObj?.questions)
//           ? [...testObj.questions]
//           : [];
//         testQuestions.sort((a, b) => (a.order || 0) - (b.order || 0));

//         setData({
//           ...payload,
//           test: payload?.test || testObj,
//           questions: testQuestions,
//         });
//       } else {
//         const sorted = [...questions].sort(
//           (a, b) => (a.order || 0) - (b.order || 0)
//         );
//         setData({ ...payload, questions: sorted });
//       }
//     } catch (e) {
//       setErr(e?.response?.data?.message || e?.message || "Yuklashda xatolik");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     load();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [attemptId]);

//   // timer tick
//   useEffect(() => {
//     if (!data) return;
//     const end = data?.attempt?.end_time || data?.end_time;
//     if (!end) return;
//     const t = setInterval(() => setLeft(leftSeconds(end)), 1000);
//     return () => clearInterval(t);
//   }, [data]);

//   useEffect(() => {
//     if (left === 0 && data && !isFinished(data)) {
//       handleFinish(); // auto finish
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [left]);

//   const questions = useMemo(
//     () => data?.questions || data?.attempt?.questions || [],
//     [data]
//   );
//   const answers = useMemo(
//     () => data?.answers || data?.attempt?.answers || [],
//     [data]
//   );

//   const isFinished = (d) => d?.attempt?.is_finished ?? d?.is_finished ?? false;
//   const total = questions.length;
//   const answeredCount = useMemo(
//     () =>
//       answers.filter((a) => a.option_id != null && a.question_id != null)
//         .length,
//     [answers]
//   );
//   const progressPct = total ? Math.round((answeredCount / total) * 100) : 0;

//   const current = questions[idx];

//   const selectedOptionId = useMemo(() => {
//     if (!current) return null;
//     const found = answers.find((a) => a.question_id === current.id);
//     return found?.option_id ?? null;
//   }, [answers, current]);

//   const fmt = (s) => {
//     const m = Math.floor(s / 60);
//     const sec = s % 60;
//     return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
//   };

//   // Javob yuborish (bitta javobni qayta bosganda action YO'Q)
//   const handleSelect = async (questionId, optionId) => {
//     if (busyAnswer || isFinished(data)) return;

//     // Agar allaqachon shu option tanlangan bo‘lsa — hech narsa qilmaymiz
//     if (selectedOptionId === optionId) return;

//     // Tez-tez bosishdan himoya (bir xil kalit bilan ketma-ket requestlarni bloklaydi)
//     const key = `${attemptId}:${questionId}:${optionId}`;
//     if (lastAnswerKeyRef.current === key) return;
//     lastAnswerKeyRef.current = key;

//     try {
//       setBusyAnswer(true);
//       await clientPostRequest(`/attempts/attempts/${attemptId}/answer`, {
//         question_id: questionId,
//         option_id: optionId,
//       });
//       // optimistic update
//       setData((prev) => {
//         const prevAns = prev?.answers || [];
//         const i = prevAns.findIndex((x) => x.question_id === questionId);
//         const nextAns =
//           i >= 0
//             ? prevAns.map((a, k) =>
//                 k === i ? { ...a, option_id: optionId } : a
//               )
//             : [...prevAns, { question_id: questionId, option_id: optionId }];
//         return { ...prev, answers: nextAns };
//       });
//     } catch (e) {
//       console.error(e);
//     } finally {
//       setBusyAnswer(false);
//       // bitta request tugagach, keyni bo‘shatamiz; lekin aynan shu option qayta bosilsa baribir yuqorida qaytadi
//       setTimeout(() => {
//         lastAnswerKeyRef.current = null;
//       }, 150);
//     }
//   };

//   // Finish
//   const handleFinish = async () => {
//     if (busyFinish || isFinished(data)) return;
//     try {
//       setBusyFinish(true);
//       await clientPostRequest(`/attempts/attempts/${attemptId}/finish`, {});
//       navigate(`/attempts/${attemptId}/result`, { replace: true });
//     } catch (e) {
//       console.error(e);
//     } finally {
//       setBusyFinish(false);
//     }
//   };

//   return (
//     <Fragment>
//       {loading ? (
//         <div className="rounded-2xl bg-white p-6 shadow">Yuklanmoqda…</div>
//       ) : err ? (
//         <div className="rounded-2xl bg-red-50 p-6 text-red-700 ring-1 ring-red-200 shadow">
//           {err}
//         </div>
//       ) : !data ? (
//         <div className="rounded-2xl border border-dashed p-8 text-center text-gray-500">
//           Ma’lumot topilmadi.
//         </div>
//       ) : (
//         <div className="grid gap-4">
//           {/* Top bar: title + timer + finish */}
//           <div className="sticky top-2 z-10 rounded-2xl border border-slate-200/70 bg-white/90 p-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/70">
//             <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
//               <div>
//                 <h1 className="text-base sm:text-lg font-semibold text-slate-900">
//                   {data?.test?.title || data?.attempt?.test?.title || "Attempt"}
//                 </h1>
//                 <p className="text-xs sm:text-sm text-slate-500">
//                   Savollar: {total}
//                 </p>
//               </div>

//               <div className="flex items-center gap-2">
//                 <span
//                   className={`rounded-xl px-3 py-1.5 text-xs sm:text-sm font-medium ${
//                     isFinished(data)
//                       ? "bg-slate-200 text-slate-700"
//                       : left <= 15
//                       ? "bg-rose-100 text-rose-700"
//                       : "bg-emerald-100 text-emerald-700"
//                   }`}
//                 >
//                   {isFinished(data) ? "Finished" : `Qolgan vaqt: ${fmt(left)}`}
//                 </span>

//                 {!isFinished(data) && (
//                   <button
//                     onClick={handleFinish}
//                     disabled={busyFinish}
//                     className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-60"
//                   >
//                     Finish
//                   </button>
//                 )}
//               </div>
//             </div>

//             {/* Progress line */}
//             <div className="mt-3">
//               <div className="flex items-center justify-between text-xs text-slate-500">
//                 <span>Progress</span>
//                 <span>
//                   {answeredCount}/{total} — {progressPct}%
//                 </span>
//               </div>
//               <div className="mt-1 h-2 w-full rounded-full bg-slate-100">
//                 <div
//                   className="h-2 rounded-full bg-slate-900 transition-all"
//                   style={{ width: `${progressPct}%` }}
//                   aria-valuemin={0}
//                   aria-valuemax={100}
//                   aria-valuenow={progressPct}
//                   role="progressbar"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Body */}
//           {total ? (
//             <div className="grid gap-4 lg:grid-cols-[1fr,360px]">
//               {/* Question panel */}
//               <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
//                 <div className="mb-3 flex items-center justify-between">
//                   <div className="text-xs text-slate-500">
//                     Savol {idx + 1} / {total}
//                   </div>
//                   {current?.order && (
//                     <span className="text-[11px] text-slate-400">
//                       Order: {current.order}
//                     </span>
//                   )}
//                 </div>

//                 {/* Image (if provided) */}
//                 {current?.image_url && (
//                   <div className="mb-3">
//                     <img
//                       src={current.image_url}
//                       alt="Question"
//                       className="max-h-72 w-full rounded-xl border border-slate-200 object-contain"
//                     />
//                   </div>
//                 )}

//                 {/* Question text – uzun matn to‘liq ko‘rinadi */}
//                 <div className="whitespace-pre-wrap break-words text-slate-900">
//                   {current?.content}
//                 </div>

//                 {/* Options */}
//                 <div className="mt-4 grid gap-2">
//                   {(current?.options || []).map((o) => {
//                     const active = selectedOptionId === o.id;
//                     return (
//                       <button
//                         key={o.id}
//                         disabled={isFinished(data) || busyAnswer || active}
//                         onClick={() => handleSelect(current.id, o.id)}
//                         className={[
//                           "w-full rounded-xl border px-4 py-2 text-left text-sm transition",
//                           "whitespace-pre-wrap break-words",
//                           active
//                             ? "border-slate-900 bg-slate-900 text-white"
//                             : "border-slate-200 bg-white hover:bg-slate-50",
//                           (isFinished(data) || busyAnswer || active) &&
//                             "cursor-not-allowed",
//                         ].join(" ")}
//                       >
//                         {o.content}
//                       </button>
//                     );
//                   })}
//                 </div>

//                 {/* Nav */}
//                 <div className="mt-5 flex items-center justify-between gap-2">
//                   <button
//                     onClick={() => setIdx((i) => Math.max(0, i - 1))}
//                     className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
//                     disabled={idx === 0}
//                   >
//                     ← Oldingi
//                   </button>

//                   <div className="hidden sm:block text-xs text-slate-500">
//                     Tanlangan: {selectedOptionId ? `#${selectedOptionId}` : "—"}
//                   </div>

//                   <button
//                     onClick={() => setIdx((i) => Math.min(total - 1, i + 1))}
//                     className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
//                     disabled={idx === total - 1}
//                   >
//                     Keyingi →
//                   </button>
//                 </div>
//               </div>

//               {/* Progress panel (grid) */}
//               <aside className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
//                 <div className="flex items-center justify-between">
//                   <h3 className="text-sm font-semibold text-slate-900">
//                     Savollar
//                   </h3>
//                   <span className="text-xs text-slate-500">
//                     Tanlangan: {answeredCount}/{total}
//                   </span>
//                 </div>

//                 <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-5">
//                   {questions.map((q, i) => {
//                     const chosen = answers.some(
//                       (a) => a.question_id === q.id && a.option_id != null
//                     );
//                     const isCurrent = i === idx;
//                     return (
//                       <button
//                         key={q.id}
//                         onClick={() => setIdx(i)}
//                         className={[
//                           "aspect-[5/4] rounded-lg text-xs font-medium transition",
//                           isCurrent
//                             ? "bg-slate-900 text-white"
//                             : chosen
//                             ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
//                             : "bg-slate-100 text-slate-700 hover:bg-slate-200",
//                         ].join(" ")}
//                         title={chosen ? "Answered" : "Unanswered"}
//                         aria-current={isCurrent ? "step" : undefined}
//                       >
//                         {i + 1}
//                       </button>
//                     );
//                   })}
//                 </div>

//                 {/* Quick actions */}
//                 <div className="mt-4 flex flex-wrap items-center gap-2">
//                   <button
//                     onClick={() => {
//                       // next unanswered
//                       const nextIdx = questions.findIndex((q, i) => {
//                         const chosen = answers.some(
//                           (a) => a.question_id === q.id && a.option_id != null
//                         );
//                         return !chosen && i > idx;
//                       });
//                       if (nextIdx !== -1) setIdx(nextIdx);
//                     }}
//                     className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-50"
//                   >
//                     Keyingi javobsiz
//                   </button>
//                   <button
//                     onClick={() => setIdx(0)}
//                     className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs hover:bg-slate-50"
//                   >
//                     Boshiga qaytish
//                   </button>
//                 </div>
//               </aside>
//             </div>
//           ) : (
//             <div className="rounded-2xl border border-dashed p-8 text-center text-slate-500">
//               Savollar topilmadi.
//             </div>
//           )}
//         </div>
//       )}
//     </Fragment>
//   );
// };

import { useEffect, useMemo, useState, Fragment, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  clientGetRequest,
  clientPostRequest,
  adminGetRequest,
} from "../../request";

const leftSeconds = (endIso) => {
  const now = Date.now();
  const end = new Date(endIso).getTime();
  return Math.max(0, Math.floor((end - now) / 1000));
};

export const Attempt = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [left, setLeft] = useState(0);
  const [idx, setIdx] = useState(0);
  const [busyAnswer, setBusyAnswer] = useState(false);
  const [busyFinish, setBusyFinish] = useState(false);

  // double-click guard
  const lastAnswerKeyRef = useRef(null);

  // --- Admin’dan keldimi? 3 ta signal: state.from, ?admin=1, sessionStorage.prevPath
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

  const isFinished = (d) => d?.attempt?.is_finished ?? d?.is_finished ?? false;

  // attempt + test savollarini yuklash
  const load = async () => {
    try {
      setErr("");
      setLoading(true);

      // 1) Attempt
      const res = await getFn(`/attempts/attempts/${attemptId}`);
      const payload = res?.data?.data || res?.data || res;

      // timer
      const end = payload?.attempt?.end_time || payload?.end_time;
      if (end) setLeft(leftSeconds(end));

      // 2) test_id
      const testId =
        payload?.attempt?.test_id ??
        payload?.test_id ??
        payload?.test?.id ??
        null;

      // 3) Savollar
      let questions = payload?.questions || payload?.attempt?.questions || [];
      if ((!questions || !questions.length) && testId) {
        const tRes = await getFn(
          `/assessments/tests/one/${encodeURIComponent(testId)}`
        );
        const testObj = tRes?.data?.data || tRes?.data || tRes;
        const testQuestions = Array.isArray(testObj?.questions)
          ? [...testObj.questions]
          : [];
        testQuestions.sort((a, b) => (a.order || 0) - (b.order || 0));

        setData({
          ...payload,
          test: payload?.test || testObj,
          questions: testQuestions,
        });
      } else {
        const sorted = [...questions].sort(
          (a, b) => (a.order || 0) - (b.order || 0)
        );
        setData({ ...payload, questions: sorted });
      }
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId, cameFromAdmin]);

  // timer tick
  useEffect(() => {
    if (!data) return;
    const end = data?.attempt?.end_time || data?.end_time;
    if (!end) return;
    const t = setInterval(() => setLeft(leftSeconds(end)), 1000);
    return () => clearInterval(t);
  }, [data]);

  useEffect(() => {
    if (left === 0 && data && !isFinished(data)) {
      handleFinish(); // auto finish
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left]);

  const questions = useMemo(
    () => data?.questions || data?.attempt?.questions || [],
    [data]
  );
  const answers = useMemo(
    () => data?.answers || data?.attempt?.answers || [],
    [data]
  );

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

  // sahifa/answers yangilanganda — birinchi javobsiz savolga turib berish
  useEffect(() => {
    if (!questions.length) return;
    const firstUnanswered = questions.findIndex(
      (q) => !answers.some((a) => a.question_id === q.id && a.option_id != null)
    );
    if (firstUnanswered >= 0) setIdx(firstUnanswered);
  }, [questions, answers]);

  const fmt = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  // helper: keyingi javobsiz indeks
  const nextUnansweredIndexWith = (answersList, startIdx) => {
    if (!questions.length) return -1;
    // oldinga qarab
    for (let i = startIdx + 1; i < questions.length; i++) {
      const qId = questions[i].id;
      const chosen = answersList.some(
        (a) => a.question_id === qId && a.option_id != null
      );
      if (!chosen) return i;
    }
    // boshidan
    for (let i = 0; i <= startIdx; i++) {
      const qId = questions[i].id;
      const chosen = answersList.some(
        (a) => a.question_id === qId && a.option_id != null
      );
      if (!chosen) return i;
    }
    return -1;
  };

  // Javob yuborish (bir savol — bir marta). Javob bo'lsa qayta yozmaymiz.
  const handleSelect = async (questionId, optionId) => {
    if (busyAnswer || isFinished(data)) return;

    // allaqachon shu savolga javob berilgan bo'lsa — LOCK
    if (selectedOptionId !== null) return;

    // double-click guard
    const key = `${attemptId}:${questionId}:${optionId}`;
    if (lastAnswerKeyRef.current === key) return;
    lastAnswerKeyRef.current = key;

    try {
      setBusyAnswer(true);
      await clientPostRequest(`/attempts/attempts/${attemptId}/answer`, {
        question_id: questionId,
        option_id: optionId,
      });

      // optimistic update + AUTO-ADVANCE
      setData((prev) => {
        const prevAns = prev?.answers || [];
        const existsIdx = prevAns.findIndex(
          (x) => x.question_id === questionId
        );

        // yangi javobni faqat YO'Q bo'lsa qo'shamiz (overwrite qilmaymiz)
        const nextAns =
          existsIdx >= 0
            ? prevAns // bor bo'lsa o'zgartirmaymiz (lock)
            : [...prevAns, { question_id: questionId, option_id: optionId }];

        // auto-advance yoki finish
        const nxt = nextUnansweredIndexWith(nextAns, idx);
        if (nxt === -1) {
          // hammasi javoblangan — finish (async, lekin UI tez o'tadi)
          (async () => {
            try {
              await clientPostRequest(
                `/attempts/attempts/${attemptId}/finish`,
                {}
              );
              navigate(`/attempts/${attemptId}/result`, { replace: true });
            } catch (e) {
              console.error(e);
            }
          })();
        } else {
          // keyingi javobsizga turib beramiz
          setIdx(nxt);
        }

        return { ...prev, answers: nextAns };
      });
    } catch (e) {
      console.error(e);
    } finally {
      setBusyAnswer(false);
      setTimeout(() => {
        lastAnswerKeyRef.current = null;
      }, 150);
    }
  };

  // Finish tugmasi
  const handleFinish = async () => {
    if (busyFinish || isFinished(data)) return;
    try {
      setBusyFinish(true);
      await clientPostRequest(`/attempts/attempts/${attemptId}/finish`, {});
      navigate(`/attempts/${attemptId}/result`, { replace: true });
    } catch (e) {
      console.error(e);
    } finally {
      setBusyFinish(false);
    }
  };

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
        <div className="grid gap-4">
          {/* Top bar: title + timer + finish */}
          <div className="sticky top-2 z-10 rounded-2xl border border-slate-200/70 bg-white/90 p-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/70">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-base sm:text-lg font-semibold text-slate-900">
                  {data?.test?.title || data?.attempt?.test?.title || "Attempt"}
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
                  {isFinished(data)
                    ? "Finished"
                    : `Qolgan vaqt: ${leftSeconds ? `${fmt(left)}` : "—"}`}
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
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progressPct}
                  role="progressbar"
                />
              </div>
            </div>
          </div>

          {/* Body */}
          {total ? (
            <div className="grid gap-4 lg:grid-cols-[1fr,360px]">
              {/* Question panel */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Savol {idx + 1} / {total}
                  </div>
                  {current?.order && (
                    <span className="text-[11px] text-slate-400">
                      Order: {current.order}
                    </span>
                  )}
                </div>

                {/* Image */}
                {current?.image_url && (
                  <div className="mb-3">
                    <img
                      src={current.image_url}
                      alt="Question"
                      className="max-h-72 w-full rounded-xl border border-slate-200 object-contain"
                    />
                  </div>
                )}

                {/* Question text */}
                <div className="whitespace-pre-wrap break-words text-slate-900">
                  {current?.content}
                </div>

                {/* Options */}
                <div className="mt-4 grid gap-2">
                  {(current?.options || []).map((o) => {
                    const active = selectedOptionId === o.id;
                    const locked = selectedOptionId !== null; // javob berilgan — lock
                    return (
                      <button
                        key={o.id}
                        disabled={isFinished(data) || busyAnswer || locked}
                        onClick={() => handleSelect(current.id, o.id)}
                        className={[
                          "w-full rounded-xl border px-4 py-2 text-left text-sm transition",
                          "whitespace-pre-wrap break-words",
                          active
                            ? "border-slate-900 bg-slate-900 text-white"
                            : "border-slate-200 bg-white hover:bg-slate-50",
                          (isFinished(data) || busyAnswer || locked) &&
                            "cursor-not-allowed",
                        ].join(" ")}
                      >
                        {o.content}
                      </button>
                    );
                  })}
                </div>

                {/* Nav (ko‘rish uchun, javob o‘zgarmaydi) */}
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

                {/* Quick actions */}
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
    </Fragment>
  );
};
