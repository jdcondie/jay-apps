import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';
import type { Skill, SkillMatch } from '@autopilot/shared';

export function useSkills() {
  const [skills,  setSkills]  = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('skills')
      .select('*')
      .order('created_at', { ascending: false });
    setSkills(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = useCallback(async (skill: Omit<Skill, 'id' | 'created_at'>) => {
    const { data } = await supabase
      .from('skills')
      .insert(skill)
      .select()
      .single();
    if (data) setSkills(s => [data, ...s]);
    return data;
  }, []);

  const update = useCallback(async (id: string, patch: Partial<Skill>) => {
    const { data } = await supabase
      .from('skills')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (data) setSkills(s => s.map(x => x.id === id ? data : x));
    return data;
  }, []);

  const remove = useCallback(async (id: string) => {
    await supabase.from('skills').delete().eq('id', id);
    setSkills(s => s.filter(x => x.id !== id));
  }, []);

  const detectSkills = useCallback(async (
    task: string,
    summary: string,
    skillList: Skill[]
  ): Promise<SkillMatch[]> => {
    if (!skillList.length) return [];
    const result = await api.detectSkills(task, summary, skillList.map(s => ({
      name: s.name,
      trigger_phrase: s.trigger_phrase,
      description: s.description,
    })));
    return (result.matches || []).map((m: { skill_index: number; relevance: string; reason: string }) => ({
      skill: skillList[m.skill_index],
      relevance: m.relevance,
      reason: m.reason,
    })).filter((m: SkillMatch) => m.skill);
  }, []);

  return { skills, loading, load, add, update, remove, detectSkills };
}
