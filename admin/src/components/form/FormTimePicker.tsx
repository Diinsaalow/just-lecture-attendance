import React, { useState, useEffect, useRef, useMemo } from 'react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { Clock } from 'lucide-react';

interface FormTimePickerProps {
    id: string;
    label: string;
    error?: string;
    value?: string | null; // Expected format "HH:mm"
    onChange: (time: string) => void;
    onBlur?: () => void;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
    required?: boolean;
    helpText?: string;
}

const FormTimePicker: React.FC<FormTimePickerProps> = ({
    id,
    label,
    error,
    value,
    onChange,
    onBlur,
    disabled = false,
    placeholder = 'Select time',
    className = '',
    required = false,
    helpText,
}) => {
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const flatpickrRef = useRef<any>(null);

    // Parse "HH:mm" to Date object for flatpickr
    const parsedValue = useMemo(() => {
        if (!value) return '';
        const [hours, minutes] = value.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes)) return '';
        const d = new Date();
        d.setHours(hours, minutes, 0, 0);
        return d;
    }, [value]);

    return (
        <div className="space-y-2 w-full">
            <label htmlFor={id} className={`block text-sm font-medium ${error ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                {label}
                {required && <span className="text-red-500 ltr:ml-1 rtl:mr-1">*</span>}
            </label>

            <div className={`relative ${error ? 'has-error' : ''} w-full`}>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Clock className={`h-5 w-5 ${error ? 'text-red-500' : 'text-gray-400'}`} />
                </div>

                <div className="w-full" style={{ display: 'block', width: '100%' }}>
                    <Flatpickr
                        id={id}
                        value={parsedValue}
                        options={{
                            enableTime: true,
                            noCalendar: true,
                            dateFormat: 'h:i K',
                            time_24hr: false,
                            disableMobile: true,
                            position: isRtl ? 'auto right' : 'auto left',
                            appendTo: typeof document !== 'undefined' ? document.body : undefined,
                            onReady: (selectedDates: any, dateStr: any, instance: any) => {
                                if (instance?.calendarContainer) {
                                    instance.calendarContainer.style.zIndex = '2147483647';
                                }
                            },
                        }}
                        onChange={(dates: Date[]) => {
                            if (dates.length > 0) {
                                const d = dates[0];
                                const hours = String(d.getHours()).padStart(2, '0');
                                const minutes = String(d.getMinutes()).padStart(2, '0');
                                onChange(`${hours}:${minutes}`);
                            }
                        }}
                        onClose={onBlur}
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

export default FormTimePicker;
