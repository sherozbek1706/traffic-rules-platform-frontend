import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { clientGetRequest } from "../../request/";
import { NavbarStudent } from "../";

export const LayoutStudent = () => {
  const [me, setMe] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await clientGetRequest("/students/profile");
        if (res?.data) setMe(res.data);
      } catch {
        // profil bo'lmasa ham sahifa ochiladi
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarStudent me={me} />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
      <footer className="mt-10 border-t border-gray-200 py-6 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} Student Portal
      </footer>
    </div>
  );
};
