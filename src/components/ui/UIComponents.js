import React from 'react';

// Button Component
export const Button = ({ onClick, children }) => (
  <button
    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
    onClick={onClick}
  >
    {children}
  </button>
);

// Select Component
export const Select = ({ value, onValueChange, children }) => (
  <select
    className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
    value={value}
    onChange={(e) => onValueChange(e.target.value)}
  >
    {children}
  </select>
);

export const SelectTrigger = ({ children }) => (
  <div className="relative">
    {children}
  </div>
);

export const SelectValue = ({ placeholder }) => (
  <span className="block truncate">{placeholder}</span>
);

export const SelectContent = ({ children }) => (
  <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
    {children}
  </div>
);

export const SelectItem = ({ value, children }) => (
  <div
    className="cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-gray-100"
    data-value={value}
  >
    {children}
  </div>
);

// Slider Component
export const Slider = ({ min, max, step, value, onValueChange, className }) => (
  <input
    type="range"
    min={min}
    max={max}
    step={step}
    value={value[0]}
    onChange={(e) => onValueChange([parseInt(e.target.value, 10)])}
    className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${className}`}
  />
);

export default {
  Button,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Slider,
};