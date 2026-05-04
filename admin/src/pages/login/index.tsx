import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Lock, ShieldCheck, User } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FormInput from '../../components/form/FormInput';
import LoginCover from './components/LoginCover';
import { LoginFormData, loginSchema } from './schema';
import { useAuth } from '../../hooks/useAuth';
import Alert from '../../components/Alert';
import LoginHeader from './components/LoginHeader';
import TwoFactorVerification from './components/TwoFactorVerification';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';
import { useVerify2FAMutation, useVerify2FABackupCodeMutation } from '../../store/api/authApi';
import { mapLoginResponseUser } from '../../utils/mapAuthUser';

const Login = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isLoginLoading } = useAuth();
    const dispatch = useDispatch();
    const [verify2FA] = useVerify2FAMutation();
    const [verifyBackupCode] = useVerify2FABackupCodeMutation();
    const [requires2FA, setRequires2FA] = useState(false);
    const [pendingUsername, setPendingUsername] = useState('');

    // Get redirect URL from query parameters or location state
    const searchParams = new URLSearchParams(location.search);
    const redirectPath = searchParams.get('redirect') || location.state?.from?.pathname || '/';

    const {
        control,
        handleSubmit,
        formState: { errors },
        setError,
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        mode: 'onChange',
        defaultValues: {
            username: '',
            passcode: '',
            rememberMe: false,
        },
    });

    const onSubmit = async (data: LoginFormData) => {
        const result = await login({
            username: data.username.trim().toLowerCase(),
            passcode: data.passcode,
        });

        if (result.success) {
            // If backend indicates 2FA is required
            if (result.data && 'requires2FA' in result.data && (result.data as { requires2FA?: boolean }).requires2FA) {
                setRequires2FA(true);
                setPendingUsername(data.username.trim().toLowerCase());
            } else {
                // Otherwise proceed normally
                navigate(redirectPath, { replace: true });
            }
        } else {
            // Handle error
            setError('root', { message: result.error || t('login.login_failed') });
        }
    };

    const handle2FAVerify = async (token: string) => {
        try {
            const result = await verify2FA({ username: pendingUsername, token }).unwrap();
            if (result.accessToken && result.user) {
                dispatch(setCredentials({ user: mapLoginResponseUser(result.user), token: result.accessToken }));
                navigate(redirectPath, { replace: true });
                return { success: true } as const;
            }
            return { success: false, error: t('two_factor.verification_failed') } as const;
        } catch (error: unknown) {
            const err = error as { data?: { message?: string } };
            return { success: false, error: err?.data?.message || t('two_factor.invalid_code') } as const;
        }
    };

    const handleBackupCodeVerify = async (backupCode: string) => {
        try {
            const result = await verifyBackupCode({ username: pendingUsername, backupCode }).unwrap();
            if (result.accessToken && result.user) {
                dispatch(setCredentials({ user: mapLoginResponseUser(result.user), token: result.accessToken }));
                navigate(redirectPath, { replace: true });
                return { success: true } as const;
            }
            return { success: false, error: t('two_factor.backup_code_failed') } as const;
        } catch (error: unknown) {
            const err = error as { data?: { message?: string } };
            return { success: false, error: err?.data?.message || t('two_factor.invalid_backup') } as const;
        }
    };

    const handleBack = () => {
        setRequires2FA(false);
        setPendingUsername('');
    };

    return (
        <>
            {requires2FA ? (
                <TwoFactorVerification username={pendingUsername} onVerify={handle2FAVerify} onUseBackupCode={handleBackupCodeVerify} onBack={handleBack} />
            ) : (
                <LoginCover>
                    <div className="w-full h-full p-4 sm:p-6 md:p-8">
                        <div className="w-full h-full p-6 sm:p-8 rounded-3xl bg-white/95 backdrop-blur-xl shadow-[0_18px_50px_-12px_rgba(0,0,0,0.18)] dark:bg-[#181f2a]/95 dark:backdrop-blur-xl dark:shadow-[0_18px_50px_-12px_rgba(0,0,0,0.5)] border border-gray-100/60 dark:border-[#232a3b]/60 flex flex-col">
                            <LoginHeader />

                            <form className="space-y-6 flex-1 flex flex-col justify-center" onSubmit={handleSubmit(onSubmit)} noValidate aria-labelledby="login-title">
                                {/* Alert Messages */}
                                {errors.root && <Alert type="danger" title="" message={errors.root?.message ?? ''} />}

                                <div className="space-y-5">
                                    <Controller
                                        name="username"
                                        control={control}
                                        render={({ field }) => (
                                            <FormInput
                                                id="username"
                                                type="text"
                                                label={t('form.username.label')}
                                                icon={User}
                                                error={errors.username?.message || ''}
                                                placeholder={t('form.username.placeholder')}
                                                autoComplete="username"
                                                aria-describedby="username-help"
                                                disabled={isLoginLoading}
                                                className="dark:bg-[#232a3b] dark:text-gray-100 dark:placeholder-gray-500 border-gray-200 dark:border-gray-700 focus:border-primary dark:focus:border-primary-light transition-colors duration-200"
                                                {...field}
                                            />
                                        )}
                                    />

                                    <Controller
                                        name="passcode"
                                        control={control}
                                        render={({ field }) => (
                                            <FormInput
                                                id="passcode"
                                                type="password"
                                                label={t('form.passcode.label')}
                                                icon={Lock}
                                                error={errors.passcode?.message || ''}
                                                placeholder={t('form.passcode.placeholder')}
                                                autoComplete="current-password"
                                                inputMode="numeric"
                                                aria-describedby="passcode-help"
                                                disabled={isLoginLoading}
                                                className="dark:bg-[#232a3b] dark:text-gray-100 dark:placeholder-gray-500 border-gray-200 dark:border-gray-700 focus:border-primary dark:focus:border-primary-light transition-colors duration-200"
                                                {...field}
                                            />
                                        )}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <label className="flex items-center cursor-pointer group">
                                        <Controller
                                            name="rememberMe"
                                            control={control}
                                            render={({ field: { value, onChange, ...field } }) => (
                                                <input
                                                    type="checkbox"
                                                    className="form-checkbox rounded border-gray-300 text-primary focus:ring-primary focus:ring-2 focus:ring-offset-2 dark:border-gray-700 dark:bg-[#232a3b] transition-all duration-200"
                                                    disabled={isLoginLoading}
                                                    checked={value}
                                                    onChange={(e) => onChange(e.target.checked)}
                                                    {...field}
                                                />
                                            )}
                                        />
                                        <span className="text-gray-600 dark:text-gray-400 ml-3 text-sm group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-200">
                                            {t('login.remember_me')}
                                        </span>
                                    </label>
                                    <a href="/forgot-password" className="text-sm font-medium text-primary hover:text-primary/90 focus:underline focus:outline-none">
                                        {t('login.forgot_password')}
                                    </a>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full h-12 px-6 bg-primary rounded-xl text-white font-semibold text-sm transition-all duration-300 hover:bg-primary/90 focus:ring-4 focus:ring-primary/20 disabled:opacity-70 disabled:hover:bg-primary shadow-lg hover:shadow-xl dark:shadow-[0_4px_20px_0_rgba(255,140,0,0.15)] dark:hover:shadow-[0_8px_30px_0_rgba(255,140,0,0.25)] transform hover:scale-[1.01] active:scale-[0.99]"
                                    disabled={isLoginLoading}
                                >
                                    {isLoginLoading ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                ></path>
                                            </svg>
                                            {t('login.login_progress')}
                                        </span>
                                    ) : (
                                        t('login.login')
                                    )}
                                </button>

                                <p id="username-help" className="sr-only">
                                    {t('login.username_help')}
                                </p>
                                <p id="passcode-help" className="sr-only">
                                    {t('login.passcode_help')}
                                </p>

                                <div className="pt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                                    <span className="inline-flex items-center gap-1">
                                        <ShieldCheck className="w-4 h-4" />
                                        {t('login.security_notice')}
                                    </span>
                                </div>
                            </form>
                        </div>
                    </div>
                </LoginCover>
            )}
        </>
    );
};

export default Login;
