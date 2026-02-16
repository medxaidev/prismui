import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  Children,
  cloneElement,
  isValidElement,
} from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TransitionGroupProps {
  /** Children must have a unique `key` prop */
  children: React.ReactNode;

  /**
   * Render wrapper element.
   * @default 'div'
   */
  component?: React.ElementType | null;

  /** Additional className for the wrapper */
  className?: string;

  /** Additional style for the wrapper */
  style?: React.CSSProperties;
}

interface ChildState {
  /** The child element */
  child: React.ReactElement;
  /** Whether this child is exiting (being removed) */
  exiting: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getChildKey(child: React.ReactElement): string {
  return String(child.key ?? '');
}

function getChildMap(children: React.ReactNode): Map<string, React.ReactElement> {
  const map = new Map<string, React.ReactElement>();
  Children.forEach(children, (child) => {
    if (isValidElement(child)) {
      map.set(getChildKey(child), child);
    }
  });
  return map;
}

// ---------------------------------------------------------------------------
// TransitionGroup
// ---------------------------------------------------------------------------

export function TransitionGroup({
  children,
  component: Component = 'div',
  className,
  style,
}: TransitionGroupProps) {
  const [childStates, setChildStates] = useState<Map<string, ChildState>>(() => {
    const map = new Map<string, ChildState>();
    Children.forEach(children, (child) => {
      if (isValidElement(child)) {
        map.set(getChildKey(child), { child, exiting: false });
      }
    });
    return map;
  });

  const prevChildrenRef = useRef<Map<string, React.ReactElement>>(getChildMap(children));

  useEffect(() => {
    const nextChildMap = getChildMap(children);

    setChildStates((prev) => {
      const next = new Map<string, ChildState>();

      // Keep existing children, update with new props
      for (const [key, state] of prev) {
        if (nextChildMap.has(key)) {
          // Child still present — update element, clear exiting
          next.set(key, { child: nextChildMap.get(key)!, exiting: false });
        } else if (!state.exiting) {
          // Child removed — mark as exiting (keep in DOM for exit animation)
          next.set(key, {
            child: cloneElement(state.child, { mounted: false } as any),
            exiting: true,
          });
        } else {
          // Already exiting — keep as is
          next.set(key, state);
        }
      }

      // Add new children that weren't in previous render
      for (const [key, child] of nextChildMap) {
        if (!prev.has(key)) {
          next.set(key, { child, exiting: false });
        }
      }

      return next;
    });

    prevChildrenRef.current = nextChildMap;
  }, [children]);

  const handleExited = useCallback((key: string) => {
    setChildStates((prev) => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const renderedChildren = Array.from(childStates.entries()).map(([key, state]) => {
    const child = state.child;

    if (!isValidElement(child)) return child;

    // Inject onExited callback for exiting children
    if (state.exiting) {
      return cloneElement(child, {
        key,
        onExited: () => {
          // Call original onExited if present
          const originalOnExited = (child.props as any).onExited;
          if (typeof originalOnExited === 'function') {
            originalOnExited();
          }
          handleExited(key);
        },
      } as any);
    }

    return cloneElement(child, { key } as any);
  });

  if (Component === null) {
    return <>{renderedChildren}</>;
  }

  return (
    <Component className={className} style={style}>
      {renderedChildren}
    </Component>
  );
}

TransitionGroup.displayName = '@prismui/core/TransitionGroup';
