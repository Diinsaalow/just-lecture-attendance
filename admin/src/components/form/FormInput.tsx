import React, { useState, forwardRef } from 'react';
import { LucideIcon, Eye, EyeOff } from 'lucide-react';

interface FormInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
    label: string;
    icon?: LucideIcon;
    error?: string;
    value: string;
    onChange: (value: string) => void;
    onBlur: () => void;
    disabled?: boolean;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(({ label, icon: Icon, error, className = '', type = 'text', value, onChange, onBlur, disabled, inputMode, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
    };

    const inputType = type === 'password' ? (showPassword ? 'text' : 'password') : type;

    // Handler to restrict input to numbers (and one dot) for number type
    const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value;
        // Allow only digits, at most one dot, and an optional leading minus sign
        if (/^-?\d*\.?\d*$/.test(val)) {
            onChange(val);
        }
    };

    return (
        <div className="space-y-2 relative z-auto">
            <label htmlFor={props.id} className={`block text-sm font-medium ${error ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                {label}
            </label>
            <div className="relative z-auto">
                {/* Only render icon if not number type */}
                {Icon && type !== 'number' && (
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Icon className={`h-5 w-5 ${error ? 'text-red-500' : 'text-gray-400'}`} />
                    </div>
                )}
                <input
                    {...props}
                    ref={ref}
                    type={type === 'number' ? 'text' : inputType}
                    inputMode={type === 'number' ? 'decimal' : inputMode}
                    value={value}
                    onChange={type === 'number' ? handleNumberInput : (e) => onChange(e.target.value)}
                    onBlur={onBlur}
                    aria-invalid={error ? 'true' : 'false'}
                    className={`
                        block w-full ${Icon && type !== 'number' ? 'pl-11' : 'pl-4'} pr-10 py-2.5 text-gray-900 dark:text-white
                        border-2 rounded-lg text-sm transition-all duration-200 ease-in-out
                        focus:outline-none
                        dark:bg-black/30
                        ${
                            error
                                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 hover:border-red-600 focus:hover:border-red-500'
                                : 'border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 hover:border-gray-400 focus:hover:border-primary dark:border-gray-700 dark:focus:border-primary'
                        }
                        ${disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : ''}
                        ${className}
                    `}
                />
                {type === 'password' && (
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        onMouseDown={handleMouseDownPassword}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors dark:hover:text-gray-300"
                        tabIndex={-1}
                    >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                )}
            </div>
            {error && (
                <p className="text-sm text-red-500 mt-1" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
});

FormInput.displayName = 'FormInput';

export default FormInput;
