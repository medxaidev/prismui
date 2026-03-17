// ---------------------------------------------------------------------------
// ModalRenderer — Layer 3 Rendering Component
// Subscribes to modalStack and renders each modal as an overlay with backdrop.
// Zero business logic — purely presentational.
// ---------------------------------------------------------------------------

import React, { useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useModal } from '../use-modal';

/** Props for ModalRenderer. */
export interface ModalRendererProps {
  /** Render prop: receives (modalId, closeFn) and returns the modal content. */
  children: (modalId: string, close: () => void) => React.ReactNode;
  /** Whether clicking the backdrop closes the top modal. Default: true. */
  backdropClose?: boolean;
  /** Whether pressing Escape closes the top modal. Default: true. */
  escapeClose?: boolean;
  /** Optional className applied to the overlay wrapper. */
  className?: string;
}

// Inline styles — no external CSS dependency
const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const backdropStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
};

const contentStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 1,
};

/**
 * ModalRenderer — renders all open modals from the runtime modal stack.
 *
 * Uses a render-prop pattern so the application provides its own modal UI.
 * Each modal in the stack is rendered as a stacked overlay with backdrop.
 */
export function ModalRenderer({
  children,
  backdropClose = true,
  escapeClose = true,
  className,
}: ModalRendererProps) {
  const { modalStack, close } = useModal();

  // Escape key handler — closes the top modal
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (escapeClose && e.key === 'Escape' && modalStack.length > 0) {
        close(); // close top of stack
      }
    },
    [escapeClose, modalStack.length, close],
  );

  useEffect(() => {
    if (modalStack.length === 0) return;
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [modalStack.length, handleKeyDown]);

  if (modalStack.length === 0) {
    return null;
  }

  return createPortal(
    <>
      {modalStack.map((modalId, index) => (
        <div
          key={modalId}
          className={className}
          style={{ ...overlayStyle, zIndex: 1000 + index }}
          data-testid={`modal-overlay-${modalId}`}
          role="dialog"
          aria-modal="true"
        >
          <div
            style={backdropStyle}
            data-testid={`modal-backdrop-${modalId}`}
            onClick={
              backdropClose
                ? () => close(modalId)
                : undefined
            }
          />
          <div style={contentStyle}>
            {children(modalId, () => close(modalId))}
          </div>
        </div>
      ))}
    </>,
    document.body,
  );
}
