import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteCustomer, getCustomers } from '../api/customers';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';
import SearchBar from '../components/SearchBar';

const PAGE_SIZE = 10;

function CustomersPage() {
    const { user } = useAuth();
    const toast = useToast();

    const [data, setData] = useState({ content: [], totalPages: 0, totalElements: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [page, setPage] = useState(0);
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortDir, setSortDir] = useState('desc');
    const [search, setSearch] = useState('');
    const [reloadKey, setReloadKey] = useState(0);

    const [deleting, setDeleting] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await getCustomers({
                    page,
                    limit: PAGE_SIZE,
                    sortBy,
                    sortDir,
                    search: search || undefined,
                });
                setData(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load customer');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [page, sortBy, sortDir, search, reloadKey]);

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

    const handleDelete = async () => {
        setDeleteLoading(true);
        try {
            await deleteCustomer(deleting.id);
            toast.success('Customer deleted');
            setDeleting(null);
            if (data.content.length === 1 && page > 0) {
                setPage(page - 1);
            } else {
                setReloadKey((k) => k + 1);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete customer');
            setDeleting(null);
        } finally {
            setDeleteLoading(false);
        }
    };

    const columns = [
        { key: 'name', title: 'Name', sortable: true },
        { key: 'companyName', title: 'Company', render: (c) => c.companyName || '—' },
        { key: 'phone', title: 'Phone' },
        { key: 'email', title: 'Email', render: (c) => c.email || '—' },
        {
            key: 'createdAt',
            title: 'Created',
            sortable: true,
            render: (c) => c.createdAt.slice(0, 10),
        },
        {
            key: 'actions',
            title: '',
            render: (c) => (
                <div className="row-actions">
                    <Link to={`/customers/${c.id}/edit`}>Edit</Link>
                    {user?.role === 'ADMIN' && (
                        <button className="link-danger" onClick={() => setDeleting(c)}>
                            Delete
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div>
            <div className="page-header">
                <h1>Customers</h1>
                <span className="muted">Total: {data.totalElements}</span>
                <Link to="/customers/new" className="btn push-right">
                    Add customer
                </Link>
            </div>

            <SearchBar onSearch={handleSearch} placeholder="Name, email, phone or company" />

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
                emptyText="Customers not found"
            />

            <ConfirmDialog
                open={Boolean(deleting)}
                message={`Delete customer «${deleting?.name}»? This action cannot be undone.`}
                onConfirm={handleDelete}
                onCancel={() => setDeleting(null)}
                loading={deleteLoading}
            />
        </div>
    );
}

export default CustomersPage;