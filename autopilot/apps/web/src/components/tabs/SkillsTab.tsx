import { useState } from 'react';
import { useSkills } from '../../hooks/useSkills';
import { Btn } from '../ui/Btn';
import { Mono } from '../ui/Mono';
import { Tag } from '../ui/Tag';
import styles from './SkillsTab.module.css';

const PRESETS = ['CRO Auditor', 'Email Copywriter', 'Ad Script Writer', 'Data Analyst', 'Code Reviewer'];

export function SkillsTab() {
  const { skills, add, update, remove } = useSkills();
  const [showAdd,  setShowAdd]  = useState(false);
  const [name,     setName]     = useState('');
  const [trigger,  setTrigger]  = useState('');
  const [desc,     setDesc]     = useState('');
  const [text,     setText]     = useState('');
  const [editId,   setEditId]   = useState<string | null>(null);
  const [saving,   setSaving]   = useState(false);

  const clearForm = () => { setName(''); setTrigger(''); setDesc(''); setText(''); setEditId(null); };

  const submit = async () => {
    if (!name.trim() || !text.trim()) return;
    setSaving(true);
    if (editId) {
      await update(editId, { name, trigger_phrase: trigger, description: desc, text });
    } else {
      await add({ name, trigger_phrase: trigger, description: desc, text });
    }
    clearForm();
    setShowAdd(false);
    setSaving(false);
  };

  const startEdit = (s: typeof skills[0]) => {
    setEditId(s.id);
    setName(s.name);
    setTrigger(s.trigger_phrase || '');
    setDesc(s.description || '');
    setText(s.text);
    setShowAdd(true);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Skills</h2>
          <Mono dim size="xs">Skills get injected into blueprint system prompts when pinned to a pipeline.</Mono>
        </div>
        <Btn size="sm" onClick={() => { setShowAdd(v => !v); clearForm(); }}>
          {showAdd ? 'Cancel' : '+ Add skill'}
        </Btn>
      </div>

      {/* How it works */}
      <div className={styles.howItWorks}>
        <div className={styles.step}>
          <Mono accent size="xs">1</Mono>
          <Mono dim size="xs">Add a skill with a trigger phrase</Mono>
        </div>
        <span className={styles.arrow}>→</span>
        <div className={styles.step}>
          <Mono accent size="xs">2</Mono>
          <Mono dim size="xs">AutoPilot auto-detects relevance at map-confirm</Mono>
        </div>
        <span className={styles.arrow}>→</span>
        <div className={styles.step}>
          <Mono accent size="xs">3</Mono>
          <Mono dim size="xs">Pin to pipeline → injected into system prompt</Mono>
        </div>
      </div>

      {showAdd && (
        <div className={styles.addForm}>
          <div className={styles.presets}>
            {PRESETS.map(p => (
              <button key={p} className={styles.preset} onClick={() => setName(p)}>
                <Mono dim size="xs">{p}</Mono>
              </button>
            ))}
          </div>
          <input className={styles.input} placeholder="Skill name *" value={name} onChange={e => setName(e.target.value)} />
          <input className={styles.input} placeholder="Trigger phrase (e.g. 'email copy', 'ad script')" value={trigger} onChange={e => setTrigger(e.target.value)} />
          <input className={styles.input} placeholder="Short description" value={desc} onChange={e => setDesc(e.target.value)} />
          <textarea
            className={styles.textarea}
            placeholder="Full skill text — methodology, rules, and approach..."
            value={text}
            onChange={e => setText(e.target.value)}
            rows={6}
          />
          <Btn onClick={submit} loading={saving} disabled={!name.trim() || !text.trim()}>
            {editId ? 'Update Skill' : 'Save Skill'}
          </Btn>
        </div>
      )}

      <div className={styles.list}>
        {skills.length === 0 && (
          <div className={styles.empty}><Mono dim size="xs">No skills yet. Add your first one.</Mono></div>
        )}
        {skills.map(s => (
          <div key={s.id} className={styles.card}>
            <div className={styles.cardTop}>
              <div className={styles.cardLeft}>
                <Mono size="xs">{s.name}</Mono>
                {s.trigger_phrase && <Tag color="teal">trigger: {s.trigger_phrase}</Tag>}
                {s.description && <Mono dim size="xs">{s.description}</Mono>}
              </div>
              <div className={styles.cardActions}>
                <Btn size="sm" variant="ghost" onClick={() => startEdit(s)}>Edit</Btn>
                <Btn size="sm" variant="danger" onClick={() => remove(s.id)}>Delete</Btn>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
