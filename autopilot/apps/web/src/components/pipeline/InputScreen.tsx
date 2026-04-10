import { useState } from 'react';
import { Btn } from '../ui/Btn';
import { Mono } from '../ui/Mono';
import styles from './InputScreen.module.css';

interface InputScreenProps {
  task:         string;
  stack:        string;
  onTaskChange: (v: string) => void;
  onStackChange:(v: string) => void;
  onSubmit:     () => void;
  loading:      boolean;
  error:        string | null;
}

export function InputScreen({
  task,
  stack,
  onTaskChange,
  onStackChange,
  onSubmit,
  loading,
  error,
}: InputScreenProps) {
  const [showStack, setShowStack] = useState(!!stack);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) onSubmit();
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2 className={styles.title}>What should be automated?</h2>
          <Mono dim size="xs">Describe the task in plain language.</Mono>
        </div>

        <textarea
          className={styles.textarea}
          placeholder="e.g. After each client call, pull notes from Notion and draft a follow-up email with action items..."
          value={task}
          onChange={e => onTaskChange(e.target.value)}
          onKeyDown={handleKey}
          rows={5}
          autoFocus
        />

        {showStack ? (
          <div className={styles.stackRow}>
            <Mono dim size="xs" className={styles.stackLabel}>Client stack</Mono>
            <input
              className={styles.stackInput}
              placeholder="e.g. Notion, Gmail, Slack, Shopify..."
              value={stack}
              onChange={e => onStackChange(e.target.value)}
            />
          </div>
        ) : (
          <button className={styles.addStack} onClick={() => setShowStack(true)}>
            <Mono dim size="xs">+ Add client software stack (optional)</Mono>
          </button>
        )}

        {error && <Mono red size="xs" className={styles.error}>{error}</Mono>}

        <div className={styles.footer}>
          <Mono dim size="xs">⌘↵ to run</Mono>
          <Btn onClick={onSubmit} loading={loading} disabled={!task.trim()}>
            Qualify + Map
          </Btn>
        </div>
      </div>
    </div>
  );
}
