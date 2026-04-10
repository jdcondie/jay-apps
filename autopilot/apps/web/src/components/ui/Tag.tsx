import styles from './Tag.module.css';

interface TagProps {
  children: React.ReactNode;
  color?: 'accent' | 'warn' | 'blue' | 'purple' | 'red' | 'orange' | 'teal' | 'dim';
  className?: string;
}

export function Tag({ children, color = 'dim', className }: TagProps) {
  return (
    <span className={[styles.tag, styles[color], className || ''].join(' ')}>
      {children}
    </span>
  );
}
