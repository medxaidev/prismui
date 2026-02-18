import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PrismuiProvider } from '../../PrismuiProvider/PrismuiProvider';
import { overlayModule } from '../overlay/overlayModule';
import { dialogModule } from './dialogModule';
import { useDialogController } from './useDialogController';
import { DialogRenderer } from './DialogRenderer';
import { useRuntimeKernel } from '../RuntimeContext';
import type { DialogController } from './types';
import type { RuntimeKernel } from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <PrismuiProvider
      withCssVars={false}
      withCssBaseline={false}
      modules={[overlayModule(), dialogModule()]}
    >
      {children}
    </PrismuiProvider>
  );
}

function KernelConsumer({ onCapture }: { onCapture: (k: RuntimeKernel) => void }) {
  const kernel = useRuntimeKernel();
  onCapture(kernel);
  return null;
}

function ControllerConsumer({ onCapture }: { onCapture: (c: DialogController) => void }) {
  const controller = useDialogController();
  onCapture(controller);
  return null;
}

// ---------------------------------------------------------------------------
// dialogModule — setup
// ---------------------------------------------------------------------------

describe('dialogModule — setup', () => {
  it('registers dialog controller in kernel', () => {
    let kernel: RuntimeKernel | null = null;

    render(
      <Wrapper>
        <KernelConsumer onCapture={(k) => { kernel = k; }} />
      </Wrapper>,
    );

    expect(kernel).not.toBeNull();
    expect(kernel!.get('dialog')).toBeDefined();
  });

  it('exposes dialog controller via kernel.getExposed', () => {
    let kernel: RuntimeKernel | null = null;

    render(
      <Wrapper>
        <KernelConsumer onCapture={(k) => { kernel = k; }} />
      </Wrapper>,
    );

    const controller = kernel!.getExposed<DialogController>('dialog');
    expect(controller).toBeDefined();
    expect(typeof controller!.open).toBe('function');
    expect(typeof controller!.confirm).toBe('function');
  });
});

// ---------------------------------------------------------------------------
// useDialogController
// ---------------------------------------------------------------------------

