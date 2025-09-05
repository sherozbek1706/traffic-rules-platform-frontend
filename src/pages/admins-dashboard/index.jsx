// src/pages/admins/index.jsx
import React, { useEffect, useMemo, useState } from "react";
import { LayoutDashboard } from "../../components";
import { useDispatch, useSelector } from "react-redux";
import {
  addAdmin,
  listAdmin,
  removeAdmin,
  editAdmin,
} from "../../redux/slice/admin-slice";
import {
  HiOutlineSparkles,
  HiMiniPlus,
  HiMagnifyingGlass,
  HiAdjustmentsHorizontal,
  HiChevronUpDown,
  HiChevronLeft,
  HiChevronRight,
  HiPencilSquare,
  HiTrash,
  HiXMark,
  HiEye,
  HiEyeSlash,
  HiUser,
  HiPhone,
} from "react-icons/hi2";
import { HiStatusOnline, HiStatusOffline } from "react-icons/hi";
import { MdOutlineAdminPanelSettings } from "react-icons/md";
import { RiAdminFill, RiShieldUserFill } from "react-icons/ri";
import { success_notify } from "../../shared/notify";
import { Errors } from "../../utils/error";

export const AdminsDashboard = () => {
  const dispatch = useDispatch();
  const { admins, loading, error, status } = useSelector((s) => s.admin);

  // ---------- Query / Filters ----------
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("all"); // all | admin | super_admin | moderator
  const [stateFilter, setStateFilter] = useState("all"); // all | active | inactive

  // ---------- Sort & Pagination ----------
  const [sortKey, setSortKey] = useState("name"); // name | role | username
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // ---------- Modal (Unified) ----------
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create"); // create | edit
  const [formLoading, setFormLoading] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);

  // ---------- Confirm ----------
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    if (status === "idle") dispatch(listAdmin());
  }, [dispatch, status]);

  // ---------- Derived: KPI ----------
  const total = admins?.length || 0;
  const totalSuper =
    admins?.filter((a) => a.role === "super_admin").length || 0;
  const totalAdmin = admins?.filter((a) => a.role === "admin").length || 0;
  const totalActive = admins?.filter((a) => !a.is_deleted).length || 0;

  // ---------- Derived: Filter + Sort + Paginate ----------
  const filtered = useMemo(() => {
    if (!admins) return [];
    const term = q.trim().toLowerCase();
    let res = admins.filter((a) => {
      const bag = [a.first_name, a.last_name, a.username]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const hit = bag.includes(term) || a.phone_number?.includes(q);
      return hit;
    });
    if (roleFilter !== "all") res = res.filter((a) => a.role === roleFilter);
    if (stateFilter !== "all")
      res = res.filter((a) =>
        stateFilter === "active" ? !a.is_deleted : a.is_deleted
      );

    res.sort((a, b) => {
      const nameA = `${a.first_name || ""} ${a.last_name || ""}`.trim();
      const nameB = `${b.first_name || ""} ${b.last_name || ""}`.trim();
      const map = {
        name: [nameA.toLowerCase(), nameB.toLowerCase()],
        role: [(a.role || "").toLowerCase(), (b.role || "").toLowerCase()],
        username: [
          (a.username || "").toLowerCase(),
          (b.username || "").toLowerCase(),
        ],
      };
      const [av, bv] = map[sortKey] || [nameA, nameB];
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return res;
  }, [admins, q, roleFilter, stateFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  // ---------- Actions ----------
  const refresh = () => dispatch(listAdmin());

  const openCreate = () => {
    setFormMode("create");
    setEditingAdmin(null);
    setFormOpen(true);
  };
  const openEdit = (admin) => {
    setFormMode("edit");
    setEditingAdmin(admin);
    setFormOpen(true);
  };
  const closeForm = () => {
    setFormOpen(false);
    setEditingAdmin(null);
  };

  const askConfirm = (text, action) => {
    setConfirmText(text || "Tasdiqlaysizmi?");
    setConfirmAction(() => action);
    setConfirmOpen(true);
  };
  const runConfirm = () => {
    setConfirmOpen(false);
    if (confirmAction) confirmAction();
  };

  const doDelete = (id) => {
    askConfirm(
      "Adminni o‘chirmoqchimisiz? Bu amalni qaytarib bo‘lmaydi.",
      () => {
        dispatch(removeAdmin(id))
          .unwrap()
          .then((data) => {
            if (data[0]?.id) {
              success_notify("Admin muvaffaqiyatli o‘chirildi!");
              dispatch(listAdmin());
            } else {
              Errors("Noma’lum xatolik");
            }
          })
          .catch((e) => Errors(e));
      }
    );
  };

  // const submitForm = async (payload) => {
  //   setFormLoading(true);
  //   try {
  //     if (formMode === "create") {
  //       await dispatch(addAdmin(payload)).unwrap();
  //       success_notify("Yangi admin qo‘shildi!");
  //     } else {
  //       await dispatch(
  //         editAdmin({ id: editingAdmin.id, data: payload })
  //       ).unwrap();
  //       success_notify("Admin ma’lumotlari yangilandi!");
  //     }
  //     closeForm();
  //     dispatch(listAdmin());
  //   } catch (e) {
  //     Errors(e);
  //   } finally {
  //     setFormLoading(false);
  //   }
  // };

  // ---------- Loading & Error (top-level) ----------

  // const submitForm = async (payload) => {
  //   setFormLoading(true);
  //   try {
  //     if (formMode === "create") {
  //       const data = await dispatch(addAdmin(payload)).unwrap();
  //       // optional additional guard if your API uses a custom shape
  //       if (data?.success === false)
  //         throw new Error(data?.message || "Add failed");
  //       success_notify("Yangi admin qo‘shildi!");
  //     } else {
  //       const data = await dispatch(
  //         editAdmin({ id: editingAdmin.id, data: payload })
  //       ).unwrap();
  //       if (data?.success === false)
  //         throw new Error(data?.message || "Update failed");
  //       success_notify("Admin ma’lumotlari yangilandi!");
  //     }

  //     closeForm(); // only runs on *real* success
  //     dispatch(listAdmin()); // refresh
  //   } catch (e) {
  //     Errors(e); // show backend/validation message
  //     // DO NOT close the form here
  //   } finally {
  //     setFormLoading(false);
  //   }
  // };

  const submitForm = async (payload) => {
    setFormLoading(true);
    try {
      const action =
        formMode === "create"
          ? await dispatch(addAdmin(payload))
          : await dispatch(editAdmin({ id: editingAdmin.id, data: payload }));

      if (
        addAdmin?.rejected?.match?.(action) ||
        editAdmin?.rejected?.match?.(action)
      ) {
        // thunk rejected -> show error, keep modal open
        Errors(action.payload || action.error?.message || "Amal bajarilmadi");
        return;
      }

      // Even if fulfilled, double-check payload shape (soft errors)
      const data = action.payload;
      if (data?.success === false || data?.error) {
        Errors(data?.message || "Amal bajarilmadi");
        return;
      }

      success_notify(
        formMode === "create"
          ? "Yangi admin qo‘shildi!"
          : "Admin ma’lumotlari yangilandi!"
      );
      closeForm();
      dispatch(listAdmin());
    } finally {
      setFormLoading(false);
    }
  };

  const showSkeleton = loading && !admins?.length;
  const showErrorSplash = error && !admins?.length;

  return (
    <LayoutDashboard>
      {/* Header — NeoGlass */}
      <section className="relative mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-white to-slate-50 p-6 shadow-sm">
        <div className="pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="relative z-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-md">
              <HiOutlineSparkles className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Adminlar boshqaruvi
              </h1>
              <p className="text-sm text-slate-600">
                Foydalanuvchi ma’murlarini qidirish, filtrlash va boshqarish.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={refresh}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50"
              title="Yangilash"
            >
              Yangilash
            </button>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-indigo-700 hover:to-violet-700"
            >
              <HiMiniPlus className="h-5 w-5" />
              Yangi admin
            </button>
          </div>
        </div>

        {/* KPI */}
        <div className="relative z-10 mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <KPI
            label="Jami adminlar"
            value={total}
            tone="indigo"
            icon={<RiAdminFill className="h-5 w-5" />}
          />
          <KPI
            label="Super adminlar"
            value={totalSuper}
            tone="violet"
            icon={<MdOutlineAdminPanelSettings className="h-5 w-5" />}
          />
          <KPI
            label="Oddiy adminlar"
            value={totalAdmin}
            tone="cyan"
            icon={<RiShieldUserFill className="h-5 w-5" />}
          />
          <KPI
            label="Faol"
            value={totalActive}
            tone="emerald"
            icon={<HiStatusOnline className="h-5 w-5" />}
          />
        </div>
      </section>

      {/* Toolbar — redesigned (paste over your current sticky toolbar section) */}
      <section className="sticky top-4 z-10 mb-6">
        <div className="rounded-2xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/60">
          {/* Top row: Search + Reset */}
          <div className="flex flex-col gap-3 p-3 md:flex-row md:items-center md:justify-between">
            {/* Search */}
            <div className="flex flex-1 items-center">
              <div className="relative w-full md:max-w-lg">
                <HiMagnifyingGlass
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Qidirish: ism, username yoki telefon…"
                  aria-label="Adminlarni qidirish"
                  className="w-full rounded-xl border border-slate-200 bg-white px-10 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />
                {q ? (
                  <button
                    type="button"
                    onClick={() => {
                      setQ("");
                      setPage(1);
                    }}
                    aria-label="Qidiruvni tozalash"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
                  >
                    <HiXMark className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </div>

            {/* Reset all */}
            <div className="flex items-center gap-2 md:justify-end">
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  setRoleFilter("all");
                  setStateFilter("all");
                  setSortKey("name");
                  setSortDir("asc");
                  setPage(1);
                }}
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                aria-label="Filtr va tartiblarni tiklash"
              >
                Tiklash
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

          {/* Bottom row: Quick Filters + Sort */}
          <div className="grid gap-3 p-3 md:grid-cols-3 md:items-center">
            {/* Role pills */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-slate-500">Role:</span>
              {[
                { id: "all", label: "Barchasi" },
                { id: "super_admin", label: "Super admin" },
                { id: "admin", label: "Admin" },
                { id: "moderator", label: "Moderator" },
              ].map((r) => {
                const active = roleFilter === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setRoleFilter(r.id);
                      setPage(1);
                    }}
                    aria-pressed={active}
                    className={[
                      "rounded-full px-3 py-1.5 text-xs font-semibold transition ring-1",
                      active
                        ? "bg-slate-900 text-white ring-slate-900"
                        : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>

            {/* Status segmented */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-slate-500">
                Holati:
              </span>
              {[
                { id: "all", label: "Barchasi" },
                { id: "active", label: "Faol" },
                { id: "inactive", label: "O‘chirilgan" },
              ].map((s) => {
                const active = stateFilter === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setStateFilter(s.id);
                      setPage(1);
                    }}
                    aria-pressed={active}
                    className={[
                      "rounded-lg px-3 py-1.5 text-xs font-medium transition ring-1",
                      active
                        ? "bg-emerald-600 text-white ring-emerald-600"
                        : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50",
                    ].join(" ")}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>

            {/* Sort control */}
            <div className="flex items-center justify-start gap-2 md:justify-end">
              <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-sm shadow-sm">
                <HiAdjustmentsHorizontal
                  className="h-5 w-5 text-slate-500"
                  aria-hidden="true"
                />
                <label className="sr-only" htmlFor="sort-key">
                  Saralash mezoni
                </label>
                <select
                  id="sort-key"
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value)}
                  className="rounded-md bg-transparent px-1 py-1 outline-none"
                >
                  <option value="name">Ism</option>
                  <option value="username">Username</option>
                  <option value="role">Role</option>
                </select>
                <div className="h-4 w-px bg-slate-200" />
                <button
                  type="button"
                  onClick={() =>
                    setSortDir((d) => (d === "asc" ? "desc" : "asc"))
                  }
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  aria-label={
                    sortDir === "asc" ? "O‘sish bo‘yicha" : "Kamayish bo‘yicha"
                  }
                  title={sortDir === "asc" ? "Asc" : "Desc"}
                >
                  <HiChevronUpDown
                    className={`h-5 w-5 ${
                      sortDir === "asc" ? "" : "rotate-180"
                    } transition`}
                  />
                  {sortDir === "asc" ? "Asc" : "Desc"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      {showSkeleton ? (
        <SkeletonGrid />
      ) : showErrorSplash ? (
        <ErrorSplash message={error} onRetry={refresh} />
      ) : (
        <>
          {/* Table (desktop) */}
          <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-slate-50 text-slate-700">
                <tr>
                  <Th>Admin</Th>
                  <Th className="hidden lg:table-cell">Telefon</Th>
                  <Th>Role</Th>
                  <Th className="hidden sm:table-cell">Holati</Th>
                  <Th align="right">Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pageData.length ? (
                  pageData.map((a) => (
                    <tr key={a.id} className="group hover:bg-slate-50/70">
                      <td className="relative px-5 py-4">
                        <span className="pointer-events-none absolute left-0 top-0 h-full w-[3px] scale-y-0 rounded-r-full bg-indigo-500/70 transition-transform group-hover:scale-y-100" />
                        <div className="flex items-center gap-3">
                          <Avatar name={`${a.first_name} ${a.last_name}`} />
                          <div>
                            <div className="font-medium text-slate-900">
                              {a.first_name} {a.last_name}
                            </div>
                            <div className="text-xs text-slate-500">
                              @{a.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-5 py-4 text-slate-800 lg:table-cell">
                        {a.phone_number}
                      </td>
                      <td className="px-5 py-4">
                        <RoleBadge role={a.role} />
                      </td>
                      <td className="hidden px-5 py-4 sm:table-cell">
                        <StateBadge active={!a.is_deleted} />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <IconButton
                            title="Tahrirlash"
                            tone="amber"
                            onClick={() => openEdit(a)}
                          >
                            <HiPencilSquare className="h-4 w-4" />
                          </IconButton>
                          <IconButton
                            title="O‘chirish"
                            tone="rose"
                            onClick={() => doDelete(a.id)}
                          >
                            <HiTrash className="h-4 w-4" />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-16">
                      <EmptyState />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 text-sm text-slate-600">
              <div>
                Ko‘rsatildi <b>{(page - 1) * pageSize + 1 || 0}</b> —{" "}
                <b>{Math.min(page * pageSize, filtered.length)}</b> /{" "}
                <b>{filtered.length}</b>
              </div>
              <div className="flex items-center gap-1">
                <PagerButton
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <HiChevronLeft className="h-5 w-5" />
                  <span className="hidden sm:inline">Oldingi</span>
                </PagerButton>
                <span className="mx-2 font-medium">
                  {page} / {totalPages}
                </span>
                <PagerButton
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <span className="hidden sm:inline">Keyingi</span>
                  <HiChevronRight className="h-5 w-5" />
                </PagerButton>
              </div>
            </div>
          </div>

          {/* Cards (mobile) */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {pageData.length ? (
              pageData.map((a) => (
                <div
                  key={a.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={`${a.first_name} ${a.last_name}`} />
                      <div>
                        <div className="font-semibold text-slate-900">
                          {a.first_name} {a.last_name}
                        </div>
                        <div className="text-xs text-slate-500">
                          @{a.username}
                        </div>
                        <div className="mt-1 text-xs text-slate-600">
                          {a.phone_number}
                        </div>
                      </div>
                    </div>
                    <RoleBadge role={a.role} />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <StateBadge active={!a.is_deleted} />
                    <div className="flex items-center gap-2">
                      <IconButton
                        title="Tahrirlash"
                        tone="amber"
                        onClick={() => openEdit(a)}
                      >
                        <HiPencilSquare className="h-4 w-4" />
                      </IconButton>
                      <IconButton
                        title="O‘chirish"
                        tone="rose"
                        onClick={() => doDelete(a.id)}
                      >
                        <HiTrash className="h-4 w-4" />
                      </IconButton>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
                <EmptyState />
              </div>
            )}

            {/* Mobile pager */}
            <div className="mt-1 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-2 text-sm text-slate-700">
              <PagerButton
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <HiChevronLeft className="h-5 w-5" /> Oldingi
              </PagerButton>
              <span className="font-medium">
                {page} / {totalPages}
              </span>
              <PagerButton
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Keyingi <HiChevronRight className="h-5 w-5" />
              </PagerButton>
            </div>
          </div>
        </>
      )}

      {/* Unified Add/Edit Modal */}
      <AdminFormModal
        open={formOpen}
        mode={formMode}
        initialData={editingAdmin}
        loading={formLoading}
        onClose={closeForm}
        onSubmit={submitForm}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        text={confirmText}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={runConfirm}
      />

      {/* Floating Add Button */}
      <button
        onClick={openCreate}
        className="fixed bottom-6 right-6 z-20 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-indigo-700 hover:to-violet-700 md:hidden"
      >
        <HiMiniPlus className="h-5 w-5" />
        Yangi admin
      </button>
    </LayoutDashboard>
  );
};

/* ============================== Subcomponents ============================== */

function KPI({ label, value, icon, tone = "indigo" }) {
  const toneMap = {
    indigo: "from-indigo-50 to-indigo-100 text-indigo-700",
    violet: "from-violet-50 to-violet-100 text-violet-700",
    cyan: "from-cyan-50 to-cyan-100 text-cyan-700",
    emerald: "from-emerald-50 to-emerald-100 text-emerald-700",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">
            {label}
          </div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{value}</div>
        </div>
        <div
          className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${toneMap[tone]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function Th({ children, className = "", align = "left" }) {
  return (
    <th
      className={`px-5 py-3 text-${align} text-xs font-semibold uppercase tracking-wide ${className}`}
    >
      {children}
    </th>
  );
}

function IconButton({ children, title, tone = "slate", onClick }) {
  const tones = {
    slate:
      "ring-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:ring-slate-300",
    amber:
      "ring-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:ring-amber-300",
    rose: "ring-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:ring-rose-300",
  };
  return (
    <button
      onClick={onClick}
      title={title}
      className={`inline-flex items-center justify-center rounded-lg p-2 text-sm ring-1 transition ${tones[tone]}`}
      aria-label={title}
    >
      {children}
    </button>
  );
}

function Avatar({ name = "" }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");
  return (
    <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-sm">
      {initials || "A"}
    </div>
  );
}

function RoleBadge({ role }) {
  const map = {
    super_admin: "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white",
    admin: "bg-gradient-to-r from-indigo-600 to-blue-600 text-white",
    moderator: "bg-gradient-to-r from-emerald-600 to-teal-600 text-white",
  };
  const label =
    role === "super_admin" ? "SUPER ADMIN" : (role || "unknown").toUpperCase();
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
        map[role] || "bg-slate-200 text-slate-800"
      }`}
    >
      {label}
    </span>
  );
}

function StateBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${
        active ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
      }`}
    >
      {active ? (
        <>
          <HiStatusOnline className="h-4 w-4" /> Faol
        </>
      ) : (
        <>
          <HiStatusOffline className="h-4 w-4" /> O‘chirilgan
        </>
      )}
    </span>
  );
}

function PagerButton({ children, disabled, onClick }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 animate-pulse rounded-xl bg-slate-200" />
            <div className="flex-1">
              <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
              <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
          <div className="mt-4 h-3 w-full animate-pulse rounded bg-slate-100" />
          <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function ErrorSplash({ message, onRetry }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="max-w-md rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800 shadow-sm">
        <div className="text-lg font-semibold">Xatolik yuz berdi</div>
        <div className="mt-1 text-sm opacity-90">{message}</div>
        <button
          onClick={onRetry}
          className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-rose-700"
        >
          Qayta urinish
        </button>
      </div>
    </div>
  );
}

/* ============================ Unified Modal ============================ */

function AdminFormModal({
  open,
  mode,
  initialData,
  loading,
  onClose,
  onSubmit,
}) {
  const isEdit = mode === "edit";
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    role: "admin",
    phone_number: "",
    username: "",
    password: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [changePw, setChangePw] = useState(true);

  useEffect(() => {
    if (!open) return;
    if (isEdit && initialData) {
      setForm({
        first_name: initialData.first_name || "",
        last_name: initialData.last_name || "",
        role: initialData.role || "admin",
        phone_number: initialData.phone_number || "",
        username: initialData.username || "",
        password: "",
      });
      setChangePw(false);
    } else {
      setForm({
        first_name: "",
        last_name: "",
        role: "admin",
        phone_number: "",
        username: "",
        password: "",
      });
      setChangePw(true);
    }
    setShowPw(false);
  }, [open, isEdit, initialData]);

  if (!open) return null;

  const title = isEdit ? "Adminni tahrirlash" : "Yangi admin qo‘shish";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.first_name.trim() || !form.last_name.trim())
      return Errors("Ism va familiya majburiy!");
    if (!/^\+?\d{9,15}$/.test(form.phone_number))
      return Errors("Telefon raqam noto‘g‘ri formatda!");
    if (!form.username.trim()) return Errors("Username majburiy!");

    if (!isEdit && !form.password) return Errors("Parol majburiy!");
    if (isEdit && changePw && form.password.length < 6)
      return Errors("Yangi parol kamida 6 belgidan iborat bo‘lsin.");

    const payload = {
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      role: form.role,
      phone_number: form.phone_number.trim(),
      username: form.username.trim(),
      ...(isEdit
        ? changePw && form.password
          ? { password: form.password }
          : {}
        : { password: form.password }),
    };

    onSubmit(payload);
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-3 py-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
            aria-label="Close dialog"
          >
            <HiXMark className="h-5 w-5" />
          </button>
        </div>

        {/* Content (scrollable) */}
        <form onSubmit={submit} className="max-h-[70vh] overflow-y-auto p-6">
          <div className="grid gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Ism"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                placeholder="Ism"
                required
                icon={<HiUser className="h-5 w-5 text-slate-400" />}
              />
              <Field
                label="Familiya"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                placeholder="Familiya"
                required
                icon={<HiUser className="h-5 w-5 text-slate-400" />}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                label="Telefon raqam"
                name="phone_number"
                type="tel"
                value={form.phone_number}
                onChange={handleChange}
                placeholder="+998901234567"
                required
                icon={<HiPhone className="h-5 w-5 text-slate-400" />}
              />
              <Field
                label="Username"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="username"
                required
                icon={<HiUser className="h-5 w-5 text-slate-400" />}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-800">
                Role <span className="text-rose-600">*</span>
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                required
              >
                <option value="admin">Admin</option>
                <option value="super_admin">Super admin</option>
                <option value="moderator">Moderator</option>
              </select>
            </div>

            {isEdit ? (
              <div className="grid gap-2 rounded-2xl border border-slate-200 p-3">
                <label className="flex items-center gap-2 text-sm text-slate-800">
                  <input
                    type="checkbox"
                    checked={changePw}
                    onChange={(e) => setChangePw(e.target.checked)}
                  />
                  Parolni o‘zgartirish
                </label>
                {changePw && (
                  <PasswordField
                    value={form.password}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, password: e.target.value }))
                    }
                    show={showPw}
                    onToggle={() => setShowPw((s) => !s)}
                  />
                )}
              </div>
            ) : (
              <PasswordField
                value={form.password}
                onChange={(e) =>
                  setForm((f) => ({ ...f, password: e.target.value }))
                }
                show={showPw}
                onToggle={() => setShowPw((s) => !s)}
                required
              />
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50"
            >
              {loading && (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white" />
              )}
              {isEdit ? "Saqlash" : "Yaratish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, icon, required, className = "", ...props }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium text-slate-800">
        {label} {required && <span className="text-rose-600">*</span>}
      </span>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
            {icon}
          </span>
        )}
        <input
          required={required}
          className={`w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 pl-10 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-200 ${className}`}
          {...props}
        />
      </div>
    </label>
  );
}

function PasswordField({ value, onChange, show, onToggle, required }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium text-slate-800">
        Parol {required && <span className="text-rose-600">*</span>}
      </span>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={onChange}
          required={required}
          minLength={6}
          placeholder="Kamida 6 ta belgi"
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 pr-10 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
          aria-label={show ? "Parolni yashirish" : "Parolni ko‘rsatish"}
        >
          {show ? (
            <HiEyeSlash className="h-5 w-5" />
          ) : (
            <HiEye className="h-5 w-5" />
          )}
        </button>
      </div>
    </label>
  );
}

function ConfirmDialog({ open, text, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Tasdiqlash oynasi"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel?.();
      }}
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
        <div className="text-base font-semibold text-slate-900">Tasdiqlang</div>
        <p className="mt-2 text-sm text-slate-700">{text}</p>
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 transition hover:bg-slate-50"
          >
            Bekor qilish
          </button>
          <button
            onClick={onConfirm}
            className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            Tasdiqlayman
          </button>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-slate-500">
      <RiAdminFill className="mx-auto mb-4 h-14 w-14 text-slate-300" />
      <p className="text-base font-semibold">Adminlar topilmadi</p>
      <p className="text-sm">Qidiruv yoki filtrlarni o‘zgartirib ko‘ring</p>
    </div>
  );
}
