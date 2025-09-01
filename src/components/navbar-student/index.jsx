import { Link, useLocation, useNavigate } from "react-router-dom";

export const NavbarStudent = ({ me }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isActive = (p) =>
    pathname === p ? "text-gray-900" : "text-gray-600 hover:text-gray-900";

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-200">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-blue-600 text-white grid place-items-center shadow">
              <span className="font-bold">S</span>
            </div>
            <span className="font-semibold text-gray-900">Student Portal</span>
          </Link>

          <nav className="hidden sm:flex items-center gap-4 text-sm">
            <Link to="/" className={isActive("/")}>
              Home
            </Link>
            <Link to="/tests" className={isActive("/tests")}>
              Tests
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {me ? (
            <>
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-gray-900">
                  {me.first_name} {me.last_name}
                </div>
                <div className="text-xs text-gray-500">@{me.username}</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-gray-200 grid place-items-center text-gray-600">
                {String(me.first_name || "U")[0]}
              </div>
              <button
                onClick={logout}
                className="rounded-xl border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 text-sm">
              <Link
                to="/login"
                className="rounded-xl border border-gray-300 px-3 py-1.5 hover:bg-gray-50"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-gray-900 text-white px-3 py-1.5 hover:bg-gray-800"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
