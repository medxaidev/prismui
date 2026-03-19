# PrismUI Documentation for fhir-studio Team

> **Version**: 0.4.0  
> **Last Updated**: 2026-03-17  
> **Status**: Ready for Integration

---

## 📦 What's Included

This documentation package contains everything the fhir-studio team needs to integrate PrismUI v0.4.0.

### Core Documents

| Document | Purpose | Priority |
|----------|---------|----------|
| **[INTEGRATION-GUIDE.md](./INTEGRATION-GUIDE.md)** | Step-by-step integration instructions with code examples | ⭐⭐⭐⭐⭐ |
| **[API-REFERENCE.md](./API-REFERENCE.md)** | Complete API documentation for all modules and hooks | ⭐⭐⭐⭐⭐ |
| **[ARCHITECTURE-OVERVIEW.md](./ARCHITECTURE-OVERVIEW.md)** | High-level architecture explanation (simplified) | ⭐⭐⭐⭐ |
| **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** | Common issues and solutions | ⭐⭐⭐⭐ |
| **[BLOCKING-ISSUES.md](./BLOCKING-ISSUES.md)** | Template for reporting blocking issues | ⭐⭐⭐ |

### Additional Resources

- **npm Package**: https://www.npmjs.com/package/@prismui/core
- **Live Demo**: https://medxaidev.github.io/prismui/
- **GitHub Repository**: https://github.com/medxaidev/prismui
- **Source Code**: Available in this repository

---

## 🚀 Quick Start (5 Minutes)

### 1. Install Packages

```bash
npm install @prismui/core@0.4.0 @prismui/react@0.4.0
```

### 2. Create Runtime Setup

```typescript
// src/runtime/setup.ts
import {
  createInteractionRuntime,
  createPageModule,
  createModalModule,
  createNotificationModule,
  createWorkflowModule,
} from '@prismui/core';

export const runtime = createInteractionRuntime({
  modules: [
    createPageModule(),
    createModalModule(),
    createNotificationModule({ maxNotifications: 50 }),
    createWorkflowModule(),
  ],
});
```

### 3. Wrap Your App

```typescript
// src/App.tsx
import { PrismUIProvider } from '@prismui/react';
import { runtime } from './runtime/setup';

function App() {
  return (
    <PrismUIProvider runtime={runtime}>
      <FhirStudioApp />
    </PrismUIProvider>
  );
}
```

### 4. Use in Components

```typescript
import { useUI } from '@prismui/react';

function ResourceList() {
  const ui = useUI();

  const handleDelete = async () => {
    const confirmed = await ui.confirm('delete-resource');
    if (confirmed) {
      await deleteResource(resourceId);
      ui.notify.success('Resource deleted!');
    }
  };
}
```

**That's it!** ModalRenderer and NotificationRenderer are auto-registered.

---

## 📚 Documentation Reading Order

### For First-Time Integration

1. **Start here**: [INTEGRATION-GUIDE.md](./INTEGRATION-GUIDE.md)
   - Read "Quick Start" section
   - Read "Core Use Cases for fhir-studio"
   - Try the examples in your codebase

2. **Reference as needed**: [API-REFERENCE.md](./API-REFERENCE.md)
   - Look up specific module APIs
   - Check event types
   - Review type definitions

