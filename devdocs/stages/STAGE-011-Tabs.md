# STAGE-011: Tabs Component

> **Status**: In Progress
> **Dependencies**: STAGE-002 (Component Factory), STAGE-003 (Theming)
> **Reference**: Mantine Tabs (`D:\Programming\mantine\github\mantine-next-8.3.14\packages\@mantine\core\src\components\Tabs`)

---

## Overview

Implement a fully accessible Tabs component with compound component pattern, keyboard navigation, and three visual variants. Tabs is a **Layer 3 semantic component** that does NOT require the four-layer architecture (Base → Primitive → Component → Compound) because it has no overlay/positioning logic — it's a pure compound component like Grid.

---

## Architecture Decision: Why Not Four Layers?

The four-layer pattern is used for components with complex behavioral layers:
- **ModalBase → Dialog/Drawer** — overlay, focus trap, portal, transitions
- **PopoverBase → Popover/Tooltip** — floating positioning, arrow, portal
- **ComboboxBase → Select/Combobox** — dropdown, search, keyboard nav for options

Tabs has **none of these concerns**. It is:
- A stateful container (controlled/uncontrolled value)
- A context provider for child coordination
- Pure DOM with ARIA roles

**Pattern used**: Context-based compound component (same as `Grid` + `Grid.Col`).

---

## Component API

### Tabs (Root)

```tsx
<Tabs
  defaultValue="tab1"           // Uncontrolled default
  value={value}                 // Controlled value
  onChange={setValue}            // Change handler
  variant="default"             // 'default' | 'outline' | 'pills'
  orientation="horizontal"      // 'horizontal' | 'vertical'
  placement="left"              // 'left' | 'right' (vertical only)
  color="primary"               // Tab accent color
  radius="sm"                   // Border radius
  inverted={false}              // Flip tab/content position (horizontal only)
  keepMounted={true}            // Keep inactive panels in DOM
  loop={true}                   // Arrow keys loop
  activateTabWithKeyboard={true} // Activate on arrow key (vs manual Enter)
  allowTabDeactivation={false}  // Click active tab to deselect
>
  <Tabs.List grow justify="flex-start">
    <Tabs.Tab value="tab1" leftSection={<Icon />} rightSection={<Badge />}>
      Tab 1
    </Tabs.Tab>
    <Tabs.Tab value="tab2" disabled>Tab 2</Tabs.Tab>
  </Tabs.List>

  <Tabs.Panel value="tab1">Content 1</Tabs.Panel>
  <Tabs.Panel value="tab2">Content 2</Tabs.Panel>
</Tabs>
```

### Tabs.List
- `grow?: boolean` — tabs fill available space
- `justify?: CSSProperties['justifyContent']` — tab alignment
- Renders `role="tablist"` with `aria-orientation`

### Tabs.Tab
- `value: string` — **required**, links to panel
- `leftSection?: ReactNode` — icon/content before label
- `rightSection?: ReactNode` — badge/content after label
- `disabled?: boolean`
- `color?: string` — per-tab color override
- Renders `<button role="tab">` with full ARIA: `aria-selected`, `aria-controls`, `tabIndex`

### Tabs.Panel
- `value: string` — **required**, links to tab
- `keepMounted?: boolean` — per-panel override
- Renders `<div role="tabpanel">` with `aria-labelledby`

---

## Keyboard Navigation

| Key | Behavior |
|-----|----------|
| `ArrowRight` / `ArrowDown` | Focus next tab (respects orientation) |
| `ArrowLeft` / `ArrowUp` | Focus previous tab |
| `Home` | Focus first tab |
| `End` | Focus last tab |
| `Enter` / `Space` | Activate focused tab (when `activateTabWithKeyboard=false`) |

When `activateTabWithKeyboard=true` (default), tabs activate on focus (arrow key press).
When `loop=true` (default), navigation wraps from last to first and vice versa.

---

## New Utilities Required

### `useUncontrolled` hook
Generic controlled/uncontrolled state hook. Used by Tabs and reusable by future components.

```ts
function useUncontrolled<T>({
  value,
  defaultValue,
  finalValue,
  onChange,
}): [T, (value: T) => void, boolean]
```

### `createScopedKeydownHandler` utility
DOM-based keyboard navigation between sibling elements within a parent.

```ts
function createScopedKeydownHandler({
  siblingSelector: string,
  parentSelector: string,
  activateOnFocus?: boolean,
  loop?: boolean,
  orientation: 'horizontal' | 'vertical',
  dir?: 'ltr' | 'rtl',
  onKeyDown?: KeyboardEventHandler,
}): KeyboardEventHandler
```

---

## Variants & CSS

### CSS Variables
- `--tabs-color` — active tab accent color
- `--tabs-radius` — border radius
- `--tabs-justify` — tab list justification (set on List)

### Variant: `default`
- Underline indicator on active tab
- 2px bottom border on tab list
- Hover background on tabs

### Variant: `outline`
- Border around active tab, bottom border removed (tab "connects" to panel)
- 1px bottom border on tab list

### Variant: `pills`
- Pill-shaped active tab with filled background
- No border on tab list
- Gap between tabs

---

## File Structure

```
components/Tabs/
├── Tabs.tsx              # Root component + compound exports
├── Tabs.context.ts       # TabsProvider + useTabsContext
├── Tabs.module.css       # All variant styles
├── TabsList.tsx           # Tabs.List component
├── TabsTab.tsx            # Tabs.Tab component
├── TabsPanel.tsx          # Tabs.Panel component
├── Tabs.test.tsx          # All tests
├── Tabs.stories.tsx       # Storybook stories
└── index.ts              # Barrel exports

hooks/
├── use-uncontrolled.ts    # New generic hook
├── use-uncontrolled.test.ts
```

A `createScopedKeydownHandler` utility will be added to `core/utils/` or inline in TabsTab.

---

## Implementation Order

1. **Phase A: Utilities** — `useUncontrolled` hook + `createScopedKeydownHandler`
2. **Phase B: Core** — Context, Tabs root, TabsList, TabsTab, TabsPanel
3. **Phase C: Styles** — CSS module with all 3 variants
4. **Phase D: Tests** — 30+ tests covering ARIA, keyboard, variants, controlled/uncontrolled
5. **Phase E: Stories** — 10+ Storybook stories

---

## Acceptance Criteria

- [ ] Tabs renders with `role="tablist"`, `role="tab"`, `role="tabpanel"`
- [ ] ARIA attributes: `aria-selected`, `aria-controls`, `aria-labelledby`, `aria-orientation`
- [ ] Keyboard navigation: Arrow keys, Home, End, loop, activate-on-focus
- [ ] Controlled and uncontrolled modes
- [ ] 3 variants: default, outline, pills
- [ ] Horizontal and vertical orientation
- [ ] `keepMounted` prop (global + per-panel)
- [ ] `allowTabDeactivation` prop
- [ ] Disabled tabs skipped in keyboard navigation
- [ ] `leftSection` / `rightSection` on tabs
- [ ] Per-tab color override
- [ ] 30+ tests pass
- [ ] 10+ Storybook stories
- [ ] tsc --noEmit clean
- [ ] Zero test regressions

---

## References

- Mantine Tabs: https://alpha.mantine.dev/core/tabs/
- WAI-ARIA Tabs Pattern: https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
- Mantine Source: `D:\Programming\mantine\github\mantine-next-8.3.14\packages\@mantine\core\src\components\Tabs`
