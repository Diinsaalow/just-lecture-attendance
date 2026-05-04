import type React from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import type { IRootState } from '../../../store';
import LanguageSelector from '../../../components/common/LanguageSelector';

interface LoginCoverProps {
    children: React.ReactNode;
}

const LoginCover: React.FC<LoginCoverProps> = ({ children }) => {
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const { t } = useTranslation();

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden">
            <div className="fixed inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-green-50/40 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(34,197,94,0.12),transparent_50%)] dark:bg-[radial-gradient(circle_at_50%_120%,rgba(34,197,94,0.07),transparent_50%)]" />
                <div className="absolute inset-0 bg-grid-slate-900/[0.02] dark:bg-grid-slate-400/[0.03] bg-[size:60px_60px]" />
            </div>

            {/* Main Content */}
            <main className="relative z-10 flex-1 flex items-center justify-center p-4 lg:p-8">
                <div className="absolute top-4 right-4 lg:top-6 lg:right-6 z-20">
                    <LanguageSelector
                        variant="default"
                        showShadow
                        showGlobeIcon
                        showChevron
                        className="ms-auto w-max bg-white/80 backdrop-blur-sm dark:bg-slate-800/80"
                        dropdownWidth="w-[320px]"
                        placement="bottom-end"
                    />
                </div>

                <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                    {/* Left Side - Login Form */}
                    <div className="w-full order-2 lg:order-1">{children}</div>

                    {/* Right Side - Branding & Illustration */}
                    <div className="hidden lg:flex flex-col items-center justify-center p-8 order-1 lg:order-2">
                        {/* <div className="text-center mb-12">
                            <div className="flex items-center justify-center mb-6">
                                <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="flex flex-col items-start">
                                    <h1 className="text-4xl font-bold text-slate-800 dark:text-white">Just Lecture Attendance</h1>
                                    <p className="text-2xl font-semibold text-green-500">System</p>
                                </div>
                            </div>
                            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-md leading-relaxed">
                                Streamline your construction projects with our comprehensive management platform designed for modern teams and workflows
                            </p>
                        </div> */}

                        {/* Illustration */}
                        <div className="relative">
                            <div className="absolute -inset-8 bg-gradient-to-r from-green-400/25 to-blue-500/25 rounded-3xl blur-2xl opacity-70" />
                            <img src="/assets/images/auth/login_pattern.png" alt="Just Lecture Attendance" className="relative w-full max-w-lg h-auto drop-shadow-2xl rounded-2xl" />
                        </div>
                    </div>
                </div>
            </main>

            <footer className="relative z-10 py-6 text-center" role="contentinfo">
                <div className="inline-flex flex-col items-center space-y-2">
                    <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        © {new Date().getFullYear()} {t('footer.copyright')}
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LoginCover;
