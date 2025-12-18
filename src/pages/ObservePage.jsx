import { useState, lazy, Suspense } from "react";
import MetricsCards from "../components/MetricsCards/MetricsCards";
import FiltersBar from "../components/FiltersBar/FiltersBar";
import TracesTable from "../components/TracesTable/TracesTable";
import Pagination from "../components/Pagination/Pagination";
import useTraces from "../hooks/useTraces";

const TraceDrawer = lazy(() => import("../components/TraceDrawer/TraceDrawer"));

// Default all columns visible
const DEFAULT_COLUMNS = {
  traceId: true,
  startTime: true,
  duration: true,
  agent: true,
  application: true,
  runSteps: true,
  llmCalls: true,
  toolCalls: true,
  tokens: true,
  dataCategories: true,
  anomalous: true,
};

const ObservePage = () => {
  const { data, total, loading, filters, setFilters, toggleCardFilter } =
    useTraces();
  const [selectedTrace, setSelectedTrace] = useState(null);
  const [visibleColumns, setVisibleColumns] = useState(DEFAULT_COLUMNS);

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-[#0a0a0f] min-h-screen text-white">
      <h1 className="text-base sm:text-lg font-medium mb-4 sm:mb-6 text-gray-300">
        Observe / <span className="text-white">Activity Traces</span>
      </h1>

      <MetricsCards
        activeCards={filters.activeCards || []}
        onToggleFilter={toggleCardFilter}
      />
      <FiltersBar
        filters={filters}
        setFilters={setFilters}
        visibleColumns={visibleColumns}
        setVisibleColumns={setVisibleColumns}
        data={data}
      />
      <TracesTable
        data={data}
        loading={loading}
        onTraceClick={setSelectedTrace}
        visibleColumns={visibleColumns}
      />
      <Pagination
        total={total}
        page={filters.page}
        limit={filters.limit}
        setFilters={setFilters}
      />

      {selectedTrace && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 z-40" />}>
          <TraceDrawer
            trace={selectedTrace}
            onClose={() => setSelectedTrace(null)}
          />
        </Suspense>
      )}
    </div>
  );
};

export default ObservePage;
