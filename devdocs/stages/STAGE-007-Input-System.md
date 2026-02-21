# STAGE-007: Input System — InputBase, ComboboxBase, Input, Select, Combobox

**Status**: ✅ Complete  
**Start Date**: 2026-02-20  
**Priority**: High  
**Dependencies**: STAGE-006 ✅

---

## Executive Summary

STAGE-007 implements PrismUI's **core input system** — the foundation for all user data entry in MedXAI and beyond. It introduces two new Layer 2 bases (`InputBase`, `ComboboxBase`) and three Layer 3 semantic components (`Input`, `Select`, `Combobox`). No Layer 4 runtime controllers are needed; the complexity lives entirely in the behavior bases.

**Core Philosophy**:

> A single `ComboboxBase` drives all selection UI. `InputBase` drives all text-entry UI. Layer 3 components are thin semantic wrappers that inherit behavior, not re-implement it.

---

## Strategic Goals

### 1. InputBase (Layer 2)

- Unified input field behavior: focus ring, error/disabled states, size variants, left/right section slots
- CSS variable–driven sizing: `--input-height`, `--input-fz`, `--input-padding-x`, `--input-radius`
- `Input.Wrapper` as a standalone layout primitive (label + description + error)

### 2. ComboboxBase (Layer 2)

- Keyboard navigation: `↑↓` through options, `Enter` to select, `Escape` to close
- Controlled + uncontrolled open state
- Single-value selection model (multi-value: STAGE-008)
- ARIA: `role="combobox"`, `role="listbox"`, `role="option"`, `aria-activedescendant`
- Built on `PopoverBase` for dropdown positioning

### 3. Layer 3 Components

- **Input** — styled text input with factory system integration
- **Select** — single-value picker built on `ComboboxBase`
- **Combobox** — searchable/filterable picker with custom render support

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      PrismuiProvider                            │
│              modules={[overlayModule(), ...]}                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
   ┌─────────────┐  ┌────────────┐  ┌────────────────┐
   │  InputBase  │  │PopoverBase │  │ ComboboxBase   │
   │  (Layer 2)  │  │ (existing) │  │  (Layer 2)     │
   └──────┬──────┘  └────────────┘  └───────┬────────┘
          │                                  │
   ┌──────┴──────┐              ┌────────────┼──────────┐
   ▼             ▼              ▼            ▼          ▼
 Input     Input.Wrapper     Select      Combobox   (future:
(Layer 3)  (Layer 3)        (Layer 3)   (Layer 3)  MultiSelect)
```

### Dependency Chain

```
PopoverBase (STAGE-006) ──► ComboboxBase ──► Select
                                         └──► Combobox

InputBase ──► Input
         └──► Input.Wrapper (standalone)
         └──► (Select/Combobox trigger reuses InputBase styling)
```

### Implementation Order

```
Phase A: InputBase  ──────────────────────────────► Phase C: Input
                                                          │
Phase B: ComboboxBase  ──► Phase D: Select  ──► Phase E: Combobox
```

Phase A and B can be developed in parallel. Phase C depends on A. Phase D depends on both A and B. Phase E depends on D.

---

## Phase A: InputBase (Layer 2)

### Goal

Behavior + structure base for all text-entry components. Handles wrapper DOM structure, focus ring, error/disabled states, size variants, and left/right section slots.

### Files

```
components/InputBase/
  InputBase.tsx              # Root component + InputWrapper
  InputBase.context.tsx      # InputBaseContext (error, disabled, id)
  InputBase.module.css       # CSS variables, wrapper, sections, states
  index.ts
```

### Props — `InputBaseProps`

```ts
interface InputBaseProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode | boolean;
  required?: boolean;
  withAsterisk?: boolean;
  size?: "sm" | "md" | "lg";
  radius?: PrismuiRadius;
  variant?: "outlined" | "soft" | "plain";
  leftSection?: React.ReactNode;
  leftSectionWidth?: number | string;
  rightSection?: React.ReactNode;
  rightSectionWidth?: number | string;
  rightSectionPointerEvents?: React.CSSProperties["pointerEvents"];
  fullWidth?: boolean;
  pointer?: boolean; // disables pointer events on input (for Select trigger)
  wrapperProps?: React.HTMLAttributes<HTMLDivElement>;
  inputWrapperOrder?: ("label" | "input" | "description" | "error")[];
}
```

### `InputWrapper` — standalone layout primitive

```ts
interface InputWrapperProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode | boolean;
  required?: boolean;
  withAsterisk?: boolean;
  labelFor?: string;
  inputWrapperOrder?: ("label" | "input" | "description" | "error")[];
  children: React.ReactNode;
}
```

`InputWrapper` is the layout shell. `Input` uses it internally, but it can also wrap any custom input element.

### DOM Structure

```html
<div class="root">
  <label class="label" for="input-id"
    >Label <span class="required">*</span></label
  >
  <div
    class="wrapper"
    data-variant="default"
    data-error
    data-focused
    data-disabled
    data-with-left-section
    data-with-right-section
  >
    <div class="section" data-position="left"><!-- leftSection --></div>
    <input class="input" id="input-id" />
    <div class="section" data-position="right"><!-- rightSection --></div>
  </div>
  <div class="description">Helper text</div>
  <div class="error">Error message</div>
