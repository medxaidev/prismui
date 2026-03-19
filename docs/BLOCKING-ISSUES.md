# PrismUI Blocking Issue Report Template

> **Use this template when PrismUI blocks fhir-studio development**

---

## 🚨 Issue Summary

**Title**: [BLOCKING] Brief description of the issue

**Severity**: 
- [ ] P0 - Completely blocks development
- [ ] P1 - Blocks major feature, workaround exists but costly
- [ ] P2 - Blocks minor feature, acceptable workaround exists

**Reporter**: [Your Name]  
**Date**: [YYYY-MM-DD]  
**PrismUI Version**: [e.g., 0.4.0]  
**fhir-studio Version**: [e.g., 0.1.0]

---

## 📝 Problem Description

### What are you trying to achieve?

[Describe the feature or functionality you're implementing in fhir-studio]

Example:
> I'm implementing a resource deletion confirmation dialog that needs to:
> 1. Show a modal with resource details
> 2. Wait for user confirmation
> 3. Execute delete if confirmed
> 4. Show success notification

### What is blocking you?

[Describe the specific PrismUI limitation or bug]

Example:
> When I call `ui.modal.open('delete-confirm')`, the modal opens but I can't pass custom data (resource details) to the modal content. The ModalRenderer only receives the modalId, not the payload.

---

## 🔍 Reproduction Steps

### Minimal Code Example

```typescript
// Paste your minimal reproduction code here
import { useUI } from '@prismui/react';

function ResourceList() {
  const ui = useUI();

  const handleDelete = (resource) => {
    // Problem: How to pass resource data to modal?
    ui.modal.open('delete-confirm');
    // Expected: ui.modal.open('delete-confirm', { resource });
  };

  return <button onClick={() => handleDelete(resource)}>Delete</button>;
}
```

### Expected Behavior

[What you expect to happen]

Example:
> The modal should receive the resource data and display it in the confirmation dialog.

### Actual Behavior

[What actually happens]

Example:
> The modal opens but has no access to the resource data. I have to store it in a separate React state, which defeats the purpose of centralized state management.

---

## 💡 Attempted Workarounds

### Workaround 1: [Description]

```typescript
// Code for workaround
const [pendingResource, setPendingResource] = useState(null);

const handleDelete = (resource) => {
  setPendingResource(resource);
  ui.modal.open('delete-confirm');
};

// In modal component
const resource = pendingResource;
```

**Issues with this workaround**:
- [ ] Too complex / boilerplate-heavy
- [ ] Breaks architectural principles
- [ ] Performance issues
- [ ] Not maintainable
- [ ] Other: [Describe]

### Workaround 2: [Description]

[If you tried multiple workarounds, list them]

---

## 🎯 Proposed Solution

### Option A: [Your suggestion]

[Describe how you think PrismUI should solve this]

Example:
> Add a `payload` parameter to `ui.modal.open()`:
> ```typescript
> ui.modal.open(modalId: string, payload?: Record<string, unknown>)
> ```
> 
> Store payload in modalStack:
> ```typescript
> modalStack: Array<{ modalId: string; payload?: Record<string, unknown> }>
> ```
> 
> Expose payload in ModalRenderer via context or props.

**Estimated effort**: [Small / Medium / Large]  
**Breaking change**: [Yes / No]

### Option B: [Alternative]

[If you have alternative solutions]

---

## ⏱️ Urgency & Impact

### Timeline

- **Blocking since**: [Date]
- **Deadline**: [Date when this must be resolved]
- **Impact if not resolved**: [What happens to fhir-studio development]

Example:
> - Blocking since: 2026-03-17
> - Deadline: 2026-03-24 (1 week)
> - Impact: Cannot implement resource management features (30% of MVP scope)

### Affected Features

List all fhir-studio features blocked by this issue:

- [ ] Resource deletion
- [ ] Resource editing
- [ ] [Other feature]

---

## 📎 Additional Context

### Related Issues

- GitHub Issue #[number]
- Related discussion: [link]

### Screenshots / Videos

[Attach if relevant]

### Environment

- **OS**: [Windows / macOS / Linux]
- **Browser**: [Chrome 120 / Firefox 121 / Safari 17]
- **React Version**: [18.2.0]
- **Node Version**: [20.10.0]

### Error Messages

```
[Paste full error stack trace if applicable]
```

---

## ✅ Acceptance Criteria

For this issue to be considered resolved:

- [ ] [Specific criterion 1]
- [ ] [Specific criterion 2]
- [ ] [Specific criterion 3]

Example:
- [ ] `ui.modal.open()` accepts optional payload parameter
- [ ] ModalRenderer exposes payload to modal content
- [ ] Documentation updated with payload usage examples
- [ ] Tests added for payload passing
- [ ] No breaking changes to existing API

---

## 🤝 Collaboration

### Can you help implement the fix?

- [ ] Yes, I can submit a PR if given guidance
- [ ] No, I need the PrismUI team to implement
- [ ] Unsure

### Availability for testing

- [ ] Available to test fixes immediately
- [ ] Available within [timeframe]
- [ ] Not available (please provide test cases)

---

## 📋 Checklist Before Submitting

- [ ] Searched existing issues for duplicates
- [ ] Tried at least one workaround
- [ ] Provided minimal reproduction code
- [ ] Specified urgency and deadline
- [ ] Described expected vs actual behavior
- [ ] Proposed at least one solution

---

## 🔗 References

- **Integration Guide**: `docs/INTEGRATION-GUIDE.md`
- **API Reference**: `docs/API-REFERENCE.md`
- **Troubleshooting**: `docs/TROUBLESHOOTING.md`
- **GitHub Issues**: https://github.com/medxaidev/prismui/issues

---

**Submit this issue to**: https://github.com/medxaidev/prismui/issues/new

**Label with**: `blocking`, `fhir-studio`, `priority:high`
