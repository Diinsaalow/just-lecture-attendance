import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { IRootState } from '../../store';
import { setPageTitle } from '../../store/themeConfigSlice';
import { authUtils } from '../../utils/auth';
import { usePermission } from '../../hooks/usePermission';

const Error500 = () => {
    const dispatch = useDispatch();
    const { user, hasPermission } = usePermission();
    const homePage = authUtils.getHomePage(user, hasPermission);

    useEffect(() => {
        dispatch(setPageTitle('Server Error'));
    });
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-red-900 dark:to-orange-900">
            <div className="container mx-auto px-4">
                <div className="relative z-10 flex flex-col items-center">
                    {/* Animated 500 Text with enhanced styling */}
                    <div className="mb-12 flex items-center justify-center">
                        <h1 className="relative text-[120px] font-black tracking-wider text-red-600 dark:text-red-400 md:text-[180px] lg:text-[220px]">
                            <span className="animate-pulse">5</span>
                            <span className="inline-block animate-bounce mx-2 text-blue-600 dark:text-blue-400 drop-shadow-lg">0</span>
                            <span className="animate-pulse">0</span>
                        </h1>
                    </div>

                    {/* Server Error Icon */}
                    <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm shadow-xl dark:bg-gray-800/30">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-pulse text-red-600 dark:text-red-400">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="12" cy="12" r="2" fill="currentColor" className="animate-ping" />
                        </svg>
                    </div>

                    {/* Enhanced Error message */}
                    <div className="text-center max-w-2xl">
                        <h2 className="mb-6 text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-300 md:text-5xl">Server Error</h2>
                        <p className="mb-10 text-lg leading-relaxed text-gray-600 dark:text-gray-300 md:text-xl">
                            Our servers are having a moment. We've been notified and our team is working hard to get everything back up and running smoothly.
                        </p>

                        {/* Enhanced buttons */}
                        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <button
                                onClick={() => window.location.reload()}
                                className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white px-8 py-4 text-base font-semibold text-gray-700 shadow-lg transition-all duration-300 hover:border-gray-300 hover:shadow-xl dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-500"
                            >
                                <span className="relative z-10">🔄 Try Again</span>
                            </button>
                            <Link
                                to={homePage}
                                className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-300 dark:focus:ring-red-800"
                            >
                                <span className="relative z-10">🏠 Back to Home</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced floating elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="float-animation absolute left-[10%] top-[20%] h-20 w-20 rounded-full bg-gradient-to-r from-red-200 to-orange-200 opacity-40 blur-sm dark:from-red-700 dark:to-orange-700"></div>
                <div className="float-animation-delay absolute bottom-[30%] right-[15%] h-16 w-16 rounded-full bg-gradient-to-r from-orange-200 to-yellow-200 opacity-40 blur-sm dark:from-orange-700 dark:to-yellow-700"></div>
                <div className="float-animation-slow absolute bottom-[60%] right-[25%] h-12 w-12 rounded-full bg-gradient-to-r from-yellow-200 to-red-200 opacity-40 blur-sm dark:from-yellow-700 dark:to-red-700"></div>
                <div className="float-animation absolute left-[70%] top-[70%] h-8 w-8 rounded-full bg-gradient-to-r from-pink-200 to-red-200 opacity-40 blur-sm dark:from-pink-700 dark:to-red-700"></div>
            </div>

            {/* Enhanced CSS animations */}
            <style>
                {`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px) rotate(0deg);
                        opacity: 0.4;
                    }
                    50% {
                        transform: translateY(-30px) rotate(180deg);
                        opacity: 0.6;
                    }
                }

                .float-animation {
                    animation: float 8s ease-in-out infinite;
                }

                .float-animation-delay {
                    animation: float 10s ease-in-out 2s infinite;
                }

                .float-animation-slow {
                    animation: float 12s ease-in-out 4s infinite;
                }
                `}
            </style>
        </div>
    );
};

export default Error500;
