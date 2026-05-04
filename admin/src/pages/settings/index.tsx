import { Shield } from 'lucide-react';
import React from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumb';
import MobileToggle from './components/MobileToggle';
import Sidebar from './components/Sidebar';

const settingsItems = [
    {
        id: 'roles',
        title: 'Roles & Permissions',
        icon: <Shield className="w-5 h-5" />,
        path: '/settings/roles',
    },
];

const SettingsIndex: React.FC = () => {
    const breadcrumbItems = [{ title: 'Dashboard', path: '/' }, { title: 'Settings' }];
    const location = useLocation();
    const navigate = useNavigate();

    const activeTab = settingsItems.find((item) => location.pathname.startsWith(item.path))?.id || settingsItems[0].id;
    const [showMobileMenu, setShowMobileMenu] = React.useState(false);
    const activeTitle = settingsItems.find((item) => item.id === activeTab)?.title || '';

    React.useEffect(() => {
        if (location.pathname === '/settings' || location.pathname === '/settings/') {
            navigate(settingsItems[0].path, { replace: true });
        }
    }, [location.pathname, navigate]);

    return (
        <div>
            <Breadcrumb items={breadcrumbItems} />
            <div className="mt-5">
                <div className="panel">
                    <div className="mb-6">
                        <h5 className="font-semibold text-xl dark:text-white-light flex items-center">Settings</h5>
                    </div>
                    <MobileToggle activeTitle={activeTitle} showMobileMenu={showMobileMenu} setShowMobileMenu={setShowMobileMenu} />
                    <div className="flex flex-col md:flex-row min-h-[60vh] md:min-h-[70vh]">
                        <Sidebar items={settingsItems} activeTab={activeTab} showMobileMenu={showMobileMenu} linkComponent={NavLink} />
                        <main className="flex-1 min-w-0 h-full flex flex-col">
                            <Outlet />
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsIndex;
