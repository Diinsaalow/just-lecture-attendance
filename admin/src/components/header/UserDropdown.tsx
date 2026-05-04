import { Lock, LogOut, Mail, Settings, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useGet2FAStatusQuery } from '../../store/api/authApi';
import Dropdown from '../Dropdown';

interface UserDropdownProps {
    isRtl: boolean;
}

const UserDropdown = ({ isRtl }: UserDropdownProps) => {
    const { user, logout, lock } = useAuth();
    const navigate = useNavigate();
    const { data: twoFAStatus } = useGet2FAStatusQuery();

    return (
        <div className="dropdown shrink-0 flex">
            <Dropdown
                offset={[0, 8]}
                placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                btnClassName="relative group block"
                button={
                    <img
                        className="w-9 h-9 rounded-full object-cover saturate-50 group-hover:saturate-100 ring-2 ring-gray-200 dark:ring-gray-600 group-hover:ring-primary dark:group-hover:ring-primary/50 transition-all duration-200"
                        src={user?.profileImage || '/logo192.png'}
                        alt="userProfile"
                    />
                }
            >
                <ul className="text-dark dark:text-gray-200 !py-0 w-[230px] font-semibold bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 border border-gray-200 dark:border-gray-700">
                    <li>
                        <div className="flex items-center px-4 py-4 bg-gray-50 dark:bg-gray-700/50 rounded-t-lg">
                            <img className="rounded-md w-10 h-10 object-cover" src={user?.profileImage || '/logo192.png'} alt="userProfile" />
                            <div className="ltr:pl-4 rtl:pr-4 truncate">
                                <h4 className="text-base text-gray-900 dark:text-gray-100">
                                    {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email || 'User'}
                                    <span className="text-xs bg-success-light dark:bg-success/20 rounded text-success dark:text-success-400 px-1 ltr:ml-2 rtl:ml-2">
                                        {typeof user?.role === 'string' ? 'Role' : user?.role?.name}
                                    </span>
                                </h4>
                                <button type="button" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary text-sm">
                                    {user?.email || 'user@example.com'}
                                </button>
                            </div>
                        </div>
                    </li>
                    <li>
                        <Link
                            to="/auth/profile"
                            className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-primary dark:hover:text-primary transition-colors duration-200"
                        >
                            <User className="w-4.5 h-4.5 ltr:mr-3 rtl:ml-3 shrink-0" />
                            Profile
                        </Link>
                    </li>
                    <li>
                        <Link
                            to="/settings"
                            className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-primary dark:hover:text-primary transition-colors duration-200"
                        >
                            <Settings className="w-4.5 h-4.5 ltr:mr-3 rtl:ml-3 shrink-0" />
                            Settings
                        </Link>
                    </li>
                    <li>
                        <button
                            onClick={async () => {
                                if (!twoFAStatus?.enabled) return;
                                const result = await lock();
                                if (result.success) navigate('/auth/lockscreen');
                            }}
                            disabled={!twoFAStatus?.enabled}
                            className={`w-full text-left flex items-center px-4 py-3 transition-colors duration-200 ${
                                twoFAStatus?.enabled
                                    ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-primary dark:hover:text-primary cursor-pointer'
                                    : 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
                            }`}
                            title={!twoFAStatus?.enabled ? 'Enable 2FA to use lock screen' : 'Lock your session'}
                        >
                            <Lock className="w-4.5 h-4.5 ltr:mr-3 rtl:ml-3 shrink-0" />
                            Lock Screen
                        </button>
                    </li>
                    <li className="border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={logout}
                            className="flex items-center px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left transition-colors duration-200"
                        >
                            <LogOut className="w-4.5 h-4.5 ltr:mr-3 rtl:ml-3 rotate-90 shrink-0" />
                            Sign Out
                        </button>
                    </li>
                </ul>
            </Dropdown>
        </div>
    );
};

export default UserDropdown;
