import { useState, useCallback } from 'react';
import { api } from '../lib/api';
import { useSkills } from './useSkills';
import type {
  QualifyResult,
  ExecMap,
  Blueprint,
  PipelineStage,
  Skill,
  SkillMatch,
} from '@autopilot/shared';

export function usePipeline() {
  const [stage,            setStage]            = useState<PipelineStage>('input');
  const [task,             setTask]             = useState('');
  const [stack,            setStack]            = useState('');
  const [qualify,          setQualify]          = useState<QualifyResult | null>(null);
  const [execMap,          setExecMap]          = useState<ExecMap | null>(null);
  const [blueprint,        setBlueprint]        = useState<Blueprint | null>(null);
  const [error,            setError]            = useState<string | null>(null);
  const [pinnedSkills,     setPinnedSkills]     = useState<Skill[]>([]);
  const [detectedSkills,   setDetectedSkills]   = useState<SkillMatch[]>([]);
  const [injectedPrompt,   setInjectedPrompt]   = useState<{ name: string; text: string } | null>(null);
  const [currentPipelineId, setCurrentPipelineId] = useState<string | null>(null);

  const { skills, detectSkills } = useSkills();

  const runQualify = useCallback(async (taskText: string, stackText: string) => {
    setStage('qualifying');
    setError(null);
    try {
      const q: QualifyResult = await api.qualify(taskText, stackText);
      setQualify(q);

      if (q.overall_verdict === 'SKIP') {
        setStage('blocked');
        return;
      }

      const m: ExecMap = await api.map(taskText, stackText);
      setExecMap(m);

      // Non-blocking skill detection
      if (skills.length > 0) {
        detectSkills(taskText, q.task_summary, skills).then(matches => {
          setDetectedSkills(matches);
        }).catch(() => {});
      }

      setStage('map-confirm');
    } catch (e: any) {
      setError(e.message);
      setStage('input');
    }
  }, [skills, detectSkills]);

  const runBlueprint = useCallback(async (): Promise<Blueprint | undefined> => {
    setStage('blueprinting');
    setError(null);
    try {
      const skillTexts = pinnedSkills.map(s => s.text);
      const bp: Blueprint = await api.blueprint(
        task,
        execMap!,
        stack,
        skillTexts,
        injectedPrompt?.text
      );
      setBlueprint(bp);
      setStage('deploy');
      return bp;
    } catch (e: any) {
      setError(e.message);
      setStage('map-confirm');
    }
  }, [task, execMap, stack, pinnedSkills, injectedPrompt]);

  const reset = useCallback(() => {
    setStage('input');
    setTask('');
    setStack('');
    setQualify(null);
    setExecMap(null);
    setBlueprint(null);
    setError(null);
    setPinnedSkills([]);
    setDetectedSkills([]);
    setInjectedPrompt(null);
    setCurrentPipelineId(null);
  }, []);

  return {
    stage, setStage,
    task, setTask,
    stack, setStack,
    qualify,
    execMap, setExecMap,
    blueprint,
    error,
    pinnedSkills, setPinnedSkills,
    detectedSkills,
    injectedPrompt, setInjectedPrompt,
    currentPipelineId, setCurrentPipelineId,
    runQualify,
    runBlueprint,
    reset,
  };
}
