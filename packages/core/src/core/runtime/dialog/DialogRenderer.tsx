'use client';

import { useEffect, useState } from 'react';
import { Dialog } from '../../../components/Dialog/Dialog';
import { DialogFooter } from '../../../components/Dialog/DialogFooter';
import { useDialogController } from './useDialogController';
import type { DialogInstance } from './types';

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const btnBase: React.CSSProperties = {
  padding: '6px 16px',
  borderRadius: 6,
  border: '1px solid #ccc',
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 500,
  background: '#fff',
  color: '#333',
};

const primaryBtn: React.CSSProperties = {
  ...btnBase,
  background: '#1976d2',
  color: '#fff',
  border: 'none',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders programmatic dialogs managed by the DialogController.
 *
 * Place this component once inside your PrismuiProvider tree (typically
 * at the root level alongside your app content).
 *
 * @example
 * ```tsx
 * <PrismuiProvider modules={[overlayModule(), dialogModule()]}>
 *   <App />
 *   <DialogRenderer />
 * </PrismuiProvider>
 * ```
 */
export function DialogRenderer() {
  const controller = useDialogController();
  const [dialogs, setDialogs] = useState<DialogInstance[]>([]);

  useEffect(() => {
    // Sync initial state
    setDialogs(controller.getDialogs());

    // Subscribe to changes
    const unsubscribe = controller.subscribe((next) => {
      setDialogs([...next]);
    });

    return unsubscribe;
  }, [controller]);

  return (
    <>
      {dialogs.map((instance) => {
        const { id, options } = instance;
        const {
          title,
          content,
          onConfirm,
          onCancel,
          confirmText = 'OK',
          cancelText = 'Cancel',
          closeOnEscape = true,
          closeOnClickOutside = true,
          size,
          centered,
        } = options;

        const handleClose = () => {
          if (onCancel) {
            onCancel();
          } else {
            controller.close(id);
          }
        };

        return (
          <Dialog
            key={id}
            opened
            onClose={handleClose}
            title={title}
            closeOnEscape={closeOnEscape}
            closeOnClickOutside={closeOnClickOutside}
            size={size}
            centered={centered}
          >
            {content && (
              <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, margin: 0 }}>
                {content}
              </p>
            )}
            <DialogFooter>
              {onCancel && (
                <button
                  type="button"
                  style={btnBase}
                  onClick={onCancel}
                >
                  {cancelText}
                </button>
              )}
              {onConfirm && (
                <button
                  type="button"
                  style={primaryBtn}
                  onClick={() => onConfirm()}
                >
                  {confirmText}
                </button>
              )}
            </DialogFooter>
          </Dialog>
        );
      })}
    </>
  );
}

DialogRenderer.displayName = '@prismui/core/DialogRenderer';
