/**
 * Stage-10 · L4 Feedback · public barrel
 *
 * See `@/devdocs/system/feedback-contract.md` v0.2 for the full contract.
 */

export { useFeedback } from './useFeedback';
export { createFeedbackController } from './FeedbackController';
export type { CreateFeedbackControllerResult } from './FeedbackController';
export type {
  // Source enumeration + discriminated union
  InteractionEventSource,
  InteractionEvent,
  PressInteractionEvent,

  // Phase 6+ placeholder event shapes
  HoverSourceEvent,
  FocusSourceEvent,
  ProgrammaticSourceEvent,

  // Source-specific handler tuples
  PressHandlers,
  HoverHandlers,
  FocusHandlers,
  Unsubscribe,

  // Managed Ephemeral Instance contracts
  FeedbackInstance,
  FeedbackFactory,
  FeedbackCreateParams,

  // Controller surface
  FeedbackController,
} from './types';
