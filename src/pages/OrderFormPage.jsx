import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getCustomers } from '../api/customers';
import { createOrder, getOrder, updateOrder } from '../api/orders';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { DELIVERY_TYPES } from '../constants/statuses';
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
    const [searchParams] = useSearchParams();
    const { user } = useAuth();
    const { t } = useLanguage();
    const toast = useToast();
    const navigate = useNavigate();

    const [form, setForm] = useState(() => ({
        ...EMPTY_FORM,
        customerId: searchParams.get('customerId') || '',
    }));
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
                        toast.error(t('orderForm.ownOnly'));
                        navigate(`/orders/${id}`, { replace: true });
                        return;
                    }
                    if (['DELIVERED', 'CANCELLED'].includes(o.status)) {
                        toast.error(t('orderForm.finished'));
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
                toast.error(getErrorMessage(err, t('orderForm.loadError')));
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
            e.customerId = t('orderForm.errCustomer');
        }

        if (!form.originAddress.trim()) {
            e.originAddress = t('orderForm.errOrigin');
        } else if (form.originAddress.trim().length > 100) {
            e.originAddress = t('common.errMax', { max: 100 });
        }

        if (!form.destinationAddress.trim()) {
            e.destinationAddress = t('orderForm.errDestination');
        } else if (form.destinationAddress.trim().length > 100) {
            e.destinationAddress = t('common.errMax', { max: 100 });
        }

        if (!form.deliveryType) {
            e.deliveryType = t('orderForm.errDelivery');
        }

        if (form.price === '') {
            e.price = t('orderForm.errPriceRequired');
        } else if (Number(form.price) < 0) {
            e.price = t('orderForm.errPriceNegative');
        } else if (!/^\d{1,8}(\.\d{1,2})?$/.test(form.price)) {
            e.price = t('orderForm.errPriceFormat');
        }

        if (!form.expectedDeliveryDate) {
            e.expectedDeliveryDate = t('orderForm.errDateRequired');
        } else if (!isEdit && form.expectedDeliveryDate < today) {
            e.expectedDeliveryDate = t('orderForm.errDatePast');
        }

        if (form.notes.trim().length > 250) {
            e.notes = t('common.errMax', { max: 250 });
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
                toast.success(t('orderForm.updatedOk'));
                navigate(`/orders/${id}`);
            } else {
                const response = await createOrder({ ...common, customerId: Number(form.customerId) });
                toast.success(t('orderForm.createdOk'));
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
                toast.error(getErrorMessage(err, t('orderForm.saveError')));
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <p>{t('common.loading')}</p>;
    }

    const customerOptions = customers.map((c) => ({
        value: String(c.id),
        label: c.companyName ? `${c.name} (${c.companyName})` : c.name,
    }));

    const deliveryOptions = DELIVERY_TYPES.map((code) => ({
        value: code,
        label: t(`deliveryType.${code}`),
    }));

    const backLink = isEdit ? `/orders/${id}` : '/orders';

    return (
        <div>
            <div className="page-header">
                <h1>{isEdit ? t('orderForm.titleEdit') : t('orderForm.titleNew')}</h1>
            </div>

            <form className="entity-form" onSubmit={handleSubmit} noValidate>
                <div className="form-grid">
                    {isEdit ? (
                        <div className="form-field">
                            <span>{t('orderForm.customer')}</span>
                            <div className="readonly-field">{customerName}</div>
                        </div>
                    ) : (
                        <FormSelect
                            label={t('orderForm.customer')}
                            name="customerId"
                            value={form.customerId}
                            onChange={handleChange}
                            error={errors.customerId}
                            options={customerOptions}
                            placeholder={t('orderForm.customerPlaceholder')}
                            required
                        />
                    )}

                    <FormSelect
                        label={t('orderForm.deliveryType')}
                        name="deliveryType"
                        value={form.deliveryType}
                        onChange={handleChange}
                        error={errors.deliveryType}
                        options={deliveryOptions}
                        placeholder={t('orderForm.deliveryPlaceholder')}
                        required
                    />

                    <FormInput label={t('orderForm.origin')} name="originAddress" value={form.originAddress} onChange={handleChange} error={errors.originAddress} required />
                    <FormInput label={t('orderForm.destination')} name="destinationAddress" value={form.destinationAddress} onChange={handleChange} error={errors.destinationAddress} required />

                    <FormInput label={t('orderForm.price')} name="price" type="number" value={form.price} onChange={handleChange} error={errors.price} required />
                    <FormInput label={t('orderForm.expectedDate')} name="expectedDeliveryDate" type="date" value={form.expectedDeliveryDate} onChange={handleChange} error={errors.expectedDeliveryDate} required />
                </div>

                <FormTextarea label={t('common.notes')} name="notes" value={form.notes} onChange={handleChange} error={errors.notes} />

                <div className="form-actions">
                    <Link to={backLink} className="btn secondary">{t('common.cancel')}</Link>
                    <button type="submit" className="btn" disabled={saving}>
                        {saving ? t('common.saving') : t('common.save')}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default OrderFormPage;