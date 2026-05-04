import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldCheck, Lock, KeyRound, HelpCircle } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import FormInput from '../../../components/form/FormInput';
import { useState, useRef, useEffect } from 'react';

const twoFactorSchema = z.object({
    token: z.string().min(6, 'Enter a valid 6-digit code').max(8, 'Max 8 characters'),
});

type TwoFactorFormData = z.infer<typeof twoFactorSchema>;

interface TwoFactorVerificationProps {
    username: string;
    onVerify: (token: string) => Promise<{ success: boolean; error?: string }>;
    onUseBackupCode: (backupCode: string) => Promise<{ success: boolean; error?: string }>;
    onBack: () => void;
}

const TwoFactorVerification = ({ username, onVerify, onUseBackupCode, onBack }: TwoFactorVerificationProps) => {
    const [useBackupCode, setUseBackupCode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [digits, setDigits] = useState<string[]>([]);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const {
        control,
        handleSubmit,
        formState: { errors },
        setError,
        reset,
    } = useForm<TwoFactorFormData>({
        resolver: zodResolver(twoFactorSchema),
        mode: 'onChange',
        defaultValues: { token: '' },
    });

    const maxLength = useBackupCode ? 8 : 6;

    useEffect(() => {
        // Initialize digits array based on mode
        if (digits.length === 0) {
            setDigits(new Array(maxLength).fill(''));
        }
    }, [useBackupCode, maxLength]);

    useEffect(() => {
        // Auto-submit when all digits are filled
        if (digits.length === maxLength && digits.every((digit) => digit !== '')) {
            const token = digits.join('');
            onSubmit({ token });
        }
    }, [digits, maxLength]);

    const onSubmit = async (data: TwoFactorFormData) => {
        setIsLoading(true);
        try {
            const result = useBackupCode ? await onUseBackupCode(data.token) : await onVerify(data.token);
            if (!result.success) {
                setError('root', { message: result.error || 'Verification failed. Please try again.' });
            }
        } catch (error) {
            setError('root', { message: 'An unexpected error occurred' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleBackupCode = () => {
        setUseBackupCode(!useBackupCode);
        setDigits(new Array(useBackupCode ? 6 : 8).fill(''));
        reset();
    };

    const handleDigitChange = (index: number, value: string) => {
        if (!/^[a-zA-Z0-9]*$/.test(value)) return; // Only allow alphanumeric characters

        const newDigits = [...digits];
        newDigits[index] = value;
        setDigits(newDigits);

        // Move to next input if value is entered
        if (value && index < maxLength - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !digits[index] && index > 0) {
            // Move to previous input on backspace if current is empty
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < maxLength - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/[^a-zA-Z0-9]/g, '');
        const newDigits = new Array(maxLength).fill('');

        for (let i = 0; i < Math.min(pastedData.length, maxLength); i++) {
            newDigits[i] = pastedData[i];
        }

        setDigits(newDigits);

        // Focus the last filled input or the next empty one
        const focusIndex = Math.min(pastedData.length, maxLength - 1);
        inputRefs.current[focusIndex]?.focus();
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center px-4">
            <div className="w-full max-w-[1000px] p-4 sm:p-6 md:p-8 rounded-2xl bg-white/90 backdrop-blur-xl shadow-[0_0_40px_-10px_rgba(0,0,0,0.1)] dark:bg-[#181f2a]/90 dark:backdrop-blur-xl dark:shadow-[0_8px_32px_0_rgba(10,20,50,0.85)] border border-gray-100 dark:border-[#232a3b] mx-auto">
                <div className="mb-6">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="absolute -inset-1">
                                <div className="w-10 h-10 opacity-30 blur-lg filter bg-gradient-to-r from-primary to-secondary rounded-full" />
                            </div>
                            <ShieldCheck className="relative w-8 h-8 text-primary dark:text-primary-light" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Two-Factor Authentication</h1>
                            <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{username}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 w-full">
                    {/* Left column: info/tips */}
                    <div className="rounded-xl border border-gray-100 dark:border-[#232a3b] bg-white/70 dark:bg-[#111827]/40 p-5">
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2">Secure your login</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            {useBackupCode ? 'Use one of your single-use backup codes to access your account.' : 'Enter the 6-digit code from your authenticator app (codes refresh every 30 seconds).'}
                        </p>

                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-3">
                            <li className="flex items-start gap-2">
                                <KeyRound className="w-4 h-4 mt-0.5 text-primary" />
                                <span>{useBackupCode ? 'Backup codes are case-insensitive.' : 'Codes may have a short grace window to account for clock drift.'}</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <HelpCircle className="w-4 h-4 mt-0.5 text-primary" />
                                <span>{useBackupCode ? 'Each backup code can only be used once.' : 'If you can’t access your app, switch to a backup code.'}</span>
                            </li>
                        </ul>
                    </div>

                    {/* Right column: form */}
                    <div className="rounded-xl border border-gray-100 dark:border-[#232a3b] bg-white/70 dark:bg-[#111827]/40 p-5 space-y-4">
                        {errors.root && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">{errors.root.message}</div>
                        )}

                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                <div className="flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-primary" />
                                    {useBackupCode ? 'Backup Code' : '2FA Code'}
                                </div>
                            </label>

                            <div className="flex gap-3 justify-center">
                                {Array.from({ length: maxLength }, (_, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => (inputRefs.current[index] = el)}
                                        type="text"
                                        inputMode="text"
                                        maxLength={1}
                                        value={digits[index] || ''}
                                        onChange={(e) => handleDigitChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        onPaste={handlePaste}
                                        disabled={isLoading}
                                        className="w-16 h-16 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-[#232a3b] text-gray-900 dark:text-gray-100 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 hover:border-primary/60 dark:hover:border-primary/60 shadow-sm hover:shadow-md focus:shadow-lg"
                                        autoComplete="off"
                                    />
                                ))}
                            </div>

                            {errors.token && <p className="text-sm text-red-600 dark:text-red-400">{errors.token.message}</p>}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-2">
                            <button
                                type="button"
                                onClick={onBack}
                                className="flex-1 h-14 px-6 border-2 border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-300 font-semibold text-base shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    const token = digits.join('');
                                    if (token.length === maxLength) {
                                        onSubmit({ token });
                                    }
                                }}
                                className="flex-1 h-14 px-6 bg-gradient-to-r from-primary to-secondary rounded-xl text-white font-bold text-base transition-all duration-300 hover:from-primary/90 hover:to-secondary/90 focus:outline-none focus:ring-4 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-primary disabled:hover:to-secondary shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0"
                                disabled={isLoading || digits.join('').length !== maxLength}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-3">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Verifying...
                                    </span>
                                ) : (
                                    'Verify'
                                )}
                            </button>
                        </div>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={handleToggleBackupCode}
                                className="text-sm text-primary hover:text-primary/80 dark:text-primary-light transition-colors"
                                disabled={isLoading}
                            >
                                {useBackupCode ? 'Use authenticator code instead' : 'Use backup code'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TwoFactorVerification;
