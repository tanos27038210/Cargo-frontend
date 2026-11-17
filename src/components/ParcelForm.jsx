import { useState } from 'react';
import { createParcel, updateParcel } from '../api/parcels';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errors';
import FormInput from './FormInput';

const DIMENSION_PATTERN = /^\d{1,6}(\.\d{1,2})?$/;
const VALUE_PATTERN = /^\d{1,8}(\.\d{1,2})?$/;

function toForm(parcel) {
    if (!parcel) {
        return {
            description: '',
            weightKg: '',
            lengthCm: '',
            widthCm: '',
            heightCm: '',
            declaredValue: '0',
            fragile: false,
        };
    }
    return {
        description: parcel.description || '',
        weightKg: String(parcel.weightKg),
        lengthCm: parcel.lengthCm == null ? '' : String(parcel.lengthCm),
        widthCm: parcel.widthCm == null ? '' : String(parcel.widthCm),
        heightCm: parcel.heightCm == null ? '' : String(parcel.heightCm),
        declaredValue: String(parcel.declaredValue),
        fragile: Boolean(parcel.fragile),
    };
}

const toNumberOrNull = (value) => (value === '' ? null : Number(value));

function ParcelForm({ orderId, parcel, onSaved, onCancel }) {
    const isEdit = Boolean(parcel);
    const { t } = useLanguage();
    const toast = useToast();

    const [form, setForm] = useState(() => toForm(parcel));
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const validateDimension = (value) => {
        if (value === '') {
            return '';
        }
        if (Number(value) <= 0) {
            return t('parcelForm.errPositive');
        }
        if (!DIMENSION_PATTERN.test(value)) {
            return t('parcelForm.errDigits6');
        }
        return '';
    };

    const validate = () => {
        const e = {};

        if (!form.description.trim()) {
            e.description = t('parcelForm.errDescription');
        } else if (form.description.trim().length > 100) {
            e.description = t('common.errMax', { max: 100 });
        }

        if (form.weightKg === '') {
            e.weightKg = t('parcelForm.errWeightRequired');
        } else if (Number(form.weightKg) <= 0) {
            e.weightKg = t('parcelForm.errWeightPositive');
        } else if (!DIMENSION_PATTERN.test(form.weightKg)) {
            e.weightKg = t('parcelForm.errDigits6');
        }

        const lengthError = validateDimension(form.lengthCm);
        if (lengthError) {
            e.lengthCm = lengthError;
        }
        const widthError = validateDimension(form.widthCm);
        if (widthError) {
            e.widthCm = widthError;
        }
        const heightError = validateDimension(form.heightCm);
        if (heightError) {
            e.heightCm = heightError;
        }

        if (form.declaredValue === '') {
            e.declaredValue = t('parcelForm.errValueRequired');
        } else if (Number(form.declaredValue) < 0) {
            e.declaredValue = t('parcelForm.errValueNegative');
        } else if (!VALUE_PATTERN.test(form.declaredValue)) {
            e.declaredValue = t('parcelForm.errDigits8');
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
            description: form.description.trim(),
            weightKg: Number(form.weightKg),
            lengthCm: toNumberOrNull(form.lengthCm),
            widthCm: toNumberOrNull(form.widthCm),
            heightCm: toNumberOrNull(form.heightCm),
            declaredValue: Number(form.declaredValue),
            fragile: form.fragile,
        };

        setSaving(true);
        try {
            if (isEdit) {
                await updateParcel(parcel.id, payload);
                toast.success(t('parcelForm.updatedOk'));
            } else {
                await createParcel(orderId, payload);
                toast.success(t('parcelForm.createdOk'));
            }
            onSaved();
        } catch (err) {
            const data = err.response?.data;
            if (data?.details?.length) {
                const fieldErrors = {};
                data.details.forEach((d) => {
                    fieldErrors[d.field] = d.message;
                });
                setErrors(fieldErrors);
            } else {
                toast.error(getErrorMessage(err, t('parcelForm.saveError')));
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="dialog-overlay">
            <div className="dialog dialog-wide">
                <h2>{isEdit ? t('parcelForm.titleEdit') : t('parcelForm.titleNew')}</h2>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-grid">
                        <FormInput label={t('parcelForm.description')} name="description" value={form.description} onChange={handleChange} error={errors.description} required />
                        <FormInput label={t('parcelForm.weight')} name="weightKg" type="number" value={form.weightKg} onChange={handleChange} error={errors.weightKg} required />
                        <FormInput label={t('parcelForm.length')} name="lengthCm" type="number" value={form.lengthCm} onChange={handleChange} error={errors.lengthCm} />
                        <FormInput label={t('parcelForm.width')} name="widthCm" type="number" value={form.widthCm} onChange={handleChange} error={errors.widthCm} />
                        <FormInput label={t('parcelForm.height')} name="heightCm" type="number" value={form.heightCm} onChange={handleChange} error={errors.heightCm} />
                        <FormInput label={t('parcelForm.value')} name="declaredValue" type="number" value={form.declaredValue} onChange={handleChange} error={errors.declaredValue} required />
                    </div>

                    <label className="checkbox-field">
                        <input type="checkbox" name="fragile" checked={form.fragile} onChange={handleChange} />
                        {t('parcelForm.fragile')}
                    </label>

                    <div className="dialog-actions">
                        <button type="button" className="btn secondary" onClick={onCancel} disabled={saving}>
                            {t('common.cancel')}
                        </button>
                        <button type="submit" className="btn" disabled={saving}>
                            {saving ? t('common.saving') : t('common.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ParcelForm;