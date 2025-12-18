import React, { memo, useCallback, useMemo } from "react";

const Pagination = memo(({ total, page, limit, setFilters }) => {
  const totalPages = Math.ceil(total / limit);
  const maxVisiblePages = 5;

  const pageNumbers = useMemo(() => {
    const pages = [];
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  }, [page, totalPages]);

  const goToPage = useCallback(
    (p) => {
      setFilters((prev) => ({ ...prev, page: p }));
    },
    [setFilters]
  );

  const handleLimitChange = useCallback(
    (e) => {
      setFilters((prev) => ({
        ...prev,
        limit: Number(e.target.value),
        page: 1,
      }));
    },
    [setFilters]
  );

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
      {/* Show dropdown */}
      <div className="flex items-center gap-2 text-gray-400 text-sm">
        <span className="hidden sm:inline">Show</span>
        <select
          value={limit}
          onChange={handleLimitChange}
          className="bg-[#12121a] border border-[#2a2a3e] rounded px-2 py-1 text-white text-sm"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
        <span className="text-xs text-gray-500">of {total}</span>
      </div>

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {/* First & Prev - hidden on mobile */}
        <button
          onClick={() => goToPage(1)}
          disabled={page === 1}
          className="hidden sm:flex p-1.5 sm:p-2 rounded bg-[#12121a] border border-[#2a2a3e] text-gray-400 hover:bg-[#1a1a28] disabled:opacity-50"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          onClick={() => goToPage(Math.max(1, page - 1))}
          disabled={page === 1}
          className="p-1.5 sm:p-2 rounded bg-[#12121a] border border-[#2a2a3e] text-gray-400 hover:bg-[#1a1a28] disabled:opacity-50"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Page numbers */}
        {pageNumbers.map((num) => (
          <button
            key={num}
            onClick={() => goToPage(num)}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded text-xs sm:text-sm font-medium ${
              page === num
                ? "bg-teal-600 text-white border border-teal-500"
                : "bg-[#12121a] border border-[#2a2a3e] text-gray-400 hover:bg-[#1a1a28]"
            }`}
          >
            {num}
          </button>
        ))}

        <button
          onClick={() => goToPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="p-1.5 sm:p-2 rounded bg-[#12121a] border border-[#2a2a3e] text-gray-400 hover:bg-[#1a1a28] disabled:opacity-50"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        <button
          onClick={() => goToPage(totalPages)}
          disabled={page === totalPages}
          className="hidden sm:flex p-1.5 sm:p-2 rounded bg-[#12121a] border border-[#2a2a3e] text-gray-400 hover:bg-[#1a1a28] disabled:opacity-50"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 5l7 7-7 7M5 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
});

Pagination.displayName = "Pagination";

export default Pagination;
