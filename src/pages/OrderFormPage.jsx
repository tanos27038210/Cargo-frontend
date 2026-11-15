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
                        toast.error('Менять можно только свои заказы');
                        navigate(`/orders/${id}`, { replace: true });
                        return;
                    }

                    if (['DELIVERED', 'CANCELLED'].includes(o.status)) {
                        toast.error('Завершённый или отменённый заказ изменить нельзя');
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
                toast.error(getErrorMessage(err, 'Не удалось загрузить данные'));
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
            e.customerId = 'Выберите клиента';
        }

        if (!form.originAddress.trim()) {
            e.originAddress = 'Введите адрес отправления';
        } else if (form.originAddress.trim().length > 100) {
            e.originAddress = 'Не больше 100 символов';
        }

        if (!form.destinationAddress.trim()) {
            e.destinationAddress = 'Введите адрес назначения';
        } else if (form.destinationAddress.trim().length > 100) {
            e.destinationAddress = 'Не больше 100 символов';
        }

        if (!form.deliveryType) {
            e.deliveryType = 'Выберите тип доставки';
        }

        if (form.price === '') {
            e.price = 'Введите цену';
        } else if (Number(form.price) < 0) {
            e.price = 'Цена не может быть отрицательной';
        } else if (!/^\d{1,8}(\.\d{1,2})?$/.test(form.price)) {
            e.price = 'До 8 цифр до запятой и до 2 после';
        }

        if (!form.expectedDeliveryDate) {
            e.expectedDeliveryDate = 'Укажите ожидаемую дату доставки';
        } else if (!isEdit && form.expectedDeliveryDate < today) {
            e.expectedDeliveryDate = 'Дата не может быть в прошлом';
        }

        if (form.notes.trim().length > 250) {
            e.notes = 'Не больше 250 символов';
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
                toast.success('Заказ обновлён');
                navigate(`/orders/${id}`);
            } else {
                const response = await createOrder({ ...common, customerId: Number(form.customerId) });
                toast.success('Заказ создан');
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
                toast.error(getErrorMessage(err, 'Не удалось сохранить заказ'));
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
                <h1>{isEdit ? 'Изменить заказ' : 'Новый заказ'}</h1>
            </div>

            <form className="entity-form" onSubmit={handleSubmit} noValidate>
                <div className="form-grid">
                    {isEdit ? (
                        <div className="form-field">
                            <span>Клиент</span>
                            <div className="readonly-field">{customerName}</div>
                        </div>
                    ) : (
                        <FormSelect
                            label="Клиент"
                            name="customerId"
                            value={form.customerId}
                            onChange={handleChange}
                            error={errors.customerId}
                            options={customerOptions}
                            placeholder="Выберите клиента"
                            required
                        />
                    )}

                    <FormSelect
                        label="Тип доставки"
                        name="deliveryType"
                        value={form.deliveryType}
                        onChange={handleChange}
                        error={errors.deliveryType}
                        options={deliveryOptions}
                        placeholder="Выберите тип"
                        required
                    />

                    <FormInput label="Откуда" name="originAddress" value={form.originAddress} onChange={handleChange} error={errors.originAddress} required />
                    <FormInput label="Куда" name="destinationAddress" value={form.destinationAddress} onChange={handleChange} error={errors.destinationAddress} required />

                    <FormInput label="Цена" name="price" type="number" value={form.price} onChange={handleChange} error={errors.price} required />
                    <FormInput label="Ожидаемая дата доставки" name="expectedDeliveryDate" type="date" value={form.expectedDeliveryDate} onChange={handleChange} error={errors.expectedDeliveryDate} required />
                </div>

                <FormTextarea label="Заметки" name="notes" value={form.notes} onChange={handleChange} error={errors.notes} />

                <div className="form-actions">
                    <Link to={backLink} className="btn secondary">Отмена</Link>
                    <button type="submit" className="btn" disabled={saving}>
                        {saving ? 'Сохранение...' : 'Сохранить'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default OrderFormPage;