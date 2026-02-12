import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import styles from './TouchRipple.module.css';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DURATION = 550;
const DELAY_RIPPLE = 80;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RippleItem {
  key: number;
  rippleX: number;
  rippleY: number;
  rippleSize: number;
  pulsate: boolean;
  exiting: boolean;
}

export interface TouchRippleActions {
  start: (
    event?: React.MouseEvent | React.TouchEvent | { clientX?: number; clientY?: number },
    options?: { pulsate?: boolean; center?: boolean },
    cb?: () => void,
  ) => void;
  stop: (event?: React.SyntheticEvent, cb?: () => void) => void;
  pulsate: () => void;
}

export interface TouchRippleProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** If true, the ripple starts at the center of the component. */
  center?: boolean;
}

// ---------------------------------------------------------------------------
// Ripple — individual ripple circle (internal)
// ---------------------------------------------------------------------------

interface RippleCircleProps {
  rippleX: number;
  rippleY: number;
  rippleSize: number;
  pulsate: boolean;
  exiting: boolean;
  onExited: () => void;
}

function RippleCircle({
  rippleX,
  rippleY,
  rippleSize,
  pulsate,
  exiting,
  onExited,
}: RippleCircleProps) {
  const rippleClassName = [
    styles.ripple,
    styles.rippleVisible,
    pulsate ? styles.ripplePulsate : '',
    exiting ? styles.rippleExiting : '',
  ]
    .filter(Boolean)
    .join(' ');

  const childClassName = [
    styles.child,
    exiting ? styles.childLeaving : '',
    pulsate ? styles.childPulsate : '',
  ]
    .filter(Boolean)
    .join(' ');

  // Remove ripple after exit animation completes
  useEffect(() => {
    if (!exiting) return;
    const timer = setTimeout(onExited, DURATION);
    return () => clearTimeout(timer);
  }, [exiting, onExited]);

  return (
    <span
      className={rippleClassName}
      style={{
        width: rippleSize,
        height: rippleSize,
        top: -(rippleSize / 2) + rippleY,
        left: -(rippleSize / 2) + rippleX,
      }}
    >
      <span className={childClassName} />
    </span>
  );
}

// ---------------------------------------------------------------------------
// TouchRipple — main component
// ---------------------------------------------------------------------------

/**
 * Internal ripple effect component.
 *
 * Renders an absolute overlay that spawns animated ripple circles on
 * mouse/touch interactions. Exposed via `useImperativeHandle` so that
 * parent components can call `start()`, `stop()`, and `pulsate()`.
 *
 * Design inspired by MUI's TouchRipple but implemented with pure CSS
 * animations (no `react-transition-group` dependency).
 */
