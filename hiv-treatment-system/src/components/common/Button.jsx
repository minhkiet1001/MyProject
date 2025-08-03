import React from "react";

const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  type = "button",
  onClick,
  ariaLabel,
  icon,
  iconPosition = "left",
}) => {
  const baseStyle =
    "inline-flex items-center justify-center border font-medium rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 relative overflow-hidden";

  const variantStyles = {
    primary:
      "border-transparent text-white bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 shadow-sm hover:shadow active:bg-primary-800",
    secondary:
      "border-transparent text-primary-700 bg-primary-100 hover:bg-primary-200 focus:ring-primary-500 shadow-sm hover:shadow active:bg-primary-300",
    outline:
      "border-gray-300 text-gray-700 bg-white hover:bg-gray-50 hover:text-primary-600 hover:border-primary-300 focus:ring-primary-500 shadow-sm hover:shadow active:bg-gray-100",
    danger:
      "border-transparent text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow active:bg-red-800",
    success:
      "border-transparent text-white bg-green-600 hover:bg-green-700 focus:ring-green-500 shadow-sm hover:shadow active:bg-green-800",
    warning:
      "border-transparent text-white bg-amber-500 hover:bg-amber-600 focus:ring-amber-500 shadow-sm hover:shadow active:bg-amber-700",
    subtle:
      "border-transparent text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500 active:bg-gray-300",
    text: "border-transparent text-primary-600 bg-transparent hover:bg-primary-50 hover:text-primary-700 focus:ring-primary-500",
  };

  const sizeStyles = {
    xs: "px-2 py-1 text-xs",
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const disabledStyle = disabled
    ? "opacity-60 cursor-not-allowed"
    : 'cursor-pointer after:content-[""] after:absolute after:inset-0 after:bg-white after:opacity-0 hover:after:opacity-10 active:after:opacity-20 after:transition-opacity';

  const iconClass = icon
    ? iconPosition === "left"
      ? "mr-2"
      : "ml-2 order-2"
    : "";

  const styleClasses = `${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyle} ${className}`;

  return (
    <button
      type={type}
      className={styleClasses}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel || undefined}
      aria-disabled={disabled}
    >
      {icon && iconPosition === "left" && (
        <span className={iconClass}>{icon}</span>
      )}
      <span className={icon && iconPosition === "right" ? "order-1" : ""}>
        {children}
      </span>
      {icon && iconPosition === "right" && (
        <span className={iconClass}>{icon}</span>
      )}
      <span className="absolute inset-0 overflow-hidden rounded-lg">
        <span className="ripple-effect"></span>
      </span>
    </button>
  );
};

export default Button;
