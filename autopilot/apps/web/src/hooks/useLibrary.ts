import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Pipeline } from '@autopilot/shared';

export function useLibrary() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading,   setLoading]   = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('pipelines')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    setPipelines(data || []);
    setLoading(false);
  }, []);

  const save = useCallback(async (pipeline: Omit<Pipeline, 'id' | 'created_at' | 'updated_at'>) => {
    const { data } = await supabase
      .from('pipelines')
      .insert(pipeline)
      .select()
      .single();
    if (data) setPipelines(ps => [data, ...ps]);
    return data as Pipeline | null;
  }, []);

  const update = useCallback(async (id: string, patch: Partial<Pipeline>) => {
    const { data } = await supabase
      .from('pipelines')
      .update(patch)
      .eq('id', id)
      .select()
      .single();
    if (data) setPipelines(ps => ps.map(p => p.id === id ? data : p));
    return data as Pipeline | null;
  }, []);

  const remove = useCallback(async (id: string) => {
    await supabase.from('pipelines').delete().eq('id', id);
    setPipelines(ps => ps.filter(p => p.id !== id));
  }, []);

  return { pipelines, loading, load, save, update, remove };
}
