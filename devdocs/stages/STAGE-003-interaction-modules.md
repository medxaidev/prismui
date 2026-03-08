# STAGE-003: Interaction Modules / 交互模块

**Status:** ✅ Complete  
**Start Date:** 2026-03-08  
**Completion Date:** 2026-03-08  
**Priority:** High  
**Dependencies:** STAGE-002 (Governance Layer)  
**Sessions:** 1  
**Tests:** 58 new (247 cumulative)

**状态：** ✅ 已完成  
**开始日期：** 2026-03-08  
**完成日期：** 2026-03-08  
**优先级：** High  
**依赖：** STAGE-002（Governance Layer）  
**Sessions：** 1  
**测试：** 58 新增（累计 247）

---

## Executive Summary

Extend the Module System (Layer 0.5) with new interaction modules: Drawer and Notification. These follow the same `RuntimeModule` pattern established by Page Module and Modal Module in STAGE-001. All modules are pure `packages/core/` — zero React, zero DOM.

扩展 Module System（Layer 0.5），新增交互模块：Drawer 和 Notification。遵循 STAGE-001 中 Page Module 和 Modal Module 已建立的 `RuntimeModule` 模式。所有模块均为纯 `packages/core/` —— 零 React、零 DOM。

**Core Philosophy:**

> Interaction Modules are runtime state machines, not UI components. They manage state and expose controllers; rendering is the adapter's job.

**核心理念：**

> 交互模块是运行时状态机，而不是 UI 组件。它们管理状态并暴露 controller；渲染是 adapter 的职责。

**Stage Reordering (ADR-007):** This stage was promoted from the original STAGE-004 position to STAGE-003 to complete the runtime kernel before the presentation layer (Semantic Theme).

**阶段重排（ADR-007）：** 本阶段从原来的 STAGE-004 位置提升为 STAGE-003，以在表现层（Semantic Theme）之前完成运行时内核。

---

## Phase Breakdown

## 阶段拆解

### Phase A: Drawer Module (~20 tests)

**Goal:** Runtime module managing a drawer stack with positioning and anchor support.

**目标：** 管理 drawer 栈的 Runtime 模块，支持定位与锚点。

**Files:**

- `packages/core/src/modules/drawer-module.ts`
- `packages/core/src/modules/drawer-module.test.ts`

**API Design:**

```typescript
interface DrawerEntry {
  drawerId: string;
  anchor: "left" | "right" | "top" | "bottom";
}

interface DrawerModuleState {
  drawerStack: DrawerEntry[];
}

interface DrawerController {
  open(drawerId: string, anchor?: "left" | "right" | "top" | "bottom"): void;
  close(drawerId?: string): void;
  closeAll(): void;
  isOpen(drawerId: string): boolean;
  getStack(): DrawerEntry[];
  getAnchor(drawerId: string): string | undefined;
}

function createDrawerModule(): RuntimeModule<DrawerController>;
```

**Tests (~20):**

| #   | Test                                    | Group      |
| --- | --------------------------------------- | ---------- |
| 1   | createDrawerModule returns valid module | creation   |
| 2   | contributes initialState                | creation   |
| 3   | open adds to drawerStack                | open       |
| 4   | open with default anchor (left)         | open       |
| 5   | open with custom anchor                 | open       |
| 6   | open duplicate is no-op                 | open       |
| 7   | close specific drawer                   | close      |
| 8   | close top of stack                      | close      |
| 9   | close empty stack is no-op              | close      |
| 10  | closeAll empties stack                  | close      |
| 11  | isOpen returns correct status           | query      |
| 12  | getStack returns current stack          | query      |
| 13  | getAnchor returns drawer anchor         | query      |
| 14  | getAnchor returns undefined for closed  | query      |
| 15  | multiple drawers coexist                | stack      |
| 16  | drawer + modal independent              | isolation  |
| 17  | drawer events tracked by audit          | governance |
| 18  | drawer events subject to policy         | governance |
| 19  | has no React/DOM imports                | isolation  |

**Acceptance Criteria:**

- [x] Drawer stack management works correctly
- [x] Anchor positioning stored in state
- [x] Controller API is consistent with Modal pattern
- [x] 21 tests pass, `tsc --noEmit` clean

---

### Phase B: Notification Module (~20 tests)

**Goal:** Runtime module managing a notification queue with priority and auto-dismiss.

**目标：** 管理通知队列的 Runtime 模块，支持优先级与自动关闭。

