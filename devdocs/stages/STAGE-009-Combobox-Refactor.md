# STAGE-009: Combobox System Refactor

**Status:** 🔄 In Progress
**Depends on:** STAGE-006 (PopoverBase), STAGE-007 (Input System)
**Goal:** Deep refactor of ComboboxBase → Select → Combobox to achieve production-quality dropdown selection

---

## Problem Statement

The current ComboboxBase/Select/Combobox implementation has critical bugs:

1. **Selection doesn't work** — double-gated dropdown (PopoverBase visibility + ComboboxBaseDropdown returns null)
2. **Index-based navigation is fragile** — React state indices desync with actual DOM options
3. **ComboboxBaseTarget doesn't merge keyboard handler** — keyboard navigation broken
4. **State split awkwardly** — ComboboxBase manages value/search, but Select/Combobox also manage externally
5. **ComboboxBaseOptions counts wrong** — uses `Children.count` but options are raw divs

## Architecture Decision

**Adopt Mantine's DOM-based store pattern** while keeping PrismUI's four-layer architecture.

### Key Insight from Mantine
Mantine's `useCombobox` store uses **DOM queries** (`data-combobox-option`, `data-combobox-selected`) to navigate options instead of React state indices. This eliminates index synchronization bugs entirely.

### Layer Mapping
- **Layer 2 (Behavior Base):** `ComboboxBase` — compound component wrapping PopoverBase + ComboboxProvider
- **Layer 3 (Semantic):** `Select` (no search), `Combobox` (with search/filter)

## Refactoring Plan

### Phase 1: useCombobox Store (new)
Replace `useComboboxKeyboard` with a proper `useCombobox` store hook:
- `dropdownOpened` / `openDropdown` / `closeDropdown` / `toggleDropdown`
- `selectOption(index)` — DOM-based, sets `data-combobox-selected`
- `selectNextOption` / `selectPreviousOption` — skip disabled, loop
- `selectFirstOption` / `selectActiveOption`
- `resetSelectedOption` / `clickSelectedOption`
- `updateSelectedOptionIndex` — sync after search changes
- `listId` / `setListId` — for ARIA linking
- `searchRef` / `targetRef` — focus management

### Phase 2: ComboboxBase Sub-components
Rewrite all sub-components:
- **ComboboxBase** — provides store via context, wraps PopoverBase
- **ComboboxBase.Target** — clones child with keyboard handler + ARIA attrs
- **ComboboxBase.Dropdown** — delegates to PopoverBase.Dropdown (no double-gating)
- **ComboboxBase.Options** — `role="listbox"`, registers listId
- **ComboboxBase.Option** — `data-combobox-option`, click → `onOptionSubmit`
- **ComboboxBase.Search** — search input with controlled value
- **ComboboxBase.Empty** — empty state display

### Phase 3: Select
Rewrite Select using new ComboboxBase:
- Uses `useCombobox()` store
- `Combobox.Target` wraps `InputBase` (pointer, readOnly)
- `OptionsDropdown` helper renders filtered options
- Proper controlled/uncontrolled value management
- Click to toggle, keyboard navigation, Enter to select

### Phase 4: Combobox
Rewrite Combobox using new ComboboxBase:
- Same as Select but with search input in dropdown
- Type-to-filter with `Combobox.Search`
- Focus search on open

## Files to Modify/Create

### New Files
- `ComboboxBase/useCombobox.ts` — store hook (replaces useComboboxKeyboard)
- `ComboboxBase/get-index.ts` — getNextIndex/getPreviousIndex/getFirstIndex helpers

### Rewrite Files
- `ComboboxBase/ComboboxBase.tsx` — simplified, store-based
- `ComboboxBase/ComboboxBase.context.tsx` — new context shape (store + getStyles + onOptionSubmit)
- `ComboboxBase/ComboboxBaseTarget.tsx` — keyboard handler + ARIA
- `ComboboxBase/ComboboxBaseDropdown.tsx` — delegate to PopoverBase.Dropdown
- `ComboboxBase/ComboboxBaseOptions.tsx` — listId registration
- `ComboboxBase/ComboboxBaseOption.tsx` — data-combobox-option, click handler
- `ComboboxBase/ComboboxBaseSearch.tsx` — search input
- `ComboboxBase/index.ts` — updated exports
- `Select/Select.tsx` — full rewrite
- `Combobox/Combobox.tsx` — full rewrite
- Tests and stories for all

## Success Criteria
- [ ] Select: click opens dropdown, click option selects, value displays in trigger
- [ ] Select: keyboard navigation (ArrowUp/Down/Enter/Escape)
- [ ] Select: clearable, disabled, grouped options
- [ ] Combobox: search filters options, selection works
- [ ] Combobox: keyboard navigation through filtered results
- [ ] All existing tests pass or are updated
- [ ] tsc --noEmit clean
- [ ] Storybook stories all render and function correctly
