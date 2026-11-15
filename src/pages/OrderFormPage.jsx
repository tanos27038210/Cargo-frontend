import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getCustomers } from '../api/customers';
import { createOrder, getOrder, updateOrder } from '../api/orders';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { DELIVERY_TYPE_LABELS } from '../constants/statuses';
import { getErrorMessage } from '../utils/errors';
import FormInput from '../components/FormInput';
import FormSelect from '../components/FormSelect';
import FormTextarea from '../components/FormTextarea';

const EMPTY_FORM = {
    customerId: '',
    originAddress: '',
    destinationAddress: '',
    deliveryType: '',
    price: '',
    expectedDeliveryDate: '',
    notes: '',
};

function OrderFormPage() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const { user } = useAuth();
    const toast = useToast();
    const navigate = useNavigate();

    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [customers, setCustomers] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const today = new Date().toLocaleDateString('en-CA');

    useEffect(() => {
        const load = async () => {
            try {
                if (isEdit) {
                    const response = await getOrder(id);
                    const o = response.data;

                    if (user.role !== 'ADMIN' && o.managerId !== user.id) {
                        toast.error('You can only modify your own orders.');
                        navigate(`/orders/${id}`, { replace: true });
                        return;
                    }

                    if (['DELIVERED', 'CANCELLED'].includes(o.status)) {
                        toast.error('A completed or cancelled order cannot be modified.');
                        navigate(`/orders/${id}`, { replace: true });
                        return;
                    }

                    setCustomerName(o.customerName);
                    setForm({
                        customerId: String(o.customerId),
                        originAddress: o.originAddress || '',
                        destinationAddress: o.destinationAddress || '',
                        deliveryType: o.deliveryType || '',
                        price: String(o.price),
                        expectedDeliveryDate: o.expectedDeliveryDate || '',
                        notes: o.notes || '',
                    });
                } else {
                    const response = await getCustomers({
                        page: 0,
                        limit: 100,
                        sortBy: 'name',
                        sortDir: 'asc',
                    });
                    setCustomers(response.data.content);
                }
            } catch (err) {
                toast.error(getErrorMessage(err, 'Failed to load date'));
                navigate('/orders', { replace: true });
                return;
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, isEdit]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        const e = {};

        if (!isEdit && !form.customerId) {
            e.customerId = 'Select a customer';
        }

        if (!form.originAddress.trim()) {
            e.originAddress = 'Enter the origin address';
        } else if (form.originAddress.trim().length > 100) {
            e.originAddress = 'Maximum 100 characters';
        }

        if (!form.destinationAddress.trim()) {
            e.destinationAddress = 'Enter the delivery address';
        } else if (form.destinationAddress.trim().length > 100) {
            e.destinationAddress = 'Maximum 100 characters';
        }

        if (!form.deliveryType) {
            e.deliveryType = 'Enter delivery type';
        }

        if (form.price === '') {
            e.price = 'Enter price';
        } else if (Number(form.price) < 0) {
            e.price = 'Price cannot be negative';
        } else if (!/^\d{1,8}(\.\d{1,2})?$/.test(form.price)) {
            e.price = 'Up to 8 digits before the decimal point and up to 2 after';
        }

        if (!form.expectedDeliveryDate) {
            e.expectedDeliveryDate = 'Enter the expected delivery date';
        } else if (!isEdit && form.expectedDeliveryDate < today) {
            e.expectedDeliveryDate = 'The date cannot be in the past';
        }

        if (form.notes.trim().length > 250) {
            e.notes = 'Maximum 250 characters';
        }

        return e;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const validationErrors = validate();
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        const common = {
            originAddress: form.originAddress.trim(),
            destinationAddress: form.destinationAddress.trim(),
            deliveryType: form.deliveryType,
            price: Number(form.price),
            expectedDeliveryDate: form.expectedDeliveryDate,
            notes: form.notes.trim() || null,
        };

        setSaving(true);
        try {
            if (isEdit) {
                await updateOrder(id, common);
                toast.success('Order updated');
                navigate(`/orders/${id}`);
            } else {
                const response = await createOrder({ ...common, customerId: Number(form.customerId) });
                toast.success('Order created');
                navigate(`/orders/${response.data.id}`);
            }
        } catch (err) {
            const data = err.response?.data;
            if (data?.details?.length) {
                const fieldErrors = {};
                data.details.forEach((d) => {
                    fieldErrors[d.field] = d.message;
                });
                setErrors(fieldErrors);
            } else {
                toast.error(getErrorMessage(err, 'Failed to save order'));
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <p>Загрузка...</p>;
    }

    const customerOptions = customers.map((c) => ({
        value: String(c.id),
        label: c.companyName ? `${c.name} (${c.companyName})` : c.name,
    }));

    const deliveryOptions = Object.entries(DELIVERY_TYPE_LABELS).map(([code, label]) => ({
        value: code,
        label,
    }));

    const backLink = isEdit ? `/orders/${id}` : '/orders';

    return (
        <div>
            <div className="page-header">
                <h1>{isEdit ? 'Edit order' : 'New order'}</h1>
            </div>

            <form className="entity-form" onSubmit={handleSubmit} noValidate>
                <div className="form-grid">
                    {isEdit ? (
                        <div className="form-field">
                            <span>Customer</span>
                            <div className="readonly-field">{customerName}</div>
                        </div>
                    ) : (
                        <FormSelect
                            label="Customer"
                            name="customerId"
                            value={form.customerId}
                            onChange={handleChange}
                            error={errors.customerId}
                            options={customerOptions}
                            placeholder="Select customer"
                            required
                        />
                    )}

                    <FormSelect
                        label="Delivery type"
                        name="deliveryType"
                        value={form.deliveryType}
                        onChange={handleChange}
                        error={errors.deliveryType}
                        options={deliveryOptions}
                        placeholder="Select a type"
                        required
                    />

                    <FormInput label="From" name="originAddress" value={form.originAddress} onChange={handleChange} error={errors.originAddress} required />
                    <FormInput label="To" name="destinationAddress" value={form.destinationAddress} onChange={handleChange} error={errors.destinationAddress} required />

                    <FormInput label="Price" name="price" type="number" value={form.price} onChange={handleChange} error={errors.price} required />
                    <FormInput label="Expected delivery date" name="expectedDeliveryDate" type="date" value={form.expectedDeliveryDate} onChange={handleChange} error={errors.expectedDeliveryDate} required />
                </div>

                <FormTextarea label="Notes" name="notes" value={form.notes} onChange={handleChange} error={errors.notes} />

                <div className="form-actions">
                    <Link to={backLink} className="btn secondary">Отмена</Link>
                    <button type="submit" className="btn" disabled={saving}>
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default OrderFormPage;