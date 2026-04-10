import { Mono } from '../ui/Mono';
import { Tag } from '../ui/Tag';
import { ScoreBar } from '../ui/ScoreBar';
import styles from './QualifyStage.module.css';

export function QualifyStage() {
  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.spinner} />
        <Mono size="xs" className={styles.label}>Qualifying task...</Mono>
        <div className={styles.steps}>
          {['Analyzing automation potential', 'Checking volume & value', 'Building execution map'].map((s, i) => (
            <div key={i} className={[styles.step, i === 0 ? styles.active : ''].join(' ')}>
              <span className={styles.dot} />
              <Mono dim size="xs">{s}</Mono>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
