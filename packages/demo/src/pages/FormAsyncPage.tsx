import { useForm, useAsync } from '@prismui/react';

export function FormAsyncPage() {
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
      <div className="demo-content__header">
        <h2 className="demo-content__title">Form & Async Runtime</h2>
        <p className="demo-content__subtitle">
          Runtime-managed form state and async operation tracking — all through the event system.
        </p>
      </div>

      <div className="info-card info-card--blue">
        Form fields and async operations are part of the <b>RuntimeState</b>.
        Every field change, validation, and submission is a dispatched event — fully auditable and replayable.
      </div>

      {/* Form API */}
      <div className="feature-section">
        <h3 className="feature-section__title">Form API</h3>
        <div className="code-block">
          {`const form = useForm();

form.registerField('email', '');        // Register with initial value
form.setValue('email', 'user@test.com'); // Set value (dispatches form/setValue)
form.setTouched('email');               // Mark as touched
form.validate(validatorFn);             // Run validation
form.submitStart();                     // Start submission
form.submitSuccess();                   // Mark success
form.reset();                           // Reset all fields`}
        </div>
      </div>

      {/* Try it: Form */}
      <div className="feature-section">
        <h3 className="feature-section__title">Try: Form Lifecycle</h3>
        <p className="feature-section__desc">
          Walk through the full form lifecycle. Each step dispatches Runtime events — watch the
          Event Log and Form State in the right panel.
        </p>
        <div className="feature-section__actions">
          <button className="btn" onClick={handleRegister}>1. Register Fields</button>
          <button className="btn" onClick={handleFill}>2. Fill Data</button>
          <button className="btn" onClick={handleValidate}>3. Validate</button>
          <button className="btn btn--primary" onClick={handleSubmit} disabled={form.isSubmitting}>
            4. Submit
          </button>
          <button className="btn btn--danger" onClick={handleSimulateError}>Async Error</button>
          <button className="btn" onClick={handleReset}>Reset</button>
        </div>

        {/* Form State Display */}
        <div className="result-display" style={{ marginBottom: 8 }}>
          submitting: <b>{String(form.isSubmitting)}</b> | submitCount: <b>{form.submitCount}</b> | dirty: <b>{String(form.isDirty())}</b> | valid: <b>{String(form.isValid())}</b>
        </div>

        {fieldNames.length > 0 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--color-text-secondary)' }}>
              Fields:
            </div>
            {fieldNames.map((name) => {
              const f = form.fields[name];
              return (
                <div key={name} className={`field-card ${f.error ? 'field-card--error' : f.dirty ? 'field-card--dirty' : 'field-card--clean'}`}>
                  <b>{name}</b>: {String(f.value)}
                  {f.error && <span style={{ color: 'var(--color-error)' }}> — {f.error}</span>}
                  {f.touched && <span style={{ color: 'var(--color-accent)' }}> (touched)</span>}
                  {f.dirty && <span style={{ color: 'var(--color-success)' }}> (dirty)</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Async API */}
      <div className="feature-section">
        <h3 className="feature-section__title">Async Operations</h3>
        <div className="code-block">
          {`const async_ = useAsync();

async_.start('fetchData');                       // Mark as loading
async_.success('fetchData', { patients: [...] }); // Mark success with data
async_.error('fetchData', 'Network timeout');     // Mark error
async_.reset('fetchData');                        // Reset to idle
async_.isLoading('fetchData');                    // Check status
async_.isAnyLoading();                            // Any op loading?`}
        </div>

        {opEntries.length > 0 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--color-text-secondary)' }}>
              Active operations:
            </div>
            {opEntries.map(([id, op]) => (
              <div key={id} className="data-row">
                <span className="data-row__label">{id}</span>
                <span className={`status-tag ${op.status === 'loading' ? 'status-tag--loading'
                    : op.status === 'success' ? 'status-tag--active'
                      : op.status === 'error' ? 'status-tag--error'
                        : 'status-tag--idle'
                  }`}>
                  {op.status}
                  {op.error && ` — ${op.error}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
