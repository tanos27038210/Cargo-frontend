import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrders } from '../api/orders';
import { useAuth } from '../context/AuthContext';
import { DELIVERY_TYPE_LABELS } from '../constants/statuses';
import DataTable from '../components/DataTable';
import OrderFilterPanel from '../components/OrderFilterPanel';
import SearchBar from '../components/SearchBar';
import StatusBadge from '../components/StatusBadge';

const PAGE_SIZE = 10;
const FINISHED = ['DELIVERED', 'CANCELLED'];

const EMPTY_FILTERS = {
    status: '',
    deliveryType: '',
    priceMin: '',
    priceMax: '',
    expectedFrom: '',
    expectedTo: '',
    createdFrom: '',
    createdTo: '',
    mine: false,
};

const emptyToUndefined = (value) => (value === '' ? undefined : value);

function OrdersPage() {
    const { user } = useAuth();

    const [data, setData] = useState({ content: [], totalPages: 0, totalElements: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [page, setPage] = useState(0);
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortDir, setSortDir] = useState('desc');
    const [search, setSearch] = useState('');
    const [filters, setFilters] = useState(EMPTY_FILTERS);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await getOrders({
                    page,
                    limit: PAGE_SIZE,
                    sortBy,
                    sortDir,
                    search: search || undefined,
                    status: emptyToUndefined(filters.status),
                    deliveryType: emptyToUndefined(filters.deliveryType),
                    managerId: filters.mine ? user.id : undefined,
                    priceMin: emptyToUndefined(filters.priceMin),
                    priceMax: emptyToUndefined(filters.priceMax),
                    expectedFrom: emptyToUndefined(filters.expectedFrom),
                    expectedTo: emptyToUndefined(filters.expectedTo),
                    createdFrom: emptyToUndefined(filters.createdFrom),
                    createdTo: emptyToUndefined(filters.createdTo),
                });
                setData(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load orders');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [page, sortBy, sortDir, search, filters, user.id]);

    const handleSort = (key) => {
        if (key === sortBy) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(key);
            setSortDir('asc');
        }
        setPage(0);
    };

    const handleSearch = (value) => {
        setSearch(value);
        setPage(0);
    };

    const handleApplyFilters = (values) => {
        setFilters(values);
        setPage(0);
    };

    const today = new Date().toLocaleDateString('en-CA');

    const columns = [
        {
            key: 'orderNumber',
            title: 'Number',
            render: (o) => <Link to={`/orders/${o.id}`}>{o.orderNumber}</Link>,
        },
        { key: 'customerName', title: 'Customer' },
        {
            key: 'route',
            title: 'Route',
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
            sortable: true,
            render: (o) => Number(o.price).toFixed(2),
        },
        {
            key: 'status',
            title: 'Status',
            sortable: true,
            render: (o) => <StatusBadge status={o.status} />,
        },
        {
            key: 'expectedDeliveryDate',
            title: 'Expected',
            sortable: true,
            render: (o) => {
                const overdue = o.expectedDeliveryDate < today && !FINISHED.includes(o.status);
                return <span className={overdue ? 'overdue' : ''}>{o.expectedDeliveryDate}</span>;
            },
        },
        { key: 'managerFullName', title: 'Manager' },
        {
            key: 'createdAt',
            title: 'Created at',
            sortable: true,
            render: (o) => o.createdAt.slice(0, 10),
        },
    ];

    return (
        <div>
            <div className="page-header">
                <h1>Orders</h1>
                <span className="muted">Total: {data.totalElements}</span>
                <Link to="/orders/new" className="btn push-right">Create order</Link>
            </div>

            <SearchBar onSearch={handleSearch} placeholder="Order number, client, city or package tracking number" />

            <OrderFilterPanel onApply={handleApplyFilters} />

            {error && <div className="form-error">{error}</div>}

            <DataTable
                columns={columns}
                rows={data.content}
                loading={loading}
                sortBy={sortBy}
                sortDir={sortDir}
                onSort={handleSort}
                page={page}
                totalPages={data.totalPages}
                onPageChange={setPage}
                emptyText="Orders not found"
            />
        </div>
    );
}

export default OrdersPage;