import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, ShieldCheck, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { useUnlockSessionMutation } from '../../store/api/authApi';
import { useDispatch } from 'react-redux';
import { unlockSession } from '../../store/slices/authSlice';
import Spinner from '../../components/Spinner';

const LockScreen = () => {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [unlockSessionMutation, { isLoading }] = useUnlockSessionMutation();
    const [digits, setDigits] = useState<string[]>(new Array(6).fill(''));
    const [errorMessage, setErrorMessage] = useState('');
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const lockScreenSchema = z.object({
        token: z.string().min(6, t('lockscreen.enter_valid_code')).max(6, t('lockscreen.enter_valid_code')),
    });

    type LockScreenFormData = z.infer<typeof lockScreenSchema>;

    const {
        handleSubmit,
        setError,
        formState: { errors },
    } = useForm<LockScreenFormData>({
        resolver: zodResolver(lockScreenSchema),
        mode: 'onChange',
    });

    useEffect(() => {
        // Focus first input on mount
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    useEffect(() => {
        // Auto-submit when all digits are filled
        if (digits.every((digit) => digit !== '')) {
            const token = digits.join('');
            onSubmit({ token });
        }
    }, [digits]);

    const onSubmit = async (data: LockScreenFormData) => {
        setErrorMessage('');
        try {
            const result = await unlockSessionMutation({ token: data.token }).unwrap();
            if (result.success) {
                dispatch(unlockSession());
                navigate('/dashboard');
            }
        } catch (error: any) {
            const message = error?.data?.message || t('lockscreen.invalid_code');
            setErrorMessage(message);
            setDigits(new Array(6).fill(''));
            if (inputRefs.current[0]) {
                inputRefs.current[0].focus();
            }
        }
    };

    const handleDigitChange = (index: number, value: string) => {
        if (!/^[0-9]*$/.test(value)) return;

        const newDigits = [...digits];
        newDigits[index] = value;
        setDigits(newDigits);

        // Move to next input if value is entered
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            e.preventDefault();
            const newDigits = [...digits];
            if (digits[index]) {
                newDigits[index] = '';
                setDigits(newDigits);
            } else if (index > 0) {
                newDigits[index - 1] = '';
                setDigits(newDigits);
                inputRefs.current[index - 1]?.focus();
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
        if (pastedData.every((char) => /^[0-9]$/.test(char))) {
            const newDigits = [...pastedData, ...new Array(6 - pastedData.length).fill('')];
            setDigits(newDigits);
            inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/auth/login');
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 mb-4 shadow-lg">
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('lockscreen.title')}</h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{t('lockscreen.description')}</p>
                    </div>

                    {/* User Info */}
                    <div className="flex items-center justify-center gap-3 mb-8 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                        <img src={user?.profileImage || '/logo192.png'} alt="Profile" className="w-12 h-12 rounded-full ring-2 ring-gray-200 dark:ring-gray-600 object-cover" />
                        <div className="text-left">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email || 'User'}</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</p>
                        </div>
                    </div>

                    {/* 2FA Code Input */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <ShieldCheck className="w-4 h-4 text-blue-500" />
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('lockscreen.authenticator_code')}</label>
                            </div>

                            <div className="flex justify-center gap-2 mb-4">
                                {digits.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => (inputRefs.current[index] = el)}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleDigitChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        onPaste={handlePaste}
                                        disabled={isLoading}
                                        className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                ))}
                            </div>

                            {errorMessage && (
                                <div className="flex items-center justify-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
                                </div>
                            )}

                            {errors.token && (
                                <div className="flex items-center justify-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <p className="text-sm text-red-600 dark:text-red-400">{errors.token.message}</p>
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || digits.some((d) => !d)}
                            className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Spinner className="w-5 h-5" />
                                    <span>{t('lockscreen.unlocking')}</span>
                                </>
                            ) : (
                                <>
                                    <Lock className="w-5 h-5" />
                                    <span>{t('lockscreen.unlock_button')}</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Logout Option */}
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={handleLogout}
                            className="w-full py-2.5 px-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>{t('lockscreen.sign_out_instead')}</span>
                        </button>
                    </div>

                    {/* Help Text */}
                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('lockscreen.help_text')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LockScreen;
