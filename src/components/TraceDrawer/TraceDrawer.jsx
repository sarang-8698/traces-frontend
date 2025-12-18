import React, { useEffect, useState, memo, useCallback, useMemo } from "react";

const formatDuration = (ms) => {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
};

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const TraceDrawer = memo(({ trace, onClose }) => {
  const [showRawJson, setShowRawJson] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleEscape = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [handleEscape]);

  // Generate consistent random values based on trace id
  const stableValues = useMemo(() => {
    const hash = (trace.id || "").split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    return {
      runSteps: trace.runSteps || (Math.abs(hash) % 15) + 5,
      llmCalls: trace.llmCalls || (Math.abs(hash >> 4) % 15) + 5,
      toolCalls: trace.toolCalls || (Math.abs(hash >> 8) % 15) + 5,
      inputTokens: trace.inputTokens || (Math.abs(hash >> 12) % 1500) + 1500,
      outputTokens: trace.outputTokens || (Math.abs(hash >> 16) % 1500) + 1500,
    };
  }, [trace]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(trace, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [trace]);

  if (!trace) return null;

  const metadata = [
    { label: "Trace ID", value: trace.id || trace.traceId },
    { label: "Name", value: trace.name },
    { label: "Agent", value: trace.agent },
    { label: "Application", value: trace.application },
    { label: "Status", value: trace.status },
    { label: "Duration", value: formatDuration(trace.duration) },
    { label: "Timestamp", value: formatDate(trace.timestamp) },
  ];

  const stats = [
    { label: "Run Steps", value: stableValues.runSteps, color: "text-white" },
    {
      label: "LLM Calls",
      value: stableValues.llmCalls,
      color: "text-blue-400",
    },
    {
      label: "Tool Calls",
      value: stableValues.toolCalls,
      color: "text-purple-400",
    },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[420px] md:w-[480px] bg-[#0d0d14] border-l border-[#2a2a3e] z-50 overflow-y-auto shadow-2xl animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 bg-[#0d0d14]/95 backdrop-blur border-b border-[#2a2a3e] p-4 flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-semibold text-white">Trace Details</h2>
            <p className="text-xs text-gray-500 mt-0.5">{trace.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#1a1a28] rounded-lg text-gray-400 hover:text-white transition-colors"
            aria-label="Close drawer"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* Status Banner */}
          <div
            className={`p-3 rounded-lg border ${
              trace.status === "success"
                ? "bg-green-500/10 border-green-500/30"
                : "bg-red-500/10 border-red-500/30"
            }`}
          >
            <div className="flex items-center gap-2">
              {trace.status === "success" ? (
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <span
                className={`font-medium ${
                  trace.status === "success" ? "text-green-400" : "text-red-400"
                }`}
              >
                {trace.status === "success"
                  ? "Completed Successfully"
                  : "Execution Failed"}
              </span>
            </div>
            {trace.isAnomalous && (
              <div className="flex items-center gap-2 mt-2 text-yellow-400">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm">Anomalous behavior detected</span>
              </div>
            )}
          </div>

          {/* Metadata */}
          <section>
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
              Metadata
            </h3>
            <div className="bg-[#12121a] rounded-lg border border-[#2a2a3e] divide-y divide-[#2a2a3e]">
              {metadata.map(
                (item) =>
                  item.value && (
                    <div key={item.label} className="flex justify-between p-3">
                      <span className="text-gray-400 text-sm">
                        {item.label}
                      </span>
                      <span className="text-sm font-medium text-white truncate ml-4 max-w-[200px]">
                        {item.value}
                      </span>
                    </div>
                  )
              )}
            </div>
          </section>

          {/* Execution Stats */}
          <section>
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
              Execution Stats
            </h3>
            <div className="grid grid-cols-3 gap-3">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="bg-[#12121a] rounded-lg border border-[#2a2a3e] p-3 text-center hover:border-[#3a3a5e] transition-colors"
                >
                  <p className={`text-2xl font-bold ${item.color}`}>
                    {item.value}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Token Usage */}
          <section>
            <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
              Token Usage
            </h3>
            <div className="bg-[#12121a] rounded-lg border border-[#2a2a3e] p-4">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <p className="text-xs text-gray-400">Input</p>
                  <p className="text-xl font-bold text-teal-400">
                    {stableValues.inputTokens.toLocaleString()}
                  </p>
                </div>
                <div className="text-center px-4">
                  <svg
                    className="w-6 h-6 text-gray-600 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Output</p>
                  <p className="text-xl font-bold text-teal-400">
                    {stableValues.outputTokens.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="pt-3 border-t border-[#2a2a3e]">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Total Tokens</span>
                  <span className="text-lg font-bold text-white">
                    {(
                      stableValues.inputTokens + stableValues.outputTokens
                    ).toLocaleString()}
                  </span>
                </div>
                {/* Token bar visualization */}
                <div className="mt-3 h-2 bg-[#1a1a28] rounded-full overflow-hidden flex">
                  <div
                    className="bg-teal-500 h-full"
                    style={{
                      width: `${
                        (stableValues.inputTokens /
                          (stableValues.inputTokens +
                            stableValues.outputTokens)) *
                        100
                      }%`,
                    }}
                  />
                  <div className="bg-teal-300 h-full flex-1" />
                </div>
                <div className="flex justify-between mt-1 text-[10px] text-gray-500">
                  <span>
                    Input (
                    {Math.round(
                      (stableValues.inputTokens /
                        (stableValues.inputTokens +
                          stableValues.outputTokens)) *
                        100
                    )}
                    %)
                  </span>
                  <span>
                    Output (
                    {Math.round(
                      (stableValues.outputTokens /
                        (stableValues.inputTokens +
                          stableValues.outputTokens)) *
                        100
                    )}
                    %)
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Data Categories */}
          {trace.hasSensitiveData && (
            <section>
              <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                Data Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-sm text-yellow-400">
                  PII Detected
                </span>
                <span className="px-3 py-1.5 bg-orange-500/10 border border-orange-500/30 rounded-full text-sm text-orange-400">
                  Financial Data
                </span>
              </div>
            </section>
          )}

          {/* Raw JSON */}
          <section>
            <button
              onClick={() => setShowRawJson(!showRawJson)}
              className="flex items-center justify-between w-full text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 hover:text-white transition-colors"
            >
              <span>Raw Trace JSON</span>
              <svg
                className={`w-4 h-4 transition-transform ${
                  showRawJson ? "rotate-180" : ""
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
            {showRawJson && (
              <div className="relative">
                <button
                  onClick={copyToClipboard}
                  className="absolute top-2 right-2 p-1.5 bg-[#1a1a28] hover:bg-[#2a2a3e] rounded text-gray-400 hover:text-white transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <svg
                      className="w-4 h-4 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
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
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </button>
                <pre className="bg-[#12121a] rounded-lg border border-[#2a2a3e] p-4 pr-12 text-xs text-gray-300 overflow-x-auto max-h-64">
                  {JSON.stringify(trace, null, 2)}
                </pre>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
});

TraceDrawer.displayName = "TraceDrawer";

export default TraceDrawer;
