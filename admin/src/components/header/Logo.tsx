import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { toggleSidebar } from '../../store/themeConfigSlice';
import { Menu } from 'lucide-react';
import { authUtils } from '../../utils/auth';
import { usePermission } from '../../hooks/usePermission';

const Logo = () => {
    const dispatch = useDispatch();
    const { user, hasPermission } = usePermission();
    const homePage = authUtils.getHomePage(user, hasPermission);

    return (
        <div className="horizontal-logo flex lg:hidden justify-between items-center ltr:mr-2 rtl:ml-2">
            <Link to={homePage} className="main-logo flex items-center shrink-0">
                <img className="w-8 ltr:-ml-1 rtl:-mr-1 inline" src="/assets/images/logo.webp" alt="logo" />
                <span className="text-2xl ltr:ml-1.5 rtl:mr-1.5 font-semibold align-middle hidden md:inline dark:text-white-light transition-all duration-300">Just Lecture Attendance</span>
            </Link>
            <button
                type="button"
                className="collapse-icon flex-none dark:text-[#d0d2d6] hover:text-primary dark:hover:text-primary flex lg:hidden ltr:ml-2 rtl:mr-2 p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:bg-white-light/90 dark:hover:bg-dark/60"
                onClick={() => {
                    dispatch(toggleSidebar());
                }}
            >
                <Menu className="w-5 h-5" />
            </button>
        </div>
    );
};

export default Logo;
