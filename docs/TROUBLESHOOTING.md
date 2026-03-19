# PrismUI Troubleshooting Guide

> **Version**: 0.4.0  
> **Last Updated**: 2026-03-17

---

## 🔍 Common Issues

### Issue 1: "Cannot read property 'dispatch' of undefined"

**Symptoms**:
```
TypeError: Cannot read property 'dispatch' of undefined
  at useModal (use-modal.ts:10)
```

**Cause**: Component is using PrismUI hooks outside of `PrismUIProvider`.

**Solution**:
```typescript
// ❌ Wrong
function App() {
  return <MyComponent />; // useModal() inside will fail
}

// ✅ Correct
function App() {
  return (
    <PrismUIProvider runtime={runtime}>
      <MyComponent />  {/* Now useModal() works */}
    </PrismUIProvider>
  );
}
```

---

### Issue 2: Modal Opens But Not Visible

**Symptoms**:
- `modalStack` has items
- No visual modal on screen

**Possible Causes**:

#### Cause A: z-index Conflict

**Check**:
```typescript
const { modalStack } = useModal();
console.log('Modal stack:', modalStack); // Has items?
```

**Solution**:
```css
/* Increase z-index in your global CSS */
.prismui-modal-overlay {
  z-index: 9999 !important;
}
```

#### Cause B: Portal Not Rendering

**Check**: Inspect DOM for `<div id="prismui-portal">` or similar.

**Solution**: ModalRenderer uses `document.body` by default. If your app has custom portal logic, check for conflicts.

---

### Issue 3: Workflow Steps Not Executing

**Symptoms**:
- Workflow starts but stops at first step
- No error message

**Possible Causes**:

#### Cause A: Step Condition Returns False

**Check**:
```typescript
const { instances } = useWorkflow();
console.log('Workflow instances:', instances);
// Look at step.status — is it 'skipped'?
```

**Solution**: Review your `condition` functions:
```typescript
{
  id: 'confirm',
  type: 'confirm',
  condition: (ctx) => {
    console.log('Condition check:', ctx.results.validate);
    return ctx.results.validate.hasWarnings; // Make sure this is correct
  }
}
```

#### Cause B: Previous Step Failed

**Check**:
```typescript
instances.forEach(instance => {
  console.log('Steps:', instance.steps);
  // Look for step with status: 'failed'
});
```

**Solution**: Add error handling:
```typescript
{
  id: 'validate',
  type: 'async',
  execute: async (ctx) => {
    try {
      return await validateResource(ctx.payload.resource);
    } catch (error) {
      console.error('Validation error:', error);
      throw error; // Will trigger onError
    }
  },
  onError: {
    action: 'abort',
    notify: 'Validation failed'
  }
}
```

---

### Issue 4: Notifications Not Showing

**Symptoms**:
- `ui.notify.success()` called
- No toast appears

**Possible Causes**:

#### Cause A: NotificationModule Not Registered

**Check**:
```typescript
const runtime = createInteractionRuntime({
  modules: [
    createModalModule(),
    // createNotificationModule(), // ← Missing!
  ],
});
```

**Solution**: Add `createNotificationModule()` to modules array.

#### Cause B: NotificationRenderer Not Auto-Registered

**Check**: This should not happen in v0.3.0+, but verify:
```typescript
// In browser console
document.querySelector('[data-prismui-notification-renderer]');
// Should return an element
```

**Solution**: File a bug report if NotificationRenderer is not auto-registering.

---

### Issue 5: State Not Persisting After Refresh

**Symptoms**:
- State resets to initial values after page refresh

**Cause**: PrismUI v0.4.0 does not include automatic persistence (STAGE-10 is not yet implemented).

