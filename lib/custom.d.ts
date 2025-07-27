import 'react';

declare module 'react' {
  interface CSSProperties {
    // Allow any property that starts with "--"
    [key: `--${string}`]: string | number;
  }
}