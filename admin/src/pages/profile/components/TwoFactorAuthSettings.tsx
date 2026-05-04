import { AlertCircle, CheckCircle, Copy, Download, Key, Shield } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Spinner from '../../../components/Spinner';
import { useDisable2FAMutation, useEnable2FAMutation, useGet2FAStatusQuery, useRegenerateBackupCodesMutation, useSetup2FAMutation } from '../../../store/api/authApi';

const TwoFactorAuthSettings = () => {
    const { data: twoFAStatus, isLoading: isStatusLoading, refetch } = useGet2FAStatusQuery();
    const [setup2FA] = useSetup2FAMutation();
    const [enable2FA] = useEnable2FAMutation();
    const [disable2FA] = useDisable2FAMutation();
    const [regenerateBackupCodes] = useRegenerateBackupCodesMutation();

    const [step, setStep] = useState<'initial' | 'setup' | 'backup-codes' | 'disable'>('initial');
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [verificationCode, setVerificationCode] = useState('');
    const [digits, setDigits] = useState<string[]>(new Array(6).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [password, setPassword] = useState('');
    const [disableCode, setDisableCode] = useState('');
    const [disableDigits, setDisableDigits] = useState<string[]>(new Array(6).fill(''));
    const disableInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copiedCode, setCopiedCode] = useState(false);

    const handleSetup2FA = async () => {
        setIsLoading(true);
        setError('');
        try {
            const result = await setup2FA().unwrap();
            setQrCode(result.qrCode);
            setSecret(result.secret);
            setBackupCodes(result.backupCodes);
            setStep('setup');
        } catch (err: any) {
            setError(err?.data?.message || 'Failed to setup 2FA');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // keep string code in sync with segmented inputs
        setVerificationCode(digits.join(''));
    }, [digits]);

    useEffect(() => {
        // keep disable code in sync with segmented inputs
        setDisableCode(disableDigits.join(''));
    }, [disableDigits]);

    const handleEnable2FA = async () => {
        if (!verificationCode || verificationCode.length !== 6) {
            setError('Please enter a valid 6-digit code');
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            const result = await enable2FA({ token: verificationCode }).unwrap();
            setBackupCodes(result.backupCodes);
            setStep('backup-codes');
            setSuccess('2FA enabled successfully!');
            await refetch();
        } catch (err: any) {
            setError(err?.data?.message || 'Invalid verification code');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDisable2FA = async () => {
        if (!password || !disableCode) {
            setError('Please enter your password and 2FA code');
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            await disable2FA({ password, token: disableCode }).unwrap();
            setSuccess('2FA disabled successfully');
            setStep('initial');
            setPassword('');
            setDisableCode('');
            await refetch();
        } catch (err: any) {
            setError(err?.data?.message || 'Failed to disable 2FA');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegenerateBackupCodes = async () => {
        if (!password) {
            setError('Please enter your password');
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            const result = await regenerateBackupCodes({ password }).unwrap();
            setBackupCodes(result.backupCodes);
            setStep('backup-codes');
            setSuccess('Backup codes regenerated successfully');
            setPassword('');
        } catch (err: any) {
            setError(err?.data?.message || 'Failed to regenerate backup codes');
        } finally {
            setIsLoading(false);
        }
    };

    const copySecret = () => {
        navigator.clipboard.writeText(secret);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    };

    const handleDigitChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const next = [...digits];
        next[index] = value;
        setDigits(next);
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            e.preventDefault();
            const next = [...digits];
            if (digits[index]) {
                next[index] = '';
                setDigits(next);
            } else if (index > 0) {
                next[index - 1] = '';
                setDigits(next);
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
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
        const next = [...new Array(6).fill('')];
        for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
        setDigits(next);
        inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    };

    const handleDisableDigitChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const next = [...disableDigits];
        next[index] = value;
        setDisableDigits(next);
        if (value && index < 5) disableInputRefs.current[index + 1]?.focus();
    };

    const handleDisableKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            e.preventDefault();
            const next = [...disableDigits];
            if (disableDigits[index]) {
                next[index] = '';
                setDisableDigits(next);
            } else if (index > 0) {
                next[index - 1] = '';
                setDisableDigits(next);
                disableInputRefs.current[index - 1]?.focus();
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            disableInputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < 5) {
            disableInputRefs.current[index + 1]?.focus();
        }
    };

    const handleDisablePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6).split('');
        const next = [...new Array(6).fill('')];
        for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
        setDisableDigits(next);
        disableInputRefs.current[Math.min(pasted.length, 5)]?.focus();
    };

    const downloadBackupCodes = () => {
        const codesText = backupCodes.join('\n');
        const blob = new Blob([codesText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '2fa-backup-codes.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    const copyBackupCodes = () => {
        const codesText = backupCodes.join('\n');
        navigator.clipboard.writeText(codesText);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    };

    return (
        <div className="bg-white dark:bg-[#181f2a] rounded-xl shadow p-8">
            <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-bold">Two-Factor Authentication</h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Add an extra layer of security to your account by enabling two-factor authentication.</p>

            {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{success}</span>
                </div>
            )}

            {isStatusLoading ? (
                <div className="flex justify-center items-center p-8">
                    <Spinner />
                </div>
            ) : (
                <div className="space-y-4">
                    {step === 'initial' && (
                        <>
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Key className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">Status</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{twoFAStatus?.enabled ? 'Enabled' : 'Disabled'}</p>
                                    </div>
                                </div>
                                {twoFAStatus?.enabled ? (
                                    <button onClick={() => setStep('disable')} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors" disabled={isLoading}>
                                        Disable 2FA
                                    </button>
                                ) : (
                                    <button onClick={handleSetup2FA} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors" disabled={isLoading}>
                                        {isLoading ? 'Setting up...' : 'Enable 2FA'}
                                    </button>
                                )}
                            </div>

                            {twoFAStatus?.enabled && (
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                                        <strong>Backup codes remaining:</strong> {twoFAStatus.backupCodesCount || 0}
                                    </p>
                                    <button
                                        onClick={() => {
                                            setStep('backup-codes');
                                            setPassword('');
                                        }}
                                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        Regenerate backup codes
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    {step === 'setup' && (
                        <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-8 items-start">
                            <div className="text-center">
                                <h3 className="text-base font-semibold mb-3 text-gray-900 dark:text-white">Scan QR Code</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Scan this QR with your authenticator app</p>
                                {qrCode && <img src={qrCode} alt="QR Code" className="mx-auto w-64 h-64 border rounded-lg dark:border-gray-600 shadow-sm" />}
                            </div>

                            {/* Right column: manual key, code input, actions */}
                            <div className="space-y-6">
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Or enter this key manually:</p>
                                    <div className="relative">
                                        <input
                                            readOnly
                                            value={secret}
                                            className="w-full pr-10 pl-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-primary/30 select-all"
                                        />
                                        <button onClick={copySecret} type="button" className="absolute inset-y-0 right-0 px-3 flex items-center text-primary hover:text-primary/80" title="Copy secret">
                                            {copiedCode ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Enter 6-digit code from authenticator app
                                    </label>
                                    <div className="flex justify-center gap-3">
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
                                                className="w-16 h-16 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300 hover:border-primary/60 dark:hover:border-primary/60 shadow-sm hover:shadow-md focus:shadow-lg"
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setStep('initial');
                                            setVerificationCode('');
                                            setDigits(new Array(6).fill(''));
                                            setError('');
                                        }}
                                        className="flex-1 h-12 px-4 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleEnable2FA}
                                        disabled={isLoading || verificationCode.length !== 6}
                                        className="flex-1 h-12 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? 'Verifying...' : 'Verify & Enable'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'backup-codes' && (
                        <div className="space-y-4">
                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">Save your backup codes</p>
                                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                            Store these backup codes in a safe place. Each code can only be used once if you lose access to your authenticator app.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    {backupCodes.map((code, index) => (
                                        <code key={index} className="p-2 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600 text-sm text-center">
                                            {code}
                                        </code>
                                    ))}
                                </div>

                                {backupCodes.length > 0 && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={downloadBackupCodes}
                                            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download
                                        </button>
                                        <button
                                            onClick={copyBackupCodes}
                                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                                        >
                                            {copiedCode ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                            {copiedCode ? 'Copied!' : 'Copy'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {twoFAStatus?.enabled && (
                                <div>
                                    <label htmlFor="regeneratePassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Enter your password to regenerate backup codes
                                    </label>
                                    <input
                                        type="password"
                                        id="regeneratePassword"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter password"
                                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-3"
                                    />
                                    <button
                                        onClick={handleRegenerateBackupCodes}
                                        disabled={isLoading || !password}
                                        className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                                    >
                                        {isLoading ? 'Regenerating...' : 'Regenerate Codes'}
                                    </button>
                                </div>
                            )}

                            <button
                                onClick={() => {
                                    setStep('initial');
                                    setBackupCodes([]);
                                    setSuccess('');
                                }}
                                className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                Done
                            </button>
                        </div>
                    )}

                    {step === 'disable' && (
                        <div className="space-y-4">
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                                <p className="text-sm text-red-600 dark:text-red-400">Disabling 2FA will make your account less secure. Are you sure you want to continue?</p>
                            </div>

                            <div>
                                <label htmlFor="disablePassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Enter your password
                                </label>
                                <input
                                    type="password"
                                    id="disablePassword"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label htmlFor="disable2FACode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Enter 6-digit code from authenticator app
                                </label>
                                <div className="flex justify-center gap-3">
                                    {disableDigits.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => (disableInputRefs.current[index] = el)}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleDisableDigitChange(index, e.target.value)}
                                            onKeyDown={(e) => handleDisableKeyDown(index, e)}
                                            onPaste={handleDisablePaste}
                                            className="w-16 h-16 text-center text-2xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-primary focus:ring-4 focus:ring-primary/20 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-300 hover:border-primary/60 dark:hover:border-primary/60 shadow-sm hover:shadow-md focus:shadow-lg"
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setStep('initial');
                                        setPassword('');
                                        setDisableCode('');
                                        setDisableDigits(new Array(6).fill(''));
                                        setError('');
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDisable2FA}
                                    disabled={isLoading || !password || disableCode.length !== 6}
                                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                                >
                                    {isLoading ? 'Disabling...' : 'Disable 2FA'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default TwoFactorAuthSettings;