</div>
```

### State Attributes (on `.wrapper`)

| Attribute                 | Condition                         |
| ------------------------- | --------------------------------- |
| `data-focused`            | Input has focus                   |
| `data-error`              | `error` prop is truthy            |
| `data-disabled`           | `disabled` prop is true           |
| `data-with-left-section`  | `leftSection` is provided         |
| `data-with-right-section` | `rightSection` is provided        |
| `data-variant`            | `'outlined' \| 'soft' \| 'plain'` |

### CSS Variables (size tokens)

```
--input-height:      sm=32px  md=36px  lg=42px
--input-fz:          sm=font-size-sm  md=font-size-md  lg=font-size-lg
--input-padding-x:   sm=12px  md=14px  lg=16px
--input-section-size: sm=32px  md=36px  lg=42px
```

### Tests — 44 tests (actual)

```
InputBase.test.tsx
  Rendering
    ✓ renders native input
    ✓ renders label when provided
    ✓ renders description when provided
    ✓ renders error message when string
    ✓ renders required asterisk with required prop
    ✓ renders required asterisk with withAsterisk prop
    ✓ renders leftSection
    ✓ renders rightSection
  State attributes
    ✓ sets data-focused on focus, removes on blur
    ✓ sets data-error when error is truthy
    ✓ sets data-disabled when disabled
    ✓ sets data-with-left-section
    ✓ sets data-with-right-section
    ✓ sets data-variant
  Variants: outlined / soft / plain
  Sizes: sm / md / lg
  InputWrapper standalone
    ✓ renders label + children
    ✓ renders error
    ✓ renders description
    ✓ custom inputWrapperOrder
  Forwarding
    ✓ forwards ref to native input
    ✓ passes native input props (placeholder, type, value, onChange)
    ✓ fullWidth applies block layout
  Accessibility
    ✓ label htmlFor matches input id
    ✓ aria-describedby links to description
    ✓ aria-errormessage links to error
    ✓ aria-required when required
    ✓ aria-invalid when error
```

---

## Phase B: ComboboxBase (Layer 2)

### Goal

The behavioral engine for all selection UI. Manages dropdown open/close (via `PopoverBase`), option keyboard navigation, selection state, search value, and full ARIA combobox pattern.

### Files

```
components/ComboboxBase/
  ComboboxBase.tsx              # Root: state + context provider
  ComboboxBase.context.tsx      # ComboboxBaseContext + hook
  ComboboxBaseTarget.tsx        # Trigger wrapper (ARIA + keyboard)
  ComboboxBaseDropdown.tsx      # Dropdown panel (wraps PopoverBase.Dropdown)
  ComboboxBaseOptions.tsx       # role="listbox" container
  ComboboxBaseOption.tsx        # role="option" item
  ComboboxBaseSearch.tsx        # Search input inside dropdown
  ComboboxBaseEmpty.tsx         # Empty state slot
  useComboboxKeyboard.ts        # Keyboard navigation hook
  index.ts
```

### Context Value

```ts
interface ComboboxBaseContextValue {
  opened: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
  value: string | null;
  onOptionSelect: (value: string, label: string) => void;
  activeOptionIndex: number | null;
  setActiveOptionIndex: (index: number | null) => void;
  optionCount: number;
  setOptionCount: (n: number) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  comboboxId: string;
  listboxId: string;
  getOptionId: (index: number) => string;
  withinPortal: boolean;
  position: PopoverBasePosition;
  offset: number;
  zIndex?: number;
  disabled: boolean;
}
```

### `useComboboxKeyboard` Hook

```
ArrowDown  → open if closed, move to next option (wraps last→first)
ArrowUp    → open if closed, move to prev option (wraps first→last)
Home       → move to first option
End        → move to last option
Enter      → select activeOption, close
Escape     → clear activeOptionIndex, close
Tab        → close (no selection change)
```

### ARIA Pattern

```html
<!-- Trigger (Select mode) -->
<button
  role="combobox"
  aria-expanded="true"
  aria-haspopup="listbox"
  aria-controls="listbox-id"
  aria-activedescendant="option-2"