describe('useDialogController', () => {
  it('returns the dialog controller', () => {
    let controller: DialogController | null = null;

    render(
      <Wrapper>
        <ControllerConsumer onCapture={(c) => { controller = c; }} />
      </Wrapper>,
    );

    expect(controller).not.toBeNull();
    expect(typeof controller!.open).toBe('function');
    expect(typeof controller!.close).toBe('function');
    expect(typeof controller!.confirm).toBe('function');
    expect(typeof controller!.alert).toBe('function');
  });

  it('throws when dialogModule is not registered', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(
        <PrismuiProvider withCssVars={false} withCssBaseline={false} modules={[overlayModule()]}>
          <ControllerConsumer onCapture={() => {}} />
        </PrismuiProvider>,
      );
    }).toThrow('DialogController not found');

    spy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// DialogRenderer — rendering
// ---------------------------------------------------------------------------

describe('DialogRenderer', () => {
  it('renders nothing when no dialogs are open', () => {
    const { container } = render(
      <Wrapper>
        <DialogRenderer />
      </Wrapper>,
    );

    expect(container.querySelector('[role="dialog"]')).toBeNull();
  });

  it('renders a dialog when controller.open is called', async () => {
    let controller: DialogController | null = null;

    render(
      <Wrapper>
        <ControllerConsumer onCapture={(c) => { controller = c; }} />
        <DialogRenderer />
      </Wrapper>,
    );

    controller!.open({ title: 'Programmatic Dialog', content: 'Hello from controller' });

    await waitFor(() => {
      expect(screen.getByText('Programmatic Dialog')).toBeInTheDocument();
      expect(screen.getByText('Hello from controller')).toBeInTheDocument();
    });
  });

  it('removes dialog when controller.close is called', async () => {
    let controller: DialogController | null = null;

    render(
      <Wrapper>
        <ControllerConsumer onCapture={(c) => { controller = c; }} />
        <DialogRenderer />
      </Wrapper>,
    );

    const id = controller!.open({ title: 'To Close' });

    await waitFor(() => {
      expect(screen.getByText('To Close')).toBeInTheDocument();
    });

    controller!.close(id);

    await waitFor(() => {
      expect(screen.queryByText('To Close')).toBeNull();
    });
  });

  it('renders confirm dialog with OK and Cancel buttons', async () => {
    let controller: DialogController | null = null;

    render(
      <Wrapper>
        <ControllerConsumer onCapture={(c) => { controller = c; }} />
        <DialogRenderer />
      </Wrapper>,
    );

    controller!.confirm({ title: 'Confirm?', content: 'Are you sure?' });

    await waitFor(() => {
      expect(screen.getByText('Confirm?')).toBeInTheDocument();
      expect(screen.getByText('OK')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  it('confirm resolves true when OK is clicked', async () => {
    let controller: DialogController | null = null;

    render(
      <Wrapper>
        <ControllerConsumer onCapture={(c) => { controller = c; }} />
        <DialogRenderer />
      </Wrapper>,
    );

    const promise = controller!.confirm({ title: 'Confirm?' });

    await waitFor(() => {
      expect(screen.getByText('OK')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('OK'));

    const result = await promise;
    expect(result).toBe(true);
  });

  it('confirm resolves false when Cancel is clicked', async () => {
    let controller: DialogController | null = null;

    render(
      <Wrapper>
        <ControllerConsumer onCapture={(c) => { controller = c; }} />
        <DialogRenderer />
      </Wrapper>,
    );

    const promise = controller!.confirm({ title: 'Confirm?' });

    await waitFor(() => {
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Cancel'));

    const result = await promise;
    expect(result).toBe(false);
  });

  it('renders alert dialog with only OK button', async () => {
    let controller: DialogController | null = null;

    render(
      <Wrapper>
        <ControllerConsumer onCapture={(c) => { controller = c; }} />
        <DialogRenderer />
      </Wrapper>,
    );

    controller!.alert({ title: 'Notice' });

    await waitFor(() => {
      expect(screen.getByText('Notice')).toBeInTheDocument();
      expect(screen.getByText('OK')).toBeInTheDocument();
    });

    // No Cancel button for alert
    expect(screen.queryByText('Cancel')).toBeNull();
  });

  it('alert resolves when OK is clicked', async () => {
    let controller: DialogController | null = null;

    render(
      <Wrapper>
        <ControllerConsumer onCapture={(c) => { controller = c; }} />
        <DialogRenderer />
      </Wrapper>,
    );

    const promise = controller!.alert({ title: 'Notice' });

    await waitFor(() => {
      expect(screen.getByText('OK')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('OK'));
    await promise;
  });

  it('uses custom confirmText and cancelText', async () => {
    let controller: DialogController | null = null;

    render(
      <Wrapper>
        <ControllerConsumer onCapture={(c) => { controller = c; }} />
        <DialogRenderer />
      </Wrapper>,
    );

    controller!.confirm({ title: 'Delete?', confirmText: 'Delete', cancelText: 'Keep' });

    await waitFor(() => {
      expect(screen.getByText('Delete')).toBeInTheDocument();
      expect(screen.getByText('Keep')).toBeInTheDocument();
    });
  });

  it('closeAll removes all rendered dialogs', async () => {
    let controller: DialogController | null = null;

    render(
      <Wrapper>
        <ControllerConsumer onCapture={(c) => { controller = c; }} />
        <DialogRenderer />
      </Wrapper>,
    );

    controller!.open({ title: 'Dialog A', content: 'A' });
    controller!.open({ title: 'Dialog B', content: 'B' });

    await waitFor(() => {
      expect(screen.getByText('Dialog A')).toBeInTheDocument();
      expect(screen.getByText('Dialog B')).toBeInTheDocument();
    });

    controller!.closeAll();

    await waitFor(() => {
      expect(screen.queryByText('Dialog A')).toBeNull();
      expect(screen.queryByText('Dialog B')).toBeNull();
    });
  });
});
