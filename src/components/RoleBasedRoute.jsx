import {useAuth} from "../context/AuthContext.jsx";
import {Navigate, Outlet} from "react-router-dom";

function RoleBasedRoute({roles}) {
    const {user} = useAuth();
    return roles.includes(user?.role) ? <Outlet /> : <Navigate to="/access-denied" replace />;
}

export default RoleBasedRoute;