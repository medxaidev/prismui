# STAGE-010: Collapse & ScrollArea Components

**Status:** 📋 Planned  
**Priority:** High  
**Estimated Effort:** 3-4 sessions  
**Dependencies:** STAGE-009 (Combobox refactor complete)

---

## Overview

Implement two fundamental utility components for content visibility and scrolling:

1. **Collapse** — Animated height transition for show/hide content (Layer 3)
2. **ScrollArea** — Custom scrollbar container with cross-browser consistency (Layer 3)

These are essential building blocks used across many UI patterns (accordions, dropdowns, modals, sidebars).

---

## Component Analysis

### 1. Collapse

**Purpose:** Animate content visibility with smooth height transitions (slide up/down).

**Mantine Implementation:**
- Component wraps `useCollapse` hook for reusable logic
- Uses `requestAnimationFrame` for smooth height transitions
- Supports both vertical (default) and horizontal orientations
- Auto-calculates transition duration based on content height
- `keepMounted` prop for nested collapses (keeps DOM element, just hides)
- Respects `prefers-reduced-motion` via theme setting
- Uses `flushSync` for synchronous state updates during transitions
- `inert` attribute handling for React 18 vs 19 compatibility

**Key Props:**
```typescript
interface CollapseProps {
  in: boolean;                          // Opened state (Mantine uses 'in', we'll use 'opened')
  transitionDuration?: number;          // Duration in ms (default: 200)
  transitionTimingFunction?: string;    // CSS timing function (default: 'ease')
  animateOpacity?: boolean;             // Fade in/out (default: true)
  keepMounted?: boolean;                // Keep in DOM when collapsed
  onTransitionEnd?: () => void;         // Callback when transition completes
  orientation?: 'vertical' | 'horizontal'; // Collapse direction (default: 'vertical')
}
```

**Architecture:**
- **Layer 3** semantic component (like Transition, but height-specific)
- Wraps `useCollapse` hook (can be exported separately for advanced usage)
- Uses `Box` as base with dynamic inline styles
- No CSS modules needed (all styles are inline/dynamic)

**Implementation Strategy:**
1. Create `useCollapse` hook in `hooks/use-collapse/`
2. Create `Collapse` component wrapping the hook
3. Export both component and hook from `components/Collapse/`

---

### 2. ScrollArea

**Purpose:** Custom scrollbar container with consistent styling across browsers.

**Mantine Implementation:**
- Built on Radix UI primitives (Root, Viewport, Scrollbar, Thumb, Corner)
- Supports multiple scrollbar visibility modes:
  - `hover` — visible on hover (default)
  - `scroll` — visible while scrolling
  - `auto` — always visible when overflowing
  - `always` — always visible
  - `never` — always hidden
- `offsetScrollbars` — adds padding to prevent content overlap
- `scrollbars` prop — control which scrollbars render (`x`, `y`, `xy`)
- Scroll position callbacks (`onScrollPositionChange`, `onBottomReached`, `onTopReached`)
- `ScrollArea.Autosize` variant with max-height and overflow detection
- Uses ResizeObserver for dynamic scrollbar visibility
- CSS variables for scrollbar size

**Key Props:**
```typescript
interface ScrollAreaProps {
  scrollbarSize?: number | string;      // Scrollbar width/height (default: 0.75rem)
  type?: 'auto' | 'always' | 'scroll' | 'hover' | 'never'; // Visibility mode
  scrollHideDelay?: number;             // Hide delay in ms (default: 1000)
  scrollbars?: 'x' | 'y' | 'xy' | false; // Which scrollbars to show
  offsetScrollbars?: boolean | 'x' | 'y' | 'present'; // Add padding for scrollbars
  viewportRef?: React.ForwardedRef<HTMLDivElement>; // Ref to scrollable container
  viewportProps?: React.ComponentPropsWithRef<'div'>; // Props for viewport
  onScrollPositionChange?: (position: { x: number; y: number }) => void;
  onBottomReached?: () => void;
  onTopReached?: () => void;
  overscrollBehavior?: React.CSSProperties['overscrollBehavior'];
}

interface ScrollAreaAutosizeProps extends ScrollAreaProps {
  onOverflowChange?: (overflowing: boolean) => void; // Detect when scrollable
}
```

