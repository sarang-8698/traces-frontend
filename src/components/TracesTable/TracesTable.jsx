import React, { memo, useMemo } from "react";
import EmptyState from "../EmptyState/EmptyState";

const formatDuration = (ms) => {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
};

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return {
    date: date
      .toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replace(/\//g, "-"),
    time: date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  };
};

const getSeverityBorder = (trace) => {
  if (trace.status === "failed" || trace.isAnomalous)
    return "border-l-4 border-l-red-500";
  if (trace.hasSensitiveData) return "border-l-4 border-l-yellow-500";
  if (trace.status === "success") return "border-l-4 border-l-green-500";
  return "";
};

const StatusIcon = memo(({ status }) =>
  status === "success" ? (
    <span className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
      <svg
        className="w-3 h-3 text-green-500"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    </span>
  ) : (
    <span className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
      <svg
        className="w-3 h-3 text-red-500"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    </span>
  )
);

StatusIcon.displayName = "StatusIcon";

// Mobile Card View
const MobileTraceCard = memo(({ trace, onTraceClick, visibleColumns }) => {
  const { date, time } = formatDate(trace.timestamp);
  const show = (key) => visibleColumns[key] !== false;

  return (
    <div
      className={`bg-[#12121a] rounded-lg border border-[#2a2a3e] p-4 ${getSeverityBorder(
        trace
      )}`}
      onClick={() => onTraceClick?.(trace)}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <StatusIcon status={trace.status} />
          {show("traceId") && (
            <button className="text-teal-400 text-sm font-medium truncate hover:underline">
              {(trace.id || "0f278fc8f57a1a4").substring(0, 12)}...
            </button>
          )}
        </div>
        {show("anomalous") && (
          <span
            className={`px-2 py-0.5 rounded text-xs shrink-0 ${
              trace.isAnomalous
                ? "bg-yellow-500/20 text-yellow-400"
                : "bg-[#1a2a2a] text-teal-400"
            }`}
          >
            {trace.isAnomalous ? "Anomalous" : "Normal"}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {show("agent") && (
          <div>
            <span className="text-gray-500">Agent:</span>
            <span className="text-gray-300 ml-1">{trace.agent}</span>
          </div>
        )}
        {show("application") && (
          <div>
            <span className="text-gray-500">App:</span>
            <span className="text-gray-300 ml-1 truncate">
              {trace.application}
            </span>
          </div>
        )}
        {show("duration") && (
          <div>
            <span className="text-gray-500">Duration:</span>
            <span className="text-gray-300 ml-1">
              {formatDuration(trace.duration)}
            </span>
          </div>
        )}
        {show("startTime") && (
          <div>
            <span className="text-gray-500">Time:</span>
            <span className="text-gray-300 ml-1">
              {date} {time}
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

MobileTraceCard.displayName = "MobileTraceCard";

// Desktop Table Row
const TableRow = memo(({ trace, onTraceClick, visibleColumns }) => {
  const { date, time } = formatDate(trace.timestamp);
  const show = (key) => visibleColumns[key] !== false;

  return (
    <tr
      className={`border-b border-[#1a1a28] hover:bg-[#1a1a28] transition-colors ${getSeverityBorder(
        trace
      )}`}
    >
      <td className="p-2 sm:p-3">
        <input
          type="checkbox"
          className="rounded bg-[#1a1a28] border-[#3a3a5e]"
        />
      </td>
      <td className="p-2 sm:p-3">
        <StatusIcon status={trace.status} />
      </td>
      {show("traceId") && (
        <td className="p-2 sm:p-3">
          <button
            onClick={() => onTraceClick?.(trace)}
            className="text-teal-400 hover:underline text-xs sm:text-sm"
          >
            {(trace.id || "0f278fc8f57a1a4").substring(0, 14)}...
          </button>
        </td>
      )}
      {show("startTime") && (
        <td className="p-2 sm:p-3 text-gray-300 text-xs">
          <div>{date}</div>
          <div className="text-gray-500">{time}</div>
        </td>
      )}
      {show("duration") && (
        <td className="p-2 sm:p-3 text-gray-300 text-xs sm:text-sm">
          {formatDuration(trace.duration)}
        </td>
      )}
      {show("agent") && (
        <td className="p-2 sm:p-3 text-gray-300 text-xs sm:text-sm">
          {trace.agent}
        </td>
      )}
      {show("application") && (
        <td className="p-2 sm:p-3 text-gray-300 text-xs sm:text-sm truncate max-w-[120px]">
          {trace.application}
        </td>
      )}
      {show("runSteps") && (
        <td className="p-2 sm:p-3 text-center text-gray-300 text-xs">
          {trace.runSteps || Math.floor(Math.random() * 10) + 5}
        </td>
      )}
      {show("llmCalls") && (
        <td className="p-2 sm:p-3 text-center text-gray-300 text-xs">
          {trace.llmCalls || Math.floor(Math.random() * 10) + 5}
        </td>
      )}
      {show("toolCalls") && (
        <td className="p-2 sm:p-3 text-center text-gray-300 text-xs">
          {trace.toolCalls || Math.floor(Math.random() * 10) + 5}
        </td>
      )}
      {show("tokens") && (
        <>
          <td className="p-2 sm:p-3 text-center text-gray-300 text-xs">
            {(
              trace.inputTokens || 1500 + Math.floor(Math.random() * 500)
            ).toLocaleString()}
          </td>
          <td className="p-2 sm:p-3 text-center text-gray-300 text-xs">
            {(
              trace.outputTokens || 1500 + Math.floor(Math.random() * 500)
            ).toLocaleString()}
          </td>
        </>
      )}
      {show("dataCategories") && (
        <td className="p-2 sm:p-3">
          <div className="flex gap-1">
            <span className="px-1.5 py-0.5 bg-[#1a1a28] border border-[#2a2a3e] rounded text-[10px] text-gray-400">
              PII
            </span>
            <span className="px-1.5 py-0.5 bg-[#1a1a28] border border-[#2a2a3e] rounded text-[10px] text-gray-400">
              Fin
            </span>
          </div>
        </td>
      )}
      {show("anomalous") && (
        <td className="p-2 sm:p-3 text-center">
          <span
            className={`px-2 py-0.5 rounded text-xs ${
              trace.isAnomalous
                ? "bg-yellow-500/20 text-yellow-400"
                : "bg-[#1a2a2a] text-teal-400"
            }`}
          >
            {trace.isAnomalous ? "Yes" : "No"}
          </span>
        </td>
      )}
    </tr>
  );
});

TableRow.displayName = "TableRow";

const TracesTable = memo(
  ({ data, loading, onTraceClick, visibleColumns = {} }) => {
    const columns = useMemo(() => {
      const show = (key) => visibleColumns[key] !== false;
      const cols = [
        { key: "checkbox", label: "", show: true },
        { key: "status", label: "", show: true },
      ];

      if (show("traceId")) cols.push({ key: "traceId", label: "Trace ID" });
      if (show("startTime"))
        cols.push({ key: "startTime", label: "Start Time" });
      if (show("duration")) cols.push({ key: "duration", label: "Duration" });
      if (show("agent")) cols.push({ key: "agent", label: "Agent" });
      if (show("application"))
        cols.push({ key: "application", label: "Application" });
      if (show("runSteps")) cols.push({ key: "runSteps", label: "Steps" });
      if (show("llmCalls")) cols.push({ key: "llmCalls", label: "LLM" });
      if (show("toolCalls")) cols.push({ key: "toolCalls", label: "Tools" });
      if (show("tokens")) {
        cols.push({ key: "inputTokens", label: "In Tokens" });
        cols.push({ key: "outputTokens", label: "Out Tokens" });
      }
      if (show("dataCategories"))
        cols.push({ key: "dataCategories", label: "Categories" });
      if (show("anomalous")) cols.push({ key: "anomalous", label: "Anom." });

      return cols;
    }, [visibleColumns]);

    if (loading) {
      return (
        <div className="bg-[#12121a] rounded-lg p-8 text-center border border-[#2a2a3e]">
          <div className="animate-spin w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-gray-400 mt-4">Loading traces...</p>
        </div>
      );
    }

    if (!data.length) {
      return (
        <EmptyState
          icon={
            <svg
              className="w-8 h-8 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          }
          title="No traces found"
          description="No activity traces match your current filters. Try adjusting your search or filter criteria."
        />
      );
    }

    return (
      <>
        {/* Mobile View */}
        <div className="md:hidden space-y-3">
          {data.map((trace, i) => (
            <MobileTraceCard
              key={trace.id || i}
              trace={trace}
              onTraceClick={onTraceClick}
              visibleColumns={visibleColumns}
            />
          ))}
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto bg-[#12121a] rounded-lg border border-[#2a2a3e]">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-[#2a2a3e] bg-[#0d0d14]">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="p-2 sm:p-3 text-left font-medium text-[10px] sm:text-xs uppercase tracking-wider whitespace-nowrap"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((trace, i) => (
                <TableRow
                  key={trace.id || i}
                  trace={trace}
                  onTraceClick={onTraceClick}
                  visibleColumns={visibleColumns}
                />
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }
);

TracesTable.displayName = "TracesTable";

export default TracesTable;
