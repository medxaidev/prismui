/**
 * `@prismui/core/feedbacks` aggregator.
 *
 * Ships concrete `FeedbackFactory` implementations that plug into the
 * `useFeedback` + `FeedbackController` infrastructure (see
 * `./core/feedback/`).
 *
 * The contracts themselves live in `./core/feedback/` — this directory
 * is the opt-in implementation layer (Phase 2 ships only ripple; Phase 4+
 * adds scale / glow / haptic / analytics factories here).
 */

export * from './ripple';
export * from './glow';