**Architecture:**
- **Layer 3** semantic component
- Compound component pattern:
  - `ScrollArea` — main component
  - `ScrollArea.Autosize` — auto-height variant
  - Internal: `ScrollAreaRoot`, `ScrollAreaViewport`, `ScrollAreaScrollbar`, `ScrollAreaThumb`, `ScrollAreaCorner`
- Uses Radix UI `@radix-ui/react-scroll-area` as foundation
- CSS Modules for scrollbar styling
- CSS variables: `--scrollarea-scrollbar-size`, `--scrollarea-over-scroll-behavior`

**Implementation Strategy:**
1. Install `@radix-ui/react-scroll-area` dependency
2. Create internal primitives (Root, Viewport, Scrollbar, Thumb, Corner)
3. Create main `ScrollArea` component
4. Create `ScrollArea.Autosize` variant
5. Implement ResizeObserver logic for dynamic scrollbar visibility
6. Add CSS modules for custom scrollbar styling

---

## Scroller Component (Deferred)

**Note:** Scroller is a newer Mantine component (horizontal scroll container with navigation controls). It's not found in the Mantine version we're referencing (8.3.14), suggesting it was added in a later version.

**Decision:** **Defer Scroller to a future stage** after we have more stable foundation components. It's a specialized component (horizontal carousel-like scrolling with arrow buttons) that's less critical than Collapse and ScrollArea.

---

## PrismUI Architecture Alignment

### Collapse
- **Layer:** 3 (Semantic Component)
- **Base:** Box component
- **Dependencies:** None (self-contained)
- **Exports:** `Collapse` component + `useCollapse` hook
- **Factory:** `factory<CollapseFactory>`
- **No CSS Modules** — all styles inline/dynamic

### ScrollArea
- **Layer:** 3 (Semantic Component)
- **Base:** Radix UI primitives + Box
- **Dependencies:** `@radix-ui/react-scroll-area`, ResizeObserver API
- **Exports:** `ScrollArea`, `ScrollArea.Autosize`
- **Factory:** `factory<ScrollAreaFactory>` with compound components
- **CSS Modules:** Yes (scrollbar styling)
- **CSS Variables:** `--scrollarea-scrollbar-size`, `--scrollarea-over-scroll-behavior`

---

## Implementation Plan

### Phase A: Collapse Component (1 session)
1. Create `hooks/use-collapse/use-collapse.ts`
   - Height transition logic with `requestAnimationFrame`
   - Auto-duration calculation
   - `getCollapseProps` function
   - Handle `inert` attribute for accessibility
2. Create `components/Collapse/Collapse.tsx`
   - Wrap `useCollapse` hook
   - Support `animateOpacity` prop
   - Respect `prefers-reduced-motion`
3. Create `components/Collapse/Collapse.test.tsx` (20+ tests)
   - Open/close transitions
   - Duration and timing function
   - `keepMounted` behavior
   - Reduced motion
4. Create `components/Collapse/Collapse.stories.tsx` (6+ stories)
   - Basic usage
   - Horizontal orientation
   - Custom transition
   - Nested collapses
   - With reduced motion
5. Export from `components/index.ts` and `hooks/index.ts`

### Phase B: ScrollArea Component (2 sessions)
1. Install dependency: `@radix-ui/react-scroll-area`
2. Create internal primitives:
   - `ScrollAreaRoot.tsx`
   - `ScrollAreaViewport.tsx`
   - `ScrollAreaScrollbar.tsx`
   - `ScrollAreaThumb.tsx`
   - `ScrollAreaCorner.tsx`
3. Create `ScrollArea.tsx` main component
   - Integrate Radix primitives
   - Implement visibility modes (hover, scroll, auto, always, never)
   - Add scroll position tracking
   - ResizeObserver for `offsetScrollbars="present"`
