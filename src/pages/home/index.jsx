import { useEffect, useState } from "react";
import { clientGetRequest } from "../../request";
import { Link } from "react-router-dom";

export const Home = () => {
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await clientGetRequest("/students/profile");
        if (res?.data) setMe(res.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="grid gap-6">
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow">
        <h1 className="text-xl font-semibold">Assalomu alaykum!</h1>
        <p className="mt-1 text-sm opacity-90">
          Testlardan o‘tish va natijalarni ko‘rish uchun “Tests” bo‘limiga
          o‘ting.
        </p>
        <div className="mt-4">
          <Link
            to="/tests"
            className="inline-flex items-center rounded-xl bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20"
          >
            → Tests
          </Link>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow">
        <h2 className="text-lg font-semibold text-gray-800">Profil</h2>
        {loading ? (
          <div className="mt-4 text-sm text-gray-500">Yuklanmoqda…</div>
        ) : me ? (
          <dl className="mt-4 grid grid-cols-1 gap-3 text-gray-700 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-gray-500">Full name</dt>
              <dd className="font-medium">
                {me.first_name} {me.last_name}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Username</dt>
              <dd className="font-medium">@{me.username}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Phone</dt>
              <dd className="font-medium">{me.phone_number}</dd>
            </div>
            <div>
              <dt className="text-xs text-gray-500">Group ID</dt>
              <dd className="font-medium">{me.group_id ?? "—"}</dd>
            </div>
          </dl>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed p-6 text-center text-sm text-gray-500">
            Xush kelibsiz! Login qiling yoki ro‘yxatdan o‘ting.
          </div>
        )}
      </div>
    </div>
  );
};
