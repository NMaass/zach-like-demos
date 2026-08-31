import type { ReactNode } from 'react';

export interface StableSwapState<K extends string> {
  key: K;
  content: ReactNode;
}

export function StableSwap<K extends string>({
  active,
  states,
  className,
}: {
  active: K;
  states: readonly StableSwapState<K>[];
  className?: string;
}) {
  return (
    <span className={className} data-stable-swap>
      {states.map((state) => (
        <span
          key={state.key}
          data-stable-swap-state
          data-active={state.key === active ? '' : undefined}
          aria-hidden={state.key === active ? undefined : true}
        >
          {state.content}
        </span>
      ))}
    </span>
  );
}
