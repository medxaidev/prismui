/**
 * Stage-10 · L4 Feedback · ripple POC · public barrel
 *
 * NOTE on CSS:
 *   Consumers MUST import `@prismui/core/feedbacks/ripple/ripple-feedback.css`
 *   (or let their bundler do it via the package's side-effect-safe export) to
 *   render visible ripples. The factory itself produces a plain `<span>` with
 *   the `.prismui-ripple` class · no styling happens without the stylesheet.
 */

export { rippleFeedback } from './ripple-feedback';
