import React from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { sidebarMenu, filterMenuByPermissions, cleanEmptySections } from '../../lib/sidebar';
import { MenuItem } from '../../types/sidebar';
import { usePermission } from '../../hooks';

const HorizontalMenu = () => {
    const { t } = useTranslation();
    const { hasPermission } = usePermission();

    // Filter sidebar menu based on user permissions using resource and action
    const filteredSidebarMenu = cleanEmptySections(filterMenuByPermissions(sidebarMenu, hasPermission));

    // Check if the icon component is from Lucide
    const isLucideIcon = (icon: any) => {
        return icon && typeof icon === 'function' && (icon.toString().includes('lucide') || icon.displayName?.includes('Lucide'));
    };

    const renderMenuItem = (item: MenuItem, index: number) => {
        // Skip sections in horizontal menu
        if (item.isSection) {
            return null;
        }

        if (item.children) {
            return (
                <li key={index} className="menu nav-item relative">
                    <button type="button" className="nav-link">
                        <div className="flex items-center">
                            {item.icon && isLucideIcon(item.icon) ? <item.icon size={20} className="shrink-0" /> : item.icon ? <item.icon className="shrink-0" /> : null}
                            <span className="px-1">{t(item.title)}</span>
                        </div>
                        <div className="right_arrow">
                            <ChevronDown />
                        </div>
                    </button>
                    <ul className="sub-menu">
                        {item.children.map((child, childIndex) => (
                            <li key={childIndex}>
                                {child.children ? (
                                    <div className="relative">
                                        <button type="button">
                                            {t(child.title)}
                                            <div className="ltr:ml-auto rtl:mr-auto rtl:rotate-90 -rotate-90">
                                                <ChevronDown />
                                            </div>
                                        </button>
                                        <ul className="rounded absolute top-0 ltr:left-[95%] rtl:right-[95%] min-w-[180px] bg-white dark:bg-gray-800 z-[10] text-gray-700 dark:text-gray-300 shadow-lg dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700 p-0 py-2 hidden">
                                            {child.children.map((subChild, subChildIndex) => (
                                                <li key={subChildIndex}>
                                                    <NavLink
                                                        to={subChild.path || '#'}
                                                        target={subChild.target}
                                                        className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-200"
                                                    >
                                                        {t(subChild.title)}
                                                    </NavLink>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <NavLink to={child.path || '#'} target={child.target}>
                                        {t(child.title)}
                                    </NavLink>
                                )}
                            </li>
                        ))}
                    </ul>
                </li>
            );
        }

        return (
            <li key={index} className="menu nav-item relative">
                <NavLink to={item.path || '#'} target={item.target} className="nav-link">
                    <div className="flex items-center">
                        {item.icon && isLucideIcon(item.icon) ? <item.icon size={20} className="shrink-0" /> : item.icon ? <item.icon className="shrink-0" /> : null}
                        <span className="px-1">{t(item.title)}</span>
                    </div>
                </NavLink>
            </li>
        );
    };

    return (
        <ul className="horizontal-menu hidden py-1.5 font-semibold px-6 lg:space-x-1.5 xl:space-x-8 rtl:space-x-reverse bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200">
            {filteredSidebarMenu.map((item, index) => renderMenuItem(item, index))}
        </ul>
    );
};

export default HorizontalMenu;
