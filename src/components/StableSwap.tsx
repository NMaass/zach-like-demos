import type { ElementType, ReactNode } from 'react';

export interface StableSwapState<K extends string> { key: K; content: ReactNode }

export function StableSwap<K extends string>({
  active,
  states,
  axis = 'both',
  as,
  className,
}: {
  active: K;
  states: readonly StableSwapState<K>[];
  axis?: 'both' | 'height';
  as?: ElementType;
  className?: string;
}) {
  if (!states.some((state) => state.key === active)) throw new Error(`Undeclared StableSwap state: ${active}`);
  const Root = as ?? (axis === 'height' ? 'div' : 'span');
  const Cell = axis === 'height' ? 'div' : 'span';
  return (
    <Root className={className} data-stable-swap data-axis={axis}>
      {states.map((state) => {
        const isActive = state.key === active;
        return (
          <Cell key={state.key} data-stable-swap-state data-active={isActive ? '' : undefined} aria-hidden={isActive ? undefined : true}>
            {state.content}
          </Cell>
        );
      })}
    </Root>
  );
}
