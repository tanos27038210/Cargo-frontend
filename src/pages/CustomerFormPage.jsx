import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createCustomer, getCustomer, updateCustomer } from '../api/customers';
import { useToast } from '../context/ToastContext';
import FormInput from '../components/FormInput';
import FormTextarea from '../components/FormTextarea';

const EMPTY_FORM = {
    name: '',
    companyName: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
};

function CustomerFormPage() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const toast = useToast();

    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isEdit) {
            return;
        }
        const load = async () => {
            try {
                const response = await getCustomer(id);
                const c = response.data;
                setForm({
                    name: c.name || '',
                    companyName: c.companyName || '',
                    email: c.email || '',
                    phone: c.phone || '',
                    address: c.address || '',
                    notes: c.notes || '',
                });
            } catch (err) {
                toast.error(err.response?.data?.message || 'Failed to load customer');
                navigate('/customers', { replace: true });
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
        if (!form.name.trim()) {
            e.name = 'Enter name';
        } else if (form.name.trim().length > 150) {
            e.name = 'Maximum 150 characters';
        }
        if (form.companyName.trim().length > 150) {
            e.companyName = 'Maximum 150 characters';
        }
        if (form.email.trim()) {
            if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
                e.email = 'Invalid format email';
            } else if (form.email.trim().length > 100) {
                e.email = 'Maximum 100 characters';
            }
        }
        if (!form.phone.trim()) {
            e.phone = 'Enter phone number';
        } else if (!/^[0-9+()\s-]{5,50}$/.test(form.phone.trim())) {
            e.phone = 'Digits, +, (, ), spaces and hyphens allowed, 5 to 50 characters';
        }
        if (form.address.trim().length > 100) {
            e.address = 'Maximum 100 characters';
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

        const payload = {
            name: form.name.trim(),
            companyName: form.companyName.trim() || null,
            email: form.email.trim() || null,
            phone: form.phone.trim(),
            address: form.address.trim() || null,
            notes: form.notes.trim() || null,
        };

        setSaving(true);
        try {
            if (isEdit) {
                await updateCustomer(id, payload);
                toast.success('Customer updated');
            } else {
                await createCustomer(payload);
                toast.success('Customer created');
            }
            navigate('/customers');
        } catch (err) {
            const data = err.response?.data;
            if (data?.details?.length) {
                const fieldErrors = {};
                data.details.forEach((d) => {
                    fieldErrors[d.field] = d.message;
                });
                setErrors(fieldErrors);
            } else {
                toast.error(data?.message || 'Failed to save customer');
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <p>Загрузка...</p>;
    }

    return (
        <div>
            <div className="page-header">
                <h1>{isEdit ? 'Update customer' : 'New customer'}</h1>
            </div>

            <form className="entity-form" onSubmit={handleSubmit} noValidate>
                <div className="form-grid">
                    <FormInput label="Name" name="name" value={form.name} onChange={handleChange} error={errors.name} required />
                    <FormInput label="Phone" name="phone" value={form.phone} onChange={handleChange} error={errors.phone} required />
                    <FormInput label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} />
                    <FormInput label="Company" name="companyName" value={form.companyName} onChange={handleChange} error={errors.companyName} />
                    <FormInput label="Address" name="address" value={form.address} onChange={handleChange} error={errors.address} />
                </div>
                <FormTextarea label="Заметки" name="notes" value={form.notes} onChange={handleChange} error={errors.notes} />

                <div className="form-actions">
                    <Link to="/customers" className="btn secondary">Отмена</Link>
                    <button type="submit" className="btn" disabled={saving}>
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CustomerFormPage;