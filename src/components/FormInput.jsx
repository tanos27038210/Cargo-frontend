function FormInput({label, name, value, onChange, error, type = 'text', required = false}) {
    return (
        <label className="form-field">
            <span>
                {label}
                {required && <span className="required"> *</span>}
            </span>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                className={error ? 'has-error' : ''}
                />
            {error && <span className="field-error">{error}</span> }
        </label>
    );
}

export default FormInput;