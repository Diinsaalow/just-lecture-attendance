import React, { Fragment } from 'react';
import { Listbox, ListboxButton, ListboxOptions, ListboxOption, Transition } from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';

interface SelectOption {
    value: string;
    label: string;
}

interface FormMultiSelectProps {
    id: string;
    label: string;
    options: SelectOption[];
    value: string[];
    onChange: (value: string[]) => void;
    error?: string;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
}

const FormMultiSelect: React.FC<FormMultiSelectProps> = ({
    id,
    label,
    options,
    value,
    onChange,
    error,
    disabled = false,
    placeholder = 'Select options...',
    className = '',
}) => {
    // Helper to get labels for selected values
    const selectedLabels = options
        .filter((opt) => value.includes(opt.value))
        .map((opt) => opt.label);

    return (
        <div className={`space-y-2 ${className}`}>
            <label htmlFor={id} className={`block text-sm font-medium ${error ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                {label}
            </label>
            <Listbox value={value} onChange={onChange} multiple disabled={disabled}>
                <div className="relative mt-1">
                    <ListboxButton className={`
                        relative w-full cursor-default rounded-lg bg-white dark:bg-black/30 py-2.5 pl-4 pr-10 text-left border-2
                        focus:outline-none focus:ring-0
                        transition-all duration-200 ease-in-out
                        ${error
                            ? 'border-red-500 focus-visible:border-red-500 focus-visible:ring-2 focus-visible:ring-red-500/20'
                            : 'border-gray-300 dark:border-gray-700 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 hover:border-gray-400 dark:hover:border-gray-600'
                        }
                        ${disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60' : 'cursor-pointer'}
                        sm:text-sm
                    `}>
                        <span className={`block truncate ${selectedLabels.length === 0 ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
                            {selectedLabels.length > 0 ? selectedLabels.join(', ') : placeholder}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronDown
                                className="h-5 w-5 text-gray-400"
                                aria-hidden="true"
                            />
                        </span>
                    </ListboxButton>
                    <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <ListboxOptions className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-[#1b2e4b] py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                            {options.map((option, personIdx) => (
                                <ListboxOption
                                    key={personIdx}
                                    className={({ active, selected }) =>
                                        `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-primary/10 text-primary' : 'text-gray-900 dark:text-gray-100'
                                        }`
                                    }
                                    value={option.value}
                                >
                                    {({ selected }) => (
                                        <>
                                            <span
                                                className={`block truncate ${selected ? 'font-medium text-primary' : 'font-normal'
                                                    }`}
                                            >
                                                {option.label}
                                            </span>
                                            {selected ? (
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                                                    <Check className="h-5 w-5" aria-hidden="true" />
                                                </span>
                                            ) : null}
                                        </>
                                    )}
                                </ListboxOption>
                            ))}
                        </ListboxOptions>
                    </Transition>
                </div>
            </Listbox>
            {error && (
                <p className="text-sm text-red-500 mt-1" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
};

export default FormMultiSelect;
