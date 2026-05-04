import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface SelectOption {
    value: string;
    label: string;
}

interface FormSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
    label: string;
    options: SelectOption[];
    error?: string;
    value: string;
    onChange: (value: string) => void;
    onBlur: () => void;
    disabled?: boolean;
}

const FormSelect: React.FC<FormSelectProps> = ({ label, options, error, className = '', value, onChange, onBlur, disabled, ...props }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                onBlur();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onBlur]);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
        onBlur();
    };

    return (
        <div className="space-y-2">
            <label htmlFor={props.id} className={`block text-sm font-medium ${error ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                {label}
            </label>
            <div className="relative" ref={dropdownRef}>
                {/* Custom Select Button */}
                <button
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    className={`
                        w-full flex items-center justify-between px-4 py-2.5
                        bg-white dark:bg-gray-800
                        border-2 rounded-lg text-sm font-medium
                        transition-all duration-200 ease-in-out
                        focus:outline-none
                        ${
                            error
                                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 hover:border-red-600'
                                : 'border-gray-300 dark:border-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-gray-400 dark:hover:border-gray-600'
                        }
                        ${disabled ? 'bg-gray-100 dark:bg-gray-900 cursor-not-allowed opacity-60' : 'cursor-pointer'}
                        ${isOpen ? 'border-primary ring-2 ring-primary/20' : ''}
                        ${className}
                    `}
                >
                    <span className={`${selectedOption ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>{selectedOption?.label || 'Select an option'}</span>
                    <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''} ${error ? 'text-red-500' : 'text-gray-400'}`} />
                </button>

                {/* Dropdown Menu */}
                {isOpen && !disabled && (
                    <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
                        <div className="max-h-60 overflow-y-auto py-1">
                            {options.map((option) => {
                                const isSelected = option.value === value;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleSelect(option.value)}
                                        className={`
                                            w-full flex items-center justify-between px-4 py-2.5
                                            text-sm font-medium text-left
                                            transition-all duration-150 ease-in-out
                                            ${
                                                isSelected
                                                    ? 'bg-primary/10 text-primary dark:bg-primary/20'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-primary/5 dark:hover:bg-primary/10 hover:text-primary'
                                            }
                                        `}
                                    >
                                        <span>{option.label}</span>
                                        {isSelected && <Check className="h-4 w-4 text-primary" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
            {error && (
                <p className="text-sm text-red-500 mt-1" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
};

export default FormSelect;
