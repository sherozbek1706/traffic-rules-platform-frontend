// // src/pages/attempt-result/index.jsx
// import { useEffect, useMemo, useState, Fragment } from "react";
// import { useParams, Link } from "react-router-dom";
// import { clientGetRequest } from "../../request";

// export const AttemptResult = () => {
//   const { attemptId } = useParams();
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState("");

//   useEffect(() => {
//     (async () => {
//       try {
//         setErr("");
//         setLoading(true);

//         // 1) Attempt
//         const aRes = await clientGetRequest(`/attempts/attempts/${attemptId}`);
//         const attemptPayload = aRes?.data?.data || aRes?.data || aRes;

//         const attempt = attemptPayload?.attempt || attemptPayload;
//         const answersArr =
//           attemptPayload?.answers || attemptPayload?.attempt?.answers || [];

//         const testId =
//           attempt?.test_id ??
//           attemptPayload?.test_id ??
//           attemptPayload?.test?.id ??
//           null;

//         // 2) Test (savollar + options + explanation) — har doim testdan olib kelamiz
//         //    (shunda barcha savollar ko‘rinadi, hatto student javob bermagan bo‘lsa ham)
//         let questions = [];
//         if (testId) {
//           const tRes = await clientGetRequest(
//             `/assessments/tests/one/${encodeURIComponent(testId)}`
//           );
//           const testObj = tRes?.data?.data || tRes?.data || tRes;
//           const qs = Array.isArray(testObj?.questions) ? testObj.questions : [];
//           questions = [...qs].sort((a, b) => (a.order || 0) - (b.order || 0));
//           setData({
//             attempt,
//             answers: answersArr,
//             test: testObj,
//             questions,
//           });
//         } else {
//           // Fallback (kam uchraydi): attempt ichida bo‘lsa shu savollarni ishlatamiz
//           const qs =
//             attemptPayload?.questions ||
//             attemptPayload?.attempt?.questions ||
//             [];
//           questions = [...qs].sort((a, b) => (a.order || 0) - (b.order || 0));
//           setData({
//             attempt,
//             answers: answersArr,
//             test: attemptPayload?.test || null,
//             questions,
//           });
//         }
//       } catch (e) {
//         setErr(e?.response?.data?.message || e?.message || "Yuklashda xatolik");
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [attemptId]);

//   const score = useMemo(() => data?.attempt?.score ?? data?.score ?? 0, [data]);
//   const questions = useMemo(() => data?.questions || [], [data]);
//   const answers = useMemo(() => data?.answers || [], [data]);

//   // Tezroq qidirish uchun map
//   const answersMap = useMemo(() => {
//     const m = new Map();
//     for (const a of answers) m.set(a.question_id, a.option_id ?? null);
//     return m;
//   }, [answers]);

//   const total = questions.length;
//   const correctCount = useMemo(() => {
//     return questions.reduce((acc, q) => {
//       const my = answersMap.get(q.id);
//       const correct = (q.options || []).find((o) => o.is_correct);
//       return acc + (correct && correct.id === my ? 1 : 0);
//     }, 0);
//   }, [questions, answersMap]);
//   const percent = total > 0 ? Math.round((correctCount / total) * 100) : 0;

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
//         <div className="grid gap-6">
//           {/* Header */}
//           <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//             <div>
//               <h1 className="text-lg font-semibold text-slate-900">Natija</h1>
//               <p className="text-sm text-slate-500">
//                 Attempt #{data?.attempt?.id ?? attemptId}{" "}
//                 {data?.test?.title ? `• ${data.test.title}` : ""}
//               </p>
//             </div>

//             <div className="flex flex-wrap items-center gap-2">
//               <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
//                 <span className="font-medium">To‘g‘ri:</span>
//                 <span className="tabular-nums">
//                   {correctCount}/{total}
//                 </span>
//                 <span className="text-slate-400">({percent}%)</span>
//               </div>
//               <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
//                 <span>Score:</span>
//                 <span className="tabular-nums">{score}</span>
//               </div>
//             </div>
//           </div>

