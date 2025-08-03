import React from "react";

const Input = ({
  id,
  type = "text",
  label,
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  required = false,
  className = "",
  name,
  autoComplete,
  helpText,
  ariaDescribedby,
  maxLength,
}) => {
  const inputId = id || name;
  const helpTextId = `${inputId}-help`;
  const errorId = `${inputId}-error`;

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}{" "}
          {required && (
            <span className="text-red-500" aria-hidden="true">
              *
            </span>
          )}
          {required && <span className="sr-only">(required)</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          autoComplete={autoComplete}
          maxLength={maxLength}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={`${helpText ? helpTextId : ""} ${
            error ? errorId : ""
          } ${ariaDescribedby || ""}`}
          className={`block w-full rounded-md shadow-sm transition-colors duration-200 focus:ring-primary-500 focus:border-primary-500 sm:text-sm ${
            error ? "border-red-300 pr-10" : "border-gray-300"
          } ${disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
        />
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-red-500"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>
      {helpText && (
        <p id={helpTextId} className="mt-1 text-sm text-gray-500">
          {helpText}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
