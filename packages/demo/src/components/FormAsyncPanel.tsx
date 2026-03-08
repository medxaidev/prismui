import { useForm, useAsync } from '@prismui/react';

export function FormAsyncPanel() {
  const form = useForm();
  const async_ = useAsync();

  const handleRegister = () => {
    form.registerField('email', '');
    form.registerField('name', '');
  };

  const handleFill = () => {
    form.setValue('email', 'demo@prismui.dev');
    form.setValue('name', 'PrismUI User');
    form.setTouched('email');
    form.setTouched('name');
  };

  const handleValidate = () => {
    form.validate((fields) => ({
      email: fields.email?.value === '' ? 'Required' : null,
      name: fields.name?.value === '' ? 'Required' : null,
    }));
  };

  const handleSubmit = () => {
    form.submitStart();
    async_.start('formSubmit');

    // Simulate async submission
    setTimeout(() => {
      form.submitSuccess();
      async_.success('formSubmit', { ok: true });
    }, 800);
  };

  const handleSimulateError = () => {
    async_.start('fetchData');
    setTimeout(() => {
      async_.error('fetchData', 'Network timeout');
    }, 500);
  };

  const handleReset = () => {
    form.reset();
    async_.reset('formSubmit');
    async_.reset('fetchData');
  };

  const fieldNames = Object.keys(form.fields);
  const opEntries = Object.entries(async_.operations);

  return (
    <div>
      <h4 style={{ margin: '0 0 8px' }}>Stage-5: Form & Async</h4>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
        <button onClick={handleRegister} style={btnStyle}>Register Fields</button>
        <button onClick={handleFill} style={btnStyle}>Fill</button>
        <button onClick={handleValidate} style={btnStyle}>Validate</button>
        <button onClick={handleSubmit} style={btnStyle} disabled={form.isSubmitting}>Submit</button>
        <button onClick={handleSimulateError} style={btnStyle}>Async Error</button>
        <button onClick={handleReset} style={btnStyle}>Reset</button>
      </div>

      <div style={{ fontSize: '12px' }}>
        <div><b>isSubmitting:</b> {String(form.isSubmitting)} | <b>submitCount:</b> {form.submitCount}</div>
        <div><b>isDirty:</b> {String(form.isDirty())} | <b>isValid:</b> {String(form.isValid())}</div>

        {fieldNames.length > 0 && (
          <div style={{ marginTop: 4 }}>
            <b>Fields:</b>
            {fieldNames.map((name) => {
              const f = form.fields[name];
              return (
                <div key={name} style={{
                  padding: '2px 6px',
                  marginTop: 2,
                  borderRadius: 3,
                  background: f.error ? '#ffebee' : f.dirty ? '#e3f2fd' : '#f5f5f5',
                  fontSize: '11px',
                }}>
                  <b>{name}</b>: {String(f.value)}
                  {f.error && <span style={{ color: '#c62828' }}> ✗ {f.error}</span>}
                  {f.touched && <span style={{ color: '#1565c0' }}> (touched)</span>}
                  {f.dirty && <span style={{ color: '#2e7d32' }}> (dirty)</span>}
                </div>
              );
            })}
          </div>
        )}

        {opEntries.length > 0 && (
          <div style={{ marginTop: 4 }}>
            <b>Async Ops:</b>
            {opEntries.map(([id, op]) => (
              <div key={id} style={{
                padding: '2px 6px',
                marginTop: 2,
                borderRadius: 3,
                background: op.status === 'loading' ? '#fff8e1'
                  : op.status === 'success' ? '#e8f5e9'
                  : op.status === 'error' ? '#ffebee' : '#f5f5f5',
                fontSize: '11px',
              }}>
                <b>{id}</b>: {op.status}
                {op.error && <span style={{ color: '#c62828' }}> — {op.error}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: '2px 8px',
  fontSize: '11px',
  cursor: 'pointer',
};
