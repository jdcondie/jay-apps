import { useState } from 'react';
import { Tag } from '../ui/Tag';
import { Mono } from '../ui/Mono';
import { Btn } from '../ui/Btn';
import styles from './SkillPicker.module.css';
import type { Skill, SkillMatch } from '@autopilot/shared';

interface SkillPickerProps {
  allSkills:      Skill[];
  detectedSkills: SkillMatch[];
  pinnedSkills:   Skill[];
  onPin:          (skill: Skill) => void;
  onUnpin:        (id: string) => void;
}

export function SkillPicker({
  allSkills,
  detectedSkills,
  pinnedSkills,
  onPin,
  onUnpin,
}: SkillPickerProps) {
  const [open, setOpen] = useState(detectedSkills.length > 0);

  const pinnedIds  = new Set(pinnedSkills.map(s => s.id));
  const detectedIds = new Set(detectedSkills.map(m => m.skill.id));
  const otherSkills = allSkills.filter(s => !detectedIds.has(s.id));

  return (
    <div className={styles.panel}>
      <button className={styles.toggle} onClick={() => setOpen(v => !v)}>
        <Mono size="xs">Skills</Mono>
        <div className={styles.toggleRight}>
          {pinnedSkills.length > 0 && (
            <Tag color="purple">{pinnedSkills.length} pinned</Tag>
          )}
          {detectedSkills.length > 0 && (
            <Tag color="accent">{detectedSkills.length} detected</Tag>
          )}
          <Mono dim size="xs">{open ? '▲' : '▼'}</Mono>
        </div>
      </button>

      {open && (
        <div className={styles.body}>
          {detectedSkills.length > 0 && (
            <>
              <Mono dim size="xs" className={styles.section}>Auto-detected</Mono>
              {detectedSkills.map(({ skill, relevance, reason }) => (
                <SkillRow
                  key={skill.id}
                  skill={skill}
                  relevance={relevance}
                  reason={reason}
                  pinned={pinnedIds.has(skill.id)}
                  onPin={() => pinnedIds.has(skill.id) ? onUnpin(skill.id) : onPin(skill)}
                />
              ))}
            </>
          )}

          {otherSkills.length > 0 && (
            <>
              <Mono dim size="xs" className={styles.section}>All skills</Mono>
              {otherSkills.map(skill => (
                <SkillRow
                  key={skill.id}
                  skill={skill}
                  pinned={pinnedIds.has(skill.id)}
                  onPin={() => pinnedIds.has(skill.id) ? onUnpin(skill.id) : onPin(skill)}
                />
              ))}
            </>
          )}

          {allSkills.length === 0 && (
            <Mono dim size="xs" className={styles.empty}>No skills saved yet. Add some in the Skills tab.</Mono>
          )}
        </div>
      )}
    </div>
  );
}

function SkillRow({
  skill,
  relevance,
  reason,
  pinned,
  onPin,
}: {
  skill: Skill;
  relevance?: string;
  reason?: string;
  pinned: boolean;
  onPin: () => void;
}) {
  return (
    <div className={[styles.row, pinned ? styles.rowPinned : ''].join(' ')}>
      <div className={styles.rowLeft}>
        <Mono size="xs">{skill.name}</Mono>
        {skill.trigger_phrase && (
          <Mono dim size="xs">trigger: {skill.trigger_phrase}</Mono>
        )}
        {relevance && (
          <Tag color={relevance === 'HIGH' ? 'accent' : 'warn'}>{relevance}</Tag>
        )}
        {reason && <Mono dim size="xs" className={styles.reason}>{reason}</Mono>}
      </div>
      <Btn size="sm" variant={pinned ? 'danger' : 'ghost'} onClick={onPin}>
        {pinned ? 'unpin' : 'pin'}
      </Btn>
    </div>
  );
}
