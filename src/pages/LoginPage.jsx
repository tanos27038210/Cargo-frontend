import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

function LoginPage() {
    const { login, isAuthenticated } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [loading, setLoading] = useState(false);

    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    const validate = () => {
        const newErrors = {};
        if (!email.trim()) {
            newErrors.email = t('login.emailRequired');
        } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
            newErrors.email = t('login.emailInvalid');
        }
        if (!password) {
            newErrors.password = t('login.passwordRequired');
        }
        return newErrors;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setServerError('');

        const validationErrors = validate();
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) {
            return;
        }

        setLoading(true);
        try {
            await login(email.trim(), password);
            navigate('/', { replace: true });
        } catch (error) {
            const data = error.response?.data;
            if (data?.details?.length) {
                const fieldErrors = {};
                data.details.forEach((detail) => {
                    fieldErrors[detail.field] = detail.message;
                });
                setErrors(fieldErrors);
            } else {
                setServerError(data?.message || t('login.noConnection'));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-lang">
                <LanguageSwitcher variant="page" />
            </div>

            <form className="login-form" onSubmit={handleSubmit} noValidate>
                <h1>{t('app.name')}</h1>

                <label>
                    {t('login.email')}
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    {errors.email && <span className="field-error">{errors.email}</span>}
                </label>

                <label>
                    {t('login.password')}
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    {errors.password && <span className="field-error">{errors.password}</span>}
                </label>

                {serverError && <div className="form-error">{serverError}</div>}

                <button type="submit" disabled={loading}>
                    {loading ? t('login.submitting') : t('login.submit')}
                </button>
            </form>
        </div>
    );
}

export default LoginPage;