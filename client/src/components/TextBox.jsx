import React, { forwardRef } from "react";
import clsx from "clsx";

// Using forwardRef to pass the ref to the input element
const Textbox = forwardRef(
  ({ type = "text", placeholder, label, className, name, value, onChange, error }, ref) => {
    return (
      <div className="w-full flex flex-col gap-1">
        {/* Label (optional) */}
        {label && (
          <label htmlFor={name} className="text-slate-800">
            {label}
          </label>
        )}

        {/* Input Field */}
        <div>
          <input
            type={type}
            name={name}
            value={value} // Bind the value of the input
            onChange={onChange} // Handle change event
            placeholder={placeholder}
            ref={ref} // Pass the ref to the input
            aria-invalid={error ? "true" : "false"}
            className={clsx(
              "bg-transparent px-3 py-2.5 2xl:py-3 border border-gray-300 placeholder-gray-400 text-gray-900 outline-none text-base focus:ring-2 ring-blue-300",
              className // Apply custom class names
            )}
          />
        </div>

        {/* Error Message (optional) */}
        {error && (
          <span className="text-xs text-[#f64949fe] mt-0.5">{error}</span>
        )}
      </div>
    );
  }
);

// Assign display name for debugging in React DevTools
Textbox.displayName = "Textbox";

export default Textbox;
