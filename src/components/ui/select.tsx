'use client';

import * as React from "react"

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
  name?: string;
  className?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({
  value,
  onChange,
  placeholder = "Select an option",
  options,
  name,
  className = ""
}, ref) => {
  return (
    <select
      ref={ref}
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-3 py-2 border rounded-md bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
});

Select.displayName = "Select";

export default Select;