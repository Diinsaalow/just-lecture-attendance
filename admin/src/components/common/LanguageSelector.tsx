import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ChevronDown, Globe } from "lucide-react";
import { IRootState } from "../../store";
import { toggleRTL } from "../../store/themeConfigSlice";
import i18next from "i18next";
import { useTranslation } from "react-i18next";
import Dropdown from "../Dropdown";

interface LanguageSelectorProps {
    variant?: "default" | "compact" | "icon-only";
    showShadow?: boolean;
    showGlobeIcon?: boolean;
    showChevron?: boolean;
    className?: string;
    dropdownWidth?: string;
    placement?: "bottom-start" | "bottom-end";
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
    variant = "default",
    showShadow = true,
    showGlobeIcon = true,
    showChevron = true,
    className = "",
    dropdownWidth = "w-[320px]",
    placement = "bottom-end",
}) => {
    const dispatch = useDispatch();
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const isRtl =
        useSelector((state: IRootState) => state.themeConfig.rtlClass) === "rtl"
            ? true
            : false;
    const [flag, setFlag] = useState(themeConfig.locale);

    const { t } = useTranslation();

    const setLocale = (newFlag: string) => {
        setFlag(newFlag);
        if (newFlag.toLowerCase() === "ae") {
            dispatch(toggleRTL("rtl"));
        } else {
            dispatch(toggleRTL("ltr"));
        }
    };

    // Button styling based on variant
    const getButtonClassName = () => {
        const baseClasses =
            "flex items-center gap-3 transition-all duration-300";

        switch (variant) {
            case "compact":
                return `${baseClasses} rounded-xl border border-gray-300/50 bg-white/90 backdrop-blur-md px-3 py-2 text-gray-700 hover:bg-white hover:border-gray-400/50 ${
                    showShadow ? "shadow-lg hover:shadow-xl" : ""
                } w-[120px] justify-between`;
            case "icon-only":
                return `${baseClasses} rounded-full p-2 bg-white-light/40 dark:bg-dark/40 hover:text-primary hover:bg-white-light/90 dark:hover:bg-dark/60`;
            default:
                return `${baseClasses} rounded-2xl border border-gray-300/50 bg-white/90 backdrop-blur-md px-4 py-2.5 text-gray-700 hover:bg-white hover:border-gray-400/50 ${
                    showShadow ? "shadow-lg hover:shadow-xl" : ""
                } w-[140px] justify-between`;
        }
    };

    // Flag styling based on variant
    const getFlagClassName = () => {
        switch (variant) {
            case "icon-only":
                return "w-5 h-5 object-cover rounded-full";
            default:
                return "relative h-6 w-6 rounded-full object-cover ring-2 ring-gray-200";
        }
    };

    // Render button content based on variant
    const renderButtonContent = () => {
        switch (variant) {
            case "icon-only":
                return (
                    <img
                        src={`/assets/images/flags/${flag.toUpperCase()}.svg`}
                        alt="flag"
                        className={getFlagClassName()}
                    />
                );
            case "compact":
                return (
                    <>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-sm"></div>
                                <img
                                    src={`/assets/images/flags/${flag.toUpperCase()}.svg`}
                                    alt="flag"
                                    className={getFlagClassName()}
                                />
                            </div>
                            <div className="text-xs font-semibold uppercase tracking-wide text-gray-700">
                                {flag === "en"
                                    ? "EN"
                                    : flag === "ae"
                                    ? "AE"
                                    : flag === "so"
                                    ? "SO"
                                    : flag.toUpperCase()}
                            </div>
                        </div>
                        {showChevron && (
                            <ChevronDown className="h-3 w-3 text-gray-500" />
                        )}
                    </>
                );
            default:
                return (
                    <>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-sm"></div>
                                <img
                                    src={`/assets/images/flags/${flag.toUpperCase()}.svg`}
                                    alt="flag"
                                    className={getFlagClassName()}
                                />
                            </div>
                            <div className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                                {flag === "en"
                                    ? "EN"
                                    : flag === "ae"
                                    ? "AE"
                                    : flag === "so"
                                    ? "SO"
                                    : flag.toUpperCase()}
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            {showGlobeIcon && (
                                <Globe className="h-4 w-4 text-gray-500" />
                            )}
                            {showChevron && (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                            )}
                        </div>
                    </>
                );
        }
    };

    return (
        <div className={`dropdown ${className}`}>
            <Dropdown
                offset={[0, 8]}
                placement={placement}
                btnClassName={getButtonClassName()}
                button={renderButtonContent()}
            >
                <div
                    className={`!px-3 !py-3 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 ${dropdownWidth} z-[9999] relative`}
                    style={{ maxHeight: "400px", overflowY: "auto" }}
                >
                    <div className="mb-3 px-2">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            {t("language.select")}
                        </h3>
                        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent"></div>
                    </div>
                    <ul className="grid grid-cols-1 gap-1">
                        {themeConfig.languageList.map((item: any) => (
                            <li key={item.code}>
                                <button
                                    type="button"
                                    className={`flex w-full items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 ${
                                        flag === item.code
                                            ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 hover:text-gray-900 dark:hover:text-white"
                                    }`}
                                    onClick={() => {
                                        i18next.changeLanguage(item.code);
                                        setLocale(item.code);
                                    }}
                                >
                                    {/* Left Section: Flag + Name */}
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={`/assets/images/flags/${item.code.toUpperCase()}.svg`}
                                            alt="flag"
                                            className="w-6 h-6 rounded-full ring-2 ring-white/50 object-cover"
                                        />
                                        <span className="font-medium text-sm">
                                            {t(`language.${item.code}`)}
                                        </span>
                                    </div>

                                    {/* Right Section: Selected Indicator */}
                                    {flag === item.code && (
                                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                                    )}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </Dropdown>
        </div>
    );
};

export default LanguageSelector;
