import { supabase } from './supabase';

const BASE = import.meta.env.VITE_API_URL || '';

async function apiFetch(path: string, body?: object) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const res = await fetch(`${BASE}${path}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    if (err.error === 'limit_reached') {
      const e = new Error(err.message) as any;
      e.code  = 'limit_reached';
      e.plan  = err.plan;
      throw e;
    }
    throw new Error(err.error || 'Request failed');
  }

  return res.json();
}

export const api = {
  qualify: (task: string, stack?: string) =>
    apiFetch('/api/pipeline/qualify', { task, stack }),

  map: (task: string, stack?: string) =>
    apiFetch('/api/pipeline/map', { task, stack }),

  blueprint: (task: string, execMap: object, stack?: string, skills?: string[], overridePrompt?: string) =>
    apiFetch('/api/pipeline/blueprint', { task, execMap, stack, skills, overridePrompt }),

  expand: (stub: string, task: string, replaces: string, stack?: string, execMap?: object) =>
    apiFetch('/api/expand', { stub, task, replaces, stack, execMap }),

  detectSkills: (task: string, summary: string, skills: object[]) =>
    apiFetch('/api/detect-skills', { task, summary, skills }),

  scan: (tasks: string) =>
    apiFetch('/api/scanner', { tasks }),

  intake: (bizType: string, tools: string, painPoints: string, freq: string) =>
    apiFetch('/api/intake', { bizType, tools, painPoints, freq }),

  billing: {
    checkout: (plan: string) => apiFetch('/api/billing/checkout', { plan }),
    portal:   ()             => apiFetch('/api/billing/portal',   {}),
  },
};
