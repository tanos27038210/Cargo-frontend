import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {getUsers, updateUser} from '../api/users';
import {useAuth} from '../context/AuthContext';
import {useToast} from '../context/ToastContext';
import {ROLE_LABELS} from '../constants/roles';
import {getErrorMessage} from '../utils/errors';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';

const PAGE_SIZE = 10;

function UsersPage() {
    const {user: currentUser} = useAuth();
    const toast = useToast();

    const [data, setData] = useState({content: [], totalPages: 0, totalElements: 0});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [page, setPage] = useState(0);
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortDir, setSortDir] = useState('desc');
    const [reloadKey, setReloadKey] = useState(0);

    const [deactivating, setDeactivating] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await getUsers({page, limit: PAGE_SIZE, sortBy, sortDir});
                setData(response.data);
            } catch (err) {
                setError(getErrorMessage(err, 'Failed to load user'));
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [page, sortBy, sortDir, reloadKey]);

    const handleSort = (key) => {
        if (key === sortBy) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(key);
            setSortDir('asc');
        }
        setPage(0);
    };

    const changeActive = async (target, active) => {
        setActionLoading(true);
        try {
            await updateUser(target.id, {
                fullName: target.fullName,
                email: target.email,
                role: target.role,
                isActive: active,
            });
            toast.success(active ? 'User activated' : 'User deactivated');
            setDeactivating(null);
            setReloadKey((k) => k + 1);
        } catch (err) {
            toast.error(getErrorMessage(err, 'Failed to edit user'));
            setDeactivating(null);
        } finally {
            setActionLoading(false);
        }
    };

    const columns = [
        {key: 'fullName', title: 'Name', sortable: true},
        {key: 'email', title: 'Email', sortable: true},
        {
            key: 'role',
            title: 'Role',
            render: (u) => ROLE_LABELS[u.role] || u.role,
        },
        {
            key: 'isActive',
            title: 'Status',
            render: (u) => (
                <span className={u.isActive ? 'badge badge-active' : 'badge badge-inactive'}>
          {u.isActive ? 'Active' : 'Deactivated'}
        </span>
            ),
        },
        {
            key: 'createdAt',
            title: 'Created at',
            sortable: true,
            render: (u) => (u.createdAt ? u.createdAt.slice(0, 10) : '—'),
        },
        {
            key: 'actions',
            title: '',
            render: (u) => (
                <div style={{
                    display: 'flex', justifyContent: 'flex-end', gap: '12px',
                    alignItems: 'center'
                }}>
                    <Link to={`/users/${u.id}/edit`}>Edit</Link>
                    <div style={{minWidth: '100px', textAlign: 'rigt'}}>
                        {u.email === currentUser.email ? (
                            <span className="muted">You</span>
                        ) : u.isActive ? (
                            <button className="link-danger" onClick={() => setDeactivating(u)}>
                                Deactivated
                            </button>
                        ) : (
                            <button className="link-action" onClick={() => changeActive(u, true)}>
                                Activate
                            </button>
                        )}
                    </div>
                </div>
            ),
        },
    ];

    return (
        <div>
            <div className="page-header">
                <h1>Users</h1>
                <span className="muted">Total: {data.totalElements}</span>
                <Link to="/users/new" className="btn push-right">
                    Add user
                </Link>
            </div>

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
                emptyText="User not found"
            />

            <ConfirmDialog
                open={Boolean(deactivating)}
                title="Deactivate user"
                confirmText="Deactivated"
                message={`Deactivated «${deactivating?.fullName}»? He will no longer be able to log in until you activate him.`}
                onConfirm={() => changeActive(deactivating, false)}
                onCancel={() => setDeactivating(null)}
                loading={actionLoading}
            />
        </div>
    );
}

export default UsersPage;