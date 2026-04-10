import { useState } from 'react';
import { api } from '../../lib/api';
import { Btn } from '../ui/Btn';
import { Mono } from '../ui/Mono';
import { Tag } from '../ui/Tag';
import { ScoreBar } from '../ui/ScoreBar';
import styles from './IntakeTab.module.css';
import type { IntakeResult } from '@autopilot/shared';

export function IntakeTab() {
  const [bizType,    setBizType]    = useState('');
  const [tools,      setTools]      = useState('');
  const [painPoints, setPainPoints] = useState('');
  const [freq,       setFreq]       = useState('');
  const [result,     setResult]     = useState<IntakeResult | null>(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.intake(bizType, tools, painPoints, freq);
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
        <h2 className={styles.title}>Client Intake</h2>
        <Mono dim size="xs">Map a client's automation opportunities from a discovery call.</Mono>
      </div>

      <div className={styles.form}>
        <div className={styles.field}>
          <Mono dim size="xs" className={styles.label}>Business type</Mono>
          <input
            className={styles.input}
            placeholder="e.g. ecommerce brand, SaaS startup, agency..."
            value={bizType}
            onChange={e => setBizType(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <Mono dim size="xs" className={styles.label}>Current tools</Mono>
          <input
            className={styles.input}
            placeholder="e.g. Shopify, Klaviyo, HubSpot, Slack..."
            value={tools}
            onChange={e => setTools(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <Mono dim size="xs" className={styles.label}>Pain points</Mono>
          <textarea
            className={styles.textarea}
            placeholder="What are they spending time on that shouldn't require a human?"
            value={painPoints}
            onChange={e => setPainPoints(e.target.value)}
            rows={3}
          />
        </div>

        <div className={styles.field}>
          <Mono dim size="xs" className={styles.label}>Task frequency</Mono>
          <input
            className={styles.input}
            placeholder="e.g. daily, 50x/week, after every order..."
            value={freq}
            onChange={e => setFreq(e.target.value)}
          />
        </div>

        <div className={styles.actions}>
          {error && <Mono red size="xs">{error}</Mono>}
          <Btn onClick={run} loading={loading}>Generate Task Map</Btn>
        </div>
      </div>

      {result && (
        <div className={styles.results}>
          <div className={styles.summary}>
            <Mono dim size="xs" className={styles.summaryLabel}>Client profile</Mono>
            <Mono size="xs">{result.client_summary}</Mono>
            <Mono dim size="xs">Recommended stack: <span style={{ color: 'var(--blue)' }}>{result.recommended_stack}</span></Mono>
          </div>

          <div className={styles.taskList}>
            {result.tasks.map((t, i) => (
              <div key={i} className={[styles.taskCard, t.task === result.top_task ? styles.topTask : ''].join(' ')}>
                <div className={styles.taskTop}>
                  <Mono size="xs">{t.task}</Mono>
                  <div className={styles.taskTags}>
                    {t.quick_win && <Tag color="accent">quick win</Tag>}
                    {t.task === result.top_task && <Tag color="purple">top pick</Tag>}
                  </div>
                </div>
                <Mono dim size="xs">{t.rationale}</Mono>
                <div className={styles.scores}>
                  <ScoreBar score={t.automation_score} label="Auto" />
                  <ScoreBar score={t.value_score}      label="Value" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
