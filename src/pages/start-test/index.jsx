// import { Fragment, useEffect, useState } from "react";
// import { useNavigate, useParams, Link } from "react-router-dom";
// import { clientPostRequest } from "../../request";
// import { success_notify } from "../../shared/notify";

// export const StartTest = () => {
//   const { id } = useParams();
//   const [err, setErr] = useState("");
//   const [busy, setBusy] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     (async () => {
//       try {
//         setBusy(true);
//         // Backend route per spec: POST /api/tests/:id/start
//         const res = await clientPostRequest(`/attempts/tests/${id}/start`, {});
//         const attempt = res?.data?.attempt || res?.data;
//         if (attempt?.id) {
//           success_notify("Attempt boshlandi!");
//           navigate(`/attempts/${attempt.id}`, { replace: true });
//           return;
//         }
//         setErr("Noto‘g‘ri javob. Attempt ID topilmadi.");
//       } catch (e) {
//         setErr(e?.response?.data?.message || e?.message || "Startda xatolik");
//       } finally {
//         setBusy(false);
//       }
//     })();
//   }, [id, navigate]);

//   return (
//     <Fragment>
//       <div className="rounded-2xl bg-white p-6 shadow">
//         {busy ? (
//           <div>Attempt yaratilmoqda…</div>
//         ) : err ? (
//           <div className="space-y-3">
//             <div className="rounded-xl bg-red-50 p-4 text-red-700 ring-1 ring-red-200">
//               {err}
//             </div>
//             <Link
//               to="/tests"
//               className="inline-flex rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
//             >
//               ← Tests
//             </Link>
//           </div>
//         ) : null}
//       </div>
//     </Fragment>
//   );
// };

// import { Fragment, useEffect, useRef, useState } from "react";
// import { useNavigate, useParams, Link } from "react-router-dom";
// import { clientPostRequest } from "../../request";
// import { success_notify } from "../../shared/notify";

// export const StartTest = () => {
//   const { id } = useParams();
//   const [err, setErr] = useState("");
//   const [busy, setBusy] = useState(true);
//   const navigate = useNavigate();

//   // StrictMode double-effect guard
//   const startedRef = useRef(false);

//   useEffect(() => {
//     if (startedRef.current) return; // second call in StrictMode -> ignore
//     startedRef.current = true;

//     let cancelled = false;

//     (async () => {
//       try {
//         setBusy(true);
//         const res = await clientPostRequest(`/attempts/tests/${id}/start`, {});
//         // backend javobi: { data: attempt }
//         const attempt = res?.data?.data || res?.data?.attempt || res?.data;
//         if (!cancelled && attempt?.id) {
//           success_notify("Attempt boshlandi!");
//           navigate(`/attempts/${attempt.id}`, { replace: true });
//           return;
//         }
//         if (!cancelled) setErr("Noto‘g‘ri javob. Attempt ID topilmadi.");
//       } catch (e) {
//         if (!cancelled) setErr(e?.response?.data?.message || e?.message || "Startda xatolik");
//       } finally {
//         if (!cancelled) setBusy(false);
//       }
//     })();

//     return () => { cancelled = true; };
//   }, [id, navigate]);

//   return (
//     <Fragment>
//       <div className="rounded-2xl bg-white p-6 shadow">
//         {busy ? (
//           <div>Attempt yaratilmoqda…</div>
//         ) : err ? (
//           <div className="space-y-3">
//             <div className="rounded-xl bg-red-50 p-4 text-red-700 ring-1 ring-red-200">
//               {err}
//             </div>
//             <Link
//               to="/tests"
//               className="inline-flex rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
//             >
//               ← Tests
//             </Link>
//           </div>
//         ) : null}
//       </div>
//     </Fragment>
//   );
// };

import { Fragment, useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { clientPostRequest } from "../../request";
import { success_notify } from "../../shared/notify";

export const StartTest = () => {
  const { id } = useParams();
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(true);
  const navigate = useNavigate();

  // Dev StrictMode’da double-runni bloklash
  const startedRef = useRef(false);

  // useEffect(() => {
  //   if (startedRef.current) return;
  //   startedRef.current = true;

  //   let cancelled = false;

  //   (async () => {
  //     try {
  //       setBusy(true);

  //       const raw = await clientPostRequest(`/attempts/tests/${id}/start`, {});
  //       // AXIOS bo‘lsa ko‘pincha raw = { data: { data: attempt } }
  //       // Fetch/custom bo‘lsa ba’zan raw = { data: attempt } yoki bevosita attempt.
  //       // Shuning uchun safety normalize:
  //       const body = raw?.data ?? raw;
  //       const attempt =
  //         (body?.data && body.data.id ? body.data : null) ||
  //         (body?.attempt && body.attempt.id ? body.attempt : null) ||
  //         (body?.id ? body : null);

  //       if (!attempt?.id) {
  //         throw new Error("Server javobida attempt topilmadi");
  //       }

  //       success_notify("Attempt boshlandi!");

  //       navigate(`/attempts/${attempt.id}`, { replace: true });
  //     } catch (e) {
  //       if (!cancelled) {
  //         setErr(e?.response?.data?.message || e?.message || "Startda xatolik");
  //         setBusy(false);
  //       }
  //     }
  //   })();

  //   return () => {
  //     cancelled = true;
  //   };
  // }, [id, navigate]);

  useEffect(() => {
    // Guardni id bo‘yicha yuritamiz:
    const startedKeyRef = startedRef; // bor ref'dan foydalanamiz
    if (startedKeyRef.current === id) return;
    startedKeyRef.current = id;

    let cancelled = false;

    (async () => {
      try {
        setBusy(true);

        const raw = await clientPostRequest(`/attempts/tests/${id}/start`, {});
        // Siz ko‘rsatgan payload: { data: { ...attempt } }
        const attempt =
          raw?.data?.data || raw?.data?.attempt || raw?.data || raw;

        if (!attempt?.id) {
          throw new Error("Server javobida attempt topilmadi");
        }

        if (cancelled) return;

        success_notify("Attempt boshlandi!");

        // Unmount bo‘lsa setState/navigate chaqirmaymiz
        if (cancelled) return;

        // Navigatsiya
        navigate(`/attempts/${attempt.id}`, { replace: true });

        // Agar navigate biror sababga ko‘ra o‘tmasa ham spinner qolib ketmasin:
        if (!cancelled) setBusy(false);
      } catch (e) {
        if (!cancelled) {
          setErr(e?.response?.data?.message || e?.message || "Startda xatolik");
          setBusy(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  return (
    <Fragment>
      <div className="rounded-2xl bg-white p-6 shadow">
        {busy ? (
          <div>Attempt yaratilmoqda…</div>
        ) : err ? (
          <div className="space-y-3">
            <div className="rounded-xl bg-red-50 p-4 text-red-700 ring-1 ring-red-200">
              {err}
            </div>
            <Link
              to="/tests"
              className="inline-flex rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
            >
              ← Tests
            </Link>
          </div>
        ) : null}
      </div>
    </Fragment>
  );
};
