import styles from './Header.module.css';
import { Tag } from '../ui/Tag';
import { Btn } from '../ui/Btn';
import type { PipelineStage, Skill } from '@autopilot/shared';

export type TabId = 'single' | 'intake' | 'scanner' | 'library' | 'prompts' | 'skills' | 'phone';

interface HeaderProps {
  activeTab:    TabId;
  onTabChange:  (t: TabId) => void;
  stage:        PipelineStage;
  pinnedSkills: Skill[];
  injectedPrompt: { name: string } | null;
  onExport?: () => void;
  onReset?:  () => void;
}

const TABS: { id: TabId; label: string }[] = [
  { id: 'single',  label: 'Single Task' },
  { id: 'intake',  label: 'Client Intake' },
  { id: 'scanner', label: 'Task Scanner' },
  { id: 'library', label: 'Library' },
  { id: 'prompts', label: 'Prompt Library' },
  { id: 'skills',  label: 'Skills' },
  { id: 'phone',   label: 'Phone Trigger' },
];

const STAGE_STEPS: PipelineStage[] = ['input', 'qualifying', 'map-confirm', 'blueprinting', 'deploy'];

export function Header({
  activeTab,
  onTabChange,
  stage,
  pinnedSkills,
  injectedPrompt,
  onExport,
  onReset,
}: HeaderProps) {
  const inPipeline = stage !== 'input' && activeTab === 'single';
  const stageIdx   = STAGE_STEPS.indexOf(stage);

  return (
    <header className={styles.header}>
      <div className={styles.top}>
        <div className={styles.logo}>
          <span className={styles.logoMark}>AP</span>
          <span className={styles.logoText}>AutoPilot</span>
        </div>

        <div className={styles.badges}>
          {pinnedSkills.length > 0 && (
            <Tag color="purple">{pinnedSkills.length} skill{pinnedSkills.length > 1 ? 's' : ''}</Tag>
          )}
          {injectedPrompt && (
            <Tag color="blue">prompt: {injectedPrompt.name}</Tag>
          )}
        </div>

        <div className={styles.actions}>
          {stage === 'deploy' && activeTab === 'single' && onExport && (
            <Btn size="sm" variant="ghost" onClick={onExport}>Export</Btn>
          )}
          {inPipeline && onReset && (
            <Btn size="sm" variant="ghost" onClick={onReset}>Reset</Btn>
          )}
        </div>
      </div>

      {inPipeline && (
        <div className={styles.pipeline}>
          {STAGE_STEPS.map((s, i) => (
            <div
              key={s}
              className={[
                styles.step,
                i < stageIdx  ? styles.done    : '',
                i === stageIdx ? styles.active : '',
              ].join(' ')}
            >
              <span className={styles.stepDot} />
              <span className={styles.stepLabel}>{s.replace('-', ' ')}</span>
              {i < STAGE_STEPS.length - 1 && <span className={styles.stepLine} />}
            </div>
          ))}
        </div>
      )}

      <nav className={styles.nav}>
        {TABS.map(t => (
          <button
            key={t.id}
            className={[styles.tab, activeTab === t.id ? styles.tabActive : ''].join(' ')}
            onClick={() => onTabChange(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>
    </header>
  );
}
