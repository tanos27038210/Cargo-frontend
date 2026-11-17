import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

function Layout() {
    const { user, logout } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const closeMenu = () => setMenuOpen(false);

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    return (
        <div className="layout">
            <header className="topbar">
                <button className="menu-button" onClick={() => setMenuOpen(true)} aria-label={t('nav.openMenu')}>
                    ☰
                </button>
                <span className="topbar-title">{t('app.name')}</span>
            </header>

            {menuOpen && <div className="sidebar-backdrop" onClick={closeMenu} />}

            <aside className={menuOpen ? 'sidebar sidebar-open' : 'sidebar'}>
                <div className="sidebar-title">{t('app.name')}</div>

                <nav className="sidebar-nav" onClick={closeMenu}>
                    <NavLink to="/" end>{t('nav.dashboard')}</NavLink>
                    <NavLink to="/customers">{t('nav.customers')}</NavLink>
                    <NavLink to="/orders">{t('nav.orders')}</NavLink>
                    {user?.role === 'ADMIN' && <NavLink to="/users">{t('nav.users')}</NavLink>}
                </nav>

                <LanguageSwitcher variant="sidebar" />

                <div className="sidebar-user">
                    <div>{user?.fullName}</div>
                    <div className="role">{t(`role.${user?.role}`)}</div>
                    <button onClick={handleLogout}>{t('nav.logout')}</button>
                </div>
            </aside>

            <main className="content">
                <Outlet />
            </main>
        </div>
    );
}

export default Layout;