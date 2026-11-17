import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { changeOrderStatus, deleteOrder, getOrder, getOrderHistory } from '../api/orders';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { getAllowedOrderStatuses } from '../constants/transitions';
import { getErrorMessage } from '../utils/errors';
import { formatDateTime } from '../utils/format';
import ConfirmDialog from '../components/ConfirmDialog';
import InfoItem from '../components/InfoItem';
import MessagesSection from '../components/MessagesSection';
import ParcelsSection from '../components/ParcelsSection';
import StatusBadge from '../components/StatusBadge';
import StatusChangeDropdown from '../components/StatusChangeDropdown';

function OrderDetailsPage() {
    const { id } = useParams();
    const { user } = useAuth();
    const { t } = useLanguage();
    const toast = useToast();
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusLoading, setStatusLoading] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        const load = async () => {
            try {
                const [orderResponse, historyResponse] = await Promise.all([
                    getOrder(id),
                    getOrderHistory(id),
                ]);
                setOrder(orderResponse.data);
                setHistory(historyResponse.data);
            } catch (err) {
                toast.error(getErrorMessage(err, t('orderDetails.loadError')));
                navigate('/orders', { replace: true });
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, reloadKey]);

    const handleStatusChange = async (newStatus, comment) => {
        setStatusLoading(true);
        try {
            await changeOrderStatus(id, { newStatus, comment: comment || null });
            toast.success(t('orderDetails.statusChanged'));
            setReloadKey((k) => k + 1);
            return true;
        } catch (err) {
            toast.error(getErrorMessage(err, t('orderDetails.statusError')));
            return false;
        } finally {
            setStatusLoading(false);
        }
    };

    const handleDelete = async () => {
        setDeleteLoading(true);
        try {
            await deleteOrder(id);
            toast.success(t('orderDetails.deleted'));
            navigate('/orders', { replace: true });
        } catch (err) {
            toast.error(getErrorMessage(err, t('orderDetails.deleteError')));
            setConfirmDelete(false);
        } finally {
            setDeleteLoading(false);
        }
    };

    if (loading) {
        return <p>{t('common.loading')}</p>;
    }
    if (!order) {
        return null;
    }

    const isAdmin = user.role === 'ADMIN';
    const canModify = isAdmin || order.managerId === user.id;
    const isFinished = ['DELIVERED', 'CANCELLED'].includes(order.status);
    const allowedStatuses = getAllowedOrderStatuses(order.status, isAdmin);

    return (
        <div>
            <div className="page-header">
                <h1>{t('orderDetails.title', { number: order.orderNumber })}</h1>
                <StatusBadge status={order.status} />
                <div className="push-right header-actions">
                    {canModify && !isFinished && (
                        <Link to={`/orders/${order.id}/edit`} className="btn secondary">
                            {t('common.edit')}
                        </Link>
                    )}
                    {isAdmin && (
                        <button className="btn danger" onClick={() => setConfirmDelete(true)}>
                            {t('common.delete')}
                        </button>
                    )}
                </div>
            </div>

            <section className="card">
                <h2>{t('orderDetails.info')}</h2>
                <div className="details-grid">
                    <InfoItem label={t('orders.customer')} value={order.customerName} />
                    <InfoItem label={t('orderDetails.manager')} value={order.managerFullName} />
                    <InfoItem label={t('orderDetails.from')} value={order.originAddress} />
                    <InfoItem label={t('orderDetails.to')} value={order.destinationAddress} />
                    <InfoItem label={t('orderDetails.deliveryType')} value={t(`deliveryType.${order.deliveryType}`)} />
                    <InfoItem label={t('orderDetails.price')} value={Number(order.price).toFixed(2)} />
                    <InfoItem label={t('orderDetails.expectedDate')} value={order.expectedDeliveryDate} />
                    <InfoItem label={t('common.created')} value={formatDateTime(order.createdAt)} />
                    <InfoItem label={t('common.updated')} value={formatDateTime(order.updatedAt)} />
                </div>
                <InfoItem label={t('common.notes')} value={order.notes} />
            </section>

            <ParcelsSection
                orderId={order.id}
                canModify={canModify}
                isAdmin={isAdmin}
                orderFinished={isFinished}
            />

            <section className="card">
                <h2>{t('orderDetails.statusSection')}</h2>
                {canModify ? (
                    <StatusChangeDropdown
                        allowedStatuses={allowedStatuses}
                        onChange={handleStatusChange}
                        loading={statusLoading}
                    />
                ) : (
                    <p className="muted">{t('orderDetails.noRights')}</p>
                )}
            </section>

            <section className="card">
                <h2>{t('orderDetails.history')}</h2>
                {history.length === 0 ? (
                    <p className="muted">{t('orderDetails.noHistory')}</p>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                            <tr>
                                <th>{t('orderDetails.histDate')}</th>
                                <th>{t('orderDetails.histFrom')}</th>
                                <th>{t('orderDetails.histTo')}</th>
                                <th>{t('orderDetails.histBy')}</th>
                                <th>{t('orderDetails.histComment')}</th>
                            </tr>
                            </thead>
                            <tbody>
                            {history.map((h) => (
                                <tr key={h.id}>
                                    <td>{formatDateTime(h.createdAt)}</td>
                                    <td><StatusBadge status={h.oldStatus} type={h.entityType === 'PARCEL' ? 'parcel' : 'order'} /></td>
                                    <td><StatusBadge status={h.newStatus} type={h.entityType === 'PARCEL' ? 'parcel' : 'order'} /></td>
                                    <td>{h.changedByName}</td>
                                    <td>{h.comment || '—'}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            <MessagesSection orderId={order.id} canAccess={canModify} />

            <ConfirmDialog
                open={confirmDelete}
                message={t('orderDetails.deleteMessage', { number: order.orderNumber })}
                onConfirm={handleDelete}
                onCancel={() => setConfirmDelete(false)}
                loading={deleteLoading}
            />
        </div>
    );
}

export default OrderDetailsPage;