import React, { useState, useRef, useEffect, memo, useCallback } from "react";
import { FILTER_KEYS } from "../MetricsCards/MetricsCards";
import { exportTracesAsCSV } from "../../services/tracesApi";

const FILTER_LABELS = {
  [FILTER_KEYS.FAILED]: "Status is failed",
  [FILTER_KEYS.ANOMALOUS]: "Anomalous runs",
  [FILTER_KEYS.DATA_EXPOSURE]: "Data exposure",
  [FILTER_KEYS.PII]: "Touching PII",
};

const TIME_RANGES = [
  { value: "all", label: "All Time" },
  { value: "1h", label: "Last 1 Hour" },
  { value: "24h", label: "Last 24 Hours" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
];

export const COLUMN_OPTIONS = [
  { key: "traceId", label: "Trace ID" },
  { key: "startTime", label: "Start Time" },
  { key: "duration", label: "Duration" },
  { key: "agent", label: "Agent" },
  { key: "application", label: "Application" },
  { key: "runSteps", label: "Run Steps" },
  { key: "llmCalls", label: "LLM Calls" },
  { key: "toolCalls", label: "Tool Calls" },
  { key: "tokens", label: "Tokens" },
  { key: "dataCategories", label: "Data Categories" },
  { key: "anomalous", label: "Anomalous" },
];

const FiltersBar = memo(
  ({ filters, setFilters, visibleColumns, setVisibleColumns, data = [] }) => {
    const [showTimeDropdown, setShowTimeDropdown] = useState(false);
    const [showColumnSelector, setShowColumnSelector] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const timeRef = useRef(null);
    const columnRef = useRef(null);

    const activeCards = filters.activeCards || [];
    const currentTimeRange =
      TIME_RANGES.find((t) => t.value === (filters.timeRange || "all")) ||
      TIME_RANGES[0];

    useEffect(() => {
      const handleClickOutside = (e) => {
        if (timeRef.current && !timeRef.current.contains(e.target))
          setShowTimeDropdown(false);
        if (columnRef.current && !columnRef.current.contains(e.target))
          setShowColumnSelector(false);
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const removeCardFilter = useCallback(
      (filterKey) => {
          setFilters((prev) => ({
            ...prev,
            page: 1,
          activeCards: (prev.activeCards || []).filter((k) => k !== filterKey),
        }));
      },
      [setFilters]
    );

    const clearAll = useCallback(() => {
      setFilters({
        page: 1,
        limit: 10,
        activeCards: [],
        timeRange: "all",
        search: "",
      });
    }, [setFilters]);

    const handleTimeRangeSelect = useCallback(
      (value) => {
        setFilters((prev) => ({ ...prev, page: 1, timeRange: value }));
        setShowTimeDropdown(false);
      },
      [setFilters]
    );

    const handleSearch = useCallback(
      (e) => {
        setFilters((prev) => ({ ...prev, page: 1, search: e.target.value }));
      },
      [setFilters]
    );

    const handleDownload = useCallback(() => {
      if (data.length > 0) {
        exportTracesAsCSV(data);
      } else {
        // Fallback to JSON export of filters
        const dataStr = JSON.stringify(filters, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "traces-filters.json";
        a.click();
        URL.revokeObjectURL(url);
      }
    }, [filters, data]);

    const toggleColumn = useCallback(
      (columnKey) => {
        setVisibleColumns((prev) => ({
          ...prev,
          [columnKey]: !prev[columnKey],
        }));
      },
      [setVisibleColumns]
    );

    const totalFilters =
      activeCards.length +
      (filters.timeRange && filters.timeRange !== "all" ? 1 : 0);

    return (
      <div className="mb-4" role="region" aria-label="Filters">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by Trace ID (001-025)"
              className="w-full bg-[#12121a] border border-[#2a2a3e] pl-10 pr-4 py-2 rounded-lg text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:border-teal-500"
              value={filters.search || ""}
              onChange={handleSearch}
            />
          </div>

          {/* Time Range */}
          <div className="relative hidden sm:block" ref={timeRef}>
            <button
              onClick={() => setShowTimeDropdown(!showTimeDropdown)}
              className="flex items-center gap-2 bg-[#12121a] border border-[#2a2a3e] px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-[#1a1a28]"
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
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="hidden md:inline">{currentTimeRange.label}</span>
              <svg
                className={`w-4 h-4 transition-transform ${
                  showTimeDropdown ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {showTimeDropdown && (
              <div className="absolute top-full left-0 mt-1 bg-[#12121a] border border-[#2a2a3e] rounded-lg shadow-xl z-50 min-w-[160px]">
                {TIME_RANGES.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => handleTimeRangeSelect(range.value)}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-[#1a1a28] first:rounded-t-lg last:rounded-b-lg ${
                      currentTimeRange.value === range.value
                        ? "text-teal-400 bg-[#1a1a28]"
                        : "text-gray-300"
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="relative bg-[#12121a] border border-[#2a2a3e] p-2 rounded-lg text-gray-300 hover:bg-[#1a1a28] sm:hidden"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            {totalFilters > 0 && (
              <span className="absolute -top-1 -right-1 bg-teal-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {totalFilters}
              </span>
            )}
          </button>

          {/* Desktop Filter Button */}
          <button className="relative hidden sm:flex bg-[#12121a] border border-[#2a2a3e] p-2 rounded-lg text-gray-300 hover:bg-[#1a1a28]">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            {totalFilters > 0 && (
              <span className="absolute -top-1 -right-1 bg-teal-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {totalFilters}
              </span>
            )}
          </button>

          {/* Column Selector */}
          <div className="relative hidden sm:block" ref={columnRef}>
            <button
              onClick={() => setShowColumnSelector(!showColumnSelector)}
              className="bg-[#12121a] border border-[#2a2a3e] p-2 rounded-lg text-gray-300 hover:bg-[#1a1a28]"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            {showColumnSelector && (
              <div className="absolute top-full right-0 mt-1 bg-[#12121a] border border-[#2a2a3e] rounded-lg shadow-xl z-50 p-3 min-w-[180px]">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                  Toggle Columns
                </p>
                {COLUMN_OPTIONS.map((col) => (
                  <label
                    key={col.key}
                    className="flex items-center gap-2 py-1.5 text-sm text-gray-300 hover:text-white cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={visibleColumns[col.key] !== false}
                      onChange={() => toggleColumn(col.key)}
                      className="rounded bg-[#1a1a28] border-[#3a3a5e] text-teal-500 focus:ring-teal-500"
                    />
                    {col.label}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="hidden sm:flex bg-[#12121a] border border-[#2a2a3e] p-2 rounded-lg text-gray-300 hover:bg-[#1a1a28]"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Filters Panel */}
        {showMobileFilters && (
          <div className="sm:hidden mt-3 p-3 bg-[#12121a] border border-[#2a2a3e] rounded-lg space-y-3">
            <div>
              <p className="text-xs text-gray-400 mb-2">Time Range</p>
              <select
                value={filters.timeRange || "all"}
                onChange={(e) => handleTimeRangeSelect(e.target.value)}
                className="w-full bg-[#1a1a28] border border-[#2a2a3e] rounded px-3 py-2 text-sm text-gray-300"
              >
                {TIME_RANGES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 bg-[#1a1a28] border border-[#2a2a3e] p-2 rounded-lg text-gray-300"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Download
            </button>
          </div>
        )}

        {/* Active Filter Chips */}
        {totalFilters > 0 && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {activeCards.map((filterKey) => (
              <span
                key={filterKey}
                className="inline-flex items-center gap-1 bg-[#1a2a2a] border border-teal-600/50 text-teal-400 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm"
              >
                {FILTER_LABELS[filterKey]}
                <button
                  onClick={() => removeCardFilter(filterKey)}
                  className="ml-1 hover:text-teal-200"
                >
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            ))}
            {filters.timeRange && filters.timeRange !== "all" && (
              <span className="inline-flex items-center gap-1 bg-[#1a2a2a] border border-teal-600/50 text-teal-400 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                {currentTimeRange.label}
                <button
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, timeRange: "all" }))
                  }
                  className="ml-1 hover:text-teal-200"
                >
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </span>
            )}
      <button
              onClick={clearAll}
              className="text-teal-400 text-xs sm:text-sm hover:text-teal-300 ml-2"
      >
              Clear all
      </button>
    </div>
        )}
      </div>
    );
  }
  );

FiltersBar.displayName = "FiltersBar";

export default FiltersBar;
