import React from "react";
import { CheckIcon } from "@heroicons/react/24/solid";

const Checkbox = ({
  label,
  id,
  name,
  checked,
  onChange,
  disabled = false,
  icon = null,
  className = "",
}) => {
  return (
    <div className={`flex items-start ${className}`}>
      <div className="flex items-center h-5">
        <input
          id={id}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="hidden"
        />
        <label
          htmlFor={id}
          className={`
            flex items-center justify-center w-5 h-5 rounded border cursor-pointer
            ${
              checked
                ? "bg-primary-600 border-primary-600"
                : "bg-white border-gray-300 hover:border-primary-400"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          {checked &&
            (icon || <CheckIcon className="h-3.5 w-3.5 text-white" />)}
        </label>
      </div>
      <label
        htmlFor={id}
        className={`ml-3 text-sm cursor-pointer ${
          disabled ? "text-gray-400" : "text-gray-700"
        }`}
      >
        {label}
      </label>
    </div>
  );
};

export default Checkbox;
