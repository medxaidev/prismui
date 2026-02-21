'use client';

import { useCallback } from 'react';

export interface UseComboboxKeyboardOptions {
  opened: boolean;
  onOpen: () => void;
  onClose: () => void;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  optionsCount: number;
  onSelectActive: () => void;
}

/**
 * Handles keyboard navigation for ComboboxBase.
 * Returns a keydown handler to attach to the trigger or search input.
 */
export function useComboboxKeyboard({
  opened,
  onOpen,
  onClose,
  activeIndex,
  setActiveIndex,
  optionsCount,
  onSelectActive,
}: UseComboboxKeyboardOptions) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault();
          if (!opened) {
            onOpen();
            setActiveIndex(0);
          } else {
            setActiveIndex(Math.min(activeIndex + 1, optionsCount - 1));
          }
          break;
        }
        case 'ArrowUp': {
          e.preventDefault();
          if (!opened) {
            onOpen();
            setActiveIndex(optionsCount - 1);
          } else {
            setActiveIndex(Math.max(activeIndex - 1, 0));
          }
          break;
        }
        case 'Home': {
          if (opened) {
            e.preventDefault();
            setActiveIndex(0);
          }
          break;
        }
        case 'End': {
          if (opened) {
            e.preventDefault();
            setActiveIndex(Math.max(optionsCount - 1, 0));
          }
          break;
        }
        case 'Enter': {
          if (opened && activeIndex >= 0) {
            e.preventDefault();
            onSelectActive();
          } else if (!opened) {
            e.preventDefault();
            onOpen();
          }
          break;
        }
        case 'Escape': {
          if (opened) {
            e.preventDefault();
            onClose();
          }
          break;
        }
        case 'Tab': {
          if (opened) {
            onClose();
          }
          break;
        }
        default:
          break;
      }
    },
    [opened, onOpen, onClose, activeIndex, setActiveIndex, optionsCount, onSelectActive],
  );

  return { handleKeyDown };
}