//           {/* QA list */}
//           <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
//             <h3 className="text-sm font-semibold text-slate-900">
//               Savollar & javoblar
//             </h3>

//             <div className="mt-4 grid gap-4">
//               {questions.map((q, qIdx) => {
//                 const myOptionId = answersMap.get(q.id) ?? null;
//                 const correctOption =
//                   (q.options || []).find((o) => o.is_correct) || null;
//                 const isAnswered =
//                   myOptionId !== null && myOptionId !== undefined;
//                 const isCorrect = !!(
//                   correctOption && correctOption.id === myOptionId
//                 );

//                 return (
//                   <div
//                     key={q.id}
//                     className={[
//                       "rounded-2xl border p-4 sm:p-5",
//                       isAnswered
//                         ? isCorrect
//                           ? "border-emerald-200 bg-emerald-50/40"
//                           : "border-rose-200 bg-rose-50/40"
//                         : "border-slate-200 bg-slate-50/40",
//                     ].join(" ")}
//                   >
//                     {/* Question head */}
//                     <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
//                       <div className="text-sm font-semibold text-slate-800">
//                         {qIdx + 1}. Savol
//                       </div>
//                       <div
//                         className={[
//                           "rounded-lg px-2.5 py-1 text-xs font-medium",
//                           !isAnswered
//                             ? "bg-slate-200 text-slate-700"
//                             : isCorrect
//                             ? "bg-emerald-100 text-emerald-700"
//                             : "bg-rose-100 text-rose-700",
//                         ].join(" ")}
//                       >
//                         {!isAnswered
//                           ? "Javob tanlanmagan"
//                           : isCorrect
//                           ? "To‘g‘ri"
//                           : "Noto‘g‘ri"}
//                       </div>
//                     </div>

//                     {/* Image */}
//                     {q.image_url && (
//                       <div className="mb-3">
//                         <img
//                           src={q.image_url}
//                           alt="Question"
//                           className="max-h-64 w-full rounded-xl border border-slate-200 object-contain"
//                         />
//                       </div>
//                     )}

//                     {/* Question text */}
//                     <div className="whitespace-pre-wrap break-words text-slate-900">
//                       {q.content}
//                     </div>

//                     {/* Options */}
//                     <ul className="mt-3 grid gap-1.5">
//                       {(q.options || []).map((o) => {
//                         const mine = myOptionId === o.id;
//                         const correct = !!o.is_correct;

//                         return (
//                           <li
//                             key={o.id}
//                             className={[
//                               "rounded-xl px-3 py-2 text-sm whitespace-pre-wrap break-words border",
//                               correct
//                                 ? "bg-emerald-100 text-emerald-800 border-emerald-200"
//                                 : mine
//                                 ? "bg-rose-100 text-rose-800 border-rose-200"
//                                 : "bg-white text-slate-700 border-slate-200",
//                             ].join(" ")}
//                           >
//                             <div className="flex items-start justify-between gap-3">
//                               <div className="min-w-0">{o.content}</div>
//                               <div className="shrink-0 text-[11px] opacity-80">
//                                 {correct
//                                   ? "✓ correct"
//                                   : mine
//                                   ? "your choice"
//                                   : ""}
//                               </div>
//                             </div>

//                             {/* Agar izoh bo‘lsa:
//                                 - to‘g‘ri javobning izohi HAR DOIM ko‘rsatiladi (bo‘lsa)
//                                 - student tanlagan (noto‘g‘ri) variant izohi ham alohida ko‘rsatiladi (bo‘lsa) */}
//                             {correct && o.explanation && (
//                               <div className="mt-1 rounded-lg bg-white/70 p-2 text-xs text-slate-700 ring-1 ring-emerald-200">
//                                 <span className="font-medium">
//                                   Nega to‘g‘ri:
//                                 </span>{" "}
//                                 <span className="whitespace-pre-wrap break-words">
//                                   {o.explanation}
//                                 </span>
//                               </div>
//                             )}
//                             {mine && !correct && o.explanation && (
//                               <div className="mt-1 rounded-lg bg-white/70 p-2 text-xs text-slate-700 ring-1 ring-rose-200">
//                                 <span className="font-medium">
//                                   Siz tanlagan javob izohi:
//                                 </span>{" "}
//                                 <span className="whitespace-pre-wrap break-words">
//                                   {o.explanation}
//                                 </span>
//                               </div>
//                             )}
//                           </li>
//                         );
//                       })}
//                     </ul>
//                   </div>
//                 );
//               })}
//             </div>

