import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUsers, updateUser } from '../api/users';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errors';
import ConfirmDialog from '../components/ConfirmDialog';
import DataTable from '../components/DataTable';

const PAGE_SIZE = 10;

function UsersPage() {
    const { user: currentUser } = useAuth();
    const { t } = useLanguage();
    const toast = useToast();

    const [data, setData] = useState({ content: [], totalPages: 0, totalElements: 0 });
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
                const response = await getUsers({ page, limit: PAGE_SIZE, sortBy, sortDir });
                setData(response.data);
            } catch (err) {
                setError(getErrorMessage(err, t('users.loadError')));
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
            toast.success(active ? t('users.activated') : t('users.deactivated'));
            setDeactivating(null);
            setReloadKey((k) => k + 1);
        } catch (err) {
            toast.error(getErrorMessage(err, t('users.changeError')));
            setDeactivating(null);
        } finally {
            setActionLoading(false);
        }
    };

    const columns = [
        { key: 'fullName', title: t('users.name'), sortable: true },
        { key: 'email', title: t('users.email'), sortable: true },
        {
            key: 'role',
            title: t('users.role'),
            // Подпись роли из словаря по коду (ADMIN, MANAGER)
            render: (u) => t(`role.${u.role}`),
        },
        {
            key: 'isActive',
            title: t('users.status'),
            render: (u) => (
                <span className={u.isActive ? 'badge badge-active' : 'badge badge-inactive'}>
          {u.isActive ? t('users.active') : t('users.inactive')}
        </span>
            ),
        },
        {
            key: 'createdAt',
            title: t('common.created'),
            sortable: true,
            render: (u) => (u.createdAt ? u.createdAt.slice(0, 10) : '—'),
        },
        {
            key: 'actions',
            title: '',
            render: (u) => (
                <div className="row-actions">
                    <Link to={`/users/${u.id}/edit`}>{t('common.edit')}</Link>
                    {u.email === currentUser.email ? (
                        <span className="muted">{t('users.you')}</span>
                    ) : u.isActive ? (
                        <button className="link-danger" onClick={() => setDeactivating(u)}>
                            {t('users.deactivate')}
                        </button>
                    ) : (
                        <button className="link-action" onClick={() => changeActive(u, true)}>
                            {t('users.activate')}
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div>
            <div className="page-header">
                <h1>{t('users.title')}</h1>
                <span className="muted">{t('common.total', { count: data.totalElements })}</span>
                <Link to="/users/new" className="btn push-right">
                    {t('users.add')}
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
                emptyText={t('users.empty')}
            />

            <ConfirmDialog
                open={Boolean(deactivating)}
                title={t('users.deactivateTitle')}
                confirmText={t('users.deactivate')}
                message={t('users.deactivateMessage', { name: deactivating?.fullName ?? '' })}
                onConfirm={() => changeActive(deactivating, false)}
                onCancel={() => setDeactivating(null)}
                loading={actionLoading}
            />
        </div>
    );
}

export default UsersPage;