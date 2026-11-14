import { useState } from 'react';
import { DELIVERY_TYPE_LABELS, ORDER_STATUS_LABELS } from '../constants/statuses';

const EMPTY_FILTERS = {
    status: '',
    deliveryType: '',
    priceMin: '',
    priceMax: '',
    expectedFrom: '',
    expectedTo: '',
    createdFrom: '',
    createdTo: '',
    mine: false,
};

function OrderFilterPanel({ onApply }) {
    const [values, setValues] = useState(EMPTY_FILTERS);
    const [error, setError] = useState('');

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setValues((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (values.priceMin !== '' && values.priceMax !== '' &&
            Number(values.priceMin) > Number(values.priceMax)) {
            setError('Minimum price is greater than maximum price');
            return;
        }
        if (values.expectedFrom && values.expectedTo && values.expectedFrom > values.expectedTo) {
            setError('Expected date "from" is later than date "to"');
            return;
        }
        if (values.createdFrom && values.createdTo && values.createdFrom > values.createdTo) {
            setError('Creation date "from" is later than date "to"');
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
                    <span>Status</span>
                    <select name="status" value={values.status} onChange={handleChange}>
                        <option value="">All</option>
                        {Object.entries(ORDER_STATUS_LABELS).map(([code, label]) => (
                            <option key={code} value={code}>{label}</option>
                        ))}
                    </select>
                </label>

                <label className="form-field">
                    <span>Delivery type</span>
                    <select name="deliveryType" value={values.deliveryType} onChange={handleChange}>
                        <option value="">All</option>
                        {Object.entries(DELIVERY_TYPE_LABELS).map(([code, label]) => (
                            <option key={code} value={code}>{label}</option>
                        ))}
                    </select>
                </label>

                <label className="form-field">
                    <span>Min price</span>
                    <input type="number" min="0" name="priceMin" value={values.priceMin} onChange={handleChange} />
                </label>

                <label className="form-field">
                    <span>Max price</span>
                    <input type="number" min="0" name="priceMax" value={values.priceMax} onChange={handleChange} />
                </label>

                <label className="form-field">
                    <span>Expected from</span>
                    <input type="date" name="expectedFrom" value={values.expectedFrom} onChange={handleChange} />
                </label>

                <label className="form-field">
                    <span>Expected to</span>
                    <input type="date" name="expectedTo" value={values.expectedTo} onChange={handleChange} />
                </label>

                <label className="form-field">
                    <span>Created to</span>
                    <input type="date" name="createdFrom" value={values.createdFrom} onChange={handleChange} />
                </label>

                <label className="form-field">
                    <span>Created to</span>
                    <input type="date" name="createdTo" value={values.createdTo} onChange={handleChange} />
                </label>
            </div>

            <label className="checkbox-field">
                <input type="checkbox" name="mine" checked={values.mine} onChange={handleChange} />
                Only my orders
            </label>

            {error && <div className="form-error">{error}</div>}

            <div className="filter-actions">
                <button type="submit" className="btn">Apply</button>
                <button type="button" className="btn secondary" onClick={handleReset}>Reset</button>
            </div>
        </form>
    );
}

export default OrderFilterPanel;