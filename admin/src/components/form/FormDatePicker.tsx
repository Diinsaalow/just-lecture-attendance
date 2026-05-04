import React, { useState, useEffect, useRef, useMemo } from 'react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { Calendar } from 'lucide-react';

// Helper function to format date without timezone issues
const formatDateToLocalString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

interface FormDatePickerProps {
    id: string;
    label: string;
    error?: string;
    value?: string | Date | null;
    onChange: (date: Date[]) => void;
    onBlur?: () => void;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
    required?: boolean;
    helpText?: string;
    dateFormat?: string;
    options?: any;
    name?: string;
    'data-testid'?: string;
}

const FormDatePicker: React.FC<FormDatePickerProps> = ({
    id,
    label,
    error,
    value,
    onChange,
    onBlur,
    disabled = false,
    placeholder = 'Select date',
    className = '',
    required = false,
    helpText,
    dateFormat = 'Y-m-d',
    options = {},
    name,
    'data-testid': dataTestId,
}) => {
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const flatpickrRef = useRef<any>(null);

    // Safely parse incoming value for Flatpickr (supports "YYYY-MM-DD" and ISO strings)
    const parsedValue = useMemo(() => {
        if (!value) return '';

        if (typeof value === 'string') {
            // If it's an ISO string, take the date part only: "YYYY-MM-DD"
            const datePart = value.includes('T') ? value.slice(0, 10) : value;
            const [y, m, d] = datePart.split('-').map(Number);

            if (!y || !m || !d) return '';

            // Construct at local midnight to avoid TZ shifts
            const local = new Date(y, m - 1, d);
            return isNaN(local.getTime()) ? '' : local;
        }

        // Already a Date
        if (value instanceof Date && !isNaN(value.getTime())) {
            // Normalize to strip any time component: keep calendar day stable
            return new Date(value.getFullYear(), value.getMonth(), value.getDate());
        }

        return '';
    }, [value]);

    // Ensure Flatpickr takes full width
    useEffect(() => {
        const instance = flatpickrRef.current?.flatpickr;
        const wrapper = instance?.calendarContainer?.parentElement;
        if (wrapper) {
            wrapper.style.width = '100%';
            wrapper.style.display = 'block';
            const inputElement = wrapper.querySelector('input');
            if (inputElement) {
                (inputElement as HTMLInputElement).style.width = '100%';
            }
        }
    }, []);

    return (
        <div className="space-y-2 w-full">
            <label htmlFor={id} className={`block text-sm font-medium ${error ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                {label}
                {required && <span className="text-red-500 ltr:ml-1 rtl:mr-1">*</span>}
            </label>

            <div className={`relative ${error ? 'has-error' : ''} w-full`}>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Calendar className={`h-5 w-5 ${error ? 'text-red-500' : 'text-gray-400'}`} />
                </div>

                <div className="w-full" style={{ display: 'block', width: '100%' }}>
                    <Flatpickr
                        id={id}
                        name={name}
                        value={parsedValue}
                        options={{
                            dateFormat,
                            position: isRtl ? 'auto right' : 'auto left',
                            static: false,
                            disableMobile: true,
                            appendTo: typeof document !== 'undefined' ? document.body : undefined,
                            ...options,
                            onReady: (selectedDates: any, dateStr: any, instance: any) => {
                                if (options?.onReady) options.onReady(selectedDates, dateStr, instance);
                                if (instance?.calendarContainer) {
                                    instance.calendarContainer.style.zIndex = '2147483647';
                                    instance.calendarContainer.style.position = 'absolute';
                                }
                            },
                        }}
                        // Normalize emitted dates to local midnight (no time component)
                        onChange={(dates: Date[]) => {
                            const normalized = dates.map((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()));
                            onChange(normalized);
                        }}
                        onClose={onBlur}
                        aria-invalid={error ? 'true' : 'false'}
                        data-testid={dataTestId}
                        ref={flatpickrRef}
                        className={`
                            form-input w-full
                            pl-11 pr-10 py-2.5
                            border-2 rounded-lg text-sm
                            ${!disabled ? 'cursor-pointer' : ''}
                            ${error
                                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 hover:border-red-600 focus:hover:border-red-500'
                                : 'border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-gray-400 focus:hover:border-primary dark:border-gray-700 dark:focus:border-primary'
                            }
                            ${disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}
                            ${className}
                        `}
                        placeholder={placeholder}
                        disabled={disabled}
                    />
                </div>
            </div>

            {error && (
                <p className="text-sm text-red-500 mt-1" role="alert">
                    {error}
                </p>
            )}
            {helpText && !error && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{helpText}</p>}
        </div>
    );
};

export default FormDatePicker;
