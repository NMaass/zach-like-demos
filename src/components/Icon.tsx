import type { ReactElement, SVGProps } from 'react';

export type IconName =
  | 'arrow-left'
  | 'arrow-right'
  | 'book'
  | 'check'
  | 'chevron-down'
  | 'chevron-up'
  | 'circle-help'
  | 'download'
  | 'erase'
  | 'eye'
  | 'fold'
  | 'home'
  | 'layers'
  | 'link'
  | 'lock'
  | 'menu'
  | 'pause'
  | 'play'
  | 'plus'
  | 'redo'
  | 'reset'
  | 'rotate'
  | 'scissors'
  | 'settings'
  | 'sparkles'
  | 'speaker'
  | 'speaker-off'
  | 'star'
  | 'train'
  | 'undo'
  | 'weight'
  | 'x';

const paths: Record<IconName, ReactElement> = {
  'arrow-left': <path d="m15 18-6-6 6-6M9 12h10" />,
  'arrow-right': <path d="m9 18 6-6-6-6m6 6H5" />,
  book: <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5zm16 0A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5z" />,
  check: <path d="m5 12 4 4L19 6" />,
  'chevron-down': <path d="m6 9 6 6 6-6" />,
  'chevron-up': <path d="m6 15 6-6 6 6" />,
  'circle-help': <path d="M9.1 9a3 3 0 1 1 5.8 1c0 2-2.9 2-2.9 4m0 4h.01M22 12A10 10 0 1 1 2 12a10 10 0 0 1 20 0Z" />,
  download: <path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14" />,
  erase: <path d="m7 21-4-4 10.5-10.5a2.1 2.1 0 0 1 3 0l1 1a2.1 2.1 0 0 1 0 3L7 21Zm-1.5-7.5 5 5M7 21h12" />,
  eye: <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Zm10 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />,
  fold: <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM20 13l-7 7v-7z" />,
  home: <path d="m3 11 9-8 9 8v10h-6v-6H9v6H3z" />,
  layers: <path d="m12 2 9 5-9 5-9-5zm9 10-9 5-9-5m18 5-9 5-9-5" />,
  link: <path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.1 1.1M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.1-1.1" />,
  lock: <path d="M6 10h12v11H6zM8 10V7a4 4 0 0 1 8 0v3" />,
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  pause: <path d="M8 5h3v14H8zm5 0h3v14h-3z" />,
  play: <path d="m8 5 11 7-11 7z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  redo: <path d="m17 7 4 4-4 4M3 17a7 7 0 0 1 7-7h11" />,
  reset: <path d="M4 7v6h6M20 17v-6h-6M6.5 17.5A8 8 0 0 0 20 11M17.5 6.5A8 8 0 0 0 4 13" />,
  rotate: <path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7" />,
  scissors: <path d="m9 8 10-5M9 16l10 5M6 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm0 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2.5-11.5L21 15" />,
  settings: <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm8-3.5 2-1-2-3-2.2.4a8 8 0 0 0-1.2-.7L16 4.5h-4l-.6 2.2a8 8 0 0 0-1.2.7L8 7 6 10l2 2-2 2 2 3 2.2-.4c.4.3.8.5 1.2.7l.6 2.2h4l.6-2.2c.4-.2.8-.4 1.2-.7L20 17l2-3z" />,
  sparkles: <path d="m12 3 1.2 3.8L17 8l-3.8 1.2L12 13l-1.2-3.8L7 8l3.8-1.2zM5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8zM19 13l.8 2.2L22 16l-2.2.8L19 19l-.8-2.2L16 16l2.2-.8z" />,
  speaker: <path d="M4 9v6h4l5 4V5L8 9zm12 0a4 4 0 0 1 0 6m2-9a8 8 0 0 1 0 12" />,
  'speaker-off': <path d="M4 9v6h4l5 4V5L8 9zm12 1 6 6m0-6-6 6" />,
  star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z" />,
  train: <path d="M6 3h12a2 2 0 0 1 2 2v10a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V5a2 2 0 0 1 2-2Zm-2 8h16M8 18l-3 3m11-3 3 3M8 15h.01M16 15h.01" />,
  undo: <path d="m7 7-4 4 4 4m14 2a7 7 0 0 0-7-7H3" />,
  weight: <path d="M9 7a3 3 0 1 1 6 0m-9 3h12l2 11H4z" />,
  x: <path d="m6 6 12 12M18 6 6 18" />,
};

export function Icon({ name, ...props }: { name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
