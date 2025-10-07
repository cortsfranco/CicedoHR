import React, { useState, useRef, useEffect } from 'react';

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectDropdownProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({ options, selected, onChange, placeholder = "Select..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter(item => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const getSelectedLabels = () => {
    if (selected.length === 0) return placeholder;
    if (selected.length > 2) return `${selected.length} seleccionados`;
    return options
      .filter(option => selected.includes(option.value))
      .map(option => option.label)
      .join(', ');
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2 bg-white text-slate-900 border border-slate-300 rounded-md text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <span className={`truncate ${selected.length === 0 ? 'text-slate-500' : 'text-slate-900'}`}>{getSelectedLabels()}</span>
        <svg className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-30 w-full mt-1 bg-white border border-slate-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          <ul className="p-1">
            {options.map(option => (
              <li key={option.value}>
                <label className="flex items-center w-full px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100 cursor-pointer rounded-md">
                    <input
                      type="checkbox"
                      checked={selected.includes(option.value)}
                      onChange={() => handleSelect(option.value)}
                      className="h-4 w-4 mr-2 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    {option.label}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;