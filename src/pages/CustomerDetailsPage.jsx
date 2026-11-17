import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getCustomer } from '../api/customers';
import { getOrders } from '../api/orders';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errors';
import { formatDateTime } from '../utils/format';
import DataTable from '../components/DataTable';
import InfoItem from '../components/InfoItem';
import StatusBadge from '../components/StatusBadge';

const PAGE_SIZE = 5;

function CustomerDetailsPage() {
    const { id } = useParams();
    const toast = useToast();
    const navigate = useNavigate();
    const { t } = useLanguage();

    const [customer, setCustomer] = useState(null);
    const [loading, setLoading] = useState(true);

    const [orders, setOrders] = useState({ content: [], totalPages: 0, totalElements: 0 });
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [page, setPage] = useState(0);

    useEffect(() => {
        const load = async () => {
            try {
                const response = await getCustomer(id);
                setCustomer(response.data);
            } catch (err) {
                toast.error(getErrorMessage(err, t('customerDetails.loadError')));
                navigate('/customers', { replace: true });
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    useEffect(() => {
        const load = async () => {
            setOrdersLoading(true);
            try {
                const response = await getOrders({
                    customerId: id,
                    page,
                    limit: PAGE_SIZE,
                    sortBy: 'createdAt',
                    sortDir: 'desc',
                });
                setOrders(response.data);
            } catch (err) {
                toast.error(getErrorMessage(err, t('customerDetails.ordersLoadError')));
            } finally {
                setOrdersLoading(false);
            }
        };
        load();
    }, [id, page]);

    if (loading) {
        return <p>{t('common.loading')}</p>;
    }
    if (!customer) {
        return null;
    }

    const columns = [
        {
            key: 'orderNumber',
            title: t('orders.number'),
            render: (o) => <Link to={`/orders/${o.id}`}>{o.orderNumber}</Link>,
        },
        {
            key: 'route',
            title: t('orders.route'),
            render: (o) => `${o.originAddress} → ${o.destinationAddress}`,
        },
        {
            key: 'deliveryType',
            title: t('orders.delivery'),
            // Подпись типа доставки берём из словаря по коду
            render: (o) => t(`deliveryType.${o.deliveryType}`),
        },
        {
            key: 'price',
            title: t('orders.price'),
            render: (o) => Number(o.price).toFixed(2),
        },
        {
            key: 'status',
            title: t('orders.status'),
            render: (o) => <StatusBadge status={o.status} />,
        },
        { key: 'expectedDeliveryDate', title: t('orders.expected') },
    ];

    return (
        <div>
            <div className="page-header">
                <h1>{customer.name}</h1>
                <div className="push-right header-actions">
                    <Link to={`/orders/new?customerId=${customer.id}`} className="btn">
                        {t('customerDetails.createOrder')}
                    </Link>
                    <Link to={`/customers/${customer.id}/edit`} className="btn secondary">
                        {t('common.edit')}
                    </Link>
                </div>
            </div>

            <section className="card">
                <h2>{t('customerDetails.info')}</h2>
                <div className="details-grid">
                    <InfoItem label={t('customers.phone')} value={customer.phone} />
                    <InfoItem label={t('customers.email')} value={customer.email} />
                    <InfoItem label={t('customers.company')} value={customer.companyName} />
                    <InfoItem label={t('customerForm.address')} value={customer.address} />
                    <InfoItem label={t('common.created')} value={formatDateTime(customer.createdAt)} />
                    <InfoItem label={t('common.updated')} value={formatDateTime(customer.updatedAt)} />
                </div>
                <InfoItem label={t('common.notes')} value={customer.notes} />
            </section>

            <section className="card">
                <h2>{t('customerDetails.orders', { count: orders.totalElements })}</h2>
                <DataTable
                    columns={columns}
                    rows={orders.content}
                    loading={ordersLoading}
                    sortBy="createdAt"
                    sortDir="desc"
                    onSort={() => {}}
                    page={page}
                    totalPages={orders.totalPages}
                    onPageChange={setPage}
                    emptyText={t('customerDetails.noOrders')}
                />
            </section>
        </div>
    );
}

export default CustomerDetailsPage;