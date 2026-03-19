# PrismUI Integration Guide for fhir-studio

> **Version**: 0.4.0  
> **Last Updated**: 2026-03-17  
> **Target Audience**: fhir-studio development team

---

## 📋 Quick Start

### Installation

```bash
npm install @prismui/core@0.4.0 @prismui/react@0.4.0
```

### Basic Setup (5 minutes)

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

```typescript
// src/App.tsx
import { PrismUIProvider } from '@prismui/react';
import { runtime } from './runtime/setup';

function App() {
  return (
    <PrismUIProvider runtime={runtime}>
      {/* ModalRenderer, NotificationRenderer 自动注册 */}
      <FhirStudioApp />
    </PrismUIProvider>
  );
}
```

---

## 🎯 Core Use Cases for fhir-studio

### 1. Resource Delete Confirmation Modal

```typescript
import { useUI } from '@prismui/react';

function ResourceList() {
  const ui = useUI();

  const handleDelete = async (resourceId: string) => {
    // 打开确认弹窗
    const confirmed = await ui.confirm('delete-resource');
    
    if (confirmed) {
      // 执行删除
      await deleteResource(resourceId);
      ui.notify.success('Resource deleted successfully');
    }
  };

  return (
    <button onClick={() => handleDelete('Patient/123')}>
      Delete Resource
    </button>
  );
}
```

### 2. Global Notifications

```typescript
import { useUI } from '@prismui/react';

function ResourceEditor() {
  const ui = useUI();

  const handleSave = async () => {
    try {
      await saveResource(resource);
      ui.notify.success('Resource saved successfully');
    } catch (error) {
      ui.notify.error(`Save failed: ${error.message}`);
    }
  };
}
```

### 3. Multi-Step Workflow (Edit → Validate → Save)

```typescript
import { useUI } from '@prismui/react';

function ResourceEditor() {
  const ui = useUI();

  // 定义工作流（只需定义一次，可以放在模块初始化时）
  useEffect(() => {
    ui.workflow.define({
      id: 'save-resource',
      steps: [
        {
          id: 'validate',
          type: 'async',
          execute: (ctx) => validateResource(ctx.payload.resource),
          onError: {
            notify: { type: 'error', message: 'Validation failed' },
            action: 'abort',
          },
        },
        {
          id: 'confirm',
          type: 'confirm',
          modalId: 'confirm-save',
          condition: (ctx) => ctx.results.validate.hasWarnings,
          onReject: 'abort',
        },
        {
          id: 'save',
          type: 'async',
          execute: (ctx) => saveResource(ctx.payload.resource),
        },
        {
          id: 'notify-success',
          type: 'notify',
          notification: { type: 'success', message: 'Resource saved!' },
        },
      ],
    });
  }, []);

  const handleSave = async () => {
    const result = await ui.workflow.start('save-resource', { resource });
    
    if (result.status === 'completed') {
      console.log('Save completed:', result.results);
    } else if (result.status === 'aborted') {
      console.log('User cancelled');
    }
  };
}
```

### 4. Cross-Page State Synchronization

```typescript
// Page A: Trigger event
import { useRuntime } from '@prismui/react';

function ResourceCreator() {
  const runtime = useRuntime();

  const handleCreate = async () => {
    await createResource(resource);
    
    // 发送事件通知其他页面
    runtime.dispatch({
      type: 'RESOURCE_CREATED',
      payload: { resourceId: 'Patient/123', resourceType: 'Patient' },
    });
  };
}

// Page B: Listen to event
import { useRuntime } from '@prismui/react';

function ResourceList() {
  const runtime = useRuntime();

  useEffect(() => {
    const unsubscribe = runtime.subscribe((event) => {
      if (event.type === 'RESOURCE_CREATED') {
        // 刷新列表
        fetchResources();
      }
    });

    return unsubscribe;
  }, []);
}
```

### 5. Audit Trail (Compliance)

```typescript
import { useRuntime } from '@prismui/react';

function AuditLog() {
  const runtime = useRuntime();
  const [auditEntries, setAuditEntries] = useState([]);

  useEffect(() => {
    // 获取所有审计记录
    const state = runtime.getState();
    const entries = state.auditLog || [];
    setAuditEntries(entries);
  }, []);

  return (
    <div>
      {auditEntries.map((entry) => (
        <div key={entry.id}>
          <span>{entry.timestamp}</span>
          <span>{entry.eventType}</span>
          <span>{entry.userId}</span>
        </div>
      ))}
    </div>
  );
}
```

---

## 🔧 Advanced Patterns

### Temporary State Persistence (Before STAGE-10)

```typescript
// src/hooks/usePersistence.ts
import { useRuntimeState } from '@prismui/react';
import { useEffect } from 'react';

export function usePersistence() {
  const state = useRuntimeState();

  // 保存关键状态到 localStorage
  useEffect(() => {
    const key = 'fhir-studio:state';
    const persistedState = {
      currentPage: state.currentPage,
      queryHistory: state.queryHistory, // 自定义状态
      serverConfig: state.serverConfig,
    };
    localStorage.setItem(key, JSON.stringify(persistedState));
  }, [state]);

  // 恢复状态（在 App 初始化时调用）
  useEffect(() => {
    const key = 'fhir-studio:state';
    const saved = localStorage.getItem(key);
    if (saved) {
      const data = JSON.parse(saved);
      // 恢复页面
      if (data.currentPage) {
        runtime.dispatch({
          type: 'PAGE_TRANSITION',
          payload: { pageId: data.currentPage },
        });
      }
    }
  }, []);
}
```

