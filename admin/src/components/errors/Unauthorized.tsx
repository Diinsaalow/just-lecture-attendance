import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { setPageTitle } from '../../store/themeConfigSlice';
import { IRootState } from '../../store';
import { authUtils } from '../../utils/auth';
import { usePermission } from '../../hooks/usePermission';

const Unauthorized = () => {
    const dispatch = useDispatch();
    const { user, hasPermission } = usePermission();
    const homePage = authUtils.getHomePage(user, hasPermission);

    useEffect(() => {
        dispatch(setPageTitle('Unauthorized Access'));
    });
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-r from-amber-50 to-orange-50 dark:from-gray-900 dark:to-amber-900">
            <div className="container mx-auto px-4">
                <div className="relative z-10 flex flex-col items-center">
                    {/* Animated 401 Text */}
                    <div className="mb-8 flex items-center justify-center">
                        <h1 className="animate-pulse text-[150px] font-extrabold tracking-widest text-amber-600 dark:text-amber-400 md:text-[200px]">
                            4<span className="inline-block animate-bounce text-primary">0</span>1
                        </h1>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute left-0 top-0 opacity-20">
                        <div className="h-40 w-40 rounded-full bg-amber-500 opacity-20"></div>
                    </div>
                    <div className="absolute bottom-0 right-0 opacity-20">
                        <div className="h-40 w-40 rounded-full bg-orange-500 opacity-20"></div>
                    </div>

                    {/* Lock Icon */}
                    <div className="mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm dark:bg-gray-800/20">
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-pulse text-amber-600 dark:text-amber-400">
                            <path
                                d="M18 8H17V6C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6V8H6C4.9 8 4 8.9 4 10V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V10C20 8.9 19.1 8 18 8ZM12 3C13.66 3 15 4.34 15 6V8H9V6C9 4.34 10.34 3 12 3ZM18 20H6V10H18V20ZM12 17C13.1 17 14 16.1 14 15C14 13.9 13.1 13 12 13C10.9 13 10 13.9 10 15C10 16.1 10.9 17 12 17Z"
                                fill="currentColor"
                            />
                        </svg>
                    </div>

                    {/* Error message */}
                    <div className="text-center">
                        <h2 className="mb-4 text-2xl font-bold text-gray-800 dark:text-white md:text-4xl">Access Denied</h2>
                        <p className="mb-8 text-center text-gray-600 dark:text-gray-300 md:text-lg">
                            You don't have permission to access this resource. Please contact your administrator if you believe this is an error.
                        </p>

                        {/* Buttons */}
                        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                            <button
                                onClick={() => window.history.back()}
                                className="btn rounded-md border border-gray-300 bg-white px-8 py-3 text-base font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
                            >
                                Go Back
                            </button>
                            <Link
                                to={homePage}
                                className="btn btn-gradient rounded-md bg-gradient-to-r from-amber-500 to-orange-600 px-8 py-3 text-base font-medium text-white shadow-md transition-all hover:from-amber-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                            >
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating elements for visual interest */}
            <div className="float-animation absolute left-1/4 top-1/4 h-16 w-16 rounded-full bg-amber-200 opacity-30 dark:bg-amber-700"></div>
            <div className="float-animation-delay absolute bottom-1/4 right-1/3 h-20 w-20 rounded-full bg-orange-200 opacity-30 dark:bg-orange-700"></div>
            <div className="float-animation-slow absolute bottom-1/2 right-1/4 h-12 w-12 rounded-full bg-yellow-200 opacity-30 dark:bg-yellow-700"></div>

            {/* Add custom CSS for animations using standard style tag */}
            <style>
                {`
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                    100% { transform: translateY(0px); }
                }

                .float-animation {
                    animation: float 6s ease-in-out infinite;
                }

                .float-animation-delay {
                    animation: float 8s ease-in-out 1s infinite;
                }

                .float-animation-slow {
                    animation: float 10s ease-in-out 2s infinite;
                }
                `}
            </style>
        </div>
    );
};

export default Unauthorized;
