import { useTranslation } from 'react-i18next';

const LoginHeader = () => {
    const { t } = useTranslation();
    return (
        <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-center mb-4 sm:mb-6">
                <div className="relative">
                    <div className="absolute -inset-3">
                        <div className="w-full h-full mx-auto opacity-30 blur-2xl bg-gradient-to-r from-primary/60 to-secondary/60 rounded-2xl" />
                    </div>
                    {/* <div className="relative bg-white/90 dark:bg-gray-800/90 p-3 sm:p-4 rounded-2xl shadow ring-1 ring-black/5 dark:ring-white/5">
                        <img src="/assets/images/favicon.png" alt="Just Lecture Attendance" className="w-10 h-10 sm:w-12 sm:h-12" />
                    </div> */}
                </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 dark:text-white tracking-tight mb-2 sm:mb-3">{t('login.title')}</h1>
            <p className="text-center text-gray-600 dark:text-gray-400 text-sm sm:text-base leading-relaxed max-w-md mx-auto">{t('login.description')}</p>
        </div>
    );
};

export default LoginHeader;
