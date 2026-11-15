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
                toast.error(getErrorMessage(err, 'Не удалось загрузить заказ'));
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
            toast.success('Статус изменён');
            setReloadKey((k) => k + 1);
            return true;
        } catch (err) {
            toast.error(getErrorMessage(err, 'Не удалось изменить статус'));
            return false;
        } finally {
            setStatusLoading(false);
        }
    };

    const handleDelete = async () => {
        setDeleteLoading(true);
        try {
            await deleteOrder(id);
            toast.success('Заказ удалён');
            navigate('/orders', { replace: true });
        } catch (err) {
            toast.error(getErrorMessage(err, 'Не удалось удалить заказ'));
            setConfirmDelete(false);
        } finally {
            setDeleteLoading(false);
        }
    };

    if (loading) {
        return <p>Загрузка...</p>;
    }
    if (!order) {
        return null;
    }

    const isAdmin = user.role === 'ADMIN';
    const canModify = isAdmin || order.managerId === user.id;
    const allowedStatuses = getAllowedOrderStatuses(order.status, isAdmin);

    return (
        <div>
            <div className="page-header">
                <h1>Заказ {order.orderNumber}</h1>
                <StatusBadge status={order.status} />
                <div className="push-right header-actions">
                    {canModify && (
                        <Link to={`/orders/${order.id}/edit`} className="btn secondary">
                            Изменить
                        </Link>
                    )}
                    {isAdmin && (
                        <button className="btn danger" onClick={() => setConfirmDelete(true)}>
                            Удалить
                        </button>
                    )}
                </div>
            </div>

            <section className="card">
                <h2>Информация</h2>
                <div className="details-grid">
                    <InfoItem label="Клиент" value={order.customerName} />
                    <InfoItem label="Ответственный менеджер" value={order.managerFullName} />
                    <InfoItem label="Откуда" value={order.originAddress} />
                    <InfoItem label="Куда" value={order.destinationAddress} />
                    <InfoItem
                        label="Тип доставки"
                        value={DELIVERY_TYPE_LABELS[order.deliveryType] || order.deliveryType}
                    />
                    <InfoItem label="Цена" value={Number(order.price).toFixed(2)} />
                    <InfoItem label="Ожидаемая дата доставки" value={order.expectedDeliveryDate} />
                    <InfoItem label="Создан" value={formatDateTime(order.createdAt)} />
                    <InfoItem label="Обновлён" value={formatDateTime(order.updatedAt)} />
                </div>
                <InfoItem label="Заметки" value={order.notes} />
            </section>

            <section className="card">
                <h2>Смена статуса</h2>
                {canModify ? (
                    <StatusChangeDropdown
                        allowedStatuses={allowedStatuses}
                        onChange={handleStatusChange}
                        loading={statusLoading}
                    />
                ) : (
                    <p className="muted">
                        Менять статус может только ответственный менеджер или администратор.
                    </p>
                )}
            </section>

            <section className="card">
                <h2>История статусов</h2>
                {history.length === 0 ? (
                    <p className="muted">Изменений пока не было.</p>
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                            <tr>
                                <th>Дата</th>
                                <th>Было</th>
                                <th>Стало</th>
                                <th>Кто изменил</th>
                                <th>Комментарий</th>
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

            <ConfirmDialog
                open={confirmDelete}
                message={`Удалить заказ ${order.orderNumber} вместе с посылками и сообщениями? Это действие нельзя отменить.`}
                onConfirm={handleDelete}
                onCancel={() => setConfirmDelete(false)}
                loading={deleteLoading}
            />
        </div>
    );
}

export default OrderDetailsPage;