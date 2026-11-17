import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardSummary } from '../api/dashboard';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ORDER_STATUSES } from '../constants/statuses';
import { getErrorMessage } from '../utils/errors';
import { formatDateTime } from '../utils/format';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';

function OrderListCard({ title, orders, emptyText, dateColumn }) {
    const { t } = useLanguage();

    return (
        <section className="card">
            <h2>{title}</h2>
            {(orders || []).length === 0 ? (
                <p className="muted">{emptyText}</p>
            ) : (
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                        <tr>
                            <th>{t('orders.number')}</th>
                            <th>{t('orders.customer')}</th>
                            <th>{t('orders.status')}</th>
                            <th>{dateColumn === 'expected' ? t('dashboard.expectedWas') : t('common.created')}</th>
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
    const { t } = useLanguage();

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
                setError(getErrorMessage(err, t('dashboard.loadError')));
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [reloadKey]);

    const total = summary?.totalOrders ?? 0;

    return (
        <div>
            <div className="page-header">
                <h1>{t('nav.dashboard')}</h1>
                <span className="muted">
          {user.role === 'ADMIN' ? t('dashboard.scopeAll') : t('dashboard.scopeMine')}
        </span>
                <button
                    className="btn secondary push-right"
                    onClick={() => setReloadKey((k) => k + 1)}
                    disabled={loading}
                >
                    {loading ? t('common.loading') : t('common.refresh')}
                </button>
            </div>

            {error && <div className="form-error">{error}</div>}
            {loading && !summary && <p className="muted">{t('common.loading')}</p>}

            {summary && (
                <>
                    <div className="stat-grid">
                        <StatCard title={t('dashboard.total')} value={summary.totalOrders} />
                        <StatCard title={t('dashboard.active')} value={summary.activeOrders} tone="blue" />
                        <StatCard title={t('dashboard.delivered')} value={summary.deliveredOrders} tone="green" />
                        <StatCard title={t('dashboard.cancelled')} value={summary.cancelledOrders} tone="red" />
                        <StatCard title={t('dashboard.overdue')} value={summary.overdueOrders} tone="orange" />
                    </div>

                    <section className="card">
                        <h2>{t('dashboard.byStatus')}</h2>
                        {total === 0 ? (
                            <p className="muted">{t('dashboard.noOrders')}</p>
                        ) : (
                            <div className="bar-list">
                                {ORDER_STATUSES.map((code) => {
                                    const count = summary.ordersByStatus?.[code] ?? 0;
                                    const percent = (count / total) * 100;
                                    return (
                                        <div className="bar-row" key={code}>
                                            <div className="bar-label">{t(`orderStatus.${code}`)}</div>
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
                            title={t('dashboard.recent')}
                            orders={summary.recentOrders}
                            emptyText={t('dashboard.noOrders')}
                            dateColumn="created"
                        />
                        <OrderListCard
                            title={t('dashboard.overdueList')}
                            orders={summary.overdueOrderList}
                            emptyText={t('dashboard.noOverdue')}
                            dateColumn="expected"
                        />
                    </div>
                </>
            )}
        </div>
    );
}

export default DashboardPage;