import { useEffect, useMemo, useState } from "react";
import { LayoutDashboard } from "../../components";
import { useDispatch, useSelector } from "react-redux";
import {
  listGroups,
  addGroup,
  editGroup,
  deleteGroup,
} from "../../redux/slice/groups-slice";
import { Errors } from "../../utils/error";
import { success_notify } from "../../shared/notify";

export const GroupsDashboard = () => {
  const dispatch = useDispatch();
  const { groups = [], loading, error, status } = useSelector((s) => s.groups);

  // UI state
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("created_at"); // "name" | "created_at" | "id"
  const [sortDir, setSortDir] = useState("desc"); // "asc" | "desc"
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Form state
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (status === "idle") dispatch(listGroups());
  }, [dispatch, status]);

  // Derived: filter + sort + paginate
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = q
      ? groups.filter(
          (g) =>
            g.name?.toLowerCase().includes(q) ||
            g.description?.toLowerCase().includes(q) ||
            String(g.id).includes(q)
        )
      : groups;

    const sorted = [...base].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      const av = a[sortKey];
      const bv = b[sortKey];
      if (sortKey === "name") return av.localeCompare(bv) * dir;
      if (sortKey === "created_at") return (new Date(av) - new Date(bv)) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
    return sorted;
  }, [groups, query, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  // Form helpers
  const resetForm = () => {
    setFormData({ name: "", description: "" });
    setFormErrors({});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name?.trim()) errors.name = "Group name is required";
    if (!formData.description?.trim())
      errors.description = "Description is required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // CRUD handlers
  const handleAddGroup = async () => {
    if (!validateForm()) return;
    dispatch(addGroup(formData))
      .unwrap()
      .then((data) => {
        if (data[0]?.id) {
          success_notify("Yangi guruh muvaffaqiyatli qo'shildi!");
          dispatch(listGroups());
        } else {
          Errors(error);
        }
      })
      .catch((err) => {
        Errors(err);
      });
    resetForm();
    setShowAddModal(false);
  };

  const handleEditGroup = async () => {
    if (!validateForm() || !selectedGroup) return;
    dispatch(editGroup({ id: selectedGroup.id, data: formData }))
      .unwrap()
      .then((data) => {
        if (data[0]?.id) {
          success_notify("Admin ma'lumotlari muvaffaqiyatli yangilandi!");
          dispatch(listGroups());
        } else {
          Errors(error);
        }
      })
      .catch((err) => {
        Errors(err);
      });
    setShowEditModal(false);
    setSelectedGroup(null);
  };

  const handleDeleteGroup = async () => {
    if (!selectedGroup) return;
    dispatch(deleteGroup(selectedGroup.id))
      .unwrap()
      .then((data) => {
        if (data[0]?.id) {
          success_notify("Guruh muvaffaqiyatli o'chirildi!");
          dispatch(listGroups());
        } else {
          Errors("Noma'lum xatolik");
        }
      })
      .catch((error) => Errors(error));
    setShowDeleteModal(false);
    setSelectedGroup(null);
  };

  const openEditModal = (group) => {
    setSelectedGroup(group);
    setFormData({ name: group.name, description: group.description });
    setShowEditModal(true);
  };

  const openDeleteModal = (group) => {
    setSelectedGroup(group);
    setShowDeleteModal(true);
  };

  const handleCloseModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedGroup(null);
    resetForm();
  };

  // UI bits
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

  // Loading state
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

  if (error) {
    return (
      <LayoutDashboard>
        <div className="p-6">
          <div className="rounded-xl ring-1 ring-red-200 bg-red-50 text-red-700 px-4 py-3">
            Error: {error}
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
            <h1 className="text-3xl font-semibold tracking-tight">Groups</h1>
            <p className="text-gray-500">
              Create, edit and organize your groups
            </p>
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
                placeholder="Search by name, description or ID…"
                className="w-[260px] rounded-xl ring-1 ring-gray-200 bg-white/60 pl-9 pr-10 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
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
              onClick={() => setShowAddModal(true)}
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
                  d="M12 6v12M6 12h12"
                />
              </svg>
              Add Group
            </button>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white/80 backdrop-blur ring-1 ring-gray-200/60 p-4 shadow-sm">
            <div className="text-xs uppercase text-gray-500">Total</div>
            <div className="mt-1 text-3xl font-semibold">{groups.length}</div>
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
                  <th className="px-6 py-3 text-left font-medium">ID</th>
                  <th className="px-6 py-3 text-left font-medium">
                    <SortButton label="Name" k="name" />
                  </th>
                  <th className="px-6 py-3 text-left font-medium">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left font-medium w-48">
                    <SortButton label="Created" k="created_at" />
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
                      colSpan={5}
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      No groups found
                    </td>
                  </tr>
                ) : (
                  pageData.map((group) => (
                    <tr key={group.id} className="hover:bg-gray-50/60">
                      <td className="px-6 py-4 font-mono text-xs text-gray-500">
                        {group.id}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {group.name}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {group.description}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(group.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(group)}
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
                            onClick={() => openDeleteModal(group)}
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
              No groups found
            </div>
          ) : (
            pageData.map((g) => (
              <div
                key={g.id}
                className="rounded-2xl bg-white/80 backdrop-blur ring-1 ring-gray-200/60 p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xs text-gray-500">#{g.id}</div>
                    <div className="mt-0.5 text-base font-semibold">
                      {g.name}
                    </div>
                  </div>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                    {new Date(g.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600">{g.description}</p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(g)}
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
                    onClick={() => openDeleteModal(g)}
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
        {/* Add Modal */}
        {showAddModal && (
          <Modal onClose={handleCloseModals} title="Add New Group">
            <FormFields
              formData={formData}
              formErrors={formErrors}
              onChange={handleInputChange}
            />
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={handleCloseModals}
                className="rounded-lg border px-4 py-2.5 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAddGroup}
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Add Group
              </button>
            </div>
          </Modal>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <Modal onClose={handleCloseModals} title="Edit Group">
            <FormFields
              formData={formData}
              formErrors={formErrors}
              onChange={handleInputChange}
            />
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={handleCloseModals}
                className="rounded-lg border px-4 py-2.5 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleEditGroup}
                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                Update Group
              </button>
            </div>
          </Modal>
        )}

        {/* Delete Modal */}
        {showDeleteModal && (
          <Modal onClose={handleCloseModals} title="Confirm Deletion">
            <p className="text-gray-700">
              Are you sure you want to delete the group
              <span className="font-semibold"> "{selectedGroup?.name}"</span>?
              This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={handleCloseModals}
                className="rounded-lg border px-4 py-2.5 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteGroup}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete Group
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

const FormFields = ({ formData, formErrors, onChange }) => (
  <div className="space-y-4">
    <div>
      <label
        htmlFor="name"
        className="mb-1 block text-sm font-medium text-gray-700"
      >
        Group Name
      </label>
      <input
        id="name"
        name="name"
        value={formData.name}
        onChange={onChange}
        className={`w-full rounded-xl ring-1 ring-gray-200 bg-white/60 px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
          formErrors.name ? "border-red-400" : ""
        }`}
      />
      {formErrors.name && (
        <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>
      )}
    </div>
    <div>
      <label
        htmlFor="description"
        className="mb-1 block text-sm font-medium text-gray-700"
      >
        Description
      </label>
      <textarea
        id="description"
        name="description"
        rows={3}
        value={formData.description}
        onChange={onChange}
        className={`w-full resize-y rounded-xl ring-1 ring-gray-200 bg-white/60 px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
          formErrors.description ? "border-red-400" : ""
        }`}
      />
      {formErrors.description && (
        <p className="mt-1 text-xs text-red-600">{formErrors.description}</p>
      )}
    </div>
  </div>
);