**Temporary Solution**:
```typescript
// Manual persistence
import { useRuntimeState } from '@prismui/react';
import { useEffect } from 'react';

function usePersistence() {
  const state = useRuntimeState();

  useEffect(() => {
    localStorage.setItem('app-state', JSON.stringify({
      currentPage: state.currentPage,
      // Add other fields you want to persist
    }));
  }, [state]);

  // Restore on mount
  useEffect(() => {
    const saved = localStorage.getItem('app-state');
    if (saved) {
      const data = JSON.parse(saved);
      runtime.dispatch({ type: 'PAGE_TRANSITION', payload: { pageId: data.currentPage } });
    }
  }, []);
}
```

---

### Issue 6: Cross-Page Events Not Received

**Symptoms**:
- Page A dispatches event
- Page B's subscription handler not called

**Possible Causes**:

#### Cause A: Subscription Not Set Up

**Check**:
```typescript
function PageB() {
  const runtime = useRuntime();

  useEffect(() => {
    console.log('Setting up subscription');
    const unsubscribe = runtime.subscribe((event) => {
      console.log('Event received:', event.type);
    });
    return unsubscribe;
  }, []);
}
```

**Solution**: Make sure `useEffect` runs and returns cleanup function.

#### Cause B: Event Type Mismatch

**Check**:
```typescript
// Page A
runtime.dispatch({ type: 'RESOURCE_CREATED', payload: { ... } });

// Page B
runtime.subscribe((event) => {
  if (event.type === 'RESOURCE_CREATE') { // ← Typo! Should be 'RESOURCE_CREATED'
    // ...
  }
});
```

**Solution**: Use constants for event types:
```typescript
// constants.ts
export const EVENTS = {
  RESOURCE_CREATED: 'RESOURCE_CREATED',
  RESOURCE_UPDATED: 'RESOURCE_UPDATED',
};

// Page A
runtime.dispatch({ type: EVENTS.RESOURCE_CREATED, payload: { ... } });

// Page B
runtime.subscribe((event) => {
  if (event.type === EVENTS.RESOURCE_CREATED) {
    // ...
  }
});
```

---

### Issue 7: Form Validation Not Working

**Symptoms**:
- `form.validate()` returns true even with invalid fields

**Cause**: Validator function not returning correct format.

**Solution**:
```typescript
// ❌ Wrong
const isValid = form.validate((fields) => {
  if (!fields.email?.value) {
    return false; // Wrong return type
  }
});

// ✅ Correct
const isValid = form.validate((fields) => ({
  email: !fields.email?.value ? 'Email is required' : null,
  password: !fields.password?.value ? 'Password is required' : null,
}));
```

---

### Issue 8: Async Operation Status Not Updating

**Symptoms**:
- `async.start()` called
- `isLoading()` still returns false

**Cause**: Operation ID mismatch.

**Solution**:
```typescript
// ❌ Wrong
async.start('fetch-data');
// ... later
if (async.isLoading('fetchData')) { // ← Different ID!
  // ...
}

// ✅ Correct
const OPERATION_ID = 'fetch-data';
async.start(OPERATION_ID);
// ... later
if (async.isLoading(OPERATION_ID)) {
  // ...
}
```

---

### Issue 9: Memory Leak Warning

**Symptoms**:
```
Warning: Can't perform a React state update on an unmounted component
```

**Cause**: Subscription not cleaned up.

**Solution**:
```typescript
// ❌ Wrong
useEffect(() => {
  runtime.subscribe((event) => {
    // ...
  });
  // Missing cleanup!
}, []);

// ✅ Correct
useEffect(() => {
  const unsubscribe = runtime.subscribe((event) => {
    // ...
  });
  return unsubscribe; // Cleanup on unmount
}, []);
```

---

### Issue 10: TypeScript Errors with Workflow Context

**Symptoms**:
```
Property 'results' does not exist on type 'WorkflowContext'
```

**Cause**: TypeScript can't infer the shape of `ctx.results`.

