import { useState } from 'react';
import { Btn } from '../ui/Btn';
import { Mono } from '../ui/Mono';
import { Tag } from '../ui/Tag';
import { ScoreBar } from '../ui/ScoreBar';
import { CodeBlock } from '../ui/CodeBlock';
import { RunLogPanel } from '../shared/RunLogPanel';
import { api } from '../../lib/api';
import styles from './DeployPackage.module.css';
import type { QualifyResult, ExecMap, Blueprint, Skill } from '@autopilot/shared';

interface DeployPackageProps {
  qualify:      QualifyResult;
  execMap:      ExecMap;
  blueprint:    Blueprint;
  stack:        string;
  pipelineId:   string | null;
  task:         string;
  pinnedSkills: Skill[];
  onReset:      () => void;
  onExport:     () => void;
  onSavePrompt: (name: string, text: string) => void;
}

function Section({ title, score, children, defaultOpen = false }: {
  title: string;
  score?: number;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={styles.section}>
      <button className={styles.sectionToggle} onClick={() => setOpen(v => !v)}>
        <div className={styles.sectionLeft}>
          <Mono size="xs">{title}</Mono>
          {score !== undefined && <ScoreBar score={score} showNumber />}
        </div>
        <Mono dim size="xs">{open ? '▲' : '▼'}</Mono>
      </button>
      {open && <div className={styles.sectionBody}>{children}</div>}
    </div>
  );
}

export function DeployPackage({
  qualify,
  execMap,
  blueprint,
  stack,
  pipelineId,
  task,
  pinnedSkills,
  onReset,
  onExport,
  onSavePrompt,
}: DeployPackageProps) {
  const [expandingIdx, setExpandingIdx] = useState<number | null>(null);
  const [expandedCode, setExpandedCode] = useState<Record<number, string>>({});

  const expand = async (i: number) => {
    const script = blueprint.replace.scripts[i];
    setExpandingIdx(i);
    try {
      const res = await api.expand(script.stub, task, script.replaces, stack, execMap);
      setExpandedCode(c => ({ ...c, [i]: res.code }));
    } catch (e) {
      // ignore
    } finally {
      setExpandingIdx(null);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.inner}>
        {/* Score strip */}
        <div className={styles.scoreStrip}>
          <ScoreBar score={blueprint.overall_score} label="Overall" />
          <ScoreBar score={blueprint.architect.score} label="Architect" />
          <ScoreBar score={blueprint.replace.score}   label="Replace" />
          <ScoreBar score={blueprint.optimize.score}  label="Optimize" />
        </div>

        {/* Decisive variable */}
        <div className={styles.decisive}>
          <Mono dim size="xs" className={styles.decisiveLabel}>Decisive variable</Mono>
          <Mono accent size="xs">{blueprint.decisive_variable}</Mono>
        </div>

        {/* Execution Map */}
        <Section title="Execution Map" defaultOpen>
          <div className={styles.mapFields}>
            <div className={styles.mapRow}>
              <Mono dim size="xs">Input</Mono>
              <Mono size="xs">{execMap.input}</Mono>
            </div>
            {execMap.steps.map((step, i) => (
              <div key={i} className={styles.mapStep}>
                <Mono dim size="xs">{step.order}</Mono>
                <div className={styles.mapStepBody}>
                  <Mono size="xs">{step.action}</Mono>
                  <Tag color={step.agent === 'OpenClaw' ? 'accent' : step.agent === 'Claude' ? 'blue' : 'orange'}>
                    {step.agent}
                  </Tag>
                  {step.note && <Mono dim size="xs">{step.note}</Mono>}
                </div>
              </div>
            ))}
            <div className={styles.mapRow}>
              <Mono dim size="xs">Output</Mono>
              <Mono size="xs">{execMap.output}</Mono>
            </div>
            <div className={styles.mapRow}>
              <Mono dim size="xs">Failure</Mono>
              <Mono dim size="xs">{execMap.failure}</Mono>
            </div>
          </div>
        </Section>

        {/* System Architecture */}
        <Section title="System Architecture" score={blueprint.architect.score} defaultOpen>
          <div className={styles.roleCards}>
            <div className={styles.roleCard}>
              <Tag color="accent">OpenClaw</Tag>
              <Mono size="xs">{blueprint.architect.openclaw_role}</Mono>
            </div>
            <div className={styles.roleCard}>
              <Tag color="blue">Claude</Tag>
              <Mono size="xs">{blueprint.architect.claude_role}</Mono>
            </div>
          </div>

          {blueprint.architect.subagents?.length > 0 && (
            <div className={styles.subagents}>
              <Mono dim size="xs" className={styles.subLabel}>Subagents</Mono>
              {blueprint.architect.subagents.map((a, i) => (
                <div key={i} className={styles.subRow}>
                  <Mono accent size="xs">{a.name}</Mono>
                  <Mono dim size="xs">{a.owns}</Mono>
                </div>
              ))}
            </div>
          )}

          {pinnedSkills.length > 0 && (
            <div className={styles.skillBadges}>
              <Mono dim size="xs">Injected skills:</Mono>
              {pinnedSkills.map(s => <Tag key={s.id} color="purple">{s.name}</Tag>)}
            </div>
          )}

          <div className={styles.promptBlock}>
            <div className={styles.promptHeader}>
              <Mono dim size="xs">OpenClaw System Prompt</Mono>
              <Btn
                size="sm"
                variant="ghost"
                onClick={() => onSavePrompt(qualify.task_title, blueprint.architect.system_prompt)}
              >
                Save to library
              </Btn>
            </div>
            <CodeBlock code={blueprint.architect.system_prompt} language="text" maxHeight={280} />
          </div>
        </Section>

        {/* Action Replacement */}
        <Section title="Action Replacement" score={blueprint.replace.score}>
          <Mono dim size="xs">{blueprint.replace.assessment}</Mono>
          {blueprint.replace.scripts.map((script, i) => (
            <div key={i} className={styles.scriptBlock}>
              <div className={styles.scriptHeader}>
                <Tag color="orange">{script.name}</Tag>
                <Mono dim size="xs">replaces: {script.replaces}</Mono>
              </div>
              <CodeBlock
                code={expandedCode[i] || script.stub}
                language="python"
                maxHeight={240}
              />
              {!expandedCode[i] && (
                <Btn
                  size="sm"
                  variant="ghost"
                  loading={expandingIdx === i}
                  onClick={() => expand(i)}
                >
                  Expand to full script
                </Btn>
              )}
            </div>
          ))}
        </Section>

        {/* Optimization Loop */}
        <Section title="Optimization Loop" score={blueprint.optimize.score}>
          <Mono dim size="xs">{blueprint.optimize.assessment}</Mono>
          <div className={styles.logTargets}>
            <Mono dim size="xs" className={styles.logLabel}>Log targets</Mono>
            {blueprint.optimize.log_targets.map((t, i) => (
              <div key={i} className={styles.logItem}>
                <span className={styles.logDot} />
                <Mono size="xs">{t}</Mono>
              </div>
            ))}
          </div>
          <div className={styles.firstFix}>
            <Mono dim size="xs">First fix:</Mono>
            <Mono warn size="xs">{blueprint.optimize.first_fix}</Mono>
          </div>
          {pipelineId && <RunLogPanel pipelineId={pipelineId} />}
        </Section>

        {/* Footer */}
        <div className={styles.footer}>
          <Btn variant="ghost" onClick={onReset}>New Task</Btn>
          <Btn onClick={onExport}>Export Package</Btn>
        </div>
      </div>
    </div>
  );
}
