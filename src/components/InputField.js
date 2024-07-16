import React from "react";

const InputField = ({ id, label, value, onChange }) => (
  <>
    <h1 className="text-sm text-black font-bold">{label}</h1>
    <input
      id={id}
      rows="4"
      className="block p-2.5 w-full text-sm text-gray-900 bg-gray-100 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      value={value}
      onChange={onChange}
      placeholder={`ejm: ${label}`}
    />
  </>
);

export default InputField;
