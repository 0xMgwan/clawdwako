"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isActive?: boolean;
}

export function CustomSelect({ options, value, onChange, placeholder, isActive }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Select Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-3 rounded-lg border-2 bg-background text-foreground text-sm focus:border-green-400 focus:outline-none transition-all font-medium flex items-center justify-between ${
          isActive ? 'border-green-400 bg-green-400/5' : 'border-border'
        }`}
      >
        <span className={selectedOption ? 'text-foreground' : 'text-muted-foreground'}>
          {selectedOption?.label || placeholder || 'Select...'}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-background border border-border rounded-lg shadow-xl max-h-64 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left text-sm transition-all flex items-center justify-between group ${
                option.value === value
                  ? 'bg-green-400/10 text-foreground font-semibold'
                  : 'text-foreground hover:bg-green-400/5'
              }`}
            >
              <span>{option.label}</span>
              {option.value === value && (
                <Check className="w-4 h-4 text-green-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
