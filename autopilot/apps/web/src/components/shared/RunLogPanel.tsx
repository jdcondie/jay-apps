import { useState } from 'react';
import { useRunLogs } from '../../hooks/useRunLogs';
import { Btn } from '../ui/Btn';
import { Tag } from '../ui/Tag';
import { Mono } from '../ui/Mono';
import styles from './RunLogPanel.module.css';

interface RunLogPanelProps {
  pipelineId: string;
}

const STATUS_COLOR = {
  success: 'accent',
  partial: 'warn',
  failed:  'red',
  running: 'blue',
} as const;

export function RunLogPanel({ pipelineId }: RunLogPanelProps) {
  const { logs, loading, load, add, remove } = useRunLogs(pipelineId);
  const [open,   setOpen]   = useState(false);
  const [notes,  setNotes]  = useState('');
  const [status, setStatus] = useState<'success' | 'partial' | 'failed'>('success');
  const [adding, setAdding] = useState(false);

  const toggle = () => {
    setOpen(v => !v);
    if (!open) load(pipelineId);
  };

  const submit = async () => {
    if (!notes.trim()) return;
    setAdding(true);
    await add({
      pipeline_id: pipelineId,
      status,
      notes: notes.trim(),
    });
    setNotes('');
    setAdding(false);
  };

  return (
    <div className={styles.panel}>
      <button className={styles.toggle} onClick={toggle}>
        <Mono dim size="xs">Run Log</Mono>
        <Mono accent size="xs">{open ? '▲' : '▼'}</Mono>
      </button>

      {open && (
        <div className={styles.body}>
          <div className={styles.addRow}>
            <select
              className={styles.select}
              value={status}
              onChange={e => setStatus(e.target.value as any)}
            >
              <option value="success">Success</option>
              <option value="partial">Partial</option>
              <option value="failed">Failed</option>
            </select>
            <input
              className={styles.input}
              placeholder="Add run note..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
            />
            <Btn size="sm" onClick={submit} loading={adding}>Log</Btn>
          </div>

          {loading && <Mono dim size="xs" className={styles.loading}>Loading...</Mono>}

          <div className={styles.list}>
            {logs.map(log => (
              <div key={log.id} className={styles.entry}>
                <Tag color={STATUS_COLOR[log.status]}>{log.status}</Tag>
                <Mono dim size="xs" className={styles.date}>
                  {new Date(log.logged_at).toLocaleDateString()}
                </Mono>
                {log.notes && <Mono size="xs" className={styles.note}>{log.notes}</Mono>}
                <button className={styles.del} onClick={() => remove(log.id)}>×</button>
              </div>
            ))}
            {!loading && logs.length === 0 && (
              <Mono dim size="xs" className={styles.empty}>No runs logged yet.</Mono>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
