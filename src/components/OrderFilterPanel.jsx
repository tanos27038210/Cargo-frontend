import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { DELIVERY_TYPES, ORDER_STATUSES } from '../constants/statuses';
import { EMPTY_FILTERS } from '../constants/filters';

function OrderFilterPanel({ onApply }) {
    const { t } = useLanguage();
    const [values, setValues] = useState(EMPTY_FILTERS);
    const [error, setError] = useState('');

    // Один обработчик на все поля; для галочки берём checked, для остальных value
    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setValues((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        // Проверки диапазонов: тексты ошибок берём из словаря
        if (values.priceMin !== '' && values.priceMax !== '' &&
            Number(values.priceMin) > Number(values.priceMax)) {
            setError(t('filters.errPrice'));
            return;
        }
        if (values.expectedFrom && values.expectedTo && values.expectedFrom > values.expectedTo) {
            setError(t('filters.errExpected'));
            return;
        }
        if (values.createdFrom && values.createdTo && values.createdFrom > values.createdTo) {
            setError(t('filters.errCreated'));
            return;
        }

        setError('');
        onApply(values);
    };

    const handleReset = () => {
        setValues(EMPTY_FILTERS);
        setError('');
        onApply(EMPTY_FILTERS);
    };

    return (
        <form className="filter-panel" onSubmit={handleSubmit}>
            <div className="filter-grid">
                <label className="form-field">
                    <span>{t('filters.status')}</span>
                    <select name="status" value={values.status} onChange={handleChange}>
                        <option value="">{t('filters.all')}</option>
                        {/* Для каждого кода статуса заказа создаём пункт; подпись из словаря */}
                        {ORDER_STATUSES.map((code) => (
                            <option key={code} value={code}>{t(`orderStatus.${code}`)}</option>
                        ))}
                    </select>
                </label>

                <label className="form-field">
                    <span>{t('filters.deliveryType')}</span>
                    <select name="deliveryType" value={values.deliveryType} onChange={handleChange}>
                        <option value="">{t('filters.all')}</option>
                        {DELIVERY_TYPES.map((code) => (
                            <option key={code} value={code}>{t(`deliveryType.${code}`)}</option>
                        ))}
                    </select>
                </label>

                <label className="form-field">
                    <span>{t('filters.priceFrom')}</span>
                    <input type="number" min="0" name="priceMin" value={values.priceMin} onChange={handleChange} />
                </label>

                <label className="form-field">
                    <span>{t('filters.priceTo')}</span>
                    <input type="number" min="0" name="priceMax" value={values.priceMax} onChange={handleChange} />
                </label>

                <label className="form-field">
                    <span>{t('filters.expectedFrom')}</span>
                    <input type="date" name="expectedFrom" value={values.expectedFrom} onChange={handleChange} />
                </label>

                <label className="form-field">
                    <span>{t('filters.expectedTo')}</span>
                    <input type="date" name="expectedTo" value={values.expectedTo} onChange={handleChange} />
                </label>

                <label className="form-field">
                    <span>{t('filters.createdFrom')}</span>
                    <input type="date" name="createdFrom" value={values.createdFrom} onChange={handleChange} />
                </label>

                <label className="form-field">
                    <span>{t('filters.createdTo')}</span>
                    <input type="date" name="createdTo" value={values.createdTo} onChange={handleChange} />
                </label>
            </div>

            <label className="checkbox-field">
                <input type="checkbox" name="mine" checked={values.mine} onChange={handleChange} />
                {t('filters.mine')}
            </label>

            {error && <div className="form-error">{error}</div>}

            <div className="filter-actions">
                <button type="submit" className="btn">{t('filters.apply')}</button>
                <button type="button" className="btn secondary" onClick={handleReset}>{t('filters.reset')}</button>
            </div>
        </form>
    );
}

export default OrderFilterPanel;