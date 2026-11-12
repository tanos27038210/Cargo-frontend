import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function HomePage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    return (
        <div style={{ padding: 24 }}>
            <h1>Cargo CRM</h1>
            <p>You are logged in as: {user?.fullName} ({user?.role})</p>
            <button onClick={handleLogout}>Exit</button>
        </div>
    );
}

export default HomePage;