import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrders } from '../api/orders';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getErrorMessage } from '../utils/errors';
import DataTable from '../components/DataTable';
import SearchBar from '../components/SearchBar';
import StatusBadge from '../components/StatusBadge';
import OrderFilterPanel from '../components/OrderFilterPanel';
import { EMPTY_FILTERS } from '../constants/filters';

const PAGE_SIZE = 10;
const FINISHED = ['DELIVERED', 'CANCELLED'];

const emptyToUndefined = (value) => (value === '' ? undefined : value);

function OrdersPage() {
    const { user } = useAuth();
    const { t } = useLanguage();

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
                setError(getErrorMessage(err, t('orders.loadError')));
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
            title: t('orders.number'),
            render: (o) => <Link to={`/orders/${o.id}`}>{o.orderNumber}</Link>,
        },
        { key: 'customerName', title: t('orders.customer') },
        {
            key: 'route',
            title: t('orders.route'),
            render: (o) => `${o.originAddress} → ${o.destinationAddress}`,
        },
        {
            key: 'deliveryType',
            title: t('orders.delivery'),
            render: (o) => t(`deliveryType.${o.deliveryType}`),
        },
        {
            key: 'price',
            title: t('orders.price'),
            sortable: true,
            render: (o) => Number(o.price).toFixed(2),
        },
        {
            key: 'status',
            title: t('orders.status'),
            sortable: true,
            render: (o) => <StatusBadge status={o.status} />,
        },
        {
            key: 'expectedDeliveryDate',
            title: t('orders.expected'),
            sortable: true,
            render: (o) => {
                const overdue = o.expectedDeliveryDate < today && !FINISHED.includes(o.status);
                return <span className={overdue ? 'overdue' : ''}>{o.expectedDeliveryDate}</span>;
            },
        },
        { key: 'managerFullName', title: t('orders.manager') },
        {
            key: 'createdAt',
            title: t('common.created'),
            sortable: true,
            render: (o) => o.createdAt.slice(0, 10),
        },
    ];

    return (
        <div>
            <div className="page-header">
                <h1>{t('orders.title')}</h1>
                <span className="muted">{t('common.total', { count: data.totalElements })}</span>
                <Link to="/orders/new" className="btn push-right">{t('orders.create')}</Link>
            </div>

            <SearchBar onSearch={handleSearch} placeholder={t('orders.searchPlaceholder')} />

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
                emptyText={t('orders.empty')}
            />
        </div>
    );
}

export default OrdersPage;