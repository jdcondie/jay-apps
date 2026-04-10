import styles from './Mono.module.css';

interface MonoProps {
  children: React.ReactNode;
  dim?: boolean;
  accent?: boolean;
  warn?: boolean;
  red?: boolean;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export function Mono({ children, dim, accent, warn, red, size = 'sm', className }: MonoProps) {
  const cls = [
    styles.mono,
    styles[size],
    dim    ? styles.dim    : '',
    accent ? styles.accent : '',
    warn   ? styles.warn   : '',
    red    ? styles.red    : '',
    className || '',
  ].join(' ');

  return <span className={cls}>{children}</span>;
}
