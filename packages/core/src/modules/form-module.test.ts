import { describe, it, expect } from 'vitest';
import { createInteractionRuntime } from '../runtime';
import { createFormModule, type FormController, type FieldState } from './form-module';
import { createAuditTrail } from '../governance/audit-trail';
import { createAuditMiddleware } from '../governance/audit-middleware';
import { createPolicyEngine } from '../governance/policy-engine';
import { createPolicyMiddleware } from '../governance/policy-middleware';
import { FORM_SUBMIT_START } from './form-module';

describe('Form Module', () => {
  function setup() {
    const runtime = createInteractionRuntime({
      modules: [createFormModule()],
    });
    const form = runtime.modules.form as FormController;
    return { runtime, form };
  }

  // ── basic ───────────────────────────────────────────────────────────

  describe('basic', () => {
    it('module contributes initialState', () => {
      const { runtime } = setup();
      const state = runtime.getState();
      expect(state.formFields).toEqual({});
      expect(state.formIsSubmitting).toBe(false);
      expect(state.formSubmitCount).toBe(0);
      expect(state.formSubmitError).toBe(null);
    });
  });

  // ── fields ──────────────────────────────────────────────────────────

  describe('fields', () => {
    it('registerField adds field with default state', () => {
      const { form } = setup();
      form.registerField('email');

      const field = form.getField('email');
      expect(field).toEqual({
        value: '',
        error: null,
        touched: false,
        dirty: false,
      });
    });

    it('registerField with initial value', () => {
      const { form } = setup();
      form.registerField('name', 'John');

      const field = form.getField('name');
      expect(field?.value).toBe('John');
      expect(field?.dirty).toBe(false);
    });

    it('unregisterField removes field', () => {
      const { form } = setup();
      form.registerField('temp');
      expect(form.getField('temp')).toBeDefined();

      form.unregisterField('temp');
      expect(form.getField('temp')).toBeUndefined();
    });
  });

  // ── values ──────────────────────────────────────────────────────────

  describe('values', () => {
    it('setValue updates field value', () => {
      const { form } = setup();
      form.registerField('email');
      form.setValue('email', 'test@example.com');

      expect(form.getField('email')?.value).toBe('test@example.com');
    });

    it('setValue marks field as dirty', () => {
      const { form } = setup();
      form.registerField('email');
      expect(form.getField('email')?.dirty).toBe(false);

      form.setValue('email', 'changed');
      expect(form.getField('email')?.dirty).toBe(true);
    });
  });

  // ── validation ──────────────────────────────────────────────────────

  describe('validation', () => {
    it('setError sets field error', () => {
      const { form } = setup();
      form.registerField('email');
      form.setError('email', 'Required');

      expect(form.getField('email')?.error).toBe('Required');
    });

    it('setError clears error with null', () => {
      const { form } = setup();
      form.registerField('email');
      form.setError('email', 'Required');
      form.setError('email', null);

      expect(form.getField('email')?.error).toBe(null);
    });

    it('validate runs validator on all fields', () => {
      const { form } = setup();
      form.registerField('email');
      form.registerField('name', 'John');

      const isValid = form.validate((fields) => ({
        email: fields.email.value === '' ? 'Required' : null,
        name: null,
      }));

      expect(isValid).toBe(false);
      expect(form.getField('email')?.error).toBe('Required');
      expect(form.getField('name')?.error).toBe(null);
    });

    it('validate returns true when all valid', () => {
      const { form } = setup();
      form.registerField('name', 'John');

      const isValid = form.validate(() => ({ name: null }));
      expect(isValid).toBe(true);
    });

    it('validate returns false with errors', () => {
      const { form } = setup();
      form.registerField('name');

      const isValid = form.validate(() => ({ name: 'Too short' }));
      expect(isValid).toBe(false);
    });
  });

  // ── tracking ────────────────────────────────────────────────────────

  describe('tracking', () => {
    it('setTouched marks field as touched', () => {
      const { form } = setup();
      form.registerField('email');
      expect(form.getField('email')?.touched).toBe(false);

      form.setTouched('email');
      expect(form.getField('email')?.touched).toBe(true);
    });
  });

  // ── submit ──────────────────────────────────────────────────────────

  describe('submit', () => {
    it('submitStart sets isSubmitting', () => {
      const { runtime, form } = setup();
      form.submitStart();
      expect(runtime.getState().formIsSubmitting).toBe(true);
    });

    it('submitSuccess clears isSubmitting, increments count', () => {
      const { runtime, form } = setup();
      form.submitStart();
      form.submitSuccess();

      expect(runtime.getState().formIsSubmitting).toBe(false);
      expect(runtime.getState().formSubmitCount).toBe(1);
    });

    it('submitError clears isSubmitting, increments count', () => {
      const { runtime, form } = setup();
      form.submitStart();
      form.submitError('Network error');

      expect(runtime.getState().formIsSubmitting).toBe(false);
      expect(runtime.getState().formSubmitCount).toBe(1);
      expect(runtime.getState().formSubmitError).toBe('Network error');
    });
  });

  // ── reset ───────────────────────────────────────────────────────────

  describe('reset', () => {
    it('reset restores all fields to initial values', () => {
      const { runtime, form } = setup();
      form.registerField('email', 'default@test.com');
      form.registerField('name', 'John');

      // Modify values
      form.setValue('email', 'changed@test.com');
      form.setTouched('name');
      form.setError('name', 'Error');
      form.submitStart();
      form.submitSuccess();

      // Reset
      form.reset();

      expect(form.getField('email')).toEqual({
        value: 'default@test.com',
        error: null,
        touched: false,
        dirty: false,
      });
      expect(form.getField('name')).toEqual({
        value: 'John',
        error: null,
        touched: false,
        dirty: false,
      });
      expect(runtime.getState().formIsSubmitting).toBe(false);
      expect(runtime.getState().formSubmitCount).toBe(0);
    });
  });

  // ── query ───────────────────────────────────────────────────────────

  describe('query', () => {
    it('getValues returns map of field values', () => {
      const { form } = setup();
      form.registerField('email', 'a@b.com');
      form.registerField('name', 'Alice');

      expect(form.getValues()).toEqual({ email: 'a@b.com', name: 'Alice' });
    });

    it('getErrors returns map of field errors', () => {
      const { form } = setup();
      form.registerField('email');
      form.registerField('name');
      form.setError('email', 'Required');

      expect(form.getErrors()).toEqual({ email: 'Required', name: null });
    });

    it('isValid returns true when no errors', () => {
      const { form } = setup();
      form.registerField('email', 'valid@test.com');
      expect(form.isValid()).toBe(true);
    });

    it('isDirty returns true when any field dirty', () => {
      const { form } = setup();
      form.registerField('email');
      form.registerField('name');
      expect(form.isDirty()).toBe(false);

      form.setValue('email', 'changed');
      expect(form.isDirty()).toBe(true);
    });
  });

  // ── events ──────────────────────────────────────────────────────────

  describe('events', () => {
    it('events dispatched for all mutations', () => {
      const { runtime, form } = setup();

      form.registerField('email');
      form.setValue('email', 'test');
      form.setTouched('email');
      form.setError('email', 'err');
      form.submitStart();
      form.submitSuccess();
      form.reset();

      const history = runtime.bus.getHistory();
      const types = history.map((e) => e.type);

      expect(types).toContain('form/registerField');
      expect(types).toContain('form/setValue');
      expect(types).toContain('form/setTouched');
      expect(types).toContain('form/setError');
      expect(types).toContain('form/submitStart');
      expect(types).toContain('form/submitSuccess');
      expect(types).toContain('form/reset');
    });
  });

  // ── governance ──────────────────────────────────────────────────────

  describe('governance', () => {
    it('audit tracks form events', () => {
      const audit = createAuditTrail({ maxEntries: 100 });
      const runtime = createInteractionRuntime({
        modules: [createFormModule()],
      });
      runtime.scheduler.use(createAuditMiddleware(audit, runtime.store));

      const form = runtime.modules.form as FormController;
      form.registerField('email', 'test');
      form.setValue('email', 'changed');

      const entries = audit.getEntries();
      expect(entries.length).toBeGreaterThan(0);
    });

    it('policy can block form submission', () => {
      const policy = createPolicyEngine();
      policy.addRule({
        name: 'block-submit',
        eventTypes: [FORM_SUBMIT_START],
        evaluate: () => ({ verdict: 'deny', reason: 'Submission blocked' }),
      });

      const runtime = createInteractionRuntime({
        modules: [createFormModule()],
      });
      runtime.scheduler.use(createPolicyMiddleware(policy, runtime.store));

      const form = runtime.modules.form as FormController;
      form.submitStart();

      // Policy blocks the event — isSubmitting should remain false
      expect(runtime.getState().formIsSubmitting).toBe(false);
    });
  });

  // ── isolation ───────────────────────────────────────────────────────

  describe('isolation', () => {
    it('module isolation from other modules', () => {
      const { runtime, form } = setup();
      form.registerField('email', 'test');

      // Other state slices unaffected
      expect(runtime.getState().version).toBeGreaterThan(0);
      expect(runtime.getState().formFields).toBeDefined();
    });

    it('has no React/DOM imports', async () => {
      const fs = await import('node:fs');
      const path = await import('node:path');
      const filePath = path.resolve(__dirname, 'form-module.ts');
      const source = fs.readFileSync(filePath, 'utf-8');

      expect(source).not.toMatch(/from ['"]react['"]/);
      expect(source).not.toMatch(/from ['"]react-dom['"]/);
      expect(source).not.toMatch(/document\./);
      expect(source).not.toMatch(/window\./);
    });
  });
});
