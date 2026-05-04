import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { IRootState } from '../../store';
import { setPageTitle } from '../../store/themeConfigSlice';
import { authUtils } from '../../utils/auth';
import { usePermission } from '../../hooks/usePermission';

const Error404 = () => {
    const dispatch = useDispatch();
    const { user, hasPermission } = usePermission();
    const homePage = authUtils.getHomePage(user, hasPermission);

    useEffect(() => {
        dispatch(setPageTitle('Page Not Found'));
    });
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-gray-900 dark:via-violet-900 dark:to-purple-900">
            {/* Animated background elements */}
            <div className="absolute inset-0">
                <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-gradient-to-r from-violet-300/20 to-purple-300/20 blur-3xl animate-pulse"></div>
                <div className="absolute right-1/4 bottom-1/4 h-80 w-80 rounded-full bg-gradient-to-r from-fuchsia-300/20 to-pink-300/20 blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="container mx-auto px-4">
                <div className="relative z-10 flex flex-col items-center">
                    {/* Creative 404 with astronaut theme */}
                    <div className="mb-8 relative">
                        {/* Astronaut illustration */}
                        <div className="mb-8 flex justify-center">
                            <div className="relative">
                                <div className="astronaut-float h-32 w-32 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 p-6 shadow-2xl">
                                    <svg viewBox="0 0 100 100" className="h-full w-full text-white" fill="currentColor">
                                        {/* Astronaut helmet */}
                                        <circle cx="50" cy="35" r="25" fill="currentColor" opacity="0.9" />
                                        <circle cx="50" cy="35" r="20" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.7" />
                                        {/* Face */}
                                        <circle cx="45" cy="32" r="2" fill="currentColor" />
                                        <circle cx="55" cy="32" r="2" fill="currentColor" />
                                        <path d="M 47 38 Q 50 40 53 38" stroke="currentColor" strokeWidth="1.5" fill="none" />
                                        {/* Body */}
                                        <ellipse cx="50" cy="65" rx="15" ry="20" fill="currentColor" opacity="0.8" />
                                        {/* Arms */}
                                        <ellipse cx="35" cy="60" rx="5" ry="12" fill="currentColor" opacity="0.7" />
                                        <ellipse cx="65" cy="60" rx="5" ry="12" fill="currentColor" opacity="0.7" />
                                        {/* Legs */}
                                        <ellipse cx="45" cy="85" rx="4" ry="10" fill="currentColor" opacity="0.7" />
                                        <ellipse cx="55" cy="85" rx="4" ry="10" fill="currentColor" opacity="0.7" />
                                    </svg>
                                </div>
                                {/* Stars around astronaut */}
                                <div className="absolute -top-4 -right-4 text-yellow-400 animate-twinkle">⭐</div>
                                <div className="absolute -bottom-2 -left-6 text-yellow-300 animate-twinkle delay-500">✨</div>
                                <div className="absolute top-8 -left-8 text-yellow-500 animate-twinkle delay-1000">⭐</div>
                            </div>
                        </div>

                        {/* Large 404 text */}
                        <div className="text-center">
                            <h1 className="text-[120px] font-black leading-none md:text-[180px] lg:text-[220px]">
                                <span className="inline-block text-transparent bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text animate-pulse">4</span>
                                <span className="inline-block text-transparent bg-gradient-to-r from-fuchsia-600 to-pink-600 bg-clip-text animate-bounce mx-4">0</span>
                                <span className="inline-block text-transparent bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text animate-pulse">4</span>
                            </h1>
                        </div>
                    </div>

                    {/* Error message with space theme */}
                    <div className="text-center max-w-2xl">
                        <h2 className="mb-6 text-4xl font-bold text-gray-800 dark:text-white md:text-5xl">Lost in Space</h2>
                        <p className="mb-10 text-lg leading-relaxed text-gray-600 dark:text-gray-300 md:text-xl">
                            Houston, we have a problem! The page you're looking for has drifted into the cosmic void. Our space crew is working to bring it back to Earth.
                        </p>

                        {/* Action buttons */}
                        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                            <button
                                onClick={() => window.history.back()}
                                className="group relative overflow-hidden rounded-2xl border-2 border-violet-200 bg-white/80 backdrop-blur-sm px-8 py-4 text-base font-semibold text-gray-700 shadow-xl transition-all duration-300 hover:border-violet-300 hover:shadow-2xl hover:scale-105 dark:border-violet-600 dark:bg-gray-800/80 dark:text-white dark:hover:border-violet-500"
                            >
                                <span className="relative z-10 flex items-center gap-2">🚀 Go Back</span>
                            </button>
                            <Link
                                to={homePage}
                                className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 px-8 py-4 text-base font-semibold text-white shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-violet-300 dark:focus:ring-violet-800"
                            >
                                <span className="relative z-10 flex items-center gap-2">🌍 Return to Earth</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating space elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Planets */}
                <div className="planet-orbit absolute left-[15%] top-[25%] h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg"></div>
                <div className="planet-orbit-reverse absolute right-[20%] top-[60%] h-8 w-8 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-lg"></div>
                <div className="planet-orbit absolute left-[70%] bottom-[30%] h-6 w-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg"></div>

                {/* Floating stars */}
                <div className="absolute left-[10%] top-[15%] text-2xl text-yellow-400 animate-twinkle">⭐</div>
                <div className="absolute right-[15%] top-[20%] text-xl text-yellow-300 animate-twinkle delay-700">✨</div>
                <div className="absolute left-[80%] bottom-[40%] text-lg text-yellow-500 animate-twinkle delay-1500">⭐</div>
                <div className="absolute right-[10%] bottom-[20%] text-xl text-yellow-400 animate-twinkle delay-300">✨</div>
                <div className="absolute left-[25%] bottom-[15%] text-sm text-yellow-300 animate-twinkle delay-1200">⭐</div>
            </div>

            {/* Enhanced CSS animations */}
            <style>
                {`
                @keyframes astronaut-float {
                    0%, 100% {
                        transform: translateY(0px) rotate(-5deg);
                    }
                    50% {
                        transform: translateY(-20px) rotate(5deg);
                    }
                }

                @keyframes planet-orbit {
                    0% {
                        transform: translateY(0px) translateX(0px);
                    }
                    25% {
                        transform: translateY(-15px) translateX(10px);
                    }
                    50% {
                        transform: translateY(0px) translateX(20px);
                    }
                    75% {
                        transform: translateY(15px) translateX(10px);
                    }
                    100% {
                        transform: translateY(0px) translateX(0px);
                    }
                }

                @keyframes planet-orbit-reverse {
                    0% {
                        transform: translateY(0px) translateX(0px);
                    }
                    25% {
                        transform: translateY(15px) translateX(-10px);
                    }
                    50% {
                        transform: translateY(0px) translateX(-20px);
                    }
                    75% {
                        transform: translateY(-15px) translateX(-10px);
                    }
                    100% {
                        transform: translateY(0px) translateX(0px);
                    }
                }

                @keyframes twinkle {
                    0%, 100% {
                        opacity: 0.3;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1.2);
                    }
                }

                .astronaut-float {
                    animation: astronaut-float 6s ease-in-out infinite;
                }

                .planet-orbit {
                    animation: planet-orbit 15s ease-in-out infinite;
                }

                .planet-orbit-reverse {
                    animation: planet-orbit-reverse 12s ease-in-out infinite;
                }

                .animate-twinkle {
                    animation: twinkle 2s ease-in-out infinite;
                }
                `}
            </style>
        </div>
    );
};

export default Error404;
