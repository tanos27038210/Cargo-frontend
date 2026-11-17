import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardSummary } from '../api/dashboard';
import { useAuth } from '../context/AuthContext';
import { ORDER_STATUS_LABELS } from '../constants/statuses';
import { getErrorMessage } from '../utils/errors';
import { formatDateTime } from '../utils/format';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

function OrderListCard({ title, orders = [], emptyText, dateColumn }) {
    return (
        <section className="card">
            <h2>{title}</h2>
            {orders.length === 0 ? (
                <p className="muted">{emptyText}</p>
            ) : (
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                        <tr>
                            <th>Number</th>
                            <th>Customer</th>
                            <th>Status</th>
                            <th>{dateColumn === 'expected' ? 'Expected' : 'Created'}</th>
                        </tr>
                        </thead>
                        <tbody>
                        {orders.map((o) => (
                            <tr key={o.id}>
                                <td><Link to={`/orders/${o.id}`}>{o.orderNumber}</Link></td>
                                <td>{o.customerName}</td>
                                <td><StatusBadge status={o.status} /></td>
                                <td>
                                    {dateColumn === 'expected' ? (
                                        <span className="overdue">{o.expectedDeliveryDate}</span>
                                    ) : (
                                        formatDateTime(o.createdAt)
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}

function DashboardPage() {
    const { user } = useAuth();

    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await getDashboardSummary();
                setSummary(response.data);
            } catch (err) {
                setError(getErrorMessage(err, 'Failed to load summary'));
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [reloadKey]);

    const total = summary?.totalOrders ?? 0;

    return (
        <div className="dashboard-page">
            <div className="page-header">
                <h1>Dashboard</h1>
                <span className="muted">
          {user.role === 'ADMIN' ? 'All company orders' : 'Only your orders'}
        </span>
                <button
                    className="btn secondary push-right"
                    onClick={() => setReloadKey((k) => k + 1)}
                    disabled={loading}
                >
                    {loading ? 'Loading...' : 'Update'}
                </button>
            </div>

            {error && <div className="form-error">{error}</div>}
            {loading && !summary && <p className="muted">Loading...</p>}

            {summary && (
                <>
                    <div className="stat-grid">
                        <StatCard title="Total orders" value={summary.totalOrders} />
                        <StatCard title="Active" value={summary.activeOrders} tone="blue" />
                        <StatCard title="Delivered" value={summary.deliveredOrders} tone="green" />
                        <StatCard title="Cancelled" value={summary.cancelledOrders} tone="red" />
                        <StatCard title="Overdue" value={summary.overdueOrders} tone="orange" />
                    </div>

                    <section className="card">
                        <h2>Orders by status</h2>
                        {total === 0 ? (
                            <p className="muted">No orders yet.</p>
                        ) : (
                            <div className="bar-list">
                                {Object.keys(ORDER_STATUS_LABELS).map((code) => {
                                    const count = summary.ordersByStatus?.[code] ?? 0;
                                    const percent = (count / total) * 100;
                                    return (
                                        <div className="bar-row" key={code}>
                                            <div className="bar-label">{ORDER_STATUS_LABELS[code]}</div>
                                            <div className="bar-track">
                                                <div className="bar-fill" style={{ width: `${percent}%` }} />
                                            </div>
                                            <div className="bar-count">{count}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    <div className="two-columns">
                        <OrderListCard
                            title="Recent orders"
                            orders={summary.recentOrdersList}
                            emptyText="No orders yet"
                            dateColumn="created"
                        />
                        <OrderListCard
                            title="Overdue orders"
                            orders={summary.overdueOrderList}
                            emptyText="No overdue orders"
                            dateColumn="expected"
                        />
                    </div>
                </>
            )}
        </div>
    );
}

export default DashboardPage;