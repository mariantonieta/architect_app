import React from "react";
import AsyncCreatableSelect from "react-select/async-creatable";

export type Option = {
  label: string;
  value: string;
};

type MultipleSelectorProps = {
  value: Option[];
  onChange: (value: Option[]) => void;
  onSearch: (input: string) => Promise<Option[]>;
  defaultOptions?: Option[];
  placeholder?: string;
  loadingIndicator?: React.ReactNode;
  emptyIndicator?: React.ReactNode;
  creatable?: boolean; // opcional, aunque el componente es creatable por defecto
};

export default function MultipleSelector({
  value,
  onChange,
  onSearch,
  defaultOptions = [],
  placeholder = "Select...",
  loadingIndicator,
  emptyIndicator,
}: MultipleSelectorProps) {
  // Wrapper para loadOptions que llama onSearch
  const loadOptions = (inputValue: string) => {
    if (!inputValue) return Promise.resolve(defaultOptions);
    return onSearch(inputValue);
  };

  return (
    <AsyncCreatableSelect
      isMulti
      cacheOptions
      defaultOptions={defaultOptions}
      loadOptions={loadOptions}
      onChange={(newValue) => onChange(newValue as Option[])}
      value={value}
      placeholder={placeholder}
      noOptionsMessage={() => emptyIndicator || "No options"}
      loadingMessage={() => loadingIndicator || "Loading..."}
    />
  );
}
