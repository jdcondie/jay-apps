import { useState } from 'react';
import { usePrompts } from '../../hooks/usePrompts';
import { Btn } from '../ui/Btn';
import { Mono } from '../ui/Mono';
import { Tag } from '../ui/Tag';
import { CodeBlock } from '../ui/CodeBlock';
import styles from './PromptsTab.module.css';

export function PromptsTab() {
  const { prompts, add, update, remove } = usePrompts();
  const [showAdd,  setShowAdd]  = useState(false);
  const [name,     setName]     = useState('');
  const [desc,     setDesc]     = useState('');
  const [text,     setText]     = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving,   setSaving]   = useState(false);

  const submit = async () => {
    if (!name.trim() || !text.trim()) return;
    setSaving(true);
    await add({ name, description: desc, text });
    setName(''); setDesc(''); setText('');
    setShowAdd(false);
    setSaving(false);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Prompt Library</h2>
          <Mono dim size="xs">{prompts.length} saved prompt{prompts.length !== 1 ? 's' : ''}</Mono>
        </div>
        <Btn size="sm" onClick={() => setShowAdd(v => !v)}>
          {showAdd ? 'Cancel' : '+ Add prompt'}
        </Btn>
      </div>

      {showAdd && (
        <div className={styles.addForm}>
          <input className={styles.input} placeholder="Prompt name" value={name} onChange={e => setName(e.target.value)} />
          <input className={styles.input} placeholder="Description (optional)" value={desc} onChange={e => setDesc(e.target.value)} />
          <textarea
            className={styles.textarea}
            placeholder="Paste your prompt text here..."
            value={text}
            onChange={e => setText(e.target.value)}
            rows={6}
          />
          <Btn onClick={submit} loading={saving} disabled={!name.trim() || !text.trim()}>Save Prompt</Btn>
        </div>
      )}

      <div className={styles.list}>
        {prompts.length === 0 && (
          <div className={styles.empty}>
            <Mono dim size="xs">No prompts saved yet.</Mono>
          </div>
        )}
        {prompts.map(p => (
          <div key={p.id} className={styles.card}>
            <div className={styles.cardTop} onClick={() => setExpanded(v => v === p.id ? null : p.id)}>
              <div className={styles.cardLeft}>
                <Mono size="xs">{p.name}</Mono>
                {p.description && <Mono dim size="xs">{p.description}</Mono>}
              </div>
              <div className={styles.cardRight}>
                {p.uses > 0 && <Tag color="dim">{p.uses} use{p.uses !== 1 ? 's' : ''}</Tag>}
                <Mono dim size="xs">{expanded === p.id ? '▲' : '▼'}</Mono>
              </div>
            </div>
            {expanded === p.id && (
              <div className={styles.cardBody}>
                <CodeBlock code={p.text} language="text" maxHeight={240} />
                <div className={styles.cardActions}>
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
