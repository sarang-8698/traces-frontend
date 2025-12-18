import React, { memo } from "react";

const EmptyState = memo(({ 
  icon, 
  title = "No data found", 
  description = "Try adjusting your filters or search terms",
  action,
  actionLabel = "Clear filters"
}) => (
  <div className="bg-[#12121a] rounded-lg border border-[#2a2a3e] p-8 sm:p-12 text-center">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#1a1a28] mb-4">
      {icon || (
        <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )}
    </div>
    <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
    <p className="text-gray-400 text-sm mb-6 max-w-sm mx-auto">{description}</p>
    {action && (
      <button
        onClick={action}
        className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-sm font-medium transition-colors"
      >
        {actionLabel}
      </button>
    )}
  </div>
));

EmptyState.displayName = "EmptyState";

export default EmptyState;



