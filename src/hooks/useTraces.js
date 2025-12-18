import { useEffect, useState, useCallback, useRef } from "react";
import { fetchTraces } from "../services/tracesApi";

const useTraces = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    activeCards: [],
    timeRange: "all",
    search: "",
  });

  // Debounced search state
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input (but clear immediately if empty)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    // If search is empty, clear immediately
    if (!filters.search || !filters.search.trim()) {
      setDebouncedSearch("");
      return;
    }
    
    // Otherwise debounce
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(filters.search.trim());
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [filters.search]);

  // Fetch data when filters change (using debounced search)
  useEffect(() => {
    setLoading(true);

    const params = {
      page: filters.page,
      limit: filters.limit,
    };

    if (debouncedSearch && debouncedSearch.trim()) {
      params.search = debouncedSearch.trim();
    }
    if (filters.timeRange && filters.timeRange !== "all") params.timeRange = filters.timeRange;
    if (filters.activeCards?.length > 0) params.activeCards = JSON.stringify(filters.activeCards);

    fetchTraces(params)
      .then((res) => {
        setData(res.data);
        setTotal(res.total);
      })
      .catch((err) => {
        console.error("Failed to fetch traces:", err);
        setData([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [filters.page, filters.limit, filters.timeRange, filters.activeCards, debouncedSearch]);

  const toggleCardFilter = useCallback((filterKey) => {
    setFilters((prev) => {
      const activeCards = prev.activeCards || [];
      const isActive = activeCards.includes(filterKey);
  return {
        ...prev,
        page: 1,
        activeCards: isActive
          ? activeCards.filter((k) => k !== filterKey)
          : [...activeCards, filterKey],
      };
    });
  }, []);

  return { data, total, loading, filters, setFilters, toggleCardFilter };
};

export default useTraces;
