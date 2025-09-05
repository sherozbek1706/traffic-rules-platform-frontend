// ================================
// src/services/groupAdmin.service.js
// Works with your axios helpers. If your helpers live elsewhere, adjust the import path.
// Base URL is assumed to be /api/v1 on adminAxiosInstance, so paths here are /admin/*
// ================================
import {
  adminGetRequest,
  adminPostRequest,
  adminDeleteRequest,
} from "../../request";

export const listGroupAdmins = (config) =>
  adminGetRequest("/admin/list-group-admins", config);
export const addAdminToGroup = (payload, config) =>
  adminPostRequest("/admin/add-admin-to-group", payload, config);
export const removeAdminGroup = (id, config) =>
  adminDeleteRequest(`/admin/remove-admin-groups/${id}`, config);

// ================================
// src/pages/GroupAdminAssignment.jsx
// Modern UI + fully working filters, searches, delete
// Uses Redux lists: admins (state.admin) & groups (state.groups)
// ================================
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LayoutDashboard } from "../../components";
import { listAdmin } from "../../redux/slice/admin-slice";
import { listGroups } from "../../redux/slice/groups-slice";

import { Errors } from "../../utils/error";
import { success_notify } from "../../shared/notify";

export const GroupAdminsDashboard = () => {
  const dispatch = useDispatch();
  const {
    admins = [],
    status: adminStatus,
    loading: adminLoading,
  } = useSelector((s) => s.admin);
  const {
    groups = [],
    status: groupStatus,
    loading: groupLoading,
  } = useSelector((s) => s.groups);

  // UI state
  const [selectedGroupId, setSelectedGroupId] = useState("all");
  const [selectedAdminId, setSelectedAdminId] = useState("");
  const [adminQuery, setAdminQuery] = useState(""); // for admin select filtering

  // assignment list filter/search/sort
  const [assignmentQuery, setAssignmentQuery] = useState("");
  const [sortKey, setSortKey] = useState("admin"); // "admin" | "group"
  const [sortDir, setSortDir] = useState("asc"); // "asc" | "desc"

  // assignments data
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);

  // initial data
  useEffect(() => {
    if (adminStatus === "idle") dispatch(listAdmin());
    if (groupStatus === "idle") dispatch(listGroups());
  }, [dispatch, adminStatus, groupStatus]);

  useEffect(() => {
    refreshAssignments();
  }, []);

  const refreshAssignments = async () => {
    try {
      setLoading(true);
      const res = await listGroupAdmins();
      setAssignments(Array.isArray(res) ? res : res?.data || []);
    } catch (e) {
      Errors(e);
    } finally {
      setLoading(false);
    }
  };

  // derived: quick maps
  const groupMap = useMemo(
    () => Object.fromEntries(groups.map((g) => [String(g.id), g])),
    [groups]
  );
  const adminMap = useMemo(
    () => Object.fromEntries(admins.map((a) => [String(a.id), a])),
    [admins]
  );

  // filter admins for select by query
  const adminOptions = useMemo(() => {
    const q = adminQuery.trim().toLowerCase();
    if (!q) return admins;
    return admins.filter((a) =>
      [a.first_name, a.last_name, a.username, a.phone_number]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [admins, adminQuery]);

  // normalize assignments for table
  const tableData = useMemo(() => {
    const base = assignments.map((x) => {
      const g = x.group || groupMap[String(x.group_id)] || {};
      const a = x.admin || adminMap[String(x.admin_id)] || {};
      return {
        id: x.id ?? `${x.group_id}-${x.admin_id}`,
        group_id: x.group_id ?? g.id,
        group_name: g.name ?? x.group_name ?? `Group #${x.group_id}`,
        admin_id: x.admin_id ?? a.id,
        admin_name:
          [a.first_name, a.last_name].filter(Boolean).join(" ") ||
          x.admin_name ||
          `@${a.username || x.username || "unknown"}`,
        username: a.username || x.username || "",
      };
    });

    // group filter (dropdown at top-left)
    const grouped =
      selectedGroupId === "all"
        ? base
        : base.filter((r) => String(r.group_id) === String(selectedGroupId));

    // assignment search: admin_name / username / group_name
    const q = assignmentQuery.trim().toLowerCase();
    const searched = q
      ? grouped.filter((r) =>
          [r.admin_name, r.username, r.group_name]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(q)
        )
      : grouped;

    // sort by admin or group
    const dir = sortDir === "asc" ? 1 : -1;
    const sorted = [...searched].sort((a, b) => {
      const ka = sortKey === "admin" ? a.admin_name || "" : a.group_name || "";
      const kb = sortKey === "admin" ? b.admin_name || "" : b.group_name || "";
      return ka.localeCompare(kb) * dir;
    });

    return sorted;
  }, [
    assignments,
    selectedGroupId,
    assignmentQuery,
    sortKey,
    sortDir,
    groupMap,
    adminMap,
  ]);

  // actions
  const handleAssign = async () => {
    if (!selectedGroupId || selectedGroupId === "all")
      return Errors("Guruh tanlang");
    if (!selectedAdminId) return Errors("Admin tanlang");

    // prevent client-side duplicates
    const exists = assignments.some(
      (x) =>
        String(x.group_id) === String(selectedGroupId) &&
        String(x.admin_id) === String(selectedAdminId)
    );
    if (exists)
      return Errors("Bu admin ushbu guruhga allaqachon biriktirilgan");

    try {
      setLoading(true);
      await addAdminToGroup({
        group_id: String(selectedGroupId),
        admin_id: String(selectedAdminId),
      });
      success_notify("Admin guruhga biriktirildi");
      setSelectedAdminId("");
      await refreshAssignments();
    } catch (e) {
      Errors(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (row) => {
    const assignmentId = row.id;
    if (!assignmentId) return Errors("Noto'g'ri bog'lanish ID");
    if (!window.confirm("Biriktirishni olib tashlamoqchimisiz?")) return;
    try {
      setLoading(true);
      await removeAdminGroup(assignmentId);
      success_notify("Biriktirish o'chirildi");
      await refreshAssignments();
    } catch (e) {
      Errors(e);
    } finally {
      setLoading(false);
    }
  };

  // loading states
  const busy = loading || adminLoading || groupLoading;

  return (
    <LayoutDashboard>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              Adminlarni Guruhlarga Biriktirish
            </h1>
            <p className="text-gray-500">
              Superadmin guruh yaratadi va shu yerda adminlarni guruhlarga
              tayinlaydi
            </p>
          </div>
          <button
            onClick={refreshAssignments}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-50 px-3.5 py-2.5 text-sm font-medium text-gray-700 ring-1 ring-gray-200/60 hover:bg-gray-100"
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
                d="M4 4v6h6M20 20v-6h-6M20 10a8 8 0 1 0-8 8"
              />
            </svg>
            Yangilash
          </button>
        </div>

        {/* Assign form */}
        <div className="rounded-2xl bg-white/80 backdrop-blur p-5 shadow-sm ring-1 ring-gray-200/60">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Group select */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Guruh
              </label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full rounded-xl ring-1 ring-gray-200 bg-white/60 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                <option value="all">— Barcha guruhlar —</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Admin filter + select */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Admin qidirish
              </label>
              <input
                value={adminQuery}
                onChange={(e) => setAdminQuery(e.target.value)}
                placeholder="Ism, username yoki telefon..."
                className="w-full rounded-xl ring-1 ring-gray-200 bg-white/60 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Admin tanlash
              </label>
              <select
                value={selectedAdminId}
                onChange={(e) => setSelectedAdminId(e.target.value)}
                className="w-full rounded-xl ring-1 ring-gray-200 bg-white/60 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                <option value="">— Adminni tanlang —</option>
                {adminOptions.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.first_name} {a.last_name} @{a.username}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleAssign}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm ring-1 ring-inset ring-blue-600/20 transition hover:bg-blue-700 disabled:opacity-50"
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
              Biriktirish
            </button>
          </div>
        </div>

        {/* Controls for assignments list */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Ro'yxat qidirish:</span>
            <input
              value={assignmentQuery}
              onChange={(e) => setAssignmentQuery(e.target.value)}
              placeholder="Admin, username yoki guruh..."
              className="w-full md:w-[340px] rounded-xl ring-1 ring-gray-200 bg-white/60 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => {
                setSortKey("admin");
                setSortDir((d) =>
                  sortKey === "admin" && d === "asc" ? "desc" : "asc"
                );
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 ring-1 ${
                sortKey === "admin"
                  ? "ring-blue-300 bg-blue-50 text-blue-700"
                  : "ring-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Admin {sortKey === "admin" ? (sortDir === "asc" ? "▲" : "▼") : ""}
            </button>
            <button
              onClick={() => {
                setSortKey("group");
                setSortDir((d) =>
                  sortKey === "group" && d === "asc" ? "desc" : "asc"
                );
              }}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 ring-1 ${
                sortKey === "group"
                  ? "ring-blue-300 bg-blue-50 text-blue-700"
                  : "ring-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Guruh {sortKey === "group" ? (sortDir === "asc" ? "▲" : "▼") : ""}
            </button>
          </div>
        </div>

        {/* Assignments table (desktop) */}
        <div className="hidden md:block rounded-2xl bg-white shadow-sm ring-1 ring-gray-200/60 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-6 py-3 text-left font-semibold uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left font-semibold uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left font-semibold uppercase tracking-wider">
                  Guruh
                </th>
                <th className="px-6 py-3 text-right font-semibold uppercase tracking-wider">
                  Harakatlar
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {busy ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : tableData.length ? (
                tableData.map((r) => (
                  <tr key={r.id} className="group hover:bg-gray-50/70">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {r.admin_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">@{r.username}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 ring-1 ring-gray-200/70">
                        {r.group_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleRemove(r)}
                        className="inline-flex items-center gap-1.5 rounded-lg ring-1 ring-red-300/70 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
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
                        O'chirish
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    Hali biriktirishlar yo'q
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Cards (mobile) */}
        <div className="md:hidden grid grid-cols-1 gap-3">
          {busy ? (
            <div className="rounded-xl ring-1 ring-gray-200/60 bg-white p-6 text-center text-gray-500">
              Yuklanmoqda...
            </div>
          ) : tableData.length ? (
            tableData.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl bg-white/80 backdrop-blur ring-1 ring-gray-200/60 p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold">
                      {r.admin_name}
                    </div>
                    <div className="text-xs text-gray-500">@{r.username}</div>
                    <div className="mt-1">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 ring-1 ring-gray-200/70">
                        {r.group_name}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(r)}
                    className="h-9 rounded-lg ring-1 ring-red-300/70 bg-red-50 px-3 text-xs font-medium text-red-700 hover:bg-red-100"
                  >
                    O'chirish
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-xl ring-1 ring-gray-200/60 bg-white p-6 text-center text-gray-500">
              Hali biriktirishlar yo'q
            </div>
          )}
        </div>
      </div>
    </LayoutDashboard>
  );
};
