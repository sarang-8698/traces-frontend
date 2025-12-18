import { useEffect, useState, memo, useMemo } from "react";
import { fetchMetrics } from "../../services/tracesApi";

// Filter keys for each card type
export const FILTER_KEYS = {
  FAILED: "failed",
  ANOMALOUS: "anomalous",
  DATA_EXPOSURE: "dataExposure",
  PII: "pii",
};

const CARDS_CONFIG = [
  {
    label: "Failed Runs",
    subtitle: "Runs that failed",
    filterKey: FILTER_KEYS.FAILED,
    metricKey: "failedRuns",
    icon: (
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
    ),
    activeColor: "border-red-500 bg-red-500/10",
    hoverColor: "hover:border-red-500/50",
  },
  {
    label: "Anomalous Runs",
    subtitle: "Detected unusual behaviour",
    filterKey: FILTER_KEYS.ANOMALOUS,
    metricKey: "anomalousRuns",
    icon: (
      <svg
        className="w-5 h-5 text-yellow-500"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
    ),
    activeColor: "border-yellow-500 bg-yellow-500/10",
    hoverColor: "hover:border-yellow-500/50",
  },
  {
    label: "Data Exposure Runs",
    subtitle: "Runs with data exposure",
    filterKey: FILTER_KEYS.DATA_EXPOSURE,
    metricKey: "dataExposureRuns",
    icon: (
      <svg
        className="w-5 h-5 text-cyan-400"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
    ),
    activeColor: "border-cyan-500 bg-cyan-500/10",
    hoverColor: "hover:border-cyan-500/50",
  },
  {
    label: "Runs Touching PII",
    subtitle: "Last 24 Hours",
    filterKey: FILTER_KEYS.PII,
    metricKey: "piiRuns",
    icon: (
      <svg
        className="w-5 h-5 text-cyan-400"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    ),
    activeColor: "border-cyan-500 bg-cyan-500/10",
    hoverColor: "hover:border-cyan-500/50",
  },
];

const MetricCard = memo(({ card, value, isActive, onToggle, isLoading }) => (
  <button
    onClick={() => onToggle(card.filterKey)}
    className={`w-full text-left p-3 sm:p-4 rounded-lg cursor-pointer border transition-all duration-200 select-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-[#0a0a0f]
      ${
        isActive
          ? card.activeColor
          : `bg-[#12121a] border-[#2a2a3e] ${card.hoverColor} hover:bg-[#1a1a28]`
      }`}
    aria-pressed={isActive}
    aria-label={`Filter by ${card.label}`}
  >
    <div className="flex items-start gap-2 sm:gap-3">
      <div className="mt-1 shrink-0">{card.icon}</div>
      <div className="min-w-0">
        {isLoading ? (
          <div className="h-8 w-12 skeleton rounded mb-2" />
        ) : (
          <p className="text-2xl sm:text-3xl font-bold text-white">{value}</p>
        )}
        <p className="text-xs sm:text-sm font-medium text-white mt-1 truncate">
          {card.label}
        </p>
        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 truncate">
          {card.subtitle}
        </p>
      </div>
    </div>
  </button>
));

MetricCard.displayName = "MetricCard";

const MetricsCards = memo(({ activeCards = [], onToggleFilter }) => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchMetrics()
      .then((data) => {
        setMetrics(data);
        setError(null);
      })
      .catch((err) => {
        console.error("Failed to fetch metrics:", err);
        setError("Failed to load metrics");
      })
      .finally(() => setLoading(false));
  }, []);

  const activeSet = useMemo(() => new Set(activeCards), [activeCards]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
      {CARDS_CONFIG.map((card) => (
        <MetricCard
          key={card.filterKey}
          card={card}
          value={error ? "—" : metrics?.[card.metricKey] ?? 0}
          isActive={activeSet.has(card.filterKey)}
          onToggle={onToggleFilter}
          isLoading={loading}
        />
      ))}
    </div>
  );
});

MetricsCards.displayName = "MetricsCards";

export default MetricsCards;