//             <div className="mt-6">
//               <Link
//                 to="/tests"
//                 className="inline-flex rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
//               >
//                 ← Tests
//               </Link>
//             </div>
//           </div>
//         </div>
//       )}
//     </Fragment>
//   );
// };

// src/pages/attempt-result/index.jsx
import { useEffect, useMemo, useState, Fragment, useCallback } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { clientGetRequest, adminGetRequest } from "../../request";

/** Ranglar va ohanglar */
const toneForPercent = (p) => {
  if (p >= 90)
    return {
      ring: "from-emerald-400 to-emerald-600",
      text: "text-emerald-700",
      chip: "bg-emerald-100 text-emerald-700 border-emerald-200",
    };
  if (p >= 70)
    return {
      ring: "from-lime-400 to-green-500",
      text: "text-green-700",
      chip: "bg-lime-100 text-lime-700 border-lime-200",
    };
  if (p >= 50)
    return {
      ring: "from-amber-400 to-orange-500",
      text: "text-amber-700",
      chip: "bg-amber-100 text-amber-800 border-amber-200",
    };
  if (p >= 30)
    return {
      ring: "from-rose-300 to-amber-400",
      text: "text-amber-800",
      chip: "bg-rose-100 text-rose-800 border-rose-200",
    };
  return {
    ring: "from-rose-400 to-red-600",
    text: "text-rose-700",
    chip: "bg-rose-100 text-rose-800 border-rose-200",
  };
};

