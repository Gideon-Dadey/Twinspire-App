'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Controlled-or-uncontrolled state hook.
 *
 *   const [value, setValue] = useControllableState({
 *     prop: props.value,
 *     defaultProp: props.defaultValue,
 *     onChange: props.onValueChange,
 *   });
 */
export function useControllableState<T>(params: {
  prop?: T | undefined;
  defaultProp?: T | undefined;
  onChange?: (next: T) => void;
}): [T | undefined, (next: T | ((prev: T | undefined) => T)) => void] {
  const { prop, defaultProp, onChange } = params;
  const isControlled = prop !== undefined;
  const [uncontrolled, setUncontrolled] = useState<T | undefined>(defaultProp);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const value = isControlled ? prop : uncontrolled;

  const setValue = useCallback(
    (next: T | ((prev: T | undefined) => T)) => {
      if (isControlled) {
        const resolved = typeof next === 'function' ? (next as (p: T | undefined) => T)(prop) : next;
        if (!Object.is(resolved, prop)) onChangeRef.current?.(resolved);
        return;
      }
      setUncontrolled((prev) => {
        const resolved = typeof next === 'function' ? (next as (p: T | undefined) => T)(prev) : next;
        if (!Object.is(resolved, prev)) onChangeRef.current?.(resolved);
        return resolved;
      });
    },
    [isControlled, prop],
  );

  return [value, setValue];
}