3. **When stuck**: [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
   - Search for your error message
   - Check common issues
   - Try debugging tips

### For Understanding Architecture

1. [ARCHITECTURE-OVERVIEW.md](./ARCHITECTURE-OVERVIEW.md)
   - Read "What is PrismUI?" section
   - Review "Layered Architecture"
   - Understand "Core Concepts"

2. **Deep dive** (optional): `../devdocs/architecture/`
   - Full architectural documentation
   - Design decisions (ADRs)
   - Stage implementation details

---

## 🎯 Key Capabilities for fhir-studio

### ✅ What PrismUI Provides

| Capability | Status | Use Case |
|------------|--------|----------|
| **Modal Management** | ✅ v0.3.0 | Resource deletion confirmation, edit dialogs |
| **Notification System** | ✅ v0.3.0 | Save success/failure, validation errors |
| **Drawer Management** | ✅ v0.3.0 | Sidebars, panels |
| **Workflow Orchestration** | ✅ v0.4.0 | Edit → Validate → Save flows |
| **Cross-Page Communication** | ✅ v0.2.0 | Refresh lists when resources change |
| **Audit Trail** | ✅ v0.2.0 | Compliance logging |
| **Form State Management** | ✅ v0.2.0 | Complex forms with validation |
| **Async Operation Tracking** | ✅ v0.2.0 | Loading states, error handling |

### ⏳ Coming Soon (Not Blocking)

| Capability | Planned | Workaround |
|------------|---------|------------|
| **State Persistence** | v0.5.0 (STAGE-10) | Manual localStorage |
| **Plugin State Isolation** | v0.6.0 (STAGE-11) | Namespace conventions |
| **WebSocket Integration** | v0.7.0 (STAGE-12) | Manual integration |

---

## 🐛 Reporting Issues

### Non-Blocking Issues

For issues that **don't block development**:
1. Document in `fhir-studio/docs/prismui-feedback.md`
2. Continue with workaround
3. Report after MVP is complete

### Blocking Issues

For issues that **block fhir-studio development**:
1. Use template: [BLOCKING-ISSUES.md](./BLOCKING-ISSUES.md)
2. Open GitHub Issue with label `blocking` + `fhir-studio`
3. Notify PrismUI team immediately
4. PrismUI development will be paused until resolved

**Response Time Commitment**:
- P0 (blocks development): 24 hours
- P1 (blocks major feature): 48 hours
- P2 (blocks minor feature): 1 week

---

## 📊 Version Compatibility

| PrismUI | React | Node | TypeScript |
|---------|-------|------|------------|
| 0.4.0 | ≥18.0.0 | ≥18.0.0 | ≥4.9.0 |

**Peer Dependencies**:
- `react`: ^18.0.0
- `react-dom`: ^18.0.0

**No other dependencies required** - PrismUI core is zero-dependency.

---

## 🔧 Development Workflow

### Phase 1: Basic Integration (Week 1)

- [ ] Install packages
- [ ] Set up Runtime
- [ ] Wrap App with PrismUIProvider
- [ ] Test Modal (delete confirmation)
- [ ] Test Notification (save success/error)

### Phase 2: Core Features (Week 2-3)

- [ ] Implement resource editor with Workflow
- [ ] Implement cross-page communication
- [ ] Set up audit logging
- [ ] Add form state management

### Phase 3: Optimization (Week 4)

- [ ] Add state persistence (temporary solution)
- [ ] Performance optimization
- [ ] Document issues and feedback
- [ ] Plan STAGE-10/11/12 requirements

---

## 📞 Support Channels

### Questions & Discussion

- **GitHub Discussions**: https://github.com/medxaidev/prismui/discussions
- **Email**: fangjun@medxai.dev

### Bug Reports

- **GitHub Issues**: https://github.com/medxaidev/prismui/issues
- **Template**: [BLOCKING-ISSUES.md](./BLOCKING-ISSUES.md)

### Feature Requests

- Document in `fhir-studio/docs/prismui-feature-requests.md`
- Review after MVP completion
- Submit to GitHub Discussions

---

## 📦 Package Information

### @prismui/core

```json
{
  "name": "@prismui/core",
  "version": "0.4.0",
  "description": "Event-driven runtime kernel for modern web applications",
  "main": "./dist/cjs/index.cjs",
  "module": "./dist/esm/index.mjs",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/esm/index.mjs",
      "require": "./dist/cjs/index.cjs",
      "types": "./dist/index.d.ts"
    }
  }
}
```

**Bundle Size**: ~15KB gzipped

### @prismui/react

```json
{
  "name": "@prismui/react",
  "version": "0.4.0",
  "description": "React adapter for PrismUI runtime",
  "main": "./dist/cjs/index.cjs",
  "module": "./dist/esm/index.mjs",
  "types": "./dist/index.d.ts",
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "@prismui/core": "^0.4.0"
  }
}
```

**Bundle Size**: ~3KB gzipped

---

## ✅ Integration Checklist

Copy this checklist to your project documentation:

```markdown
## PrismUI Integration Checklist

### Setup
- [ ] Installed @prismui/core@0.4.0
- [ ] Installed @prismui/react@0.4.0
- [ ] Created runtime setup file
- [ ] Wrapped App with PrismUIProvider

### Core Features
- [ ] Modal management working (delete confirmation)
- [ ] Notifications working (success/error messages)
- [ ] Workflow working (edit → validate → save)
- [ ] Cross-page communication working
- [ ] Audit trail configured

### Documentation
- [ ] Team read INTEGRATION-GUIDE.md
- [ ] API-REFERENCE.md bookmarked
- [ ] TROUBLESHOOTING.md reviewed
- [ ] BLOCKING-ISSUES.md template saved

### Testing
- [ ] Modal opens and closes correctly
- [ ] Notifications appear and dismiss
- [ ] Workflow steps execute in order
- [ ] Events propagate across pages
- [ ] Audit log captures events

### Feedback
- [ ] Created prismui-feedback.md in fhir-studio
- [ ] Documented workarounds used
- [ ] Listed missing features (non-blocking)
- [ ] Prepared for post-MVP review
```

---

## 🎓 Learning Resources

### Official Resources

- **Live Demo**: https://medxaidev.github.io/prismui/
  - Interactive examples of all features
  - Copy-paste code snippets
  
- **Dashboard Reference App**: https://medxaidev.github.io/prismui/dashboard/
  - Real-world integration patterns
  - Complex scenarios

### Code Examples

All examples in INTEGRATION-GUIDE.md are tested and production-ready. Copy them directly into your codebase.

### Video Tutorials

*Coming soon* - Will be added after fhir-studio MVP feedback.

---

## 🔄 Update Policy

### Semantic Versioning

PrismUI follows [Semantic Versioning](https://semver.org/):

- **Patch** (0.4.x): Bug fixes, no breaking changes
- **Minor** (0.x.0): New features, no breaking changes
- **Major** (x.0.0): Breaking changes

### Upgrade Path

When new versions are released:

1. Check CHANGELOG.md for breaking changes
2. Review migration guide (if major version)
3. Test in development environment
4. Update production after validation

**Current stable**: 0.4.0  
**Next planned**: 0.5.0 (Persistence Layer)

---

## 📝 License

MIT License - See [LICENSE](../LICENSE) file.

---

## 🙏 Acknowledgments

PrismUI is built for fhir-studio and the broader medical informatics community. Your feedback shapes the roadmap.

**Contributors**:
- Fangjun (Architecture & Implementation)
- fhir-studio team (Requirements & Testing)

---

**Ready to start?** → [INTEGRATION-GUIDE.md](./INTEGRATION-GUIDE.md)

**Questions?** → [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

**Blocked?** → [BLOCKING-ISSUES.md](./BLOCKING-ISSUES.md)
