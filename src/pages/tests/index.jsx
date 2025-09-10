import { Fragment, useEffect, useMemo, useState } from "react";
import { clientGetRequest } from "../../request";
import { Link } from "react-router-dom";

const fmtSecs = (s) => {
  const m = Math.floor((s || 0) / 60);
  const sec = (s || 0) % 60;
  return `${m}m ${sec}s`;
};

export const Tests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setErr("");
        setLoading(true);
        // your client adds /api/v1 prefix under the hood
        const res = await clientGetRequest("/assessments/tests/list");
        const list = Array.isArray(res?.data)
          ? res.data
          : res?.data?.data ?? [];
        setTests(list);
      } catch (e) {
        setErr(e?.message || "Failed to load tests");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const published = useMemo(() => tests.filter((t) => t.is_published), [tests]);

  return (
    <Fragment>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Tests</h1>
          <p className="text-sm text-gray-500">
            Faqat e’lon qilingan (published) testlar ko‘rsatiladi.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-white p-6 shadow">Yuklanmoqda…</div>
      ) : err ? (
        <div className="rounded-2xl bg-red-50 p-6 text-red-700 ring-1 ring-red-200 shadow">
          {err}
        </div>
      ) : !published.length ? (
        <div className="rounded-2xl border border-dashed p-8 text-center text-gray-500">
          Publish qilingan testlar topilmadi.
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {published.map((t) => (
            <li
              key={t.id}
              className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="line-clamp-2 text-base font-semibold text-gray-900">
                  {t.title}
                </h3>
                <span className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                  {fmtSecs(t.time_limit_sec)}
                </span>
              </div>
              {t.description && (
                <p className="mt-2 line-clamp-3 text-sm text-gray-600">
                  {t.description}
                </p>
              )}

              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  #{t.id} •{" "}
                  {new Date(t.updated_at || t.created_at).toLocaleDateString()}
                </span>
                <Link
                  to={`/tests/${t.id}/start`}
                  className="rounded-xl bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-black"
                >
                  Start
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Fragment>
  );
};
