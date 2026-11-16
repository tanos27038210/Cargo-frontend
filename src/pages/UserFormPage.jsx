import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createUser, getUser, updateUser } from '../api/users';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ROLE_LABELS } from '../constants/roles';
import { getErrorMessage } from '../utils/errors';
import FormInput from '../components/FormInput';
import FormSelect from '../components/FormSelect';

const EMPTY_FORM = { fullName: '', email: '', password: '', role: '', isActive: true };

function UserFormPage() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const { user: currentUser } = useAuth();
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
                toast.error(getErrorMessage(err, 'Failed to load user'));
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
            e.fullName = 'Enter name';
        } else if (form.fullName.trim().length > 100) {
            e.fullName = 'Maximum 100 characters';
        }

        if (!form.email.trim()) {
            e.email = 'Enter email';
        } else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
            e.email = 'Invalid format email';
        } else if (form.email.trim().length > 150) {
            e.email = 'Maximum 150 characters';
        }

        if (!isEdit) {
            if (!form.password) {
                e.password = 'Enter password';
            } else if (form.password.length < 8) {
                e.password = 'Minimum 8 characters';
            } else if (form.password.length > 72) {
                e.password = 'Maximum 72 characters';
            }
        }

        if (!form.role) {
            e.role = 'Select role';
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
                toast.success('User updated');
            } else {
                await createUser({
                    fullName: form.fullName.trim(),
                    email,
                    password: form.password,
                    role: form.role,
                });
                toast.success('User created');
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
                setErrors({ email: data?.message || 'Email already exists' });
            } else {
                toast.error(getErrorMessage(err, 'Failed to save user'));
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    const roleOptions = Object.entries(ROLE_LABELS).map(([code, label]) => ({
        value: code,
        label,
    }));

    return (
        <div>
            <div className="page-header">
                <h1>{isEdit ? 'Edit user' : 'New user'}</h1>
            </div>

            <form className="entity-form" onSubmit={handleSubmit} noValidate>
                <div className="form-grid">
                    <FormInput label="Name" name="fullName" value={form.fullName} onChange={handleChange} error={errors.fullName} required />
                    <FormInput label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} required />

                    {!isEdit && (
                        <FormInput label="Password" name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} required />
                    )}

                    <FormSelect
                        label="Role"
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        error={errors.role}
                        options={roleOptions}
                        placeholder="Select role"
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
                        Active (can log in)
                    </label>
                )}

                {isSelf && (
                    <p className="muted">You cannot change your own role and status.</p>
                )}

                <div className="form-actions">
                    <Link to="/users" className="btn secondary">Cancel</Link>
                    <button type="submit" className="btn" disabled={saving}>
                        {saving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default UserFormPage;