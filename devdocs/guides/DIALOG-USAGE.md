# Dialog Usage Guide

> Complete guide to using PrismUI's Dialog component and programmatic DialogController.

---

## Quick Start

### Declarative Dialog (Layer 3)

```tsx
import { Dialog, DialogFooter } from '@prismui/core';

function MyPage() {
  const [opened, setOpened] = useState(false);

  return (
    <>
      <button onClick={() => setOpened(true)}>Open</button>

      <Dialog opened={opened} onClose={() => setOpened(false)} title="Hello">
        <p>Dialog content goes here.</p>
        <DialogFooter>
          <button onClick={() => setOpened(false)}>Close</button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
```

### Programmatic Dialog (Layer 4)

```tsx
import { useDialogController } from '@prismui/core';

function MyPage() {
  const dialog = useDialogController();

  const handleDelete = async () => {
    const confirmed = await dialog.confirm({
      title: 'Delete Item?',
      content: 'This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });

    if (confirmed) {
      await deleteItem();
    }
  };

  return <button onClick={handleDelete}>Delete</button>;
}
```

---

## Dialog Component

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `opened` | `boolean` | — | Whether the dialog is open |
| `onClose` | `() => void` | — | Called when the dialog should close |
| `title` | `ReactNode` | — | Title rendered in the header |
| `withCloseButton` | `boolean` | `true` | Show close button in header |
| `closeButtonProps` | `ButtonHTMLAttributes` | — | Props for the close button |
| `size` | `number \| string` | `440` | Dialog width (numbers → rem) |
| `centered` | `boolean` | `false` | Vertically center the dialog |
| `fullScreen` | `boolean` | `false` | Take up the full viewport |
| `overlayOpacity` | `number` | `0.48` | Backdrop opacity |
| `trapFocus` | `boolean` | `true` | Trap keyboard focus |
| `closeOnEscape` | `boolean` | `true` | Close on Escape key |
| `closeOnClickOutside` | `boolean` | `true` | Close on backdrop click |
| `lockScroll` | `boolean` | `true` | Lock body scroll |
| `withinPortal` | `boolean` | `true` | Render in a portal |

### Sizing

```tsx
// Numeric (converted to rem)
<Dialog size={600} ... />

// String (used as-is)
<Dialog size="80%" ... />

// Full screen
<Dialog fullScreen ... />
```

### Centering

```tsx
// Default: offset from top (5vh padding)
<Dialog ... />

// Vertically centered
<Dialog centered ... />
```

---

## Compound Components

For full layout control, use the compound components directly:

```tsx
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
  DialogCloseButton,
} from '@prismui/core';

<Dialog opened={opened} onClose={close} withCloseButton={false}>
  <DialogHeader>
    <DialogTitle>Custom Title</DialogTitle>
    <DialogCloseButton />
  </DialogHeader>
  <DialogBody>
    <p>Body content with full control over layout.</p>
  </DialogBody>
  <DialogFooter>
    <button onClick={close}>Cancel</button>
    <button onClick={handleSave}>Save</button>
  </DialogFooter>
</Dialog>
```

### Available Components

| Component | Description |
|-----------|-------------|
| `DialogHeader` | Flex container for title + close button |
| `DialogTitle` | Title text (font-weight 600) |
| `DialogBody` | Body content with padding |
| `DialogFooter` | Right-aligned footer for actions |
| `DialogCloseButton` | Close button that calls `onClose` from context |

---

## DialogController API

### Setup

```tsx
import { PrismuiProvider, overlayModule, dialogModule, DialogRenderer } from '@prismui/core';

<PrismuiProvider modules={[overlayModule(), dialogModule()]}>
  <App />
  <DialogRenderer />
</PrismuiProvider>
```

> **Important**: Place `<DialogRenderer />` inside the provider tree. It renders programmatic dialogs.

### Methods

#### `open(options): string`

Opens a dialog and returns its ID for manual closing.

```tsx
const id = dialog.open({
  title: 'Info',
  content: 'Something happened.',
});

// Later...
dialog.close(id);
```

#### `close(id): void`

Closes a specific dialog by ID.

#### `closeAll(): void`

Closes all open programmatic dialogs.

#### `confirm(options): Promise<boolean>`

Opens a confirmation dialog with OK and Cancel buttons. Returns `true` if confirmed, `false` if cancelled.

```tsx
const confirmed = await dialog.confirm({
  title: 'Are you sure?',
  content: 'This will delete the item permanently.',
  confirmText: 'Delete',   // default: 'OK'
  cancelText: 'Keep',      // default: 'Cancel'
});
```

#### `alert(options): Promise<void>`

Opens an alert dialog with only an OK button. Resolves when acknowledged.

```tsx
await dialog.alert({
  title: 'Session Expired',
  content: 'Please log in again.',
  confirmText: 'Got it',
});
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `title` | `string` | — | Dialog title |
| `content` | `string` | — | Body text |
| `onConfirm` | `() => void \| Promise<void>` | — | Confirm callback |
| `onCancel` | `() => void` | — | Cancel callback |
| `confirmText` | `string` | `'OK'` | Confirm button text |
| `cancelText` | `string` | `'Cancel'` | Cancel button text |
| `closeOnEscape` | `boolean` | `true` | Close on Escape |
| `closeOnClickOutside` | `boolean` | `true` | Close on backdrop click |
| `size` | `number \| string` | `440` | Dialog width |
| `centered` | `boolean` | `false` | Vertically center |

---

## Patterns

### Chained Confirmations (Wizard)

```tsx
const dialog = useDialogController();

async function wizard() {
  const step1 = await dialog.confirm({ title: 'Step 1', content: 'Continue?' });
  if (!step1) return;

  const step2 = await dialog.confirm({ title: 'Step 2', content: 'Almost done.' });
  if (!step2) return;

  await dialog.alert({ title: 'Done!', content: 'All steps completed.' });
}
```

### Confirmation Before Navigation

```tsx
async function handleNavigate(path: string) {
  if (hasUnsavedChanges) {
    const confirmed = await dialog.confirm({
      title: 'Unsaved Changes',
      content: 'You have unsaved changes. Discard them?',
      confirmText: 'Discard',
      cancelText: 'Stay',
    });
    if (!confirmed) return;
  }
  navigate(path);
}
```

### Error Alert

```tsx
try {
  await saveData();
} catch (error) {
  await dialog.alert({
    title: 'Save Failed',
    content: error.message,
  });
}
```

---

## Storybook Stories

### Dialog Component (`Components/Dialog`)
- Basic Dialog
- Confirmation Dialog
- Centered
- Full Screen
- Custom Size
- Compound Components
- Nested Dialogs

### DialogController (`Runtime/DialogController`)
- Programmatic confirm()
- Programmatic alert()
- Manual open/close
- Multiple Dialogs
- Chained Confirms
