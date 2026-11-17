import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Layout() {
    const { user, logout } = useAuth();
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
                <button className="menu-button" onClick={() => setMenuOpen(true)} aria-label="Open menu">
                    ☰
                </button>
                <span className="topbar-title">Cargo CRM</span>
            </header>

            {menuOpen && <div className="sidebar-backdrop" onClick={closeMenu} />}

            <aside className={menuOpen ? 'sidebar sidebar-open' : 'sidebar'}>
                <div className="sidebar-title">Cargo CRM</div>

                <nav className="sidebar-nav" onClick={closeMenu}>
                    <NavLink to="/" end>Dashboard</NavLink>
                    <NavLink to="/customers">Customers</NavLink>
                    <NavLink to="/orders">Orders</NavLink>
                    {user?.role === 'ADMIN' && <NavLink to="/users">Users</NavLink>}
                </nav>

                <div className="sidebar-user">
                    <div>{user?.fullName}</div>
                    <div className="role">{user?.role}</div>
                    <button onClick={handleLogout}>Выйти</button>
                </div>
            </aside>

            <main className="content">
                <Outlet />
            </main>
        </div>
    );
}

export default Layout;