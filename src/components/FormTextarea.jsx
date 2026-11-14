function FormTextarea({ label, name, value, onChange, error, rows = 3 }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        className={error ? 'has-error' : ''}
      />
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}

export default FormTextarea;