>
  Selected Value
</button>

<!-- Dropdown -->
<div role="listbox" id="listbox-id">
  <div role="option" id="option-0" aria-selected="false">Option A</div>
  <div role="option" id="option-1" aria-selected="false">Option B</div>
  <div role="option" id="option-2" aria-selected="true" data-active>
    Option C
  </div>
</div>
```

### Compound Components

| Component               | Role             | Description                                |
| ----------------------- | ---------------- | ------------------------------------------ |
| `ComboboxBase.Target`   | Trigger wrapper  | Attaches ARIA + keyboard handlers to child |
| `ComboboxBase.Dropdown` | Dropdown panel   | Wraps `PopoverBase.Dropdown`               |
| `ComboboxBase.Options`  | `role="listbox"` | Container for option items                 |
| `ComboboxBase.Option`   | `role="option"`  | Individual selectable item                 |
| `ComboboxBase.Search`   | Search input     | Filterable input inside dropdown           |
| `ComboboxBase.Empty`    | Empty state      | Shown when no options match                |

### Tests — 40 tests

```
ComboboxBase.test.tsx
  Open/close
    ✓ closed by default
    ✓ opens on trigger click
    ✓ closes on Escape
    ✓ closes on outside click
    ✓ controlled open state
  Keyboard navigation
    ✓ ArrowDown opens and highlights first option
    ✓ ArrowDown moves to next option
    ✓ ArrowDown wraps from last to first
    ✓ ArrowUp moves to previous option
    ✓ ArrowUp wraps from first to last
    ✓ Home moves to first option
    ✓ End moves to last option
    ✓ Enter selects highlighted option
    ✓ Enter closes dropdown after selection
    ✓ Escape clears highlight and closes
    ✓ Tab closes without selection
  Selection
    ✓ calls onOptionSelect with value and label
    ✓ selected option has aria-selected="true"
    ✓ controlled value
    ✓ uncontrolled value
  Search
    ✓ renders ComboboxBase.Search
    ✓ onSearchChange called on input
    ✓ search value accessible in context
  ARIA
    ✓ trigger has role="combobox"
    ✓ trigger has aria-expanded
    ✓ trigger has aria-controls pointing to listbox
    ✓ trigger has aria-activedescendant when option highlighted
    ✓ listbox has role="listbox"
    ✓ options have role="option"
    ✓ highlighted option has data-active
  Empty state
    ✓ renders ComboboxBase.Empty when no options
  Disabled
    ✓ disabled trigger does not open
    ✓ disabled option is skipped in keyboard navigation
    ✓ disabled option cannot be selected
  Positioning
    ✓ inherits position from PopoverBase
    ✓ withinPortal default true
  Multiple options
    ✓ renders multiple options
    ✓ option click calls onOptionSelect
```

---

## Phase C: Input (Layer 3)

### Goal

Styled text input with `polymorphicFactory`, CSS variables resolver, and `StylesApiProps` support. Thin wrapper over `InputBase`.

### Files

```
components/Input/
  Input.tsx              # polymorphicFactory component
  Input.module.css       # theme-token CSS variables
  index.ts
```

### StylesNames

```ts
type InputStylesNames =
  | "root" // outer wrapper div
  | "label" // <label>
  | "required" // asterisk span
  | "description" // helper text
  | "error" // error message
  | "wrapper" // input row (input + sections)
  | "input" // native <input>
  | "section"; // left/right section slots
```

### CSS Variables

```ts
type InputCssVariables = {
  wrapper:
    | "--input-height"
    | "--input-fz"
    | "--input-padding-x"
    | "--input-radius"
    | "--input-section-size";
};
```

### Variants

| Variant    | Description                                                       |
| ---------- | ----------------------------------------------------------------- |
| `outlined` | Border + white bg (default). Focus: border→primary + ring         |
| `soft`     | Neutral gray fill, no border. Focus: bg lightens + border appears |
| `plain`    | No border, no bg. Focus: subtle bottom border                     |

### Static Components

```ts
Input.Wrapper = InputWrapper; // re-exported from InputBase
```

### Tests — (covered by InputBase tests, Input is thin wrapper)

```
Input.test.tsx
  Rendering: input, label, description, error, sections, required asterisk (required + withAsterisk)
  Variants: outlined / soft / plain
  Sizes: sm / md / lg
  States: error (data-error), disabled (data-disabled), focus (data-focused)
  Forwarding: ref, onChange/onFocus/onBlur, fullWidth
  Input.Wrapper: standalone label+children, error, description, inputWrapperOrder
  Accessibility: label htmlFor, aria-invalid
