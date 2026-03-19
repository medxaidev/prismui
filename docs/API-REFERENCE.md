# PrismUI API Reference

> **Version**: 0.4.0  
> **Last Updated**: 2026-03-17

---

## Table of Contents

- [Core API (@prismui/core)](#core-api-prismuicore)
  - [createInteractionRuntime](#createinteractionruntime)
  - [Modules](#modules)
  - [Interaction DSL](#interaction-dsl)
  - [Types](#types)
- [React API (@prismui/react)](#react-api-prismuireact)
  - [Provider](#provider)
  - [Hooks](#hooks)

---

## Core API (@prismui/core)

### createInteractionRuntime

创建 PrismUI 运行时实例。

```typescript
function createInteractionRuntime(options?: RuntimeOptions): InteractionRuntime
```

**Options**:

```typescript
interface RuntimeOptions {
  modules?: RuntimeModule[];        // 要注册的模块列表
  historySize?: number;             // 事件历史大小（默认：100）
  initialState?: Partial<RuntimeState>; // 初始状态
  middleware?: SchedulerMiddleware[]; // 中间件
}
```

**Returns**: `InteractionRuntime`

**Example**:

```typescript
import { createInteractionRuntime, createModalModule } from '@prismui/core';

const runtime = createInteractionRuntime({
  modules: [createModalModule()],
  historySize: 200,
});
```

---

### Modules

#### createPageModule

页面路由管理模块。

```typescript
function createPageModule(): RuntimeModule<PageController>
```

**State**:
- `currentPage: string | null` - 当前页面 ID
- `mountedPages: Set<string>` - 已挂载的页面
- `locked: boolean` - 是否锁定路由

**Controller API**:

```typescript
interface PageController {
  transition(pageId: string): void;
  mount(pageId: string): void;
  unmount(pageId: string): void;
  lock(): void;
  unlock(): void;
  isLocked(): boolean;
}
```

**Events**:
- `PAGE_MOUNT` - 页面挂载
- `PAGE_UNMOUNT` - 页面卸载
- `PAGE_TRANSITION` - 页面切换
- `PAGE_LOCK` - 锁定路由
- `PAGE_UNLOCK` - 解锁路由

---

#### createModalModule

Modal 状态管理模块。

```typescript
function createModalModule(): RuntimeModule<ModalController>
```

**State**:
- `modalStack: string[]` - Modal ID 栈

**Controller API**:

```typescript
interface ModalController {
  open(modalId: string): void;
  close(modalId?: string): void;  // 不传 ID 则关闭栈顶
  closeAll(): void;
  isOpen(modalId: string): boolean;
  getStack(): string[];
}
```

**Events**:
- `MODAL_OPEN` - Modal 打开
- `MODAL_CLOSE` - Modal 关闭
- `MODAL_CLOSE_ALL` - 关闭所有 Modal

---

#### createDrawerModule

Drawer 状态管理模块。

```typescript
function createDrawerModule(): RuntimeModule<DrawerController>
```

**State**:
- `drawerStack: DrawerEntry[]` - Drawer 栈

**Types**:

```typescript
interface DrawerEntry {
  drawerId: string;
  anchor: 'left' | 'right' | 'top' | 'bottom';
}
```

**Controller API**:

```typescript
interface DrawerController {
  open(drawerId: string, anchor?: DrawerAnchor): void;
  close(drawerId?: string): void;
  closeAll(): void;
  isOpen(drawerId: string): boolean;
  getStack(): DrawerEntry[];
  getAnchor(drawerId: string): DrawerAnchor | undefined;
}
```

**Events**:
- `DRAWER_OPEN` - Drawer 打开
- `DRAWER_CLOSE` - Drawer 关闭
- `DRAWER_CLOSE_ALL` - 关闭所有 Drawer

---

#### createNotificationModule

通知管理模块。

```typescript
function createNotificationModule(
  options?: NotificationModuleOptions
): RuntimeModule<NotificationController>
```

**Options**:

```typescript
interface NotificationModuleOptions {
  maxNotifications?: number;  // 最大通知数（默认：50）
}
```

**State**:
- `notifications: NotificationEntry[]` - 通知列表

**Types**:

```typescript
interface NotificationEntry {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  autoDismissMs?: number;
  timestamp: number;
}
```

**Controller API**:

```typescript
interface NotificationController {
  show(notification: Omit<NotificationEntry, 'id' | 'timestamp'>): string;
  dismiss(id: string): void;
  dismissAll(): void;
  getAll(): NotificationEntry[];
  getById(id: string): NotificationEntry | undefined;
  count(): number;
}
```

**Events**:
- `NOTIFICATION_SHOW` - 显示通知
- `NOTIFICATION_DISMISS` - 关闭通知
- `NOTIFICATION_DISMISS_ALL` - 关闭所有通知

---

#### createFormModule

表单状态管理模块。

```typescript
function createFormModule(): RuntimeModule<FormController>
```

**State**:
- `formFields: Record<string, FieldState>` - 表单字段
- `formIsSubmitting: boolean` - 是否提交中
- `formSubmitCount: number` - 提交次数
- `formSubmitError: string | null` - 提交错误

**Types**:

```typescript
interface FieldState {
  value: unknown;
  error: string | null;
  touched: boolean;
  dirty: boolean;
}

type FormValidator = (fields: Record<string, FieldState>) => Record<string, string | null>;
```

**Controller API**:

```typescript
interface FormController {
  registerField(fieldId: string, initialValue: unknown): void;
  unregisterField(fieldId: string): void;
  setValue(fieldId: string, value: unknown): void;
  setError(fieldId: string, error: string | null): void;
  setTouched(fieldId: string, touched: boolean): void;
  validate(validator: FormValidator): boolean;
  submitStart(): void;
  submitSuccess(): void;
  submitError(error: string): void;
  reset(): void;
  getField(fieldId: string): FieldState | undefined;
  getValues(): Record<string, unknown>;
  getErrors(): Record<string, string>;
  isValid(): boolean;
  isDirty(): boolean;
  getSubmitCount(): number;
}
```

**Events**:
- `FORM_REGISTER_FIELD` - 注册字段
- `FORM_UNREGISTER_FIELD` - 注销字段
- `FORM_SET_VALUE` - 设置值
- `FORM_SET_ERROR` - 设置错误
- `FORM_SET_TOUCHED` - 设置 touched
- `FORM_VALIDATE` - 验证
- `FORM_SUBMIT_START` - 开始提交
- `FORM_SUBMIT_SUCCESS` - 提交成功
- `FORM_SUBMIT_ERROR` - 提交失败
- `FORM_RESET` - 重置

---

#### createAsyncModule

异步操作跟踪模块。

```typescript
function createAsyncModule(): RuntimeModule<AsyncController>
```

**State**:
- `asyncOperations: Record<string, AsyncOperation>` - 异步操作

**Types**:

```typescript
type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

interface AsyncOperation {
  status: AsyncStatus;
  data?: unknown;
  error?: string;
  startedAt?: number;
  completedAt?: number;
}
```

**Controller API**:

```typescript
interface AsyncController {
  start(operationId: string): void;
  success(operationId: string, data?: unknown): void;
  error(operationId: string, error: string): void;
  reset(operationId: string): void;
  getOperation(operationId: string): AsyncOperation | undefined;
  getStatus(operationId: string): AsyncStatus;
  isLoading(operationId: string): boolean;
  isAnyLoading(): boolean;
}
```

**Events**:
- `ASYNC_START` - 开始异步操作
- `ASYNC_SUCCESS` - 异步操作成功
- `ASYNC_ERROR` - 异步操作失败
- `ASYNC_RESET` - 重置异步操作

---

#### createWorkflowModule

工作流编排模块。

```typescript
function createWorkflowModule(): RuntimeModule<WorkflowController>
```

**State**:
- `workflowDefinitions: Record<string, WorkflowDefinition>` - 工作流定义
- `workflowInstances: Record<string, WorkflowInstance>` - 工作流实例

**Types**:

```typescript
interface WorkflowDefinition {
  id: string;
  steps: WorkflowStep[];
}

type WorkflowStep = AsyncStep | ConfirmStep | NotifyStep | CustomStep;

interface StepBase {
  id: string;
  condition?: (ctx: WorkflowContext) => boolean;
  onEnter?: (ctx: WorkflowContext) => void;
  onExit?: (ctx: WorkflowContext) => void;
}

interface AsyncStep extends StepBase {
  type: 'async';
  execute: (ctx: WorkflowContext) => Promise<unknown>;
  onError?: { action: 'abort' | 'continue'; notify?: string };
}

interface ConfirmStep extends StepBase {
  type: 'confirm';
  modalId: string;
  onReject?: 'abort' | 'skip';
}

interface NotifyStep extends StepBase {
  type: 'notify';
  notification: { type: NotificationType; message: string } | ((ctx: WorkflowContext) => { type: NotificationType; message: string });
}

interface CustomStep extends StepBase {
  type: 'custom';
  execute: (ctx: WorkflowContext) => unknown | Promise<unknown>;
  onError?: { action: 'abort' | 'continue'; notify?: string };
}

interface WorkflowContext {
  workflowId: string;
  instanceId: string;
  payload: Record<string, unknown>;
  results: Record<string, unknown>;
  currentStepIndex: number;
}

type WorkflowStatus = 'idle' | 'running' | 'completed' | 'failed' | 'aborted';

interface WorkflowInstance {
  instanceId: string;
  workflowId: string;
  status: WorkflowStatus;
  payload: Record<string, unknown>;
  results: Record<string, unknown>;
  steps: StepState[];
  currentStepIndex: number;
  error?: string;
  startedAt: number;
  completedAt?: number;
}

interface WorkflowResult {
  instanceId: string;
  status: 'completed' | 'failed' | 'aborted';
  results: Record<string, unknown>;
  error?: string;
}
```

**Controller API**:

```typescript
interface WorkflowController {
  define(definition: WorkflowDefinition): void;
  start(workflowId: string, payload?: Record<string, unknown>): Promise<WorkflowResult>;
  abort(instanceId: string): void;
  getInstances(): WorkflowInstance[];
  getInstance(instanceId: string): WorkflowInstance | undefined;
}
```

**Events**:
- `WORKFLOW_DEFINE` - 定义工作流
- `WORKFLOW_START` - 启动工作流
- `WORKFLOW_STEP_START` - 步骤开始
- `WORKFLOW_STEP_COMPLETE` - 步骤完成
- `WORKFLOW_STEP_SKIP` - 步骤跳过
- `WORKFLOW_STEP_FAIL` - 步骤失败
- `WORKFLOW_COMPLETE` - 工作流完成
- `WORKFLOW_FAIL` - 工作流失败
- `WORKFLOW_ABORT` - 工作流中止

---

### Interaction DSL

统一的 DSL API，包装所有模块能力。

```typescript
function createInteractionDSL(runtime: InteractionRuntime): InteractionDSL
```

**API**:

```typescript
interface InteractionDSL {
  // Modal
  modal: {
    open(modalId: string): void;
    close(modalId?: string): void;
    closeAll(): void;
    isOpen(modalId: string): boolean;
    getStack(): string[];
  };
  
  // Drawer
  drawer: {
    open(drawerId: string, anchor?: DrawerAnchor): void;
    close(drawerId?: string): void;
    closeAll(): void;
    isOpen(drawerId: string): boolean;
    getStack(): DrawerEntry[];
  };
  
  // Notification
  notify: {
    info(message: string, options?: NotifyOptions): string;
    success(message: string, options?: NotifyOptions): string;
    warning(message: string, options?: NotifyOptions): string;
    error(message: string, options?: NotifyOptions): string;
    show(notification: Omit<NotificationEntry, 'id' | 'timestamp'>): string;
    dismiss(id: string): void;
    dismissAll(): void;
  };
  
  // Form
  form: {
    register(fieldId: string, initialValue: unknown): void;
    unregister(fieldId: string): void;
    set(fieldId: string, value: unknown): void;
    touch(fieldId: string): void;
    validate(validator: FormValidator): boolean;
    submit(): void;
    submitDone(): void;
    submitFail(error: string): void;
    reset(): void;
    values(): Record<string, unknown>;
    errors(): Record<string, string>;
    isValid(): boolean;
    isDirty(): boolean;
  };
  
  // Async
  async: {
    start(operationId: string): void;
    done(operationId: string, data?: unknown): void;
    fail(operationId: string, error: string): void;
    reset(operationId: string): void;
    isLoading(operationId: string): boolean;
    isAnyLoading(): boolean;
  };
  
  // Workflow
  workflow: {
    define(definition: WorkflowDefinition): void;
    start(workflowId: string, payload?: Record<string, unknown>): Promise<WorkflowResult>;
    abort(instanceId: string): void;
  };
  
  // Convenience
  confirm(modalId: string): Promise<boolean>;
}
```

---

### Types

#### RuntimeEvent

```typescript
interface RuntimeEvent {
  type: string;
  payload?: Record<string, unknown>;
  timestamp: number;
  version: number;
}
```

#### RuntimeState

```typescript
interface RuntimeState {
  version: number;
  [key: string]: unknown;  // 模块贡献的状态
}
```

#### RuntimeModule

```typescript
interface RuntimeModule<TController = unknown> {
  name: string;
  initialState?: Record<string, unknown>;
  reducers?: Record<string, EventReducer>;
  middleware?: SchedulerMiddleware[];
  controller?: (runtime: InteractionRuntime) => TController;
  onInit?(runtime: InteractionRuntime): void;
  onDestroy?(): void;
}
```

---

## React API (@prismui/react)

### Provider

#### PrismUIProvider

根 Provider，包装整个应用。

```typescript
function PrismUIProvider(props: PrismUIProviderProps): JSX.Element
```

**Props**:

```typescript
interface PrismUIProviderProps {
  runtime: InteractionRuntime;
  children: React.ReactNode;
}
```

**Example**:

```typescript
import { PrismUIProvider } from '@prismui/react';
import { runtime } from './runtime/setup';

function App() {
  return (
    <PrismUIProvider runtime={runtime}>
      <YourApp />
    </PrismUIProvider>
  );
}
```

---

### Hooks

#### useRuntime

获取 Runtime 实例。

```typescript
function useRuntime(): InteractionRuntime
```

**Example**:

```typescript
import { useRuntime } from '@prismui/react';

function MyComponent() {
  const runtime = useRuntime();
  
  useEffect(() => {
    const unsubscribe = runtime.subscribe((event) => {
      console.log('Event:', event);
    });
    return unsubscribe;
  }, []);
}
```

---

#### useRuntimeState

订阅整个 Runtime State。

```typescript
function useRuntimeState(): RuntimeState
```

**Example**:

```typescript
import { useRuntimeState } from '@prismui/react';

function MyComponent() {
  const state = useRuntimeState();
  console.log('Current page:', state.currentPage);
}
```

---

#### useSelector

订阅 State 的部分切片（性能优化）。

```typescript
function useSelector<T>(selector: (state: RuntimeState) => T): T
```

**Example**:

```typescript
import { useSelector } from '@prismui/react';

function MyComponent() {
  const currentPage = useSelector((state) => state.currentPage);
  // 只有 currentPage 变化时才会重新渲染
}
```

---

#### usePage

使用 PageModule。

```typescript
function usePage(): UsePageReturn
```

**Returns**:

```typescript
interface UsePageReturn {
  currentPage: string | null;
  mountedPages: Set<string>;
  locked: boolean;
  transition(pageId: string): void;
  mount(pageId: string): void;
  unmount(pageId: string): void;
  lock(): void;
  unlock(): void;
  isLocked(): boolean;
}
```

---

#### useModal

使用 ModalModule。

```typescript
function useModal(): UseModalReturn
```

**Returns**:

```typescript
interface UseModalReturn {
  modalStack: string[];
  open(modalId: string): void;
  close(modalId?: string): void;
  closeAll(): void;
  isOpen(modalId: string): boolean;
  getStack(): string[];
}
```

---

#### useDrawer

使用 DrawerModule。

```typescript
function useDrawer(): UseDrawerReturn
```

**Returns**:

```typescript
interface UseDrawerReturn {
  drawerStack: DrawerEntry[];
  open(drawerId: string, anchor?: DrawerAnchor): void;
  close(drawerId?: string): void;
  closeAll(): void;
  isOpen(drawerId: string): boolean;
  getStack(): DrawerEntry[];
  getAnchor(drawerId: string): DrawerAnchor | undefined;
}
```

---

#### useNotification

使用 NotificationModule。

```typescript
function useNotification(): UseNotificationReturn
```

**Returns**:

```typescript
interface UseNotificationReturn {
  notifications: NotificationEntry[];
  count: number;
  show(notification: Omit<NotificationEntry, 'id' | 'timestamp'>): string;
  dismiss(id: string): void;
  dismissAll(): void;
  getById(id: string): NotificationEntry | undefined;
}
```

---

#### useForm

使用 FormModule。

```typescript
function useForm(): UseFormReturn
```

**Returns**:

```typescript
interface UseFormReturn {
  fields: Record<string, FieldState>;
  isSubmitting: boolean;
  submitCount: number;
  formSubmitError: string | null;
  register(fieldId: string, initialValue: unknown): void;
  unregister(fieldId: string): void;
  set(fieldId: string, value: unknown): void;
  setError(fieldId: string, error: string | null): void;
  setTouched(fieldId: string, touched: boolean): void;
  validate(validator: FormValidator): boolean;
  submitStart(): void;
  submitSuccess(): void;
  setSubmitError(error: string): void;
  reset(): void;
  getValues(): Record<string, unknown>;
  getErrors(): Record<string, string>;
  isValid(): boolean;
  isDirty(): boolean;
}
```

---

#### useAsync

使用 AsyncModule。

```typescript
function useAsync(): UseAsyncReturn
```

**Returns**:

```typescript
interface UseAsyncReturn {
  operations: Record<string, AsyncOperation>;
  start(operationId: string): void;
  done(operationId: string, data?: unknown): void;
  fail(operationId: string, error: string): void;
  reset(operationId: string): void;
  getOperation(operationId: string): AsyncOperation | undefined;
  getStatus(operationId: string): AsyncStatus;
  isLoading(operationId: string): boolean;
  isAnyLoading(): boolean;
}
```

---

#### useWorkflow

使用 WorkflowModule。

```typescript
function useWorkflow(): UseWorkflowReturn
```

**Returns**:

```typescript
interface UseWorkflowReturn {
  definitions: Record<string, WorkflowDefinition>;
  instances: WorkflowInstance[];
  define(definition: WorkflowDefinition): void;
  start(workflowId: string, payload?: Record<string, unknown>): Promise<WorkflowResult>;
  abort(instanceId: string): void;
  getInstance(instanceId: string): WorkflowInstance | undefined;
}
```

---

#### useUI

使用统一的 DSL API（推荐）。

```typescript
function useUI(): InteractionDSL
```

**Example**:

```typescript
import { useUI } from '@prismui/react';

function MyComponent() {
  const ui = useUI();
  
  const handleAction = async () => {
    const confirmed = await ui.confirm('delete-modal');
    if (confirmed) {
      ui.notify.success('Deleted!');
    }
  };
}
```

---

## Event Types Reference

### Page Events
- `PAGE_MOUNT`
- `PAGE_UNMOUNT`
- `PAGE_TRANSITION`
- `PAGE_LOCK`
- `PAGE_UNLOCK`

### Modal Events
- `MODAL_OPEN`
- `MODAL_CLOSE`
- `MODAL_CLOSE_ALL`

### Drawer Events
- `DRAWER_OPEN`
- `DRAWER_CLOSE`
- `DRAWER_CLOSE_ALL`

### Notification Events
- `NOTIFICATION_SHOW`
- `NOTIFICATION_DISMISS`
- `NOTIFICATION_DISMISS_ALL`

### Form Events
- `FORM_REGISTER_FIELD`
- `FORM_UNREGISTER_FIELD`
- `FORM_SET_VALUE`
- `FORM_SET_ERROR`
- `FORM_SET_TOUCHED`
- `FORM_VALIDATE`
- `FORM_SUBMIT_START`
- `FORM_SUBMIT_SUCCESS`
- `FORM_SUBMIT_ERROR`
- `FORM_RESET`

### Async Events
- `ASYNC_START`
- `ASYNC_SUCCESS`
- `ASYNC_ERROR`
- `ASYNC_RESET`

### Workflow Events
- `WORKFLOW_DEFINE`
- `WORKFLOW_START`
- `WORKFLOW_STEP_START`
- `WORKFLOW_STEP_COMPLETE`
- `WORKFLOW_STEP_SKIP`
- `WORKFLOW_STEP_FAIL`
- `WORKFLOW_COMPLETE`
- `WORKFLOW_FAIL`
- `WORKFLOW_ABORT`

---

**For more examples, see**: `docs/INTEGRATION-GUIDE.md`
