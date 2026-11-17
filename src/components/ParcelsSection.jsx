import { useEffect, useState } from 'react';
import { changeParcelStatus, deleteParcel, getOrderParcels } from '../api/parcels';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { getAllowedParcelStatuses } from '../constants/transitions';
import { getErrorMessage } from '../utils/errors';
import ConfirmDialog from './ConfirmDialog';
import ParcelForm from './ParcelForm';
import StatusBadge from './StatusBadge';
import StatusChangeDropdown from './StatusChangeDropdown';

function ParcelsSection({ orderId, canModify, isAdmin, orderFinished }) {
    const { t } = useLanguage();
    const toast = useToast();

    const [parcels, setParcels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reloadKey, setReloadKey] = useState(0);

    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [statusParcel, setStatusParcel] = useState(null);
    const [statusLoading, setStatusLoading] = useState(false);
    const [deleting, setDeleting] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const reload = () => setReloadKey((k) => k + 1);

    useEffect(() => {
        const load = async () => {
            try {
                const response = await getOrderParcels(orderId);
                setParcels(response.data);
            } catch (err) {
                toast.error(getErrorMessage(err, t('parcels.loadError')));
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [orderId, reloadKey]);

    const formatSize = (p) => {
        if (p.lengthCm == null && p.widthCm == null && p.heightCm == null) {
            return '—';
        }
        return `${p.lengthCm ?? '?'} × ${p.widthCm ?? '?'} × ${p.heightCm ?? '?'} ${t('parcels.cm')}`;
    };

    const openCreate = () => {
        setEditing(null);
        setFormOpen(true);
    };

    const openEdit = (parcel) => {
        setEditing(parcel);
        setFormOpen(true);
    };

    const closeForm = () => {
        setFormOpen(false);
        setEditing(null);
    };

    const handleSaved = () => {
        closeForm();
        reload();
    };

    const handleStatusChange = async (newStatus, comment) => {
        setStatusLoading(true);
        try {
            await changeParcelStatus(statusParcel.id, { newStatus, comment: comment || null });
            toast.success(t('parcels.statusChanged'));
            setStatusParcel(null);
            reload();
            return true;
        } catch (err) {
            toast.error(getErrorMessage(err, t('parcels.statusError')));
            return false;
        } finally {
            setStatusLoading(false);
        }
    };

    const handleDelete = async () => {
        setDeleteLoading(true);
        try {
            await deleteParcel(deleting.id);
            toast.success(t('parcels.deleted'));
            setDeleting(null);
            reload();
        } catch (err) {
            toast.error(getErrorMessage(err, t('parcels.deleteError')));
            setDeleting(null);
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <section className="card">
            <div className="card-header">
                <h2>{t('parcels.title', { count: parcels.length })}</h2>
                {canModify && !orderFinished && (
                    <button className="btn" onClick={openCreate}>
                        {t('parcels.add')}
                    </button>
                )}
            </div>

            {loading && <p className="muted">{t('common.loading')}</p>}
            {!loading && parcels.length === 0 && (
                <p className="muted">{t('parcels.none')}</p>
            )}

            {!loading && parcels.length > 0 && (
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                        <tr>
                            <th>{t('parcels.tracking')}</th>
                            <th>{t('parcels.description')}</th>
                            <th>{t('parcels.weight')}</th>
                            <th>{t('parcels.size')}</th>
                            <th>{t('parcels.value')}</th>
                            <th>{t('parcels.fragile')}</th>
                            <th>{t('parcels.status')}</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {parcels.map((p) => (
                            <tr key={p.id}>
                                <td>{p.trackingNumber}</td>
                                <td>{p.description}</td>
                                <td>{p.weightKg}</td>
                                <td>{formatSize(p)}</td>
                                <td>{Number(p.declaredValue).toFixed(2)}</td>
                                <td>{p.fragile ? t('common.yes') : t('common.no')}</td>
                                <td><StatusBadge status={p.status} type="parcel" /></td>
                                <td>
                                    <div className="row-actions">
                                        {canModify && (
                                            <button className="link-action" onClick={() => setStatusParcel(p)}>
                                                {t('parcels.status')}
                                            </button>
                                        )}
                                        {canModify && (
                                            <button className="link-action" onClick={() => openEdit(p)}>
                                                {t('common.edit')}
                                            </button>
                                        )}
                                        {isAdmin && (
                                            <button className="link-danger" onClick={() => setDeleting(p)}>
                                                {t('common.delete')}
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {formOpen && (
                <ParcelForm
                    orderId={orderId}
                    parcel={editing}
                    onSaved={handleSaved}
                    onCancel={closeForm}
                />
            )}

            {statusParcel && (
                <div className="dialog-overlay" onClick={() => setStatusParcel(null)}>
                    <div className="dialog dialog-wide" onClick={(e) => e.stopPropagation()}>
                        <h2>{t('parcels.statusTitle', { tracking: statusParcel.trackingNumber })}</h2>
                        <p>
                            {t('parcels.current')} <StatusBadge status={statusParcel.status} type="parcel" />
                        </p>
                        <StatusChangeDropdown
                            allowedStatuses={getAllowedParcelStatuses(statusParcel.status, isAdmin)}
                            onChange={handleStatusChange}
                            loading={statusLoading}
                            type="parcel"
                        />
                        <div className="dialog-actions">
                            <button className="btn secondary" onClick={() => setStatusParcel(null)}>
                                {t('common.close')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmDialog
                open={Boolean(deleting)}
                message={t('parcels.deleteMessage', { tracking: deleting?.trackingNumber ?? '' })}
                onConfirm={handleDelete}
                onCancel={() => setDeleting(null)}
                loading={deleteLoading}
            />
        </section>
    );
}

export default ParcelsSection;