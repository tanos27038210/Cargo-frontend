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

function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                    <Route path="/" element={<Placeholder title="Dashboard" />} />
                    <Route path="/customers" element={<CustomersPage />} />
                    <Route path="/customers/new" element={<CustomerFormPage />} />
                    <Route path="/customers/:id/edit" element={<CustomerFormPage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/orders/:id" element={<OrderDetailsPage />} />

                    <Route element={<RoleBasedRoute roles={['ADMIN']} />}>
                        <Route path="users" element={<Placeholder title="Users" />} />
                    </Route>

                    <Route path="/access-denied" element={<AccessDeniedPage />} />
                    <Route path="*" element={<NotFoundPage />} />
                </Route>
            </Route>
        </Routes>
    );
}

export default App;