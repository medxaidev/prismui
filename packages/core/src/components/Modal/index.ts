/**
 * Modal · public barrel.
 *
 * Authority: ADR-007 (Modal foundation · Round 1 议题 A-F 决策 1-20).
 *
 * Public surface:
 *   · `Modal` (compound component · 7 subcomponents per 议题 E 决策 15)
 *   · 7 prop type exports (Root / Trigger / Backdrop / Content / Title /
 *     Description / Close)
 *   · `ModalRole` / `ModalSize` value-shape types
 *
 * NOT re-exported (`_internal/` private mirror Stage-15 / Stage-11 范式):
 *   · `useFocusTrap` · `tabbable` · `<ModalScrollLock>` · `useDismissModal` ·
 *     `ModalContext` / `useModalContext`
 */

export { Modal } from './Modal';
export type {
  ModalRootProps,
  ModalTriggerProps,
  ModalBackdropProps,
  ModalContentProps,
  ModalTitleProps,
  ModalDescriptionProps,
  ModalCloseProps,
  ModalSize,
} from './Modal';
export type { ModalRole } from './modal-context';
