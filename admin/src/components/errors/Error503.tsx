import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { setPageTitle } from '../../store/themeConfigSlice';
import { IRootState } from '../../store';
import { authUtils } from '../../utils/auth';
import { usePermission } from '../../hooks/usePermission';

const Error503 = () => {
    const dispatch = useDispatch();
    const { user, hasPermission } = usePermission();
    const homePage = authUtils.getHomePage(user, hasPermission);

    useEffect(() => {
        dispatch(setPageTitle('Service Unavailable'));
    });
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-cyan-900 dark:to-blue-900">
            <div className="container mx-auto px-4">
                <div className="relative z-10 flex flex-col items-center">
                    {/* Animated 503 Text with enhanced styling */}
                    <div className="mb-12 flex items-center justify-center">
                        <h1 className="relative text-[120px] font-black tracking-wider text-blue-600 dark:text-blue-400 md:text-[180px] lg:text-[220px]">
                            <span className="animate-pulse">5</span>
                            <span className="inline-block animate-bounce mx-2 text-cyan-600 dark:text-cyan-400 drop-shadow-lg">0</span>
                            <span className="animate-pulse">3</span>
                        </h1>
                    </div>

                    {/* Maintenance Icon */}
                    <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm shadow-xl dark:bg-gray-800/30">
                        <svg
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="animate-spin text-cyan-600 dark:text-cyan-400"
                            style={{ animationDuration: '3s' }}
                        >
                            <path
                                d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                        </svg>
                    </div>

                    {/* Enhanced Error message */}
                    <div className="text-center max-w-2xl">
                        <h2 className="mb-6 text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent dark:from-white dark:to-gray-300 md:text-5xl">
                            Under Maintenance
                        </h2>
                        <p className="mb-10 text-lg leading-relaxed text-gray-600 dark:text-gray-300 md:text-xl">
                            We're currently performing scheduled maintenance to improve your experience. We'll be back online shortly. Thank you for your patience!
                        </p>

                        {/* Enhanced buttons */}
                        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <button
                                onClick={() => window.location.reload()}
                                className="group relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white px-8 py-4 text-base font-semibold text-gray-700 shadow-lg transition-all duration-300 hover:border-gray-300 hover:shadow-xl dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-gray-500"
                            >
                                <span className="relative z-10">🔄 Check Again</span>
                            </button>
                            <Link
                                to={homePage}
                                className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-300 dark:focus:ring-cyan-800"
                            >
                                <span className="relative z-10">🏠 Back to Home</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                            </Link>
                        </div>

                        {/* Status indicator */}
                        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse"></div>
                            <span>Maintenance in progress...</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced floating elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="float-animation absolute left-[10%] top-[20%] h-20 w-20 rounded-full bg-gradient-to-r from-cyan-200 to-blue-200 opacity-40 blur-sm dark:from-cyan-700 dark:to-blue-700"></div>
                <div className="float-animation-delay absolute bottom-[30%] right-[15%] h-16 w-16 rounded-full bg-gradient-to-r from-blue-200 to-indigo-200 opacity-40 blur-sm dark:from-blue-700 dark:to-indigo-700"></div>
                <div className="float-animation-slow absolute bottom-[60%] right-[25%] h-12 w-12 rounded-full bg-gradient-to-r from-indigo-200 to-cyan-200 opacity-40 blur-sm dark:from-indigo-700 dark:to-cyan-700"></div>
                <div className="float-animation absolute left-[70%] top-[70%] h-8 w-8 rounded-full bg-gradient-to-r from-teal-200 to-cyan-200 opacity-40 blur-sm dark:from-teal-700 dark:to-cyan-700"></div>
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

export default Error503;
