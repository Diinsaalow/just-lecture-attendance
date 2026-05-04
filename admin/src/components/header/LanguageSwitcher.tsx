import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { toggleRTL } from '../../store/themeConfigSlice';
import i18next from 'i18next';
import Dropdown from '../Dropdown';

const LanguageSwitcher = () => {
    const dispatch = useDispatch();
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
    const [flag, setFlag] = useState(themeConfig.locale);

    const setLocale = (flag: string) => {
        setFlag(flag);
        if (flag.toLowerCase() === 'sa') {
            dispatch(toggleRTL('rtl'));
        } else {
            dispatch(toggleRTL('ltr'));
        }
    };

    return (
        <div className="dropdown shrink-0">
            <Dropdown
                offset={[0, 8]}
                placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                btnClassName="block p-2 rounded-full bg-white-light/40 dark:bg-gray-700/60 hover:text-primary hover:bg-white-light/90 dark:hover:bg-gray-600/80 dark:text-gray-200 transition-colors duration-200"
                button={<img className="w-5 h-5 object-cover rounded-full ring-1 ring-gray-200 dark:ring-gray-600" src={`/assets/images/flags/${flag.toUpperCase()}.svg`} alt="flag" />}
            >
                <ul className="!px-2 text-dark dark:text-gray-200 grid grid-cols-1 gap-2 font-semibold w-[200px] bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 py-2">
                    {themeConfig.languageList.map((item: any) => {
                        return (
                            <li key={item.code}>
                                <button
                                    type="button"
                                    className={`flex w-full hover:text-primary dark:hover:text-primary rounded-lg p-3 transition-colors duration-200 ${
                                        i18next.language === item.code
                                            ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300'
                                    }`}
                                    onClick={() => {
                                        i18next.changeLanguage(item.code);
                                        setLocale(item.code);
                                    }}
                                >
                                    <img src={`/assets/images/flags/${item.code.toUpperCase()}.svg`} alt="flag" className="w-5 h-5 object-cover rounded-full" />
                                    <span className="ltr:ml-3 rtl:mr-3">{item.name}</span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </Dropdown>
        </div>
    );
};

export default LanguageSwitcher;
