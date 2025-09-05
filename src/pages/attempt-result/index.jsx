// src/pages/attempt-result/index.jsx
import { useEffect, useMemo, useState, Fragment } from "react";
import { useParams, Link } from "react-router-dom";
import { clientGetRequest } from "../../request";

export const AttemptResult = () => {
  const { attemptId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        setLoading(true);

        // 1) Attempt
        const aRes = await clientGetRequest(`/attempts/attempts/${attemptId}`);
        const attemptPayload = aRes?.data?.data || aRes?.data || aRes;

        const attempt = attemptPayload?.attempt || attemptPayload;
        const answersArr =
          attemptPayload?.answers || attemptPayload?.attempt?.answers || [];

        const testId =
          attempt?.test_id ??
          attemptPayload?.test_id ??
          attemptPayload?.test?.id ??
          null;

        // 2) Test (savollar + options + explanation) — har doim testdan olib kelamiz
        //    (shunda barcha savollar ko‘rinadi, hatto student javob bermagan bo‘lsa ham)
        let questions = [];
        if (testId) {
          const tRes = await clientGetRequest(
            `/assessments/tests/one/${encodeURIComponent(testId)}`
          );
          const testObj = tRes?.data?.data || tRes?.data || tRes;
          const qs = Array.isArray(testObj?.questions) ? testObj.questions : [];
          questions = [...qs].sort((a, b) => (a.order || 0) - (b.order || 0));
          setData({
            attempt,
            answers: answersArr,
            test: testObj,
            questions,
          });
        } else {
          // Fallback (kam uchraydi): attempt ichida bo‘lsa shu savollarni ishlatamiz
          const qs =
            attemptPayload?.questions ||
            attemptPayload?.attempt?.questions ||
            [];
          questions = [...qs].sort((a, b) => (a.order || 0) - (b.order || 0));
          setData({
            attempt,
            answers: answersArr,
            test: attemptPayload?.test || null,
            questions,
          });
        }
      } catch (e) {
        setErr(e?.response?.data?.message || e?.message || "Yuklashda xatolik");
      } finally {
        setLoading(false);
      }
    })();
  }, [attemptId]);

  const score = useMemo(() => data?.attempt?.score ?? data?.score ?? 0, [data]);
  const questions = useMemo(() => data?.questions || [], [data]);
  const answers = useMemo(() => data?.answers || [], [data]);

  // Tezroq qidirish uchun map
  const answersMap = useMemo(() => {
    const m = new Map();
    for (const a of answers) m.set(a.question_id, a.option_id ?? null);
    return m;
  }, [answers]);

  const total = questions.length;
  const correctCount = useMemo(() => {
    return questions.reduce((acc, q) => {
      const my = answersMap.get(q.id);
      const correct = (q.options || []).find((o) => o.is_correct);
      return acc + (correct && correct.id === my ? 1 : 0);
    }, 0);
  }, [questions, answersMap]);
  const percent = total > 0 ? Math.round((correctCount / total) * 100) : 0;

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
        <div className="grid gap-6">
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Natija</h1>
              <p className="text-sm text-slate-500">
                Attempt #{data?.attempt?.id ?? attemptId}{" "}
                {data?.test?.title ? `• ${data.test.title}` : ""}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                <span className="font-medium">To‘g‘ri:</span>
                <span className="tabular-nums">
                  {correctCount}/{total}
                </span>
                <span className="text-slate-400">({percent}%)</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                <span>Score:</span>
                <span className="tabular-nums">{score}</span>
              </div>
            </div>
          </div>

          {/* QA list */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">
              Savollar & javoblar
            </h3>

            <div className="mt-4 grid gap-4">
              {questions.map((q, qIdx) => {
                const myOptionId = answersMap.get(q.id) ?? null;
                const correctOption =
                  (q.options || []).find((o) => o.is_correct) || null;
                const isAnswered =
                  myOptionId !== null && myOptionId !== undefined;
                const isCorrect = !!(
                  correctOption && correctOption.id === myOptionId
                );

                return (
                  <div
                    key={q.id}
                    className={[
                      "rounded-2xl border p-4 sm:p-5",
                      isAnswered
                        ? isCorrect
                          ? "border-emerald-200 bg-emerald-50/40"
                          : "border-rose-200 bg-rose-50/40"
                        : "border-slate-200 bg-slate-50/40",
                    ].join(" ")}
                  >
                    {/* Question head */}
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-slate-800">
                        {qIdx + 1}. Savol
                      </div>
                      <div
                        className={[
                          "rounded-lg px-2.5 py-1 text-xs font-medium",
                          !isAnswered
                            ? "bg-slate-200 text-slate-700"
                            : isCorrect
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700",
                        ].join(" ")}
                      >
                        {!isAnswered
                          ? "Javob tanlanmagan"
                          : isCorrect
                          ? "To‘g‘ri"
                          : "Noto‘g‘ri"}
                      </div>
                    </div>

                    {/* Image */}
                    {q.image_url && (
                      <div className="mb-3">
                        <img
                          src={q.image_url}
                          alt="Question"
                          className="max-h-64 w-full rounded-xl border border-slate-200 object-contain"
                        />
                      </div>
                    )}

                    {/* Question text */}
                    <div className="whitespace-pre-wrap break-words text-slate-900">
                      {q.content}
                    </div>

                    {/* Options */}
                    <ul className="mt-3 grid gap-1.5">
                      {(q.options || []).map((o) => {
                        const mine = myOptionId === o.id;
                        const correct = !!o.is_correct;

                        return (
                          <li
                            key={o.id}
                            className={[
                              "rounded-xl px-3 py-2 text-sm whitespace-pre-wrap break-words border",
                              correct
                                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                : mine
                                ? "bg-rose-100 text-rose-800 border-rose-200"
                                : "bg-white text-slate-700 border-slate-200",
                            ].join(" ")}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">{o.content}</div>
                              <div className="shrink-0 text-[11px] opacity-80">
                                {correct
                                  ? "✓ correct"
                                  : mine
                                  ? "your choice"
                                  : ""}
                              </div>
                            </div>

                            {/* Agar izoh bo‘lsa: 
                                - to‘g‘ri javobning izohi HAR DOIM ko‘rsatiladi (bo‘lsa)
                                - student tanlagan (noto‘g‘ri) variant izohi ham alohida ko‘rsatiladi (bo‘lsa) */}
                            {correct && o.explanation && (
                              <div className="mt-1 rounded-lg bg-white/70 p-2 text-xs text-slate-700 ring-1 ring-emerald-200">
                                <span className="font-medium">
                                  Nega to‘g‘ri:
                                </span>{" "}
                                <span className="whitespace-pre-wrap break-words">
                                  {o.explanation}
                                </span>
                              </div>
                            )}
                            {mine && !correct && o.explanation && (
                              <div className="mt-1 rounded-lg bg-white/70 p-2 text-xs text-slate-700 ring-1 ring-rose-200">
                                <span className="font-medium">
                                  Siz tanlagan javob izohi:
                                </span>{" "}
                                <span className="whitespace-pre-wrap break-words">
                                  {o.explanation}
                                </span>
                              </div>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>

            <div className="mt-6">
              <Link
                to="/tests"
                className="inline-flex rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
              >
                ← Tests
              </Link>
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
};
