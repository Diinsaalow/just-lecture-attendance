import React from 'react';
import { Outlet } from 'react-router-dom';

/** Shell for `/users` routes; navigation is via the sidebar (Users → Users / Lecturers). */
const UsersModuleLayout: React.FC = () => (
    <div>
        <Outlet />
    </div>
);

export default UsersModuleLayout;
