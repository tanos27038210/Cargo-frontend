import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createUser, getUser, updateUser } from '../api/users';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errors';
import FormInput from '../components/FormInput';
import FormSelect from '../components/FormSelect';

const EMPTY_FORM = { fullName: '', email: '', password: '', role: '', isActive: true };

const ROLES = ['ADMIN', 'MANAGER'];

function UserFormPage() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const { user: currentUser } = useAuth();
    const { t } = useLanguage();
    const toast = useToast();
    const navigate = useNavigate();

    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [isSelf, setIsSelf] = useState(false);
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isEdit) {
            return;
        }
        const load = async () => {
            try {
                const response = await getUser(id);
                const u = response.data;
                setForm({
                    fullName: u.fullName || '',
                    email: u.email || '',
                    password: '',
                    role: u.role || '',
                    isActive: Boolean(u.isActive),
                });
                setIsSelf(u.email === currentUser.email);
            } catch (err) {
                toast.error(getErrorMessage(err, t('userForm.loadError')));
                navigate('/users', { replace: true });
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, isEdit]);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const validate = () => {
        const e = {};

        if (!form.fullName.trim()) {
            e.fullName = t('userForm.errNameRequired');
        } else if (form.fullName.trim().length > 100) {
            e.fullName = t('common.errMax', { max: 100 });
        }

        if (!form.email.trim()) {
            e.email = t('userForm.errEmailRequired');
        } else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
            e.email = t('common.errEmail');
        } else if (form.email.trim().length > 150) {
            e.email = t('common.errMax', { max: 150 });
        }

        if (!isEdit) {
            if (!form.password) {
                e.password = t('userForm.errPasswordRequired');
            } else if (form.password.length < 8) {
                e.password = t('userForm.errPasswordMin');
            } else if (form.password.length > 72) {
                e.password = t('userForm.errPasswordMax');
            }
        }

        if (!form.role) {
            e.role = t('userForm.errRoleRequired');
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

        const email = form.email.trim().toLowerCase();

        setSaving(true);
        try {
            if (isEdit) {
                await updateUser(id, {
                    fullName: form.fullName.trim(),
                    email,
                    role: form.role,
                    isActive: form.isActive,
                });
                toast.success(t('userForm.updatedOk'));
            } else {
                await createUser({
                    fullName: form.fullName.trim(),
                    email,
                    password: form.password,
                    role: form.role,
                });
                toast.success(t('userForm.createdOk'));
            }
            navigate('/users');
        } catch (err) {
            const data = err.response?.data;
            if (data?.details?.length) {
                const fieldErrors = {};
                data.details.forEach((d) => {
                    fieldErrors[d.field] = d.message;
                });
                setErrors(fieldErrors);
            } else if (err.response?.status === 409) {
                setErrors({ email: data?.message });
            } else {
                toast.error(getErrorMessage(err, t('userForm.saveError')));
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <p>{t('common.loading')}</p>;
    }

    const roleOptions = ROLES.map((code) => ({ value: code, label: t(`role.${code}`) }));

    return (
        <div>
            <div className="page-header">
                <h1>{isEdit ? t('userForm.titleEdit') : t('userForm.titleNew')}</h1>
            </div>

            <form className="entity-form" onSubmit={handleSubmit} noValidate>
                <div className="form-grid">
                    <FormInput label={t('users.name')} name="fullName" value={form.fullName} onChange={handleChange} error={errors.fullName} required />
                    <FormInput label={t('users.email')} name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} required />

                    {!isEdit && (
                        <FormInput label={t('userForm.password')} name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} required />
                    )}

                    <FormSelect
                        label={t('users.role')}
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        error={errors.role}
                        options={roleOptions}
                        placeholder={t('userForm.rolePlaceholder')}
                        disabled={isSelf}
                        required
                    />
                </div>

                {isEdit && (
                    <label className="checkbox-field">
                        <input
                            type="checkbox"
                            name="isActive"
                            checked={form.isActive}
                            onChange={handleChange}
                            disabled={isSelf}
                        />
                        {t('userForm.activeLabel')}
                    </label>
                )}

                {isSelf && <p className="muted">{t('userForm.selfNote')}</p>}

                <div className="form-actions">
                    <Link to="/users" className="btn secondary">{t('common.cancel')}</Link>
                    <button type="submit" className="btn" disabled={saving}>
                        {saving ? t('common.saving') : t('common.save')}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default UserFormPage;