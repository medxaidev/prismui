'use client';

import { createContext, useContext } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface InputBaseContextValue {
  /** Whether the input has an error. */
  error: boolean;

  /** Whether the input is disabled. */
  disabled: boolean;

  /** The id of the native input element. */
  id: string;

  /** The id of the description element (for aria-describedby). */
  descriptionId: string;

  /** The id of the error element (for aria-errormessage). */
  errorId: string;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export const InputBaseContext = createContext<InputBaseContextValue | null>(null);

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useInputBaseContext(): InputBaseContextValue | null {
  return useContext(InputBaseContext);
}
