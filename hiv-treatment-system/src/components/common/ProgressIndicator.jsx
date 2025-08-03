import React from "react";

/**
 * Progress indicator component with animated transitions
 *
 * @param {number} value - Current progress value (0-100)
 * @param {string} color - Color theme (primary, success, warning, danger)
 * @param {string} size - Size of the progress bar (sm, md, lg)
 * @param {boolean} showLabel - Whether to show the percentage label
 * @param {string} label - Optional custom label text
 */
const ProgressIndicator = ({
  value = 0,
  color = "primary",
  size = "md",
  showLabel = false,
  label = null,
}) => {
  // Ensure value is between 0 and 100
  const safeValue = Math.min(Math.max(0, value), 100);

  // Map color prop to tailwind classes
  const colorClasses = {
    primary: "bg-primary-500",
    success: "bg-success-500",
    warning: "bg-warning-500",
    danger: "bg-danger-500",
    neutral: "bg-neutral-500",
  };

  // Map size prop to height classes
  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  const bgColor = colorClasses[color] || colorClasses.primary;
  const heightClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        {label && (
          <span className="text-sm font-medium text-gray-700">{label}</span>
        )}
        {showLabel && (
          <span className="text-sm font-medium text-gray-700">
            {safeValue}%
          </span>
        )}
      </div>
      <div className={`w-full bg-gray-200 rounded-full ${heightClass}`}>
        <div
          className={`${bgColor} rounded-full ${heightClass} transition-all duration-500 ease-in-out`}
          style={{ width: `${safeValue}%` }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressIndicator;
