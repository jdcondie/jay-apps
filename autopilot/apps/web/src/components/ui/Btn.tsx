import styles from './Btn.module.css';

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'warn';
  size?: 'sm' | 'md';
  loading?: boolean;
}

export function Btn({ variant = 'primary', size = 'md', loading, children, className, ...rest }: BtnProps) {
  return (
    <button
      className={[
        styles.btn,
        styles[variant],
        styles[size],
        loading ? styles.loading : '',
        className || '',
      ].join(' ')}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading ? <span className={styles.spinner} /> : null}
      {children}
    </button>
  );
}