/** Foizga qarab keng, mazmunli tavsiya qaytaradi */
const getAdviceForPercent = (p) => {
  if (p === 100) {
    return [
      "Zo‘r! 100% natija — material to‘liq o‘zlashtirilgan. Endi chuqurlashtirish uchun: murakkabroq variantlar, 'why not' tahlillar (nima uchun boshqa variantlar noto‘g‘ri), va real amaliy vaziyatlar bilan mashq qiling.",
      "Keyingi bosqich: vaqt cheklovi qisqaroq bo‘lgan rejimda sinov, o‘xshash mavzudagi yangi testlar, va o‘rgangan narsalarni boshqalarga tushuntirish (Feynman usuli).",
    ];
  }
  if (p >= 90) {
    return [
      "Ajoyib daraja! Bir nechta xatolik — odatda diqqat yoki nozik detallar. Xato savollarni alohida qayta ko‘ring, har birida 'nima meni chalg‘itdi?' degan savolga javob yozib chiqing.",
      "Tayyorlanish rejasi: qisqa 'spaced repetition' (1–2 kun oralatib), chalkash tushunchalar uchun jadval/diagram chizing va misollar orqali mustahkamlang.",
    ];
  }
  if (p >= 80) {
    return [
      "Yaxshi natija! Asosiy tushunchalar o‘zlashtirilgan, endi nozik joylarni mustahkamlash kerak. Xato bo‘lgan savollarni mavzular bo‘yicha guruhlab, har biri uchun 2–3 ta qo‘shimcha misol toping.",
      "Amaliyot: vaqtni 10–15% qisqartirib, yana test qiling. Har savolga qisqa 'necha sekund ketdi' qaydnoma olib borish, diqqatni jamlashga yordam beradi.",
    ];
  }
  if (p >= 70) {
    return [
      "Barqaror zamin bor. Eng ko‘p adashgan mavzularni toping va shu bo‘limlarga qisqa konspekt tuzing (ta’rif → misol → qarshi misol → asosiy qoida).",
      "Strategiya: har kuni 20–30 daqiqalik bloklarda mini-testlar va 'active recall' — yoddan tushuntirish. Chalkash tushunchalarni vizual sxemaga aylantiring.",
    ];
  }
  if (p >= 60) {
    return [
      "O‘rtacha natija — yaxshi boshlang‘ich. Kamchiliklarni topish uchun: xato savollarni tagiga nima uchun noto‘g‘ri tanlanganini yozing (xulosa xatolari, atamalar, shoshilish).",
      "Reja: 2–3 mavzuni tanlab, ularni chuqurroq o‘rganing. Har mavzu uchun 10–15 ta mashq, keyin aralashtirilgan 'mixed' test qilib tekshiring.",
    ];
  }
  if (p >= 50) {
    return [
      "Chegarada. Mustahkamlash shart — ayniqsa asosiy ta’riflar va tez-tez uchraydigan holatlar. Glossariy (terminlar ro‘yxati) tuzing, har biri uchun 1–2 misol yozing.",
      "Mashq: xatolar repo’si (noto‘g‘ri vs to‘g‘ri sababi bilan). Keyingi test oldidan shu ro‘yxatni ko‘zdan kechiring va o‘xshash savollarni alohida yeching.",
    ];
  }
  if (p >= 40) {
    return [
      "Biroz ko‘proq tayyorgarlik zarur. Savollarni o‘qishda kalit so‘zlarni alohida belgilash odatini kiriting (ta’rif, istisno, birlik/ko‘plik, vaqt).",
      "Reja: avvalo oson savollarda 90%+ aniqlikka chiqish, keyin o‘rtacha darajani ko‘paytirish. Har kuni 30–45 daqiqa fokusli mashg‘ulot.",
    ];
  }
  if (p >= 30) {
    return [
      "Poydevor sust. Boshlang‘ich mavzularni qayta ko‘rib chiqing: ta’riflar, asosiy qoidalar, eng oddiy misollar. Har bo‘limdan keyin 5–10 daqiqalik mini-quiz bering.",
      "Vizual: skhema, jadval, mind-map. Har bir xato uchun 'qanday fikrlash xatosi bo‘ldi?' deb etiketa qo‘ying (masalan: shoshilish, noto‘g‘ri taxmin, terminni adashtirish).",
    ];
  }
  if (p >= 20) {
    return [
      "Bosqichma-bosqich yondashuv kerak. Har kuni kichik bloklar: 15–20 daqiqa o‘qish + 10 daqiqa test. To‘g‘ri javob izohlarini ham sinchiklab o‘qing.",
      "Mentor yoki guruh bilan ishlash foydali: tushuntirib berish orqali o‘zingiz ham chuqurroq anglaysiz.",
    ];
  }
  if (p >= 10) {
    return [
      "Asoslar bilan qayta boshlaylik: mavzuni qisqa bo‘limlarga bo‘lib, har bir bo‘limni alohida o‘zlashtiring. O‘ta sodda misollardan murakkabroqqa.",
      "Ishonchni oshirish uchun oson testlardan boshlang. Har muvaffaqiyat uchun kichik mukofot qoidasini kiriting.",
    ];
  }
  return [
    "Hali hammasi oldinda! Noldan boshlaymiz: atamalar lug‘ati, eng oddiy savollar, video/rasmli tushuntirishlardan foydalaning.",
    "Kundalik odat: 15–20 daqiqalik qat’iy vaqt, telefonni uzoqroqqa qo‘yib, bitta bo‘limga to‘liq e’tibor. Progressni grafikda belgilab boring.",
  ];
};