```

---

## Phase D: Select (Layer 3)

### Goal

Single-value dropdown picker. Trigger looks like an `Input` (with `pointer` mode). Built entirely on `ComboboxBase`.

### Files

```
components/Select/
  Select.tsx              # Main component
  Select.module.css       # Dropdown + option styles
  index.ts
```

### Props — `SelectProps`

```ts
interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

interface SelectProps {
  data: SelectOption[] | string[];
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
  placeholder?: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  error?: React.ReactNode | boolean;
  required?: boolean;
  withAsterisk?: boolean;
  size?: "sm" | "md" | "lg";
  radius?: PrismuiRadius;
  variant?: "outlined" | "soft" | "plain";
  disabled?: boolean;
  clearable?: boolean;
  onClear?: () => void;
  allowDeselect?: boolean;
  position?: PopoverBasePosition;
  maxDropdownHeight?: number | string;
  renderOption?: (option: SelectOption, active: boolean) => React.ReactNode;
  nothingFoundMessage?: React.ReactNode;
  fullWidth?: boolean;
  dropdownWidth?: number | string | "target";
}
```

### Behavior

1. **Trigger**: `<button>` styled as input via `InputBase` with `pointer` mode. Shows selected label or placeholder.
2. **Chevron**: Right section with `ChevronDownIcon`, rotates 180° when open.
3. **Clear button**: Replaces chevron when `clearable` and value is set.
4. **Dropdown**: `ComboboxBase.Dropdown` → `ComboboxBase.Options` → `ComboboxBase.Option` items.
5. **Grouping**: Options with `group` field rendered under a `groupLabel` header.
6. **Width**: Default `'target'` — dropdown matches trigger width.

### StylesNames

```ts
type SelectStylesNames =
  | "root"
  | "label"
  | "description"
  | "error"
  | "wrapper"
  | "input" // trigger button (styled as input)
  | "section" // chevron / clear button
  | "dropdown" // dropdown panel
  | "options" // listbox container
  | "option" // individual option
  | "optionLabel" // option text
  | "groupLabel" // group header
  | "empty"; // nothing found
```

### Tests — 28 tests (actual)

```
Select.test.tsx
  Rendering: trigger, placeholder, selected label, label/description/error, chevron, clear button
  Open/close: click opens, Escape closes, outside click closes, closes after selection
  Selection: onChange, controlled, uncontrolled defaultValue, allowDeselect, clearable + onClear
  Keyboard: ArrowDown opens+highlights, ArrowDown navigates, Enter selects, Escape closes
  Options: all options rendered, disabled not selectable, grouped options, nothingFoundMessage, renderOption
  Sizes: sm / md / lg
  Variants: outlined / soft / plain
  Accessibility: role="combobox", aria-expanded, aria-haspopup="listbox", role="listbox",
                 role="option", aria-selected="true" on selected
```

---

## Phase E: Combobox (Layer 3)

### Goal

Searchable/filterable picker. Extends `Select` with a text input in the trigger or dropdown. Supports custom option rendering and async data.

### Files

```
components/Combobox/
  Combobox.tsx              # Main component
  Combobox.module.css       # Search input + highlight styles
  index.ts
