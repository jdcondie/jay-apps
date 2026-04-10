import styles from './ScoreBar.module.css';

interface ScoreBarProps {
  score: number;
  label?: string;
  showNumber?: boolean;
}

function scoreColor(s: number) {
  if (s >= 75) return 'var(--accent)';
  if (s >= 50) return 'var(--warn)';
  return 'var(--red)';
}

export function ScoreBar({ score, label, showNumber = true }: ScoreBarProps) {
  const clamped = Math.min(100, Math.max(0, score));
  const color   = scoreColor(clamped);

  return (
    <div className={styles.wrap}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{ width: `${clamped}%`, background: color }}
        />
      </div>
      {showNumber && (
        <span className={styles.num} style={{ color }}>
          {clamped}
        </span>
      )}
    </div>
  );
}
