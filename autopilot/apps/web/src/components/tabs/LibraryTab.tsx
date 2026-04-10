import { useEffect, useState } from 'react';
import { useLibrary } from '../../hooks/useLibrary';
import { Btn } from '../ui/Btn';
import { Mono } from '../ui/Mono';
import { Tag } from '../ui/Tag';
import { ScoreBar } from '../ui/ScoreBar';
import { RunLogPanel } from '../shared/RunLogPanel';
import { buildExport, downloadJSON } from '../../lib/export';
import styles from './LibraryTab.module.css';
import type { Pipeline } from '@autopilot/shared';

export function LibraryTab() {
  const { pipelines, loading, load, update, remove } = useLibrary();
  const [expandedId, setExpandedId]  = useState<string | null>(null);
  const [editNotes,  setEditNotes]   = useState<Record<string, string>>({});
  const [editClient, setEditClient]  = useState<Record<string, string>>({});

  useEffect(() => { load(); }, [load]);

  const toggle = (id: string) => setExpandedId(v => v === id ? null : id);

  const saveNote = async (id: string) => {
    await update(id, { notes: editNotes[id] });
  };

  const saveClient = async (id: string) => {
    await update(id, { client_tag: editClient[id] });
  };

  const exportPipeline = (p: Pipeline) => {
    const data = buildExport(p);
    downloadJSON(data, `${p.task_title?.replace(/\s+/g, '-').toLowerCase() || 'pipeline'}.json`);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <Mono dim size="xs">Loading library...</Mono>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <h2 className={styles.title}>Pipeline Library</h2>
        <Mono dim size="xs">{pipelines.length} saved pipeline{pipelines.length !== 1 ? 's' : ''}</Mono>
      </div>

      {pipelines.length === 0 && (
        <div className={styles.empty}>
          <Mono dim size="xs">No pipelines saved yet. Run a task to get started.</Mono>
        </div>
      )}

      <div className={styles.list}>
        {pipelines.map(p => (
          <div key={p.id} className={styles.card}>
            <div className={styles.cardTop} onClick={() => toggle(p.id)}>
              <div className={styles.cardLeft}>
                <div className={styles.cardTitle}>
                  <Mono size="xs">{p.task_title || p.task.slice(0, 60)}</Mono>
                  {p.client_tag && <Tag color="blue">{p.client_tag}</Tag>}
                  {p.software_stack && <Tag color="dim">{p.software_stack}</Tag>}
                </div>
                {p.task_summary && <Mono dim size="xs">{p.task_summary}</Mono>}
              </div>
              <div className={styles.cardRight}>
                {p.overall_score !== undefined && (
                  <ScoreBar score={p.overall_score} showNumber />
                )}
                <Mono dim size="xs">{new Date(p.created_at).toLocaleDateString()}</Mono>
              </div>
            </div>

            {expandedId === p.id && (
              <div className={styles.cardBody}>
                {/* Client tag */}
                <div className={styles.editRow}>
                  <Mono dim size="xs" className={styles.editLabel}>Client tag</Mono>
                  <input
                    className={styles.editInput}
                    value={editClient[p.id] ?? (p.client_tag || '')}
                    onChange={e => setEditClient(c => ({ ...c, [p.id]: e.target.value }))}
                    placeholder="Tag this pipeline to a client..."
                  />
                  <Btn size="sm" variant="ghost" onClick={() => saveClient(p.id)}>Save</Btn>
                </div>

                {/* Notes */}
                <div className={styles.editRow}>
                  <Mono dim size="xs" className={styles.editLabel}>Notes</Mono>
                  <textarea
                    className={styles.editTextarea}
                    value={editNotes[p.id] ?? (p.notes || '')}
                    onChange={e => setEditNotes(n => ({ ...n, [p.id]: e.target.value }))}
                    placeholder="Add notes..."
                    rows={2}
                  />
                  <Btn size="sm" variant="ghost" onClick={() => saveNote(p.id)}>Save</Btn>
                </div>

                {/* Run log */}
                <RunLogPanel pipelineId={p.id} />

                {/* Actions */}
                <div className={styles.cardActions}>
                  <Btn size="sm" variant="ghost" onClick={() => exportPipeline(p)}>Export</Btn>
                  <Btn size="sm" variant="danger" onClick={() => remove(p.id)}>Delete</Btn>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
