        </header>

        {/* Stats & Controls */}
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="text-sm text-neutral-500">{total} results</div>
          <div className="flex items-center gap-2">
            <select
              className="rounded-lg border border-neutral-200 bg-white/60 px-3 py-2 text-sm outline-none transition focus:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {[10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}/page
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table / List */}
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <table className="hidden w-full md:table">
            <thead className="bg-neutral-50/60 text-left text-sm text-neutral-500 dark:bg-neutral-900/50">
              <tr>
                <th className="px-4 py-3 font-medium">ID</th>
                <th className="px-4 py-3 font-medium">Content</th>
                <th className="px-4 py-3 font-medium">Image</th>
                <th className="px-4 py-3 font-medium">Options</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-neutral-500"
                  >
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && paged.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-sm text-neutral-500"
                  >
                    No questions
                  </td>
                </tr>
              )}
              {paged.map((q) => (
                <tr
                  key={q.id}
                  className="align-top border-t border-neutral-100 dark:border-neutral-900"
                >
                  <td className="px-4 py-4 font-mono text-xs text-neutral-600 dark:text-neutral-400">
                    {q.id}
                  </td>
                  <td className="px-4 py-4">
                    <div
                      className="line-clamp-3 text-sm text-neutral-800 dark:text-neutral-200"
                      dangerouslySetInnerHTML={{ __html: q.content }}
                    />
                  </td>
                  <td className="px-4 py-4">
                    {q.image_url ? (
                      <img
                        src={q.image_url}
                        alt="question"
                        className="h-16 w-24 rounded-lg object-cover ring-1 ring-black/5"
                      />
                    ) : (
                      <span className="text-sm text-neutral-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <ul className="list-disc space-y-1 pl-5 text-[13px] text-neutral-700 dark:text-neutral-300">
                      {(q.options || []).slice(0, 3).map((o) => (
                        <li
                          key={o.id}
                          className={
                            o.is_correct
                              ? "font-semibold text-emerald-600 dark:text-emerald-400"
                              : ""
                          }
                        >
                          <span
                            dangerouslySetInnerHTML={{ __html: o.content }}
                          />
                          {o.is_correct ? " ✓" : ""}
                        </li>
                      ))}
                      {(q.options || []).length > 3 && <li>…</li>}
                    </ul>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => openEdit(q)}
                        className="inline-flex items-center rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-800 shadow-sm hover:bg-neutral-50 active:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
                      >
                        <EditIcon className="mr-1.5 h-4 w-4" /> Edit
                      </button>
                      <button
                        onClick={() => onDelete(q)}
                        className="inline-flex items-center rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm ring-1 ring-black/5 hover:bg-rose-700 active:bg-rose-800"
                      >
                        <TrashIcon className="mr-1.5 h-4 w-4" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile Cards */}
          <div className="grid gap-3 p-3 md:hidden">
            {loading && <CardSkeleton />}
            {!loading && paged.length === 0 && (
              <div className="rounded-xl border border-neutral-200 bg-white p-5 text-center text-sm text-neutral-500 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
                No questions
              </div>
            )}
            {paged.map((q) => (
              <div
                key={q.id}
                className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono text-xs text-neutral-500">
                    #{q.id}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(q)}
                      className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(q)}
                      className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <div
                    className="text-sm text-neutral-800 dark:text-neutral-200"
                    dangerouslySetInnerHTML={{ __html: q.content }}
                  />
                  {q.image_url && (
                    <img
                      src={q.image_url}
                      className="h-36 w-full rounded-lg object-cover"
                    />
                  )}
                  <ul className="list-disc space-y-1 pl-5 text-[13px] text-neutral-700 dark:text-neutral-300">
                    {(q.options || []).slice(0, 3).map((o) => (
                      <li
                        key={o.id}
                        className={
                          o.is_correct
                            ? "font-semibold text-emerald-600 dark:text-emerald-400"
                            : ""
                        }
                      >
                        <span dangerouslySetInnerHTML={{ __html: o.content }} />
                        {o.is_correct ? " ✓" : ""}
                      </li>
                    ))}
                    {(q.options || []).length > 3 && <li>…</li>}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-1">
          <button
            className="inline-flex items-center rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm shadow-sm disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          {Array.from({ length: pagesCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`h-9 min-w-9 rounded-lg border px-3 text-sm shadow-sm transition ${
                page === i + 1
                  ? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-900"
                  : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            className="inline-flex items-center rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm shadow-sm disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900"
            disabled={page >= pagesCount}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={closeModal}
            />

            <div className="absolute inset-0 grid place-items-center p-4">
              <motion.div
                role="dialog"
                aria-modal
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 24, opacity: 0 }}
                className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl ring-1 ring-black/5 dark:border-neutral-800 dark:bg-neutral-950"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Sticky header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-100 bg-white/70 px-5 py-4 backdrop-blur-md dark:border-neutral-900 dark:bg-neutral-950/70">
                  <h2 className="text-lg font-semibold">
                    {editing ? "Edit Question" : "New Question"}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={closeModal}
                      className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm shadow-sm hover:bg-neutral-50 active:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={onSubmit}
                      disabled={submitting}
                      className="inline-flex items-center rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-sm ring-1 ring-black/5 hover:opacity-95 disabled:opacity-60 dark:bg-white dark:text-neutral-900"
                    >
                      {submitting ? "Saving…" : "Save"}
                    </button>
                  </div>
                </div>

                <div className="max-h-[75vh] w-full overflow-y-auto p-5">
                  <div className="grid gap-5 md:grid-cols-5">
                    {/* Content */}
                    <div className="md:col-span-3 space-y-3">
                      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Content (HTML allowed)
                      </label>
                      <textarea
                        className="min-h-[160px] w-full rounded-xl border border-neutral-200 bg-white/60 p-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-300 focus:shadow-sm focus:shadow-neutral-200 dark:border-neutral-800 dark:bg-neutral-900"
                        value={form.content}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, content: e.target.value }))
                        }
                        placeholder="<p>Your question HTML…</p>"
                      />
                    </div>

                    {/* Image */}
                    <div className="md:col-span-2 space-y-3">
                      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Image (optional)
                      </label>
                      <div className="flex items-center gap-4">
                        <label className="flex h-24 w-full cursor-pointer items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-white/60 text-sm text-neutral-500 transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={onFile}
                            className="hidden"
                          />
                          <span className="px-3 text-center">
                            Drop or click to upload
                          </span>
                        </label>
                        {(form.image_url || editing?.image_url) && (
                          <div className="relative h-24 w-40 overflow-hidden rounded-xl ring-1 ring-black/5">
                            <img
                              src={form.image_url || editing?.image_url}
                              alt="preview"
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Options */}
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        Options
                      </label>
                      <button
                        onClick={addOption}
                        className="inline-flex items-center rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm shadow-sm hover:bg-neutral-50 active:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900"
                      >
                        <PlusIcon className="mr-1.5 h-4 w-4" /> Add option
                      </button>
                    </div>

                    <div className="grid gap-3">
                      {form.options.map((o, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="correct"
                              checked={!!o.is_correct}
                              onChange={() => markCorrect(idx)}
                              className="h-4 w-4 accent-neutral-900"
                            />
                            <span className="text-xs text-neutral-500">
                              Correct
                            </span>
                            <div className="ml-auto flex items-center gap-2">
                              <button
                                onClick={() => removeOption(idx)}
                                disabled={form.options.length <= 2}
                                className="inline-flex items-center rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs shadow-sm disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-950"
                              >
                                <TrashIcon className="mr-1 h-3.5 w-3.5" />{" "}
                                Remove
                              </button>
                            </div>
                          </div>
                          <div className="mt-3 grid gap-2">
                            <textarea
                              className="min-h-[80px] w-full rounded-lg border border-neutral-200 bg-white/60 p-2.5 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-300 focus:shadow-sm focus:shadow-neutral-200 dark:border-neutral-800 dark:bg-neutral-950"
                              placeholder="<p>Option HTML…</p>"
                              value={o.content}
                              onChange={(e) =>
                                setOption(idx, { content: e.target.value })
                              }
                            />
                            <input
                              className="w-full rounded-lg border border-neutral-200 bg-white/60 p-2.5 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-300 focus:shadow-sm focus:shadow-neutral-200 dark:border-neutral-800 dark:bg-neutral-950"
                              placeholder="Explanation (optional)"
                              value={o.explanation || ""}
                              onChange={(e) =>
                                setOption(idx, { explanation: e.target.value })
                              }
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </LayoutDashboard>
  );
};

// ---- Little Components ----
function CardSkeleton() {
  return (
    <div className="animate-pulse space-y-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
      <div className="h-4 w-24 rounded bg-neutral-200/70 dark:bg-neutral-800" />
      <div className="h-4 w-3/4 rounded bg-neutral-200/70 dark:bg-neutral-800" />
      <div className="h-24 w-full rounded bg-neutral-200/70 dark:bg-neutral-800" />
    </div>
  );
}

function SearchIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M21 21l-4.3-4.3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function PlusIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
