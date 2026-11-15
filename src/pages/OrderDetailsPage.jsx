import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { changeOrderStatus, deleteOrder, getOrder, getOrderHistory} from '../api/orders';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { DELIVERY_TYPE_LABELS } from '../constants/statuses';
import { getAllowedOrderStatuses } from '../constants/transitions';
import { getErrorMessage } from '../utils/errors';
import { formatDateTime } from '../utils/format';
import ConfirmDialog from '../components/ConfirmDialog';
import StatusBadge from '../components/StatusBadge';
import StatusChangeDropdown from '../components/StatusChangeDropdown';
import ParcelsSection from '../components/ParcelsSection';
import MessagesSection from '../components/MessagesSection';

function InfoItem({ label, value }) {
    return (
        <div className="info-item">
            <div className="info-label">{label}</div>
            <div className="info-value">{value || '—'}</div>
        </div>
    );
}

function OrderDetailsPage() {
    const { id } = useParams();
    const { user } = useAuth();
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
        if (!id || id === 'undefined') return;

        const load = async () => {
            try {
                const [orderResponse, historyResponse] = await Promise.all([
                    getOrder(id),
                    getOrderHistory(id),
                ]);
                setOrder(orderResponse.data);
                setHistory(historyResponse.data);
            } catch (err) {
                toast.error(getErrorMessage(err, 'Failed to load order'));
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
            toast.success('Status updated');
            setReloadKey((k) => k + 1);
            return true;
        } catch (err) {
            toast.error(getErrorMessage(err, 'Failed to update status'));
            return false;
        } finally {
            setStatusLoading(false);
        }
    };

    const handleDelete = async () => {
        setDeleteLoading(true);
        try {
            await deleteOrder(id);
            toast.success('Order deleted');
            navigate('/orders', { replace: true });
        } catch (err) {
            toast.error(getErrorMessage(err, 'Failed to delete order'));
            setConfirmDelete(false);
        } finally {
            setDeleteLoading(false);
        }
    };

    if (loading) {
        return <p>Loading...</p>;
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
                <h1>Order {order.orderNumber}</h1>
                <StatusBadge status={order.status} />
                <div className="push-right header-actions">
                    {canModify && !isFinished && (
                        <Link to={`/orders/${order.id}/edit`} className="btn secondary">
                            Edit
                        </Link>
                    )}
                    {isAdmin && (
                        <button className="btn danger" onClick={() => setConfirmDelete(true)}>
                            Delete
                        </button>
                    )}
                </div>
            </div>

            <section className="card">
                <h2>Details</h2>
                <div className="details-grid">
                    <InfoItem label="Customer" value={order.customerName} />
                    <InfoItem label="Responsible manager" value={order.managerFullName} />
                    <InfoItem label="From" value={order.originAddress} />
                    <InfoItem label="To" value={order.destinationAddress} />
                    <InfoItem
                        label="Delivery type"
                        value={DELIVERY_TYPE_LABELS[order.deliveryType] || order.deliveryType}
                    />
                    <InfoItem label="Price" value={Number(order.price).toFixed(2)} />
                    <InfoItem label="Expected delivery date" value={order.expectedDeliveryDate} />
                    <InfoItem label="Created" value={formatDateTime(order.createdAt)} />
                    <InfoItem label="Updated" value={formatDateTime(order.updatedAt)} />
                </div>
                <InfoItem label="Notes" value={order.notes} />
            </section>

            <ParcelsSection
                orderId={order.id}
                canModify={canModify}
                isAdmin={isAdmin}
                orderFinished={isFinished}
            />

            <section className="card">
                <h2>Status change</h2>
                {canModify ? (
                    <StatusChangeDropdown
                        allowedStatuses={allowedStatuses}
                        onChange={handleStatusChange}
                        loading={statusLoading}
                    />
                ) : (
                    <p className="muted">
                        Only the responsible manager or administrator can change the status.
                    </p>
                )}
            </section>

            <section className="card">
                <h2>Status history</h2>
                {history.length === 0 ? (
                    <p className="muted">No changes yet</p>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                            <tr>
                                <th>Date</th>
                                <th>From</th>
                                <th>To</th>
                                <th>Changed by</th>
                                <th>Comment</th>
                            </tr>
                            </thead>
                            <tbody>
                            {history.map((h) => (
                                <tr key={h.id}>
                                    <td>{formatDateTime(h.createdAt)}</td>
                                    <td><StatusBadge status={h.oldStatus} /></td>
                                    <td><StatusBadge status={h.newStatus} /></td>
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
                message={`Delete parcel ${order.orderNumber} with parcels and messages? This action cannot be undone.`}
                onConfirm={handleDelete}
                onCancel={() => setConfirmDelete(false)}
                loading={deleteLoading}
            />
        </div>
    );
}

export default OrderDetailsPage;