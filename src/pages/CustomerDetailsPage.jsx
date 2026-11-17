import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getCustomer } from '../api/customers';
import { getOrders } from '../api/orders';
import { useToast } from '../context/ToastContext';
import { DELIVERY_TYPE_LABELS } from '../constants/statuses';
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
                toast.error(getErrorMessage(err, 'Failed to load customer'));
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
                toast.error(getErrorMessage(err, 'Failed to load customer'));
            } finally {
                setOrdersLoading(false);
            }
        };
        load();
    }, [id, page]);

    if (loading) {
        return <p>Loading...</p>;
    }
    if (!customer) {
        return null;
    }

    const columns = [
        {
            key: 'orderNumber',
            title: 'Number',
            render: (o) => <Link to={`/orders/${o.id}`}>{o.orderNumber}</Link>,
        },
        {
            key: 'route',
            title: 'Route',
            // Два адреса через стрелку
            render: (o) => `${o.originAddress} → ${o.destinationAddress}`,
        },
        {
            key: 'deliveryType',
            title: 'Delivery type',
            render: (o) => DELIVERY_TYPE_LABELS[o.deliveryType] || o.deliveryType,
        },
        {
            key: 'price',
            title: 'Price',
            render: (o) => Number(o.price).toFixed(2),
        },
        {
            key: 'status',
            title: 'Status',
            render: (o) => <StatusBadge status={o.status} />,
        },
        {
            key: 'expectedDeliveryDate',
            title: 'Expected',
        },
    ];

    return (
        <div>
            <div className="page-header">
                <h1>{customer.name}</h1>
                <div className="push-right header-actions">
                    <Link to={`/orders/new?customerId=${customer.id}`} className="btn">
                        Create order
                    </Link>
                    <Link to={`/customers/${customer.id}/edit`} className="btn secondary">
                        Edit
                    </Link>
                </div>
            </div>

            <section className="card">
                <h2>Information</h2>
                <div className="details-grid">
                    <InfoItem label="Phone number" value={customer.phone} />
                    <InfoItem label="Email" value={customer.email} />
                    <InfoItem label="Company" value={customer.companyName} />
                    <InfoItem label="Address" value={customer.address} />
                    <InfoItem label="Created at" value={formatDateTime(customer.createdAt)} />
                    <InfoItem label="Updated at" value={formatDateTime(customer.updatedAt)} />
                </div>
                <InfoItem label="Notes" value={customer.notes} />
            </section>

            <section className="card">
                <h2>Customer orders ({orders.totalElements})</h2>
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
                    emptyText="The customer has no orders yet"
                />
            </section>
        </div>
    );
}

export default CustomerDetailsPage;