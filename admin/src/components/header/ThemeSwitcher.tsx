import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { toggleTheme } from '../../store/themeConfigSlice';
import { Sun, Moon, Laptop } from 'lucide-react';

const ThemeSwitcher = () => {
    const dispatch = useDispatch();
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);

    return (
        <div>
            {themeConfig.theme === 'light' ? (
                <button
                    className="flex items-center p-2 rounded-full bg-white-light/40 dark:bg-gray-700/60 hover:text-primary hover:bg-white-light/90 dark:hover:bg-gray-600/80 dark:text-gray-200 dark:hover:text-primary transition-colors duration-200"
                    onClick={() => {
                        dispatch(toggleTheme('dark'));
                    }}
                    title="Switch to Dark Mode"
                >
                    <Sun className="w-4 h-4" />
                </button>
            ) : (
                ''
            )}
            {themeConfig.theme === 'dark' && (
                <button
                    className="flex items-center p-2 rounded-full bg-white-light/40 dark:bg-gray-700/60 hover:text-primary hover:bg-white-light/90 dark:hover:bg-gray-600/80 dark:text-gray-200 dark:hover:text-primary transition-colors duration-200"
                    onClick={() => {
                        dispatch(toggleTheme('system'));
                    }}
                    title="Switch to System Theme"
                >
                    <Moon className="w-4 h-4" />
                </button>
            )}
            {themeConfig.theme === 'system' && (
                <button
                    className="flex items-center p-2 rounded-full bg-white-light/40 dark:bg-gray-700/60 hover:text-primary hover:bg-white-light/90 dark:hover:bg-gray-600/80 dark:text-gray-200 dark:hover:text-primary transition-colors duration-200"
                    onClick={() => {
                        dispatch(toggleTheme('light'));
                    }}
                    title="Switch to Light Mode"
                >
                    <Laptop className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

export default ThemeSwitcher;