```

### Props — `ComboboxProps`

```ts
interface ComboboxProps extends Omit<SelectProps, "renderOption"> {
  searchValue?: string;
  defaultSearchValue?: string;
  onSearchChange?: (value: string) => void;
  filter?: (options: SelectOption[], search: string) => SelectOption[];
  searchInDropdown?: boolean; // false = search in trigger (default)
  searchPlaceholder?: string;
  limit?: number;
  renderOption?: (
    option: SelectOption,
    active: boolean,
    search: string,
  ) => React.ReactNode;
}
```

### Two Search Modes

**Mode 1: Search in trigger** (default — like Autocomplete)

- Trigger is `<input>`, typing filters options in real time
- Selecting an option sets the input value to the option label

**Mode 2: Search in dropdown** (`searchInDropdown=true`)

- Trigger is `<button>` (same as Select)
- Opening reveals a search `<input>` at the top of the dropdown

### Default Filter

```ts
function defaultFilter(
  options: SelectOption[],
  search: string,
): SelectOption[] {
  const q = search.toLowerCase().trim();
  if (!q) return options;
  return options.filter((o) => o.label.toLowerCase().includes(q));
}
```

### Tests — 24 tests (actual)

```
Combobox.test.tsx
  Rendering: trigger, label, description, error
  Dropdown behavior: opens on click, shows search input, shows all options
  Search filtering: filters options, nothing found, custom filter, onSearchChange
  Selection: onChange, displays selected value, closes after selection
  Clearable: shows clear button, calls onChange(null)
  Disabled state: disables trigger
  ARIA: role="combobox", aria-expanded, aria-autocomplete="list"
  Keyboard: ArrowDown opens, Escape closes
  Search placeholder: default, custom
```

---

## Testing Strategy

### Total Tests: 96 new (1470 total)

| Phase     | Component    | Tests                        |
| --------- | ------------ | ---------------------------- |
| A         | InputBase    | 44                           |
| B         | ComboboxBase | (tested via Select/Combobox) |
| C         | Input        | (thin wrapper, covered by A) |
| D         | Select       | 28                           |
| E         | Combobox     | 24                           |
| **Total** |              | **96**                       |

---

## Storybook Stories

### Input (`Components/Input`) — 8 stories ✅

1. Basic Input
2. All Variants (outlined / soft / plain)
3. All Sizes (sm / md / lg)
4. With Sections (leftSection / rightSection)
5. Error State
6. Disabled State
7. Input.Wrapper Standalone
8. Controlled

### Select (`Components/Select`) — 8 stories ✅

1. Basic Select
2. Clearable
3. Grouped Options
4. Custom renderOption
5. All Sizes
6. Disabled Options
7. Nothing Found
8. Controlled

### Combobox (`Components/Combobox`) — 7 stories ✅

1. Basic Combobox
2. Clearable
3. Custom Filter (starts-with)
4. Custom renderOption (emoji + checkmark)
5. Large Dataset (200 items)
6. Custom Search Placeholder
7. Controlled Search Value

---

## File Structure Summary

```
packages/core/src/components/
  InputBase/
    InputBase.tsx
    InputBase.context.tsx
    InputBase.module.css
    index.ts
  ComboboxBase/
    ComboboxBase.tsx
    ComboboxBase.context.tsx
    ComboboxBaseTarget.tsx
    ComboboxBaseDropdown.tsx
    ComboboxBaseOptions.tsx
    ComboboxBaseOption.tsx
    ComboboxBaseSearch.tsx
    ComboboxBaseEmpty.tsx
    useComboboxKeyboard.ts
    index.ts
  Input/
    Input.tsx
    Input.module.css
    Input.stories.tsx
    index.ts
  InputBase/
    ...
    InputBase.test.tsx
  Select/
    Select.tsx
    Select.module.css
    Select.stories.tsx
    Select.test.tsx
    index.ts
  Combobox/
    Combobox.tsx
    Combobox.module.css
    Combobox.stories.tsx
    Combobox.test.tsx
    index.ts
```

---

## Success Metrics

### Technical

- [x] 96 new tests passing (1470 total)
- [x] tsc --noEmit clean
- [x] 23 Storybook stories (8 Input + 8 Select + 7 Combobox)
- [x] Full keyboard accessibility (WCAG 2.1 AA)

### Architectural

- [x] `ComboboxBase` is the single source of keyboard navigation truth
- [x] `InputBase` is the single source of input field structure
- [x] `Select` and `Combobox` contain zero duplicated behavior logic
- [x] Compatible with react-hook-form (`{...register('field')}` spread works)

### Developer Experience

- [x] `<Input label="Name" error={errors.name?.message} {...register('name')} />`
- [x] `<Select data={options} value={value} onChange={setValue} />`
- [x] `<Combobox data={options} searchValue={q} onSearchChange={setQ} />`

---

## Future Extensions (Post-STAGE-007)

- **MultiSelect** — `ComboboxBase` with `value: string[]`, tag chips in trigger
- **Autocomplete** — `ComboboxBase` with free-text input + suggestions
- **NumberInput** — `InputBase` with step buttons as rightSection
- **PasswordInput** — `InputBase` with show/hide toggle as rightSection
- **Textarea** — `InputBase` with `multiline` mode
- **DatePicker** — `ComboboxBase` + calendar dropdown (STAGE-008 candidate)
