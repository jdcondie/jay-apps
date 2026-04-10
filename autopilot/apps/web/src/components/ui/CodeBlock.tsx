import { useState } from 'react';
import styles from './CodeBlock.module.css';

interface CodeBlockProps {
  code: string;
  language?: string;
  maxHeight?: number;
}

export function CodeBlock({ code, language = 'text', maxHeight = 320 }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.lang}>{language}</span>
        <button className={styles.copyBtn} onClick={copy}>
          {copied ? '✓ copied' : 'copy'}
        </button>
      </div>
      <pre className={styles.pre} style={{ maxHeight }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}
