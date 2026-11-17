import { useEffect, useState } from 'react';
import { changeParcelStatus, deleteParcel, getOrderParcels } from '../api/parcels';
import { useToast } from '../context/ToastContext';
import { getAllowedParcelStatuses } from '../constants/transitions';
import { getErrorMessage } from '../utils/errors';
import ConfirmDialog from './ConfirmDialog';
import ParcelForm from './ParcelForm';
import StatusBadge from './StatusBadge';
import StatusChangeDropdown from './StatusChangeDropdown';

const formatSize = (p) => {
    if (p.lengthCm == null && p.widthCm == null && p.heightCm == null) {
        return '—';
    }
    return `${p.lengthCm ?? '?'} × ${p.widthCm ?? '?'} × ${p.heightCm ?? '?'} см`;
};

function ParcelsSection({ orderId, canModify, isAdmin, orderFinished }) {
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
                toast.error(getErrorMessage(err, 'Failed to load parcel'));
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [orderId, reloadKey]);

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
            toast.success('Parcel status updated');
            setStatusParcel(null);
            reload();
            return true;
        } catch (err) {
            toast.error(getErrorMessage(err, 'Failed to update status'));
            return false;
        } finally {
            setStatusLoading(false);
        }
    };

    const handleDelete = async () => {
        setDeleteLoading(true);
        try {
            await deleteParcel(deleting.id);
            toast.success('Parcel deleted');
            setDeleting(null);
            reload();
        } catch (err) {
            toast.error(getErrorMessage(err, 'Failed to delete parcel'));
            setDeleting(null);
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <section className="card">
            <div className="card-header">
                <h2>Parcels ({parcels.length})</h2>
                {canModify && !orderFinished && (
                    <button className="btn" onClick={openCreate}>
                        Add parcel
                    </button>
                )}
            </div>

            {loading && <p className="muted">Loading...</p>}
            {!loading && parcels.length === 0 && (
                <p className="muted">There are no parcels in the order yet.</p>
            )}

            {!loading && parcels.length > 0 && (
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                        <tr>
                            <th>Tracking number</th>
                            <th>Description</th>
                            <th>Weight, kg</th>
                            <th>Size</th>
                            <th>Value</th>
                            <th>Fragile</th>
                            <th>Status</th>
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
                                <td>{p.fragile ? 'Yes' : 'No'}</td>
                                <td><StatusBadge status={p.status} type="parcel" /></td>
                                <td>
                                    <div className="row-actions">
                                        {canModify && (
                                            <button className="link-action" onClick={() => setStatusParcel(p)}>
                                                Status
                                            </button>
                                        )}
                                        {canModify && (
                                            <button className="link-action" onClick={() => openEdit(p)}>
                                                Edit
                                            </button>
                                        )}
                                        {isAdmin && (
                                            <button className="link-danger" onClick={() => setDeleting(p)}>
                                                Delete
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
                        <h2>Parcel status {statusParcel.trackingNumber}</h2>
                        <p>
                            Currently: <StatusBadge status={statusParcel.status} />
                        </p>
                        <StatusChangeDropdown
                            allowedStatuses={getAllowedParcelStatuses(statusParcel.status, isAdmin)}
                            onChange={handleStatusChange}
                            loading={statusLoading}
                            type="parcel"
                        />
                        <div className="dialog-actions">
                            <button className="btn secondary" onClick={() => setStatusParcel(null)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmDialog
                open={Boolean(deleting)}
                message={`Delete parcel ${deleting?.trackingNumber}? This action cannot be undone.`}
                onConfirm={handleDelete}
                onCancel={() => setDeleting(null)}
                loading={deleteLoading}
            />
        </section>
    );
}

export default ParcelsSection;