**Solution**:
```typescript
// Add type assertions
{
  id: 'confirm',
  type: 'confirm',
  condition: (ctx) => {
    const validateResult = ctx.results.validate as { hasWarnings: boolean };
    return validateResult.hasWarnings;
  }
}

// Or define a typed workflow
interface SaveResourceContext extends WorkflowContext {
  results: {
    validate: { hasWarnings: boolean; errors: string[] };
    save: { resourceId: string };
  };
}
```

---

## 🐛 Debugging Tips

### Enable Debug Logging

```typescript
// Add this to your runtime setup
const runtime = createInteractionRuntime({
  modules: [...],
  middleware: [
    (event, next) => {
      console.log('[PrismUI Event]', event.type, event.payload);
      return next(event);
    }
  ]
});
```

### Inspect Runtime State

```typescript
// In browser console
window.__PRISMUI_RUNTIME__ = runtime; // Expose runtime globally

// Then in console:
__PRISMUI_RUNTIME__.getState();
__PRISMUI_RUNTIME__.getHistory();
```

### Use React DevTools

Install React DevTools extension and search for `PrismUIProvider` in component tree. You can inspect the runtime context value.

### Check Event History

```typescript
const runtime = useRuntime();
const history = runtime.getHistory();
console.log('Last 10 events:', history.slice(-10));
```

---

## 📞 Getting Help

### Before Opening an Issue

1. Check this troubleshooting guide
2. Search existing issues on GitHub
3. Try the minimal reproduction (see below)

### Minimal Reproduction Template

```typescript
import { createInteractionRuntime, createModalModule } from '@prismui/core';
import { PrismUIProvider, useModal } from '@prismui/react';

const runtime = createInteractionRuntime({
  modules: [createModalModule()],
});

function TestComponent() {
  const { open } = useModal();
  
  return (
    <button onClick={() => open('test-modal')}>
      Open Modal
    </button>
  );
}

function App() {
  return (
    <PrismUIProvider runtime={runtime}>
      <TestComponent />
    </PrismUIProvider>
  );
}
```

### Issue Template

When opening an issue, include:

1. **PrismUI Version**: (e.g., 0.4.0)
2. **React Version**: (e.g., 18.2.0)
3. **Browser**: (e.g., Chrome 120)
4. **Description**: What you expected vs what happened
5. **Reproduction**: Minimal code to reproduce
6. **Error Messages**: Full stack trace
7. **Screenshots**: If UI-related

---

## 🔧 Performance Issues

### Issue: Excessive Re-renders

**Symptoms**: Component re-renders on every state change, even unrelated ones.

**Solution**: Use `useSelector` instead of `useRuntimeState`:

```typescript
// ❌ Slow (re-renders on any state change)
const state = useRuntimeState();
const currentPage = state.currentPage;

// ✅ Fast (only re-renders when currentPage changes)
const currentPage = useSelector((state) => state.currentPage);
```

### Issue: Large Event History Causing Memory Issues

**Symptoms**: App slows down after running for a while.

**Solution**: Reduce history size:

```typescript
const runtime = createInteractionRuntime({
  modules: [...],
  historySize: 50, // Default is 100
});
```

---

## 🚨 Known Limitations (v0.4.0)

1. **No automatic state persistence** - Use manual localStorage (STAGE-10 will add this)
2. **No plugin state isolation** - Use namespace conventions (STAGE-11 will add this)
3. **No WebSocket integration** - Manual integration needed (STAGE-12 will add this)
4. **No parallel workflow steps** - Only sequential execution supported
5. **No workflow pause/resume** - Workflows run to completion or abort

---

## 📚 Additional Resources

- **Integration Guide**: `docs/INTEGRATION-GUIDE.md`
- **API Reference**: `docs/API-REFERENCE.md`
- **Architecture Overview**: `docs/ARCHITECTURE-OVERVIEW.md`
- **GitHub Issues**: https://github.com/medxaidev/prismui/issues
- **npm Package**: https://www.npmjs.com/package/@prismui/core

---

**Still stuck?** Open a [GitHub Issue](https://github.com/medxaidev/prismui/issues) with the template above.