4. Create `ScrollArea.module.css`
   - Custom scrollbar styling
   - Visibility transitions
   - Corner styling
5. Create `ScrollAreaAutosize.tsx`
   - Max-height with overflow detection
   - `onOverflowChange` callback
6. Create `ScrollArea.test.tsx` (25+ tests)
   - Scrollbar visibility modes
   - Scroll callbacks
   - Autosize variant
   - Offset scrollbars
7. Create `ScrollArea.stories.tsx` (10+ stories)
   - All visibility types
   - Horizontal/vertical scrollbars
   - Scroll callbacks
   - Autosize variant
   - With Popover (Autosize)
8. Export from `components/index.ts`

### Phase C: Integration & Documentation (0.5 session)
1. Update `devdocs/COMPONENT-CATALOG.md`
2. Verify all tests pass (target: 1560+ total tests)
3. Run `tsc --noEmit` verification
4. Visual verification in Storybook

---

## Testing Strategy

### Collapse Tests
- Transition states (collapsed → expanded → collapsed)
- Duration and timing function customization
- `keepMounted` keeps element in DOM
- `animateOpacity` fades content
- Reduced motion disables animation
- `onTransitionEnd` callback fires
- Horizontal orientation
- Nested collapses work correctly

### ScrollArea Tests
- Scrollbar visibility modes (hover, scroll, auto, always, never)
- Scroll position callbacks fire correctly
- Bottom/top reached callbacks
- Offset scrollbars add padding
- Autosize detects overflow
- ResizeObserver updates scrollbar visibility
- Viewport ref forwarding
- Custom scrollbar size

---

## Dependencies

### New NPM Packages
```json
{
  "@radix-ui/react-scroll-area": "^1.0.5"
}
```

### Existing PrismUI Infrastructure
- `Box` component (base for both)
- `factory` / `polymorphicFactory`
- `useStyles` / `createVarsResolver`
- `useReducedMotion` hook (for Collapse)
- `useMergeRefs` utility (for ScrollArea)

---

## Success Criteria

- ✅ Collapse component with smooth height transitions
- ✅ `useCollapse` hook exported for advanced usage
- ✅ ScrollArea with 5 visibility modes
- ✅ ScrollArea.Autosize variant with overflow detection
- ✅ Custom scrollbar styling consistent across browsers
- ✅ 45+ new tests (20 Collapse + 25 ScrollArea)
- ✅ 16+ Storybook stories (6 Collapse + 10 ScrollArea)
- ✅ Zero regressions in existing tests
- ✅ TypeScript strict mode compliance
- ✅ Accessibility: proper ARIA, keyboard navigation, reduced motion

---

## Future Enhancements (Post-STAGE-010)

1. **Scroller Component** — Horizontal scroll container with navigation controls
   - Requires: Button component for arrow controls
   - Drag-to-scroll support
   - Scroll amount customization
   - Control size variants

2. **Accordion Component** — Built on Collapse
   - Multiple collapse panels
   - Single/multiple expansion modes
   - Keyboard navigation

3. **Virtual Scrolling** — For large lists
   - Integration with ScrollArea
   - Windowing technique
   - Dynamic item heights

---

## Notes

- **Collapse** is simpler and should be implemented first
- **ScrollArea** requires Radix UI dependency — ensure it aligns with PrismUI's minimal dependency philosophy
- Both components are widely used across UI libraries and essential for production apps
- Scroller is deferred due to being a newer/specialized component not in our reference Mantine version

---

## References

- Mantine Collapse: https://alpha.mantine.dev/core/collapse/
- Mantine ScrollArea: https://alpha.mantine.dev/core/scroll-area/
- Radix UI ScrollArea: https://www.radix-ui.com/primitives/docs/components/scroll-area
- Mantine Source (8.3.14): `D:\Programming\mantine\github\mantine-next-8.3.14\packages\@mantine\core\src\components\`