**Files:**

- `packages/core/src/modules/notification-module.ts`
- `packages/core/src/modules/notification-module.test.ts`

**API Design:**

```typescript
interface NotificationEntry {
  id: string;
  type: "info" | "success" | "warning" | "error";
  message: string;
  autoDismissMs?: number; // 0 or undefined = persistent
  timestamp: number;
}

interface NotificationModuleState {
  notifications: NotificationEntry[];
}

interface NotificationController {
  show(notification: Omit<NotificationEntry, "id" | "timestamp">): string; // returns id
  dismiss(id: string): void;
  dismissAll(): void;
  getAll(): NotificationEntry[];
  getById(id: string): NotificationEntry | undefined;
  count(): number;
}

function createNotificationModule(options?: {
  maxNotifications?: number;
}): RuntimeModule<NotificationController>;
```

**Tests (~20):**

| #   | Test                                          | Group       |
| --- | --------------------------------------------- | ----------- |
| 1   | createNotificationModule returns valid module | creation    |
| 2   | contributes initialState                      | creation    |
| 3   | show adds notification with auto id           | show        |
| 4   | show with info type                           | show        |
| 5   | show with error type                          | show        |
| 6   | show respects maxNotifications limit          | show        |
| 7   | dismiss removes specific notification         | dismiss     |
| 8   | dismiss non-existent is no-op                 | dismiss     |
| 9   | dismissAll clears all notifications           | dismiss     |
| 10  | getAll returns current notifications          | query       |
| 11  | getById returns specific notification         | query       |
| 12  | getById returns undefined for missing         | query       |
| 13  | count returns notification count              | query       |
| 14  | notifications maintain insertion order        | order       |
| 15  | oldest evicted when maxNotifications exceeded | retention   |
| 16  | autoDismissMs stored in entry                 | autoDismiss |
| 17  | notification + modal independent              | isolation   |
| 18  | notification events tracked by audit          | governance  |
| 19  | has no React/DOM imports                      | isolation   |

**Acceptance Criteria:**

- [x] Notification queue management works correctly
- [x] Auto-dismiss metadata stored (actual timer is adapter-layer concern)
- [x] maxNotifications ring buffer behavior
- [x] 24 tests pass, `tsc --noEmit` clean

---

### Phase C: React Adapter Hooks (~15 tests)

**Goal:** Add `useDrawer()` and `useNotification()` hooks to `@prismui/react`.

**Files:**

- `packages/react/src/hooks.ts` (extend existing)
- `packages/react/src/hooks.test.tsx` (extend existing)

**Acceptance Criteria:**

- [x] `useDrawer()` provides open/close/closeAll/isOpen/getStack/getAnchor
- [x] `useNotification()` provides show/dismiss/dismissAll/getAll/getById/count
- [x] Hooks are thin wrappers — zero business logic
- [x] 13 new tests pass (25 total in hooks.test.tsx)

---

### Phase D: Barrel Exports

**Goal:** Update `packages/core/src/index.ts` and `packages/react/src/index.ts` with new exports.

---

## Directory Structure

```
packages/core/src/modules/
├── page-module.ts            # STAGE-001
├── page-module.test.ts
├── modal-module.ts           # STAGE-001
├── modal-module.test.ts
├── drawer-module.ts          # Phase A
├── drawer-module.test.ts
├── notification-module.ts    # Phase B
└── notification-module.test.ts
```

---

## Definition of Done

Stage-3 is complete when **ALL** of the following are true:

1. [x] Drawer Module manages drawer stack correctly
2. [x] Notification Module manages notification queue correctly
3. [x] Both modules follow `RuntimeModule` pattern (initialState, reducers, controller)
4. [x] Both modules are pure TypeScript — zero React/DOM
5. [x] React adapter hooks added (useDrawer, useNotification)
6. [x] Governance integration verified (audit tracks events, policy can deny)
7. [x] 58 new tests passing (247 cumulative with STAGE-001 + STAGE-002)
8. [x] `tsc --noEmit` clean (core, react, demo)
9. [x] All devdocs updated
10. [x] Demo synced with DrawerPanel and NotificationPanel components

---

## References

- [ADR-007 Stage Reordering](../decisions/ADR-007-stage-reordering.md)
- [STAGE-001 Runtime Core](./STAGE-001-runtime-core.md) — Module System pattern
- [STAGE-002 Governance Layer](./STAGE-002-governance-layer.md) — Audit/Policy integration
