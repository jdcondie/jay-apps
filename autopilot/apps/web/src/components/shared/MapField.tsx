import { useState } from 'react';
import { Mono } from '../ui/Mono';
import styles from './MapField.module.css';

interface MapFieldProps {
  label:    string;
  value:    string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
}

export function MapField({ label, value, onChange, multiline, placeholder }: MapFieldProps) {
  const [editing, setEditing] = useState(false);

  return (
    <div className={styles.field}>
      <Mono dim size="xs" className={styles.label}>{label}</Mono>
      {editing ? (
        multiline ? (
          <textarea
            className={styles.textarea}
            value={value}
            onChange={e => onChange(e.target.value)}
            onBlur={() => setEditing(false)}
            autoFocus
            rows={3}
          />
        ) : (
          <input
            className={styles.input}
            value={value}
            onChange={e => onChange(e.target.value)}
            onBlur={() => setEditing(false)}
            autoFocus
          />
        )
      ) : (
        <div className={styles.display} onClick={() => setEditing(true)}>
          <Mono size="xs" className={styles.text}>
            {value || <span className={styles.placeholder}>{placeholder || 'Click to edit...'}</span>}
          </Mono>
          <Mono dim size="xs" className={styles.edit}>edit</Mono>
        </div>
      )}
    </div>
  );
}
