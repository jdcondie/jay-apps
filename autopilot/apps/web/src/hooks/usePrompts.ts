import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { SavedPrompt } from '@autopilot/shared';

export function usePrompts() {
  const [prompts,  setPrompts]  = useState<SavedPrompt[]>([]);
  const [loading,  setLoading]  = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('saved_prompts')
      .select('*')
      .order('uses', { ascending: false });
    setPrompts(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const add = useCallback(async (prompt: Omit<SavedPrompt, 'id' | 'created_at' | 'uses'>) => {
    const { data } = await supabase
      .from('saved_prompts')
      .insert({ ...prompt, uses: 0 })
      .select()
      .single();
    if (data) setPrompts(ps => [data, ...ps]);
    return data as SavedPrompt | null;
  }, []);

  const update = useCallback(async (id: string, patch: Partial<SavedPrompt>) => {
    const { data } = await supabase
      .from('saved_prompts')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (data) setPrompts(ps => ps.map(p => p.id === id ? data : p));
    return data as SavedPrompt | null;
  }, []);

  const remove = useCallback(async (id: string) => {
    await supabase.from('saved_prompts').delete().eq('id', id);
    setPrompts(ps => ps.filter(p => p.id !== id));
  }, []);

  const incrementUse = useCallback(async (id: string) => {
    const prompt = prompts.find(p => p.id === id);
    if (!prompt) return;
    await update(id, { uses: (prompt.uses || 0) + 1 });
  }, [prompts, update]);

  return { prompts, loading, load, add, update, remove, incrementUse };
}
