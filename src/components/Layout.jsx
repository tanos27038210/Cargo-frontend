import {NavLink, Outlet, useNavigate} from "react-router-dom";
import {useAuth} from '../context/AuthContext.jsx';

function Layout() {
    const {user, logout} =useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/logout', {replace: true});
    };

    return (
        <div className="layout">
            <aside className="sidebar">
                <div className="sidebar-title">Cargo CRM</div>

                <nav className="sidebar-nav">
                    <NavLink to="/" end>Dashboard</NavLink>
                    <NavLink to="/customers">Customers</NavLink>
                    <NavLink to="/orders">Orders</NavLink>
                    {user?.role === 'ADMIN' && <NavLink to="/users">Users</NavLink>}
                </nav>

                <div className="sidebar-user">
                    <div>{user?.fullName}</div>
                    <div className="role">{user?.role}</div>
                    <button onClick={handleLogout}>Exit</button>
                </div>
            </aside>

            <main className="content">
                <Outlet />
            </main>
        </div>
    );
}

export default Layout;