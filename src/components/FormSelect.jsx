function FormSelect({ label, name, value, onChange, error, options, placeholder = 'Выберите', required = false }) {
    return (
        <label className="form-field">
      <span>
        {label}
          {required && <span className="required"> *</span>}
      </span>
            <select
                name={name}
                value={value}
                onChange={onChange}
                className={error ? 'has-error' : ''}
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            {error && <span className="field-error">{error}</span>}
        </label>
    );
}

export default FormSelect;