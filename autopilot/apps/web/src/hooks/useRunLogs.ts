import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { RunLog } from '@autopilot/shared';

export function useRunLogs(pipelineId?: string) {
  const [logs,    setLogs]    = useState<RunLog[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (pid?: string) => {
    const id = pid || pipelineId;
    if (!id) return;
    setLoading(true);
    const { data } = await supabase
      .from('run_logs')
      .select('*')
      .eq('pipeline_id', id)
      .order('logged_at', { ascending: false })
      .limit(20);
    setLogs(data || []);
    setLoading(false);
  }, [pipelineId]);

  const add = useCallback(async (log: Omit<RunLog, 'id' | 'logged_at'>) => {
    const { data } = await supabase
      .from('run_logs')
      .insert(log)
      .select()
      .single();
    if (data) setLogs(ls => [data, ...ls]);
    return data as RunLog | null;
  }, []);

  const remove = useCallback(async (id: string) => {
    await supabase.from('run_logs').delete().eq('id', id);
    setLogs(ls => ls.filter(l => l.id !== id));
  }, []);

  return { logs, loading, load, add, remove };
}
