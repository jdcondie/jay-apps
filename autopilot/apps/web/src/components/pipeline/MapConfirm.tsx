import { useState } from 'react';
import { Btn } from '../ui/Btn';
import { Mono } from '../ui/Mono';
import { Tag } from '../ui/Tag';
import { ScoreBar } from '../ui/ScoreBar';
import { SkillPicker } from '../shared/SkillPicker';
import { MapField } from '../shared/MapField';
import { checkMapHealth } from '../../lib/mapHealth';
import styles from './MapConfirm.module.css';
import type { QualifyResult, ExecMap, Skill, SkillMatch } from '@autopilot/shared';

interface MapConfirmProps {
  qualify:        QualifyResult;
  execMap:        ExecMap;
  setExecMap:     (m: ExecMap) => void;
  stack:          string;
  allSkills:      Skill[];
  detectedSkills: SkillMatch[];
  pinnedSkills:   Skill[];
  setPinnedSkills:(s: Skill[]) => void;
  injectedPrompt: { name: string; text: string } | null;
  setInjectedPrompt: (p: { name: string; text: string } | null) => void;
  onConfirm:      () => void;
  loading:        boolean;
  error:          string | null;
}

export function MapConfirm({
  qualify,
  execMap,
  setExecMap,
  stack,
  allSkills,
  detectedSkills,
  pinnedSkills,
  setPinnedSkills,
  injectedPrompt,
  setInjectedPrompt,
  onConfirm,
  loading,
  error,
}: MapConfirmProps) {
  const health = checkMapHealth(execMap);

  const updateStep = (i: number, field: string, value: string) => {
    const steps = execMap.steps.map((s, idx) =>
      idx === i ? { ...s, [field]: value } : s
    );
    setExecMap({ ...execMap, steps });
  };

  const pinSkill = (skill: Skill) => {
    if (!pinnedSkills.find(s => s.id === skill.id)) {
      setPinnedSkills([...pinnedSkills, skill]);
    }
  };
  const unpinSkill = (id: string) => setPinnedSkills(pinnedSkills.filter(s => s.id !== id));

  const btnLabel = () => {
    const parts: string[] = ['Build Blueprint'];
    if (health.errors.length)   parts.push(`(${health.errors.length} error${health.errors.length > 1 ? 's' : ''})`);
    if (pinnedSkills.length)    parts.push(`• ${pinnedSkills.length} skill${pinnedSkills.length > 1 ? 's' : ''}`);
    return parts.join(' ');
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.inner}>
        {/* Qualify scores */}
        <div className={styles.scoreStrip}>
          <div className={styles.scoreItem}>
            <Tag color={qualify.qualify.verdict === 'PASS' ? 'accent' : 'red'}>
              Qualify {qualify.qualify.verdict}
            </Tag>
            <ScoreBar score={qualify.qualify.score} />
          </div>
          <div className={styles.scoreItem}>
            <Tag color={qualify.filter.verdict === 'PASS' ? 'accent' : 'warn'}>
              Filter {qualify.filter.verdict}
            </Tag>
            <ScoreBar score={qualify.filter.score} />
          </div>
          <div className={styles.verdict}>
            <Tag color={qualify.overall_verdict === 'BUILD' ? 'accent' : qualify.overall_verdict === 'SKIP' ? 'red' : 'warn'}>
              {qualify.overall_verdict}
            </Tag>
            <Mono dim size="xs">{qualify.verdict_reason}</Mono>
          </div>
        </div>

        {/* Map health */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Mono size="xs">Map Health</Mono>
            <ScoreBar score={health.score} showNumber />
          </div>
          {health.errors.map((e, i) => (
            <div key={i} className={styles.issue}>
              <Tag color="red">error</Tag>
              <Mono red size="xs">{e}</Mono>
            </div>
          ))}
          {health.warnings.map((w, i) => (
            <div key={i} className={styles.issue}>
              <Tag color="warn">warn</Tag>
              <Mono warn size="xs">{w}</Mono>
            </div>
          ))}
        </div>

        {/* Skills */}
        {allSkills.length > 0 && (
          <SkillPicker
            allSkills={allSkills}
            detectedSkills={detectedSkills}
            pinnedSkills={pinnedSkills}
            onPin={pinSkill}
            onUnpin={unpinSkill}
          />
        )}

        {/* Map editor */}
        <div className={styles.section}>
          <Mono size="xs" className={styles.sectionTitle}>Execution Map</Mono>
          {stack && <Tag color="blue" className={styles.stackTag}>{stack}</Tag>}

          <MapField
            label="Input trigger"
            value={execMap.input}
            onChange={v => setExecMap({ ...execMap, input: v })}
          />

          <div className={styles.steps}>
            {execMap.steps.map((step, i) => (
              <div key={i} className={styles.stepRow}>
                <Mono dim size="xs" className={styles.stepNum}>{step.order}</Mono>
                <div className={styles.stepFields}>
                  <MapField
                    label="Action"
                    value={step.action}
                    onChange={v => updateStep(i, 'action', v)}
                    placeholder="What happens..."
                  />
                  <div className={styles.stepMeta}>
                    <select
                      className={styles.agentSelect}
                      value={step.agent}
                      onChange={e => updateStep(i, 'agent', e.target.value)}
                    >
                      <option value="OpenClaw">OpenClaw</option>
                      <option value="Claude">Claude</option>
                      <option value="Python script">Python script</option>
                    </select>
                    {step.note !== undefined && (
                      <MapField
                        label="Note"
                        value={step.note || ''}
                        onChange={v => updateStep(i, 'note', v)}
                        placeholder="Optional note..."
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <MapField
            label="Output"
            value={execMap.output}
            onChange={v => setExecMap({ ...execMap, output: v })}
          />
          <MapField
            label="Failure / fallback"
            value={execMap.failure}
            onChange={v => setExecMap({ ...execMap, failure: v })}
            multiline
          />
        </div>

        {error && <Mono red size="xs" className={styles.error}>{error}</Mono>}

        <div className={styles.footer}>
          <Btn
            onClick={onConfirm}
            loading={loading}
            variant={health.errors.length > 0 ? 'warn' : 'primary'}
          >
            {btnLabel()}
          </Btn>
        </div>
      </div>
    </div>
  );
}
