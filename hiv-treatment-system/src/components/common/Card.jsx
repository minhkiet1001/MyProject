import React from "react";

const Card = ({
  children,
  className = "",
  title,
  subtitle,
  footer,
  noPadding = false,
  variant = "default",
  onClick,
  role,
  ariaLabel,
  icon,
  actionButton,
  hoverEffect = true,
}) => {
  const baseClasses =
    "bg-white rounded-lg overflow-hidden transition-all duration-300";

  const variantClasses = {
    default: "shadow-sm",
    elevated: "shadow-md",
    bordered: "border border-gray-200",
    soft: "bg-gray-50 shadow-sm",
    primary: "bg-primary-50 border border-primary-100",
    success: "bg-green-50 border border-green-100",
    warning: "bg-yellow-50 border border-yellow-100",
    danger: "bg-red-50 border border-red-100",
  };

  const hoverClasses = hoverEffect
    ? "group hover:shadow-lg hover:-translate-y-1"
    : "";

  const clickableClasses = onClick ? "cursor-pointer" : "";

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${clickableClasses} ${hoverClasses} ${className}`}
      onClick={onClick}
      role={role || (onClick ? "button" : undefined)}
      aria-label={ariaLabel}
    >
      {(title || subtitle || icon) && (
        <div className="px-5 py-4 sm:px-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center">
            {icon && (
              <div className="mr-3 p-2 rounded-full bg-primary-100 text-primary-600 group-hover:bg-primary-200 transition-colors duration-300">
                {icon}
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-lg leading-6 font-medium text-gray-900 group-hover:text-primary-700 transition-colors duration-300">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {actionButton && <div>{actionButton}</div>}
        </div>
      )}

      <div className={noPadding ? "" : "px-5 py-5 sm:p-6"}>{children}</div>

      {footer && (
        <div className="px-5 py-4 sm:px-6 bg-gray-50 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
