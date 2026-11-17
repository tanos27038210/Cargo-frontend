import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createCustomer, getCustomer, updateCustomer } from '../api/customers';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errors';
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
    const { t } = useLanguage();

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
                toast.error(getErrorMessage(err, t('customerForm.loadError')));
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
            e.name = t('customerForm.errNameRequired');
        } else if (form.name.trim().length > 150) {
            e.name = t('common.errMax', { max: 150 });
        }
        if (form.companyName.trim().length > 150) {
            e.companyName = t('common.errMax', { max: 150 });
        }
        if (form.email.trim()) {
            if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
                e.email = t('common.errEmail');
            } else if (form.email.trim().length > 100) {
                e.email = t('common.errMax', { max: 100 });
            }
        }
        if (!form.phone.trim()) {
            e.phone = t('customerForm.errPhoneRequired');
        } else if (!/^[0-9+()\s-]{5,50}$/.test(form.phone.trim())) {
            e.phone = t('customerForm.errPhoneFormat');
        }
        if (form.address.trim().length > 100) {
            e.address = t('common.errMax', { max: 100 });
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
                toast.success(t('customerForm.updatedOk'));
            } else {
                await createCustomer(payload);
                toast.success(t('customerForm.createdOk'));
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
                toast.error(getErrorMessage(err, t('customerForm.saveError')));
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <p>{t('common.loading')}</p>;
    }

    return (
        <div>
            <div className="page-header">
                <h1>{isEdit ? t('customerForm.titleEdit') : t('customerForm.titleNew')}</h1>
            </div>

            <form className="entity-form" onSubmit={handleSubmit} noValidate>
                <div className="form-grid">
                    <FormInput label={t('customers.name')} name="name" value={form.name} onChange={handleChange} error={errors.name} required />
                    <FormInput label={t('customers.phone')} name="phone" value={form.phone} onChange={handleChange} error={errors.phone} required />
                    <FormInput label={t('customers.email')} name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} />
                    <FormInput label={t('customers.company')} name="companyName" value={form.companyName} onChange={handleChange} error={errors.companyName} />
                    <FormInput label={t('customerForm.address')} name="address" value={form.address} onChange={handleChange} error={errors.address} />
                </div>
                <FormTextarea label={t('common.notes')} name="notes" value={form.notes} onChange={handleChange} error={errors.notes} />

                <div className="form-actions">
                    <Link to="/customers" className="btn secondary">{t('common.cancel')}</Link>
                    <button type="submit" className="btn" disabled={saving}>
                        {saving ? t('common.saving') : t('common.save')}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CustomerFormPage;