const TouchRipple = forwardRef<TouchRippleActions, TouchRippleProps>(
  function TouchRipple(props, ref) {
    const { center: centerProp = false, className, ...other } = props;

    const [ripples, setRipples] = useState<RippleItem[]>([]);
    const nextKey = useRef(0);
    const containerRef = useRef<HTMLSpanElement>(null);

    // Used to filter out mouse-emulated events on mobile
    const ignoringMouseDown = useRef(false);
    // Timer for delayed touch ripple
    const startTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const startTimerCommit = useRef<(() => void) | null>(null);

    // Callback to run after ripple state update
    const rippleCallback = useRef<(() => void) | null>(null);

    useEffect(() => {
      if (rippleCallback.current) {
        rippleCallback.current();
        rippleCallback.current = null;
      }
    }, [ripples]);

    // Cleanup timer on unmount
    useEffect(() => {
      return () => {
        if (startTimer.current) clearTimeout(startTimer.current);
      };
    }, []);

    const handleExited = useCallback((key: number) => {
      setRipples((prev) => prev.filter((r) => r.key !== key));
    }, []);

    const startCommit = useCallback(
      (params: {
        pulsate: boolean;
        rippleX: number;
        rippleY: number;
        rippleSize: number;
        cb?: () => void;
      }) => {
        const { pulsate, rippleX, rippleY, rippleSize, cb } = params;
        setRipples((prev) => [
          ...prev,
          {
            key: nextKey.current,
            rippleX,
            rippleY,
            rippleSize,
            pulsate,
            exiting: false,
          },
        ]);
        nextKey.current += 1;
        rippleCallback.current = cb ?? null;
      },
      [],
    );

    const start = useCallback(
      (
        event: any = {},
        options: { pulsate?: boolean; center?: boolean } = {},
        cb?: () => void,
      ) => {
        const {
          pulsate = false,
          center = centerProp || options.pulsate,
        } = options;

        if (event.type === 'mousedown' && ignoringMouseDown.current) {
          ignoringMouseDown.current = false;
          return;
        }

        if (event.type === 'touchstart') {
          ignoringMouseDown.current = true;
        }

        const element = containerRef.current;
        const rect = element
          ? element.getBoundingClientRect()
          : { width: 0, height: 0, left: 0, top: 0 };

        // Calculate ripple position
        let rippleX: number;
        let rippleY: number;
        let rippleSize: number;

        if (
          center ||
          (event.clientX === 0 && event.clientY === 0) ||
          (!event.clientX && !event.touches)
        ) {
          rippleX = Math.round(rect.width / 2);
          rippleY = Math.round(rect.height / 2);
        } else {
          const { clientX, clientY } = event.touches ? event.touches[0] : event;
          rippleX = Math.round(clientX - rect.left);
          rippleY = Math.round(clientY - rect.top);
        }

        // Calculate ripple size
        if (center) {
          rippleSize = Math.sqrt((2 * rect.width ** 2 + rect.height ** 2) / 3);
          // Ensure odd size for smoother animation on mobile Chrome
          if (rippleSize % 2 === 0) rippleSize += 1;
        } else {
          const sizeX =
            Math.max(
              Math.abs((element ? element.clientWidth : 0) - rippleX),
              rippleX,
            ) * 2 + 2;
          const sizeY =
            Math.max(
              Math.abs((element ? element.clientHeight : 0) - rippleY),
              rippleY,
            ) * 2 + 2;
          rippleSize = Math.sqrt(sizeX ** 2 + sizeY ** 2);
        }

        // Touch devices: delay ripple to distinguish tap from scroll
        if (event.touches) {
          if (startTimerCommit.current === null) {
            startTimerCommit.current = () => {
              startCommit({ pulsate, rippleX, rippleY, rippleSize, cb });
            };
            startTimer.current = setTimeout(() => {
              if (startTimerCommit.current) {
                startTimerCommit.current();
                startTimerCommit.current = null;
              }
            }, DELAY_RIPPLE);
          }
        } else {
          startCommit({ pulsate, rippleX, rippleY, rippleSize, cb });
        }
      },
      [centerProp, startCommit],
    );

    const pulsate = useCallback(() => {
      start({}, { pulsate: true });
    }, [start]);

    const stop = useCallback((event?: any, cb?: () => void) => {
      if (startTimer.current) clearTimeout(startTimer.current);

      // Touch interaction may be too quick — still show the ripple
      if (event?.type === 'touchend' && startTimerCommit.current) {
        startTimerCommit.current();
        startTimerCommit.current = null;
        startTimer.current = setTimeout(() => {
          stop(event, cb);
        });
        return;
      }

      startTimerCommit.current = null;

      // Mark the oldest non-exiting ripple as exiting
      setRipples((prev) => {
        const idx = prev.findIndex((r) => !r.exiting);
        if (idx === -1) return prev;
        const next = [...prev];
        next[idx] = { ...next[idx], exiting: true };
        return next;
      });
      rippleCallback.current = cb ?? null;
    }, []);

    useImperativeHandle(ref, () => ({ start, stop, pulsate }), [
      start,
      stop,
      pulsate,
    ]);

    const rootClassName = [styles.rippleRoot, className].filter(Boolean).join(' ');

    return (
      <span className={rootClassName} ref={containerRef} {...other}>
        {ripples.map((ripple) => (
          <RippleCircle
            key={ripple.key}
            rippleX={ripple.rippleX}
            rippleY={ripple.rippleY}
            rippleSize={ripple.rippleSize}
            pulsate={ripple.pulsate}
            exiting={ripple.exiting}
            onExited={() => handleExited(ripple.key)}
          />
        ))}
      </span>
    );
  },
);

TouchRipple.displayName = '@prismui/core/TouchRipple';

export { TouchRipple, DURATION as RIPPLE_DURATION, DELAY_RIPPLE };
