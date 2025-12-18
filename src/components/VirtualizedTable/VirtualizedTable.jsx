import React, { memo, useRef, useEffect, useState, useMemo } from "react";

const ITEM_HEIGHT = 60; // Height of each row in pixels
const CONTAINER_HEIGHT = 600; // Visible container height
const BUFFER = 5; // Number of items to render outside viewport

const VirtualizedTable = memo(({ data, renderRow, columns }) => {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(CONTAINER_HEIGHT);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER);
    const end = Math.min(
      data.length,
      Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT) + BUFFER
    );
    return { start, end };
  }, [scrollTop, containerHeight, data.length]);

  // Visible items
  const visibleItems = useMemo(() => {
    return data.slice(visibleRange.start, visibleRange.end);
  }, [data, visibleRange.start, visibleRange.end]);

  // Total height of all items
  const totalHeight = data.length * ITEM_HEIGHT;

  // Offset for visible items
  const offsetY = visibleRange.start * ITEM_HEIGHT;

  // Handle scroll
  const handleScroll = (e) => {
    setScrollTop(e.target.scrollTop);
  };

  // Update container height on resize
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };

    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  return (
    <div
      ref={containerRef}
      className="overflow-auto bg-[#12121a] rounded-lg border border-[#2a2a3e]"
      style={{ height: `${containerHeight}px` }}
      onScroll={handleScroll}
    >
      {/* Table Header */}
      <div className="sticky top-0 bg-[#0d0d14] border-b border-[#2a2a3e] z-10">
        <div className="flex">
          {columns.map((col) => (
            <div
              key={col.key}
              className="p-3 text-left font-medium text-xs uppercase tracking-wider text-gray-400"
              style={{
                width: col.width || "auto",
                minWidth: col.minWidth || "100px",
              }}
            >
              {col.label}
            </div>
          ))}
        </div>
      </div>

      {/* Virtualized Content */}
      <div style={{ height: `${totalHeight}px`, position: "relative" }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={item.id || index} style={{ height: `${ITEM_HEIGHT}px` }}>
              {renderRow(item, visibleRange.start + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

VirtualizedTable.displayName = "VirtualizedTable";

export default VirtualizedTable;