### Plugin System Isolation (Before STAGE-11)

```typescript
// src/plugins/createPluginRuntime.ts
export function createPluginRuntime(pluginId: string, globalRuntime) {
  return {
    dispatch: (event) => {
      // 命名空间隔离
      globalRuntime.dispatch({
        ...event,
        type: `plugin:${pluginId}:${event.type}`,
      });
    },
    subscribe: (handler) => {
      return globalRuntime.subscribe((event) => {
        // 只接收本插件的事件
        if (event.type.startsWith(`plugin:${pluginId}:`)) {
          handler({
            ...event,
            type: event.type.replace(`plugin:${pluginId}:`, ''),
          });
        }
      });
    },
  };
}

// 使用
const pluginRuntime = createPluginRuntime('fhir-viewer', runtime);
pluginRuntime.dispatch({ type: 'DATA_LOADED', payload: { ... } });
```

---

## ⚠️ Important Notes

### 1. Renderer Auto-Registration

**ModalRenderer** 和 **NotificationRenderer** 会自动注册到 `PrismUIProvider`，无需手动添加：

```typescript
// ❌ 不需要这样做
<PrismUIProvider runtime={runtime}>
  <ModalRenderer />  {/* 不需要 */}
  <NotificationRenderer />  {/* 不需要 */}
  <App />
</PrismUIProvider>

// ✅ 正确做法
<PrismUIProvider runtime={runtime}>
  <App />  {/* Renderer 自动注册 */}
</PrismUIProvider>
```

### 2. Module Registration Order

模块注册顺序不影响功能，但建议按依赖关系排序：

```typescript
createInteractionRuntime({
  modules: [
    createPageModule(),        // 基础路由
    createModalModule(),       // Modal 管理
    createNotificationModule(), // 通知
    createWorkflowModule(),    // 工作流（依赖 Modal/Notification）
  ],
});
```

### 3. UI Components

PrismUI **不提供** UI 组件（Button、Input、Table 等），请继续使用 **Ant Design** 或其他 UI 库。

PrismUI 只提供：
- ✅ Modal/Drawer/Notification 的**状态管理**和**渲染层**
- ✅ 跨组件通信（EventBus）
- ✅ 工作流编排
- ✅ 审计追踪

---

## 🐛 Troubleshooting

### Issue: "Cannot read property 'dispatch' of undefined"

**原因**: 组件在 `PrismUIProvider` 外部使用 `useRuntime()`

**解决**: 确保所有使用 PrismUI hooks 的组件都在 `PrismUIProvider` 内部

### Issue: Modal 不显示

**原因**: 可能是 z-index 冲突或 Portal 配置问题

**解决**:
```typescript
// 检查 Modal 是否真的打开了
const { modalStack } = useModal();
console.log('Modal stack:', modalStack); // 应该有内容

// 如果有内容但不显示，检查 CSS z-index
// ModalRenderer 默认 z-index: 1000
```

### Issue: Workflow 步骤不执行

**原因**: 步骤的 `condition` 返回 false，或者前一步失败

**解决**:
```typescript
// 查看工作流实例状态
const { instances } = useWorkflow();
console.log('Workflow instances:', instances);

// 检查每个步骤的状态
instances.forEach(instance => {
  console.log('Steps:', instance.steps);
});
```

---

## 📞 Support & Feedback

### Blocking Issues (阻塞问题上报)

如果遇到**阻塞 fhir-studio 开发**的问题，请立即上报：

1. 在 PrismUI 仓库创建 Issue，标题格式：`[BLOCKING] 问题描述`
2. 使用模板：`docs/BLOCKING-ISSUES.md`
3. 包含：
   - 问题描述
   - 复现步骤
   - 期望行为
   - 临时解决方案（如果有）

### Feature Requests

如果 PrismUI 缺少某个功能，但**不阻塞开发**：

1. 先用临时方案绕过（见 Advanced Patterns）
2. 记录到 `fhir-studio/docs/prismui-feature-requests.md`
3. 在 fhir-studio MVP 完成后，统一评估是否需要加入 STAGE-10/11/12

---

## 📚 Additional Resources

- **API Reference**: `docs/API-REFERENCE.md`
- **Architecture Overview**: `docs/ARCHITECTURE-OVERVIEW.md`
- **Troubleshooting**: `docs/TROUBLESHOOTING.md`
- **Blocking Issues Template**: `docs/BLOCKING-ISSUES.md`
- **npm Package**: https://www.npmjs.com/package/@prismui/core
- **Live Demo**: https://medxaidev.github.io/prismui/

---

## ✅ Integration Checklist

- [ ] 安装 `@prismui/core` 和 `@prismui/react`
- [ ] 创建 Runtime 实例（`src/runtime/setup.ts`）
- [ ] 包装 App 组件（`<PrismUIProvider>`）
- [ ] 实现资源删除确认弹窗（验证 ModalRenderer）
- [ ] 实现全局通知（验证 NotificationRenderer）
- [ ] 实现资源保存工作流（验证 WorkflowModule）
- [ ] 实现跨页面状态同步（验证 EventBus）
- [ ] 配置状态持久化（临时方案）
- [ ] 测试审计追踪功能
- [ ] 记录遇到的问题和改进建议

---

**Good luck with fhir-studio development! 🚀**
