import React from "react";

/**
 * Skeleton loader component for content placeholders during loading
 *
 * @param {string} type - Type of skeleton (text, card, avatar, table-row)
 * @param {number} lines - Number of lines for text skeleton
 * @param {string} width - Width of the skeleton (full, 3/4, 1/2, 1/4)
 * @param {string} height - Height class for the skeleton
 * @param {string} className - Additional CSS classes
 */
const SkeletonLoader = ({
  type = "text",
  lines = 1,
  width = "full",
  height = "h-4",
  className = "",
}) => {
  // Map width prop to tailwind classes
  const widthClasses = {
    full: "w-full",
    "3/4": "w-3/4",
    "1/2": "w-1/2",
    "1/4": "w-1/4",
  };

  const widthClass = widthClasses[width] || widthClasses.full;

  // Base skeleton style with shimmer animation
  const baseClass = `bg-gray-200 rounded animate-pulse ${className}`;

  // Render different skeleton types
  switch (type) {
    case "avatar":
      return <div className={`${baseClass} rounded-full h-10 w-10`}></div>;

    case "card":
      return (
        <div className={`${baseClass} rounded-lg h-32 ${widthClass}`}></div>
      );

    case "table-row":
      return (
        <div className="flex space-x-2 items-center">
          <div className={`${baseClass} h-4 w-1/12`}></div>
          <div className={`${baseClass} h-4 w-2/12`}></div>
          <div className={`${baseClass} h-4 w-3/12`}></div>
          <div className={`${baseClass} h-4 w-2/12`}></div>
          <div className={`${baseClass} h-4 w-2/12`}></div>
          <div className={`${baseClass} h-4 w-2/12`}></div>
        </div>
      );

    case "text":
    default:
      return (
        <div className="space-y-2">
          {[...Array(lines)].map((_, i) => (
            <div
              key={i}
              className={`${baseClass} ${height} ${
                i === lines - 1 && lines > 1 ? "w-3/4" : widthClass
              }`}
            ></div>
          ))}
        </div>
      );
  }
};

export default SkeletonLoader;
