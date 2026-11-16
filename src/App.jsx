import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import Placeholder from './pages/Placeholder';
import AccessDeniedPage from './pages/AccessDeniedPage';
import NotFoundPage from './pages/NotFoundPage';
import CustomersPage from './pages/CustomersPage';
import CustomerFormPage from './pages/CustomerFormPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import OrderFormPage from './pages/OrderFormPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import UserFormPage from './pages/UserFormPage';

function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/customers" element={<CustomersPage />} />
                    <Route path="/customers/new" element={<CustomerFormPage />} />
                    <Route path="/customers/:id/edit" element={<CustomerFormPage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/orders/:id" element={<OrderDetailsPage />} />
                    <Route path="/orders/new" element={<OrderFormPage />} />
                    <Route path="/orders/:id/edit" element={<OrderFormPage />} />

                    <Route element={<RoleBasedRoute roles={['ADMIN']} />}>
                        <Route path="/users" element={<UsersPage />} />
                        <Route path="/users/new" element={<UserFormPage />} />
                        <Route path="/users/:id/edit" element={<UserFormPage />} />
                    </Route>

                    <Route path="/access-denied" element={<AccessDeniedPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
            </Route>
        </Routes>
    );
}

export default App;