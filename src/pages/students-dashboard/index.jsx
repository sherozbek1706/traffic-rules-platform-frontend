import { useEffect, useMemo, useState } from "react";
import { LayoutDashboard } from "../../components";
import {
  adminDeleteRequest,
  adminGetRequest,
  adminPutRequest,
} from "../../request";
import { success_notify } from "../../shared/notify";

/** =========================
 *  Students Dashboard (Groups-style UI)
 *  ========================= */
export const StudentsDashboard = () => {
  // Data
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Table state
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("id"); // <-- JS
  const [sortDir, setSortDir] = useState("asc"); // <-- JS
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    phone_number: "",
    group_id: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const fetchList = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await adminGetRequest("/students/list");
      const list = Array.isArray(res?.data)
        ? res.data
        : res?.data?.result ?? [];
      setStudents(list);
    } catch (e) {
      setError(e?.message || "Yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  // Derived: filter + sort + paginate
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? students.filter((r) =>
          [
            r.first_name,
            r.last_name,
            `${r.first_name ?? ""} ${r.last_name ?? ""}`,
            r.username,
            r.phone_number,
            String(r.group_id),
            String(r.id),
          ]
            .filter(Boolean)
            .some((v) => String(v).toLowerCase().includes(q))
        )
      : students;

    const sorted = [...base].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      const av = a?.[sortKey];
      const bv = b?.[sortKey];

      // Numeric-safe compare for id and group_id
      if (sortKey === "id" || sortKey === "group_id") {
        const an = Number(av ?? 0);
        const bn = Number(bv ?? 0);
        return (an - bn) * dir;
      }

      // String compare for names
      return (
        String(av ?? "").localeCompare(String(bv ?? ""), undefined, {
          sensitivity: "base",
        }) * dir
      );
    });

    return sorted;
  }, [students, query, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  // UI helpers
  const SortButton = ({ label, k }) => (
    <button
      onClick={() => {
        if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else {
          setSortKey(k);
          setSortDir("asc");
        }
      }}
      className="inline-flex items-center gap-1 text-left hover:underline"
    >
      <span>{label}</span>
      <span className="text-xs text-gray-400">
        {sortKey === k ? (sortDir === "asc" ? "▲" : "▼") : ""}
      </span>
    </button>
  );

  // Modals open/close
  const openEditModal = (s) => {
    setSelectedStudent(s);
    setFormData({
      first_name: s?.first_name ?? "",
      last_name: s?.last_name ?? "",
      username: s?.username ?? "",
      phone_number: s?.phone_number ?? "",
      group_id: s?.group_id ?? "",
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const openDeleteModal = (s) => {
    setSelectedStudent(s);
    setShowDeleteModal(true);
  };

  const handleCloseModals = () => {
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedStudent(null);
    setFormErrors({});
  };

  // Form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.first_name?.trim())
      errors.first_name = "First name is required";
    if (!formData.last_name?.trim()) errors.last_name = "Last name is required";
    if (!formData.phone_number?.trim())
      errors.phone_number = "Phone number is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // CRUD
  const handleEditStudent = async () => {
    if (!selectedStudent?.id) return;
    if (!validateForm()) return;

    const body = {
      first_name: formData.first_name?.trim(),
      last_name: formData.last_name?.trim(),
      username: formData.username?.trim(),
      phone_number: formData.phone_number?.trim(),
      group_id:
        formData.group_id === "" || formData.group_id === null
          ? null
          : isNaN(Number(formData.group_id))
          ? formData.group_id
          : Number(formData.group_id),
    };

    try {
      const res = await adminPutRequest(
        `/students/edit/${selectedStudent.id}`,
        body
      );
      if (res?.data) {
        success_notify("O‘zgartirildi");
        handleCloseModals();
        fetchList();
      }
    } catch (e) {
      setFormErrors((prev) => ({
        ...prev,
        _global: e?.message || "Yangilashda xatolik",
      }));
    }
  };

  const handleDeleteStudent = async () => {
    if (!selectedStudent?.id) return;
    try {
      const res = await adminDeleteRequest(
        `/students/remove/${selectedStudent.id}`
      );
      if (res?.data) {
        success_notify("O‘chirildi");
        handleCloseModals();
        fetchList();
      }
    } catch (e) {
      setError(e?.message || "O‘chirishda xatolik");
    }
  };

  // Loading state (skeletons)
  if (loading) {
    return (
      <LayoutDashboard>
        <div className="px-6 py-10">
          <div className="h-9 w-48 rounded-lg bg-gray-200 animate-pulse" />
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl ring-1 ring-gray-200/60 p-4">
                <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="mt-3 h-4 w-full bg-gray-100 rounded animate-pulse" />
                <div className="mt-2 h-4 w-2/3 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </LayoutDashboard>
    );
  }

  // Error state
  if (error) {
    return (
      <LayoutDashboard>
        <div className="p-6">
          <div className="rounded-xl ring-1 ring-red-200 bg-red-50 text-red-700 px-4 py-3">
            Error: {error}
          </div>
          <div className="mt-4">
            <button
              onClick={fetchList}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </LayoutDashboard>
    );
  }

  return (
    <LayoutDashboard>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Students</h1>
            <p className="text-gray-500">View, edit and manage students</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                <svg
                  className="h-4 w-4 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"
                  />
                </svg>
              </div>
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by name, username, phone, ID or group…"
                className="w-[300px] rounded-xl ring-1 ring-gray-200 bg-white/60 pl-9 pr-10 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-gray-100"
                >
                  <svg
                    className="h-4 w-4 text-gray-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
            <button
              onClick={fetchList}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2.5 text-sm font-medium text-white shadow-sm ring-1 ring-inset ring-blue-600/20 transition hover:bg-blue-700"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v6h6M20 20v-6h-6"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20 4l-5.5 5.5M4 20l5.5-5.5"
                />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white/80 backdrop-blur ring-1 ring-gray-200/60 p-4 shadow-sm">
            <div className="text-xs uppercase text-gray-500">Total</div>
            <div className="mt-1 text-3xl font-semibold">{students.length}</div>
          </div>
          <div className="rounded-2xl bg-white/80 backdrop-blur ring-1 ring-gray-200/60 p-4 shadow-sm">
            <div className="text-xs uppercase text-gray-500">Visible</div>
            <div className="mt-1 text-3xl font-semibold">{filtered.length}</div>
          </div>
          <div className="rounded-2xl bg-white/80 backdrop-blur ring-1 ring-gray-200/60 p-4 shadow-sm">
            <div className="text-xs uppercase text-gray-500">Page</div>
            <div className="mt-1 text-3xl font-semibold">
              {page}/{totalPages}
            </div>
          </div>
        </div>

        {/* Table (desktop) */}
        <div className="hidden md:block rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/60">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left font-medium w-24">
                    <SortButton label="ID" k="id" />
                  </th>
                  <th className="px-6 py-3 text-left font-medium">
                    <SortButton label="First name" k="first_name" />
                  </th>
                  <th className="px-6 py-3 text-left font-medium">
                    <SortButton label="Last name" k="last_name" />
                  </th>
                  <th className="px-6 py-3 text-left font-medium">Username</th>
                  <th className="px-6 py-3 text-left font-medium">Phone</th>
                  <th className="px-6 py-3 text-left font-medium w-28">
                    <SortButton label="Group" k="group_id" />
                  </th>
                  <th className="px-6 py-3 text-left font-medium w-44">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {pageData.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      Talabalar yo‘q
                    </td>
                  </tr>
                ) : (
                  pageData.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50/60">
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">
                        {s.id}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {s.first_name}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {s.last_name}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {s.username || "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {s.phone_number || "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {s.group_name ?? "-"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(s)}
                            className="inline-flex items-center gap-1.5 rounded-lg ring-1 ring-gray-200/60 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                          >
                            <svg
                              className="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 20h9"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"
                              />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => openDeleteModal(s)}
                            className="inline-flex items-center gap-1.5 rounded-lg ring-1 ring-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                          >
                            <svg
                              className="h-4 w-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 6h18M19 6l-1 13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M10 11v6M14 11v6"
                              />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 text-sm text-gray-600">
            <div>
              Showing {(page - 1) * pageSize + 1}-
              {Math.min(page * pageSize, filtered.length)} of {filtered.length}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg ring-1 ring-gray-300 px-3 py-1.5 disabled:opacity-40"
              >
                Prev
              </button>
              <span className="font-medium">{page}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg ring-1 ring-gray-300 px-3 py-1.5 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Cards (mobile) */}
        <div className="grid md:hidden grid-cols-1 gap-3">
          {pageData.length === 0 ? (
            <div className="rounded-xl border bg-white p-4 text-gray-500 text-center">
              Talabalar yo‘q
            </div>
          ) : (
            pageData.map((s) => (
              <div
                key={s.id}
                className="rounded-2xl bg-white/80 backdrop-blur ring-1 ring-gray-200/60 p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-gray-500">#{s.id}</div>
                    <div className="mt-0.5 text-base font-semibold">
                      {s.first_name} {s.last_name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {s.username || "-"}
                    </div>
                  </div>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                    Group: {s.group_id ?? "-"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Phone: {s.phone_number || "-"}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(s)}
                    className="inline-flex items-center gap-1.5 rounded-lg ring-1 ring-gray-200/60 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 20h9"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"
                      />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => openDeleteModal(s)}
                    className="inline-flex items-center gap-1.5 rounded-lg ring-1 ring-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 6h18M19 6l-1 13a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10 11v6M14 11v6"
                      />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Mobile pagination */}
          <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg ring-1 ring-gray-300 px-3 py-1.5 disabled:opacity-40"
            >
              Prev
            </button>
            <div>
              Page <span className="font-medium">{page}</span> of {totalPages}
            </div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg ring-1 ring-gray-300 px-3 py-1.5 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>

        {/* ===== Modals ===== */}
        {/* Edit Modal */}
        {showEditModal && (
          <Modal onClose={handleCloseModals} title="Edit Student">
            <StudentFormFields
              formData={formData}
              formErrors={formErrors}
              onChange={handleInputChange}
            />
            {formErrors._global && (
              <p className="mt-2 text-sm text-red-600">{formErrors._global}</p>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={handleCloseModals}
                className="rounded-lg border px-4 py-2.5 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleEditStudent}
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Update
              </button>
            </div>
          </Modal>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <Modal onClose={handleCloseModals} title="Confirm Deletion">
            <p className="text-gray-700">
              Are you sure you want to delete the student
              <span className="font-semibold">
                {" "}
                "{selectedStudent?.first_name} {selectedStudent?.last_name}"
              </span>
              ? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={handleCloseModals}
                className="rounded-lg border px-4 py-2.5 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStudent}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </Modal>
        )}
      </div>
    </LayoutDashboard>
  );
};

/* ---------- Reusable UI ---------- */
const Modal = ({ title, children, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md origin-center scale-100 rounded-2xl bg-white/95 backdrop-blur ring-1 ring-gray-200/70 p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100"
          >
            <svg
              className="h-5 w-5 text-gray-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};

const StudentFormFields = ({ formData, formErrors, onChange }) => (
  <div className="grid grid-cols-1 gap-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label
          htmlFor="first_name"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          First name
        </label>
        <input
          id="first_name"
          name="first_name"
          value={formData.first_name}
          onChange={onChange}
          className={`w-full rounded-xl ring-1 ring-gray-200 bg-white/60 px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
            formErrors.first_name ? "border-red-400" : ""
          }`}
        />
        {formErrors.first_name && (
          <p className="mt-1 text-xs text-red-600">{formErrors.first_name}</p>
        )}
      </div>
      <div>
        <label
          htmlFor="last_name"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Last name
        </label>
        <input
          id="last_name"
          name="last_name"
          value={formData.last_name}
          onChange={onChange}
          className={`w-full rounded-xl ring-1 ring-gray-200 bg-white/60 px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
            formErrors.last_name ? "border-red-400" : ""
          }`}
        />
        {formErrors.last_name && (
          <p className="mt-1 text-xs text-red-600">{formErrors.last_name}</p>
        )}
      </div>
    </div>

    <div>
      <label
        htmlFor="phone_number"
        className="mb-1 block text-sm font-medium text-gray-700"
      >
        Phone
      </label>
      <input
        id="phone_number"
        name="phone_number"
        value={formData.phone_number}
        onChange={onChange}
        inputMode="tel"
        className={`w-full rounded-xl ring-1 ring-gray-200 bg-white/60 px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
          formErrors.phone_number ? "border-red-400" : ""
        }`}
      />
      {formErrors.phone_number && (
        <p className="mt-1 text-xs text-red-600">{formErrors.phone_number}</p>
      )}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label
          htmlFor="username"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Username
        </label>
        <input
          id="username"
          name="username"
          value={formData.username}
          onChange={onChange}
          className="w-full rounded-xl ring-1 ring-gray-200 bg-white/60 px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        />
      </div>
      <div>
        <label
          htmlFor="group_id"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Group ID
        </label>
        <input
          id="group_id"
          name="group_id"
          value={formData.group_id}
          onChange={onChange}
          inputMode="numeric"
          className="w-full rounded-xl ring-1 ring-gray-200 bg-white/60 px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        />
      </div>
    </div>
  </div>
);

// StudentDashboard.jsx
// A single-file, modern, responsive Student Dashboard using Tailwind CSS
// Drop into CRA or Next.js. Assumes Tailwind is configured with "class" dark mode.
// Optional tailwind.config.js snippet if needed:
// module.exports = { darkMode: 'class', theme: { extend: {} }, plugins: [] }

// import React, { useEffect, useMemo, useState } from "react";

// /* =========================
//    Dummy Data (realistic)
//    ========================= */
// const KPI = [
//   {
//     id: "enrolled",
//     label: "Courses Enrolled",
//     value: 6,
//     delta: "+1 this month",
//   },
//   { id: "completed", label: "Completed", value: 12, delta: "+3 this quarter" },
//   { id: "avg", label: "Avg. Score", value: "87%", delta: "↑ 2% vs last term" },
//   { id: "pending", label: "Pending Tasks", value: 4, delta: "2 due this week" },
// ];

// const ASSIGNMENTS = [
//   {
//     id: 1,
//     title: "Algebra Problem Set 3",
//     course: "Mathematics I",
//     due: "2025-09-18",
//     progress: 60,
//     status: "In Progress",
//   },
//   {
//     id: 2,
//     title: "Intro to React Lab",
//     course: "Web Dev",
//     due: "2025-09-14",
//     progress: 20,
//     status: "Not Started",
//   },
//   {
//     id: 3,
//     title: "Reading Report - Hamlet",
//     course: "Literature",
//     due: "2025-09-20",
//     progress: 90,
//     status: "In Review",
//   },
//   {
//     id: 4,
//     title: "Physics Lab 2",
//     course: "Physics I",
//     due: "2025-09-16",
//     progress: 40,
//     status: "In Progress",
//   },
//   {
//     id: 5,
//     title: "DB Normalization Quiz",
//     course: "Databases",
//     due: "2025-09-13",
//     progress: 0,
//     status: "Not Started",
//   },
//   {
//     id: 6,
//     title: "UX Case Study",
//     course: "HCI",
//     due: "2025-09-25",
//     progress: 10,
//     status: "Not Started",
//   },
// ];

// const ENROLLMENTS = Array.from({ length: 28 }).map((_, i) => {
//   const courses = [
//     "Mathematics I",
//     "Web Dev",
//     "Physics I",
//     "Databases",
//     "Literature",
//     "HCI",
//     "Operating Systems",
//   ];
//   const names = [
//     "Alice",
//     "Bob",
//     "Charlie",
//     "Diana",
//     "Ethan",
//     "Fatima",
//     "Grace",
//     "Hiro",
//     "Ivan",
//     "Jasmin",
//     "Khan",
//     "Lena",
//   ];
//   const surnames = [
//     "Smith",
//     "Johnson",
//     "Lee",
//     "Kumar",
//     "Wong",
//     "Garcia",
//     "Brown",
//     "Davis",
//     "Martinez",
//     "Miller",
//     "Lopez",
//     "Wilson",
//   ];
//   const course = courses[i % courses.length];
//   const first = names[i % names.length];
//   const last = surnames[(i * 2) % surnames.length];
//   const score = 60 + ((i * 7) % 41); // 60..100
//   const status =
//     score > 85
//       ? "Excellent"
//       : score > 75
//       ? "Good"
//       : score > 65
//       ? "Fair"
//       : "At Risk";
//   return {
//     id: i + 1,
//     student: `${first} ${last}`,
//     course,
//     score,
//     status,
//     updatedAt: `2025-09-${(i % 28) + 1}`.padStart(10, "0"),
//   };
// });

// /* =========================
//    Icons (inline SVG)
//    ========================= */
// const IconLogo = (props) => (
//   <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
//     <path
//       className="fill-current"
//       d="M12 2a10 10 0 1 0 10 10A10.012 10.012 0 0 0 12 2Zm0 18a8 8 0 1 1 8-8 8.009 8.009 0 0 1-8 8Z"
//     />
//     <path
//       className="fill-current"
//       d="M12 6a6 6 0 1 0 6 6 6.007 6.007 0 0 0-6-6Zm0 10a4 4 0 1 1 4-4 4.005 4.005 0 0 1-4 4Z"
//     />
//   </svg>
// );

// const IconHamburger = (props) => (
//   <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
//     <path className="fill-current" d="M3 6h18v2H3zM3 11h18v2H3zM3 16h18v2H3z" />
//   </svg>
// );

// const IconBell = (props) => (
//   <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
//     <path
//       className="fill-current"
//       d="M12 2a6 6 0 0 0-6 6v2.586l-1.707 1.707A1 1 0 0 0 5 14h14a1 1 0 0 0 .707-1.707L18 10.586V8a6 6 0 0 0-6-6Zm0 20a3 3 0 0 0 3-3H9a3 3 0 0 0 3 3Z"
//     />
//   </svg>
// );

// const IconSearch = (props) => (
//   <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
//     <path
//       className="fill-current"
//       d="m21 20-5.2-5.2a7.5 7.5 0 1 0-1.4 1.4L20 21Zm-12.5-5A5.5 5.5 0 1 1 14 9.5 5.5 5.5 0 0 1 8.5 15Z"
//     />
//   </svg>
// );

// const IconChevronDown = (props) => (
//   <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
//     <path
//       className="fill-current"
//       d="M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z"
//     />
//   </svg>
// );

// const IconSun = (props) => (
//   <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
//     <path
//       className="fill-current"
//       d="M6.76 4.84 5.34 3.42 3.92 4.84 5.34 6.26 6.76 4.84zM1 13h3v-2H1v2zm10 10h2v-3h-2v3zM1 5h3V3H1v2zm16.24-.16 1.42-1.42 1.42 1.42-1.42 1.42-1.42-1.42zM20 11v2h3v-2h-3zm-9-8h2V0h-2v3zm6.66 14.34 1.42 1.42 1.42-1.42-1.42-1.42-1.42 1.42zM3.92 19.16l1.42 1.42 1.42-1.42-1.42-1.42-1.42 1.42z"
//     />
//     <circle className="fill-current" cx="12" cy="12" r="5" />
//   </svg>
// );

// const IconMoon = (props) => (
//   <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
//     <path
//       className="fill-current"
//       d="M21.64 13A9 9 0 0 1 11 2.36 9 9 0 1 0 21.64 13Z"
//     />
//   </svg>
// );

// const IconPlus = (props) => (
//   <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
//     <path className="fill-current" d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2h6z" />
//   </svg>
// );

// /* =========================
//    Small Subcomponents
//    ========================= */
// const KpiCard = ({ icon, label, value, delta }) => (
//   <div className="group rounded-2xl border border-gray-200/60 bg-white/70 p-4 shadow-sm backdrop-blur transition hover:shadow-md hover:bg-white dark:bg-gray-800/60 dark:border-gray-700 dark:hover:bg-gray-800">
//     <div className="flex items-center gap-3">
//       <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
//         {icon}
//       </div>
//       <div className="min-w-0">
//         <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
//           {label}
//         </div>
//         <div className="mt-0.5 text-2xl font-semibold text-gray-900 dark:text-gray-100">
//           {value}
//         </div>
//         <div className="text-xs text-emerald-600 dark:text-emerald-400">
//           {delta}
//         </div>
//       </div>
//     </div>
//   </div>
// );

// const ProgressBar = ({ value }) => (
//   <div
//     className="w-full rounded-full bg-gray-200 dark:bg-gray-700 h-2"
//     aria-label="Progress bar"
//   >
//     <div
//       className="h-2 rounded-full bg-blue-600 transition-all dark:bg-blue-500"
//       style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
//       role="progressbar"
//       aria-valuemin={0}
//       aria-valuemax={100}
//       aria-valuenow={value}
//     />
//   </div>
// );

// const ChartPlaceholder = () => (
//   <section
//     aria-label="Performance chart"
//     className="rounded-2xl border border-dashed border-gray-300 bg-white/60 p-4 shadow-sm backdrop-blur dark:bg-gray-800/60 dark:border-gray-700"
//   >
//     <header className="mb-3 flex items-center justify-between">
//       <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
//         Performance Overview
//       </h3>
//       <div className="text-xs text-gray-500 dark:text-gray-400">
//         Last 30 days
//       </div>
//     </header>
//     <div className="grid h-64 place-items-center rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 text-sm text-gray-500 dark:from-gray-900 dark:to-gray-800">
//       {/* Replace with your chart library component, e.g., <YourChart data={...} /> */}
//       <div id="chart" aria-hidden="true">
//         Chart placeholder
//       </div>
//     </div>
//   </section>
// );

// const AssignmentsList = ({ items, onAction }) => (
//   <section
//     aria-labelledby="recent-assignments"
//     className="rounded-2xl border border-gray-200/60 bg-white/70 p-4 shadow-sm backdrop-blur dark:bg-gray-800/60 dark:border-gray-700"
//   >
//     <header className="mb-3 flex items-center justify-between">
//       <h3
//         id="recent-assignments"
//         className="text-sm font-semibold text-gray-900 dark:text-gray-100"
//       >
//         Recent Assignments
//       </h3>
//       <a
//         href="#!"
//         className="text-xs text-blue-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-1 dark:text-blue-400"
//       >
//         View all
//       </a>
//     </header>
//     <ul className="space-y-3">
//       {items.map((a) => (
//         <li
//           key={a.id}
//           className="rounded-xl border border-gray-200/60 p-3 hover:bg-white transition dark:border-gray-700 dark:hover:bg-gray-800"
//         >
//           <div className="flex flex-wrap items-center gap-2">
//             <div className="min-w-0 flex-1">
//               <div className="flex items-center gap-2">
//                 <span className="truncate font-medium text-gray-900 dark:text-gray-100">
//                   {a.title}
//                 </span>
//                 <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
//                   {a.course}
//                 </span>
//               </div>
//               <div className="mt-2">
//                 <ProgressBar value={a.progress} />
//               </div>
//               <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
//                 Due{" "}
//                 <time dateTime={a.due}>
//                   {new Date(a.due).toLocaleDateString()}
//                 </time>{" "}
//                 · Status: {a.status}
//               </div>
//             </div>
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={() => onAction("view", a)}
//                 className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
//               >
//                 View
//               </button>
//               <button
//                 onClick={() => onAction("submit", a)}
//                 className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
//               >
//                 Submit
//               </button>
//             </div>
//           </div>
//         </li>
//       ))}
//     </ul>
//   </section>
// );

// const StatusPill = ({ status }) => {
//   const map = {
//     Excellent:
//       "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
//     Good: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
//     Fair: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
//     "At Risk":
//       "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
//   };
//   return (
//     <span
//       className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
//         map[status] ||
//         "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
//       }`}
//     >
//       {status}
//     </span>
//   );
// };

// const DataTable = ({
//   data,
//   query,
//   page,
//   pageSize,
//   onPageChange,
//   sortKey,
//   sortDir,
//   onSort,
// }) => {
//   const filtered = useMemo(() => {
//     const q = query.trim().toLowerCase();
//     if (!q) return data;
//     return data.filter((r) =>
//       [r.student, r.course, r.status, r.score, r.updatedAt].some((v) =>
//         String(v).toLowerCase().includes(q)
//       )
//     );
//   }, [data, query]);

//   const sorted = useMemo(() => {
//     const arr = [...filtered];
//     arr.sort((a, b) => {
//       const dir = sortDir === "asc" ? 1 : -1;
//       const av = a[sortKey];
//       const bv = b[sortKey];
//       if (typeof av === "number" && typeof bv === "number")
//         return (av - bv) * dir;
//       return String(av).localeCompare(String(bv)) * dir;
//     });
//     return arr;
//   }, [filtered, sortKey, sortDir]);

//   const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
//   const pageData = useMemo(() => {
//     const start = (page - 1) * pageSize;
//     return sorted.slice(start, start + pageSize);
//   }, [sorted, page, pageSize]);

//   return (
//     <section className="rounded-2xl border border-gray-200/60 bg-white/70 p-4 shadow-sm backdrop-blur dark:bg-gray-800/60 dark:border-gray-700">
//       <header className="mb-3 flex items-center justify-between">
//         <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
//           Students / Courses
//         </h3>
//         <div className="text-xs text-gray-500 dark:text-gray-400">
//           Showing {(page - 1) * pageSize + 1}-
//           {Math.min(page * pageSize, sorted.length)} of {sorted.length}
//         </div>
//       </header>

//       {/* Table (sm and up) */}
//       <div className="hidden sm:block overflow-x-auto">
//         <table className="w-full text-sm">
//           <thead className="bg-gray-50 text-gray-600 dark:bg-gray-900/40 dark:text-gray-300">
//             <tr>
//               {[
//                 { key: "id", label: "ID", width: "w-16" },
//                 { key: "student", label: "Student" },
//                 { key: "course", label: "Course" },
//                 { key: "score", label: "Score", width: "w-24" },
//                 { key: "status", label: "Status", width: "w-28" },
//                 { key: "updatedAt", label: "Updated", width: "w-32" },
//               ].map((col) => (
//                 <th
//                   key={col.key}
//                   className={`px-4 py-3 text-left font-medium ${
//                     col.width || ""
//                   }`}
//                 >
//                   <button
//                     onClick={() => onSort(col.key)}
//                     className="inline-flex items-center gap-1 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded px-1"
//                     aria-label={`Sort by ${col.label}`}
//                   >
//                     <span>{col.label}</span>
//                     {sortKey === col.key && (
//                       <span className="text-xs text-gray-400">
//                         {sortDir === "asc" ? "▲" : "▼"}
//                       </span>
//                     )}
//                   </button>
//                 </th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {pageData.length === 0 ? (
//               <tr>
//                 <td
//                   colSpan={6}
//                   className="px-4 py-10 text-center text-gray-500 dark:text-gray-400"
//                 >
//                   No records
//                 </td>
//               </tr>
//             ) : (
//               pageData.map((r) => (
//                 <tr
//                   key={r.id}
//                   className="border-t border-gray-100 hover:bg-gray-50/60 dark:border-gray-700 dark:hover:bg-gray-800"
//                 >
//                   <td className="px-4 py-3 font-mono text-xs text-gray-500">
//                     #{r.id}
//                   </td>
//                   <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
//                     {r.student}
//                   </td>
//                   <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
//                     {r.course}
//                   </td>
//                   <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
//                     {r.score}
//                   </td>
//                   <td className="px-4 py-3">
//                     <StatusPill status={r.status} />
//                   </td>
//                   <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
//                     <time dateTime={r.updatedAt}>
//                       {new Date(r.updatedAt).toLocaleDateString()}
//                     </time>
//                   </td>
//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>
//       </div>

//       {/* Card list (xs) */}
//       <div className="sm:hidden space-y-3">
//         {pageData.length === 0 ? (
//           <div className="rounded-xl border border-gray-200/60 p-4 text-center text-gray-500 dark:border-gray-700 dark:text-gray-400">
//             No records
//           </div>
//         ) : (
//           pageData.map((r) => (
//             <article
//               key={r.id}
//               className="rounded-xl border border-gray-200/60 p-4 dark:border-gray-700"
//             >
//               <div className="flex items-start justify-between gap-3">
//                 <div>
//                   <div className="text-xs text-gray-500 dark:text-gray-400">
//                     #{r.id}
//                   </div>
//                   <h4 className="mt-0.5 text-base font-semibold text-gray-900 dark:text-gray-100">
//                     {r.student}
//                   </h4>
//                   <p className="text-sm text-gray-600 dark:text-gray-300">
//                     {r.course}
//                   </p>
//                 </div>
//                 <StatusPill status={r.status} />
//               </div>
//               <div className="mt-3 flex items-center justify-between text-sm">
//                 <span className="text-gray-700 dark:text-gray-300">
//                   Score: {r.score}
//                 </span>
//                 <time
//                   className="text-gray-500 dark:text-gray-400"
//                   dateTime={r.updatedAt}
//                 >
//                   {new Date(r.updatedAt).toLocaleDateString()}
//                 </time>
//               </div>
//             </article>
//           ))
//         )}
//       </div>

//       {/* Pagination */}
//       <div className="mt-4 flex items-center justify-between text-sm">
//         <div className="text-gray-600 dark:text-gray-400">
//           Page {page} of {totalPages}
//         </div>
//         <div className="flex items-center gap-2">
//           <button
//             onClick={() => onPageChange(Math.max(1, page - 1))}
//             disabled={page === 1}
//             className="rounded-lg border border-gray-300 px-3 py-1.5 disabled:opacity-40 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-600 dark:hover:bg-gray-700"
//           >
//             Prev
//           </button>
//           <button
//             onClick={() => onPageChange(Math.min(totalPages, page + 1))}
//             disabled={page === totalPages}
//             className="rounded-lg border border-gray-300 px-3 py-1.5 disabled:opacity-40 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-600 dark:hover:bg-gray-700"
//           >
//             Next
//           </button>
//         </div>
//       </div>
//     </section>
//   );
// };

// const Sidebar = ({ open, onClose, darkMode }) => {
//   const NavItem = ({ label, active }) => (
//     <a
//       href="#!"
//       className={`group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
//         active
//           ? "bg-blue-600 text-white shadow-sm"
//           : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
//       }`}
//     >
//       <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/30 text-white dark:bg-white/10 dark:text-white">
//         {/* Simple placeholder circle icon */}
//         <svg
//           viewBox="0 0 24 24"
//           className={`h-4 w-4 ${
//             active
//               ? "fill-white"
//               : "fill-current text-gray-500 dark:text-gray-400"
//           }`}
//           aria-hidden="true"
//         >
//           <circle cx="12" cy="12" r="10" />
//         </svg>
//       </span>
//       <span className="truncate">{label}</span>
//     </a>
//   );

//   // Desktop sidebar
//   return (
//     <>
//       <aside className="hidden md:flex md:w-64 md:flex-col md:gap-4 md:border-r md:border-gray-200/70 md:bg-white/70 md:p-4 md:shadow-sm md:backdrop-blur dark:md:bg-gray-900/40 dark:md:border-gray-800">
//         <div className="flex items-center gap-2 px-2">
//           <IconLogo className="h-7 w-7 text-blue-600 dark:text-blue-400" />
//           <span className="font-semibold">AvtoMaktab</span>
//         </div>
//         <div className="mt-4 flex items-center gap-3 rounded-xl border border-gray-200/60 p-3 dark:border-gray-800">
//           <div
//             className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500"
//             aria-hidden="true"
//           />
//           <div className="min-w-0">
//             <div className="truncate text-sm font-medium">Student User</div>
//             <div className="text-xs text-gray-500 dark:text-gray-400">
//               {darkMode ? "Dark" : "Light"} mode
//             </div>
//           </div>
//         </div>
//         <nav aria-label="Main navigation" className="mt-2 grid gap-1">
//           <NavItem label="Dashboard" active />
//           <NavItem label="Courses" />
//           <NavItem label="Assignments" />
//           <NavItem label="Grades" />
//           <NavItem label="Messages" />
//           <NavItem label="Settings" />
//         </nav>
//         <div className="mt-auto rounded-xl border border-amber-200/60 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
//           Tip: Use the top-right switch to toggle dark mode.
//         </div>
//       </aside>

//       {/* Mobile overlay sidebar */}
//       <div
//         className={`${
//           open ? "pointer-events-auto" : "pointer-events-none"
//         } fixed inset-0 z-40 md:hidden`}
//         aria-hidden={!open}
//       >
//         <div
//           className={`${
//             open ? "opacity-100" : "opacity-0"
//           } absolute inset-0 bg-black/40 transition-opacity`}
//           onClick={onClose}
//         />
//         <div
//           role="dialog"
//           aria-modal="true"
//           aria-label="Mobile navigation"
//           className={`${
//             open ? "translate-x-0" : "-translate-x-full"
//           } absolute left-0 top-0 h-full w-72 transform bg-white p-4 shadow-xl transition dark:bg-gray-900`}
//         >
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <IconLogo className="h-7 w-7 text-blue-600 dark:text-blue-400" />
//               <span className="font-semibold">AvtoMaktab</span>
//             </div>
//             <button
//               onClick={onClose}
//               className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-gray-300 dark:hover:bg-gray-800"
//               aria-label="Close sidebar"
//             >
//               ✕
//             </button>
//           </div>
//           <nav className="mt-4 grid gap-1">
//             {[
//               "Dashboard",
//               "Courses",
//               "Assignments",
//               "Grades",
//               "Messages",
//               "Settings",
//             ].map((l, i) => (
//               <a
//                 key={l}
//                 href="#!"
//                 className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
//                   i === 0
//                     ? "bg-blue-600 text-white shadow-sm"
//                     : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
//                 }`}
//               >
//                 <span className="grid h-8 w-8 place-items-center rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
//                   <svg
//                     viewBox="0 0 24 24"
//                     className="h-4 w-4 fill-current"
//                     aria-hidden="true"
//                   >
//                     <circle cx="12" cy="12" r="10" />
//                   </svg>
//                 </span>
//                 <span className="truncate">{l}</span>
//               </a>
//             ))}
//           </nav>
//         </div>
//       </div>
//     </>
//   );
// };

// const Topbar = ({
//   onToggleSidebar,
//   query,
//   setQuery,
//   darkMode,
//   setDarkMode,
// }) => {
//   const [menuOpen, setMenuOpen] = useState(false);
//   return (
//     <header className="sticky top-0 z-30 border-b border-gray-200/60 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-900/40 dark:border-gray-800">
//       <div className="mx-auto flex max-w-screen-2xl items-center gap-3 px-4 py-3">
//         <button
//           onClick={onToggleSidebar}
//           className="md:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-gray-300 dark:hover:bg-gray-800"
//           aria-label="Open sidebar"
//         >
//           <IconHamburger className="h-5 w-5" />
//         </button>

//         <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
//           Student Dashboard
//         </h1>

//         <form
//           className="ml-auto flex items-center gap-2 rounded-xl border border-gray-300 bg-white/80 px-3 py-1.5 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 dark:border-gray-700 dark:bg-gray-800"
//           role="search"
//           onSubmit={(e) => e.preventDefault()}
//         >
//           <IconSearch className="h-4 w-4 text-gray-400" />
//           <label htmlFor="topbar-search" className="sr-only">
//             Search
//           </label>
//           <input
//             id="topbar-search"
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             placeholder="Search students, courses…"
//             className="w-44 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none dark:text-gray-200"
//           />
//         </form>

//         <button
//           onClick={() => setDarkMode((d) => !d)}
//           className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-gray-300 dark:hover:bg-gray-800"
//           aria-label="Toggle dark mode"
//         >
//           {darkMode ? (
//             <IconSun className="h-5 w-5" />
//           ) : (
//             <IconMoon className="h-5 w-5" />
//           )}
//         </button>

//         <button
//           className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-gray-300 dark:hover:bg-gray-800"
//           aria-label="Notifications"
//         >
//           <IconBell className="h-5 w-5" />
//           <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-4 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-semibold text-white">
//             3
//           </span>
//         </button>

//         <div className="relative">
//           <button
//             onClick={() => setMenuOpen((o) => !o)}
//             aria-haspopup="menu"
//             aria-expanded={menuOpen}
//             className="flex items-center gap-2 rounded-lg p-1.5 pr-2 text-left hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-gray-800"
//           >
//             <span
//               className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500"
//               aria-hidden="true"
//             />
//             <span className="hidden text-sm font-medium text-gray-900 dark:text-gray-100 sm:block">
//               Student
//             </span>
//             <IconChevronDown className="hidden h-4 w-4 text-gray-400 sm:block" />
//           </button>
//           {menuOpen && (
//             <div
//               role="menu"
//               tabIndex={-1}
//               className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-gray-200/70 bg-white shadow-lg dark:border-gray-800 dark:bg-gray-900"
//             >
//               <a
//                 href="#!"
//                 role="menuitem"
//                 className="block px-3 py-2 text-sm hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-gray-800"
//               >
//                 Profile
//               </a>
//               <a
//                 href="#!"
//                 role="menuitem"
//                 className="block px-3 py-2 text-sm hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-gray-800"
//               >
//                 Settings
//               </a>
//               <a
//                 href="#!"
//                 role="menuitem"
//                 className="block px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:hover:bg-rose-500/10"
//               >
//                 Sign out
//               </a>
//             </div>
//           )}
//         </div>
//       </div>
//     </header>
//   );
// };

// /* =========================
//    Main Component (default export)
//    ========================= */
// export const StudentsDashboard = () => {
//   const [darkMode, setDarkMode] = useState(false);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [query, setQuery] = useState("");

//   // Table state
//   const [page, setPage] = useState(1);
//   const pageSize = 8;
//   const [sortKey, setSortKey] = useState("id");
//   const [sortDir, setSortDir] = useState("asc");

//   // Reset page on query change
//   useEffect(() => setPage(1), [query]);

//   function handleSort(key) {
//     if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
//     else {
//       setSortKey(key);
//       setSortDir("asc");
//     }
//   }

//   function handleAssignmentAction(action, item) {
//     // Replace with real handlers
//     // eslint-disable-next-line no-alert
//     alert(`${action.toUpperCase()}: ${item.title}`);
//   }

//   return (
//     <div className={darkMode ? "dark" : ""}>
//       <div className="flex min-h-screen bg-gray-50 text-gray-900 antialiased dark:bg-gray-950 dark:text-gray-100">
//         <Sidebar
//           open={sidebarOpen}
//           onClose={() => setSidebarOpen(false)}
//           darkMode={darkMode}
//         />

//         <div className="flex min-h-screen w-0 flex-1 flex-col">
//           <Topbar
//             onToggleSidebar={() => setSidebarOpen(true)}
//             query={query}
//             setQuery={setQuery}
//             darkMode={darkMode}
//             setDarkMode={setDarkMode}
//           />

//           <main className="mx-auto w-full max-w-screen-2xl px-4 py-6">
//             {/* KPI Cards */}
//             <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
//               <KpiCard
//                 icon={
//                   <svg viewBox="0 0 24 24" className="h-5 w-5">
//                     <path
//                       className="fill-current"
//                       d="M4 5h16v2H4zM4 11h10v2H4zM4 17h16v2H4z"
//                     />
//                   </svg>
//                 }
//                 label={KPI[0].label}
//                 value={KPI[0].value}
//                 delta={KPI[0].delta}
//               />
//               <KpiCard
//                 icon={
//                   <svg viewBox="0 0 24 24" className="h-5 w-5">
//                     <path
//                       className="fill-current"
//                       d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"
//                     />
//                   </svg>
//                 }
//                 label={KPI[1].label}
//                 value={KPI[1].value}
//                 delta={KPI[1].delta}
//               />
//               <KpiCard
//                 icon={
//                   <svg viewBox="0 0 24 24" className="h-5 w-5">
//                     <path
//                       className="fill-current"
//                       d="M3 17h2a7 7 0 0 0 14 0h2a9 9 0 0 1-18 0zM12 2a7 7 0 0 1 7 7h-2a5 5 0 1 0-10 0H5a7 7 0 0 1 7-7z"
//                     />
//                   </svg>
//                 }
//                 label={KPI[2].label}
//                 value={KPI[2].value}
//                 delta={KPI[2].delta}
//               />
//               <KpiCard
//                 icon={
//                   <svg viewBox="0 0 24 24" className="h-5 w-5">
//                     <path
//                       className="fill-current"
//                       d="M7 3h10v2H7zM5 7h14v2H5zM3 11h18v2H3zM7 15h10v2H7zM9 19h6v2H9z"
//                     />
//                   </svg>
//                 }
//                 label={KPI[3].label}
//                 value={KPI[3].value}
//                 delta={KPI[3].delta}
//               />
//             </section>

//             {/* Content Grid */}
//             <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
//               <div className="lg:col-span-2">
//                 <ChartPlaceholder />
//               </div>
//               <div>
//                 <AssignmentsList
//                   items={ASSIGNMENTS.slice(0, 6)}
//                   onAction={handleAssignmentAction}
//                 />
//               </div>
//             </section>

//             {/* Data Table */}
//             <section className="mt-6">
//               <DataTable
//                 data={ENROLLMENTS}
//                 query={query}
//                 page={page}
//                 pageSize={pageSize}
//                 onPageChange={setPage}
//                 sortKey={sortKey}
//                 sortDir={sortDir}
//                 onSort={handleSort}
//               />
//             </section>
//           </main>
//         </div>

//         {/* Floating Action Button */}
//         <button
//           className="fixed bottom-5 right-5 inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
//           aria-label="Add new assignment"
//           onClick={() => alert("Create a new assignment")}
//         >
//           <IconPlus className="h-5 w-5" />
//           <span className="hidden sm:inline">New Assignment</span>
//         </button>
//       </div>
//     </div>
//   );
// };
