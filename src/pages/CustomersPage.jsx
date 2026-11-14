import { useEffect, useState } from 'react';
import { getCustomers } from '../api/customers';
import DataTable from '../components/DataTable';
import SearchBar from '../components/SearchBar';

const PAGE_SIZE = 10;

function CustomersPage() {
    const [data, setData] = useState({ content: [], totalPages: 0, totalElements: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [page, setPage] = useState(0);
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortDir, setSortDir] = useState('desc');
    const [search, setSearch] = useState('');

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
                setError(err.response?.data?.message || 'Failed to load clients');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [page, sortBy, sortDir, search]);

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
    ];

    return (
        <div>
            <div className="page-header">
                <h1>Customers</h1>
                <span className="muted">Total: {data.totalElements}</span>
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
        </div>
    );
}

export default CustomersPage;