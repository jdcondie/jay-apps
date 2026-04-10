import { useState } from 'react';
import { api } from '../../lib/api';
import { Btn } from '../ui/Btn';
import { Mono } from '../ui/Mono';
import { Tag } from '../ui/Tag';
import { ScoreBar } from '../ui/ScoreBar';
import styles from './ScannerTab.module.css';
import type { ScanResult } from '@autopilot/shared';

export function ScannerTab() {
  const [input,   setInput]   = useState('');
  const [result,  setResult]  = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const run = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.scan(input);
      setResult(res);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h2 className={styles.title}>Task Scanner</h2>
        <Mono dim size="xs">Paste a list of tasks. Get a ranked automation scorecard.</Mono>
      </div>

      <textarea
        className={styles.textarea}
        placeholder={'Paste tasks, one per line:\nRespond to support emails\nGenerate weekly reports\nUpdate CRM after calls\n...'}
        value={input}
        onChange={e => setInput(e.target.value)}
        rows={8}
      />

      <div className={styles.actions}>
        {error && <Mono red size="xs">{error}</Mono>}
        <Btn onClick={run} loading={loading} disabled={!input.trim()}>Scan Tasks</Btn>
      </div>

      {result && (
        <div className={styles.results}>
          <div className={styles.topPick}>
            <Mono dim size="xs" className={styles.topLabel}>Top pick</Mono>
            <Mono accent size="xs">{result.top_pick}</Mono>
            <Mono dim size="xs">{result.top_pick_reason}</Mono>
          </div>

          <div className={styles.table}>
            <div className={styles.tableHead}>
              <Mono dim size="xs">Task</Mono>
              <Mono dim size="xs">Auto</Mono>
              <Mono dim size="xs">Value</Mono>
              <Mono dim size="xs">Effort</Mono>
              <Mono dim size="xs">Priority</Mono>
              <Mono dim size="xs">Verdict</Mono>
            </div>

            {result.tasks.map((t, i) => (
              <div key={i} className={styles.tableRow}>
                <div className={styles.taskName}>
                  <Mono size="xs">{t.task}</Mono>
                  {t.quick_win && <Tag color="accent">quick win</Tag>}
                  <Mono dim size="xs" className={styles.reason}>{t.reason}</Mono>
                </div>
                <ScoreBar score={t.automation_score} showNumber />
                <ScoreBar score={t.value_score}      showNumber />
                <ScoreBar score={t.effort_score}     showNumber />
                <ScoreBar score={t.priority_score}   showNumber />
                <Tag color={t.verdict === 'BUILD' ? 'accent' : t.verdict === 'SKIP' ? 'red' : 'warn'}>
                  {t.verdict}
                </Tag>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
