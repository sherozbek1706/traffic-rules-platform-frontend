import { Fragment, useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { clientPostRequest } from "../../request";
import { success_notify } from "../../shared/notify";

export const StartTest = () => {
  const { id } = useParams();
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        setBusy(true);
        // Backend route per spec: POST /api/tests/:id/start
        const res = await clientPostRequest(`/attempts/tests/${id}/start`, {});
        const attempt = res?.data?.attempt || res?.data;
        if (attempt?.id) {
          success_notify("Attempt boshlandi!");
          navigate(`/attempts/${attempt.id}`, { replace: true });
          return;
        }
        setErr("Noto‘g‘ri javob. Attempt ID topilmadi.");
      } catch (e) {
        setErr(e?.response?.data?.message || e?.message || "Startda xatolik");
      } finally {
        setBusy(false);
      }
    })();
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
