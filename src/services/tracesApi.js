// const BASE_URL = "http://localhost:5000/api/traces";
const BASE_URL = "https://traces-backend.onrender.com/api/traces";
// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithRetry = async (url, options = {}, retries = MAX_RETRIES) => {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return res.json();
  } catch (error) {
    if (retries > 0 && !options.signal?.aborted) {
      await sleep(RETRY_DELAY);
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
};

export const fetchTraces = async (params = {}, signal) => {
  // Clean up params - remove empty values
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(
      ([_, v]) => v !== "" && v !== null && v !== undefined
    )
  );

  const query = new URLSearchParams(cleanParams).toString();
  const url = query ? `${BASE_URL}?${query}` : BASE_URL;

  return fetchWithRetry(url, { signal });
};

export const fetchMetrics = async () => {
  return fetchWithRetry(`${BASE_URL}/metrics`);
};

// Export trace data as CSV
export const exportTracesAsCSV = (traces) => {
  const headers = [
    "ID",
    "Name",
    "Status",
    "Agent",
    "Application",
    "Duration",
    "Timestamp",
    "Anomalous",
    "Sensitive Data",
  ];

  const rows = traces.map((t) => [
    t.id,
    t.name,
    t.status,
    t.agent,
    t.application,
    t.duration,
    t.timestamp,
    t.isAnomalous ? "Yes" : "No",
    t.hasSensitiveData ? "Yes" : "No",
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `traces-export-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
