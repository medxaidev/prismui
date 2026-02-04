# DATAFLOW (Enforceable)

**Status:** Active  
**Version:** v1.0  
**Scope:** Defines runtime data flows in Prismui

---

## 1. Theme Initialization Flow

```
Application Start
  ↓
PrismuiProvider initialized
  ↓
Theme object created (createTheme)
  ↓
CSS variables generated
  ↓
Theme context provided
  ↓
Components consume theme
```

---

## 2. Component Rendering Flow

```
Component receives props
  ↓
useTheme() accesses theme context
  ↓
Style resolution (theme + props)
  ↓
CSS variables applied
  ↓
Component renders with styles
  ↓
Accessibility attributes added
```

---

## 3. Theming System Flow

### 3.1 Theme Object Structure

```typescript
{
  colors: {
    primary: ['#...', '#...', ...],
    gray: ['#...', '#...', ...],
  },
  spacing: { xs: 8, sm: 12, md: 16, ... },
  radius: { xs: 2, sm: 4, md: 8, ... },
  fontSizes: { xs: 12, sm: 14, md: 16, ... },
  breakpoints: { xs: 576, sm: 768, md: 992, ... },
}
```

### 3.2 CSS Variables Generation

```
Theme Object
  ↓
cssVariablesResolver()
  ↓
CSS Variables Object
  {
    '--prismui-color-primary-0': '#...',
    '--prismui-spacing-md': '16px',
    ...
  }
  ↓
Injected into :root
```

---

## 4. Style Resolution Flow

```
Component Props
  ↓
Style Props Parser
  ↓
Theme Values Lookup
  ↓
CSS Variables Reference
  ↓
Final Styles Object
  ↓
Applied to Component
```

**Example:**

```typescript
<Box p="md" bg="primary.5">
  ↓
{
  padding: 'var(--prismui-spacing-md)',
  background: 'var(--prismui-color-primary-5)'
}
```

---

## 5. Polymorphic Component Flow

```
<Button component="a" href="/link">
  ↓
Polymorphic type resolution
  ↓
Props merged (Button + 'a' element)
  ↓
Rendered as <a> with Button styles
```

---

## 6. SSR Flow (Next.js App Router)

```
Server Component
  ↓
PrismuiAppProvider wraps app
  ↓
useServerInsertedHTML hook
  ↓
Collect styles during render
  ↓
Inject <style> tags in <head>
  ↓
Hydration on client
  ↓
Client-side theme context active
```

---

## 7. Theme Switching Flow

```
User triggers theme change
  ↓
Update theme context state
  ↓
CSS variables updated
  ↓
Components re-render with new theme
  ↓
Smooth transition (if enabled)
```

---

## 8. Accessibility Flow

```
Component renders
  ↓
ARIA attributes added
  ↓
Keyboard event handlers attached
  ↓
Focus management enabled
  ↓
Screen reader announcements
```

---

## 9. Forbidden Flows

**MUST NOT:**

- Bypass theme context for styles
- Access CSS variables directly without theme
- Mutate theme object at runtime
- Skip accessibility attributes
- Use inline styles for theming

---

## 10. Stage-1 Valid Dataflows

**Allowed:**

- Theme initialization
- Basic component rendering
- Style prop resolution
- CSS variable generation
- Theme context consumption

**Forbidden:**

- Complex state management
- Animation systems
- Advanced composition patterns