export const AttemptResult = () => {
  const { attemptId } = useParams();
  const location = useLocation();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [filter, setFilter] = useState("all"); // all | wrong | correct

  // Admin’dan keldimi?
  const fromState = location.state?.from || "";
  const isAdminQuery =
    new URLSearchParams(location.search).get("admin") === "1";
  const prevPath =
    (typeof window !== "undefined" && sessionStorage.getItem("prevPath")) || "";
  const cameFromAdmin =
    isAdminQuery ||
    (typeof fromState === "string" &&
      fromState.startsWith("/dashboard-panel-admin")) ||
    (typeof prevPath === "string" &&
      prevPath.startsWith("/dashboard-panel-admin"));

  const getFn = cameFromAdmin ? adminGetRequest : clientGetRequest;

  const fmt = useCallback((n) => new Intl.NumberFormat("en-US").format(n), []);

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        setLoading(true);

        // 1) Attempt
        const aRes = await getFn(`/attempts/attempts/${attemptId}`);
        const attemptPayload = aRes?.data?.data || aRes?.data || aRes;

        const attempt = attemptPayload?.attempt || attemptPayload;
        const answersArr =
          attemptPayload?.answers || attemptPayload?.attempt?.answers || [];

        const testId =
          attempt?.test_id ??
          attemptPayload?.test_id ??
          attemptPayload?.test?.id ??
          null;

        // 2) Test (har doim testdan olib kelamiz)
        let questions = [];
        if (testId) {
          const tRes = await getFn(
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
          // fallback
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
  }, [attemptId, cameFromAdmin]); // getFn ga bog‘lash shart emas, flagga bog‘ladik

  const score = useMemo(() => data?.attempt?.score ?? data?.score ?? 0, [data]);
  const questions = useMemo(() => data?.questions || [], [data]);
  const answers = useMemo(() => data?.answers || [], [data]);

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
  const wrongCount = Math.max(0, total - correctCount);

  const tone = toneForPercent(percent);
  const advice = getAdviceForPercent(percent);

  const filteredQs = useMemo(() => {
    if (filter === "all") return questions;
    if (filter === "correct") {
      return questions.filter((q) => {
        const my = answersMap.get(q.id);
        const correct = (q.options || []).find((o) => o.is_correct);
        return correct && correct.id === my;
      });
    }
    // wrong
    return questions.filter((q) => {
      const my = answersMap.get(q.id);
      const correct = (q.options || []).find((o) => o.is_correct);
      return !(correct && correct.id === my);
    });
  }, [filter, questions, answersMap]);

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
          {/* ====== Summary / Header ====== */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
            <div className="grid items-center gap-6 sm:grid-cols-[auto,1fr]">
              {/* Progress ring */}
              <div className="mx-auto h-28 w-28 sm:h-32 sm:w-32 relative">
                <div className="absolute inset-0 rounded-full bg-slate-100" />
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: `conic-gradient(var(--tw-gradient-from), var(--tw-gradient-to)) ${
                      percent * 3.6
                    }deg, #e5e7eb ${percent * 3.6}deg`,
                    ["--tw-gradient-from"]: "oklch(0.78 0.12 150)", // fallback
                    ["--tw-gradient-to"]: "oklch(0.64 0.14 142)", // fallback
                  }}
                />
                <div
                  className={`absolute inset-0 rounded-full bg-gradient-to-br ${tone.ring}`}
                  style={{
                    mask: "radial-gradient(circle at 50% 50%, transparent 58%, black 59%)",
                    WebkitMask:
                      "radial-gradient(circle at 50% 50%, transparent 58%, black 59%)",
                  }}
                />
                <div className="absolute inset-0 grid place-items-center">
                  <div className={`text-xl sm:text-2xl font-bold ${tone.text}`}>
                    {percent}%
                  </div>
                </div>
              </div>

              {/* Texts */}
              <div className="grid gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-semibold text-slate-900">
                    Natija
                  </h1>
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
                    Attempt #{data?.attempt?.id ?? attemptId}
                  </span>
                  {data?.test?.title && (
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
                      {data.test.title}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700">
                    <span className="font-medium">To‘g‘ri:</span>
                    <span className="tabular-nums">
                      {fmt(correctCount)}/{fmt(total)}
                    </span>
                    <span className="text-slate-400">({percent}%)</span>
                  </div>
                  <div
                    className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm ${tone.chip}`}
                  >
                    <span>Score:</span>
                    <span className="tabular-nums">{fmt(score)}</span>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700">
                    <span className="font-medium">Xato:</span>
                    <span className="tabular-nums">{fmt(wrongCount)}</span>
                  </div>
                </div>

                {/* Short motivational line */}
                <p className="text-sm text-slate-600">
                  {percent >= 90
                    ? "Ajoyib ish! Nozik detallarni mustahkamlash bilan yanada mukammal bo‘lasiz."
                    : percent >= 70
                    ? "Barqaror poydevor bor — endi nozik mavzularni chuqurlashtirish va tezlik."
                    : percent >= 50
                    ? "Chegarada. Asosiy terminlar va ko‘p uchraydigan vaziyatlarni takrorlang."
                    : "Bosqichma-bosqich mustahkamlab boramiz — quyidagi tavsiyalarni bajaring."}
                </p>
              </div>
            </div>
          </div>

          {/* ====== Advice / Recommendations ====== */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">
              Tavsiyalar (sizning natijangizga mos)
            </h3>
            <ul className="mt-3 grid gap-2 text-sm text-slate-700">
              {advice.map((p, i) => (
                <li
                  key={i}
                  className="rounded-xl bg-slate-50 p-3 ring-1 ring-slate-200"
                >
                  {p}
                </li>
              ))}
            </ul>
          </div>

          {/* ====== Filters ====== */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`rounded-xl border px-3 py-1.5 text-sm ${
                filter === "all"
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-800 border-slate-200 hover:bg-slate-50"
              }`}
            >
              Barchasi
            </button>
            <button
              onClick={() => setFilter("wrong")}
              className={`rounded-xl border px-3 py-1.5 text-sm ${
                filter === "wrong"
                  ? "bg-rose-600 text-white border-rose-600"
                  : "bg-white text-rose-700 border-rose-200 hover:bg-rose-50"
              }`}
            >
              Noto‘g‘ri ({wrongCount})
            </button>
            <button
              onClick={() => setFilter("correct")}
              className={`rounded-xl border px-3 py-1.5 text-sm ${
                filter === "correct"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50"
              }`}
            >
              To‘g‘ri ({correctCount})
            </button>
          </div>

          {/* ====== QA list (filtered) ====== */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">
              Savollar & javoblar
            </h3>

            <div className="mt-4 grid gap-4">
              {filteredQs.map((q, qIdx) => {
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
                      "rounded-2xl border p-4 sm:p-5 transition",
                      isAnswered
                        ? isCorrect
                          ? "border-emerald-200 bg-emerald-50/50"
                          : "border-rose-200 bg-rose-50/50"
                        : "border-slate-200 bg-slate-50/50",
                    ].join(" ")}
                  >
                    {/* Question head */}
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm font-semibold text-slate-800">
                        {qIdx + 1}. Savol
                      </div>
                      <div className="flex items-center gap-2">
                        <span
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
                        </span>
                        {isAnswered && !isCorrect && correctOption && (
                          <span className="rounded-lg bg-emerald-100 px-2 py-1 text-[11px] text-emerald-700 ring-1 ring-emerald-200">
                            To‘g‘ri: #{correctOption.id}
                          </span>
                        )}
                        {isAnswered && (
                          <span className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] text-slate-700 ring-1 ring-slate-200">
                            Sizning: #{myOptionId}
                          </span>
                        )}
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
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : mine
                                ? "bg-rose-100 text-rose-800 border-rose-300"
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

                            {/* Explanations */}
                            {correct && o.explanation && (
                              <div className="mt-1 rounded-lg bg-white/75 p-2 text-xs text-slate-700 ring-1 ring-emerald-200">
                                <span className="font-medium">
                                  Nega to‘g‘ri:
                                </span>{" "}
                                <span className="whitespace-pre-wrap break-words">
                                  {o.explanation}
                                </span>
                              </div>
                            )}
                            {mine && !correct && o.explanation && (
                              <div className="mt-1 rounded-lg bg-white/75 p-2 text-xs text-slate-700 ring-1 ring-rose-200">
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

              {filteredQs.length === 0 && (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-slate-500">
                  Bu filtr bo‘yicha savollar topilmadi.
                </div>
              )}
            </div>

            {/* Back link */}
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                to={
                  cameFromAdmin
                    ? "/dashboard-panel-admin/xyz/my-group"
                    : "/tests"
                }
                className="inline-flex rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
              >
                ← {cameFromAdmin ? "Admin guruhga qaytish" : "Tests"}
              </Link>
            </div>
          </div>
        </div>
      )}
    </Fragment>
  );
};
