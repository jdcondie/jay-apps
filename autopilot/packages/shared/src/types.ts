export interface QualifyResult {
  task_title: string;
  task_summary: string;
  qualify: PhaseResult;
  filter: PhaseResult;
  overall_verdict: 'BUILD' | 'SKIP' | 'MODIFY';
  verdict_reason: string;
}

export interface PhaseResult {
  score: number;
  verdict: 'PASS' | 'FAIL';
  assessment: string;
  gates: Record<string, boolean>;
}

export interface ExecMap {
  input: string;
  steps: ExecStep[];
  output: string;
  failure: string;
}

export interface ExecStep {
  order: number;
  action: string;
  agent: 'OpenClaw' | 'Claude' | 'Python script';
  note?: string | null;
}

export interface Blueprint {
  architect: ArchitectPhase;
  replace: ReplacePhase;
  optimize: OptimizePhase;
  overall_score: number;
  decisive_variable: string;
}

export interface ArchitectPhase {
  score: number;
  assessment: string;
  openclaw_role: string;
  claude_role: string;
  subagents: { name: string; owns: string }[];
  system_prompt: string;
}

export interface ReplacePhase {
  score: number;
  assessment: string;
  scripts: PythonScript[];
}

export interface PythonScript {
  name: string;
  replaces: string;
  stub: string;
}

export interface OptimizePhase {
  score: number;
  assessment: string;
  log_targets: string[];
  first_fix: string;
}

export interface Pipeline {
  id: string;
  created_at: string;
  updated_at: string;
  task_title: string;
  task: string;
  task_summary?: string;
  software_stack?: string;
  client_tag?: string;
  notes?: string;
  overall_score?: number;
  qualify?: QualifyResult;
  exec_map?: ExecMap;
  blueprint?: Blueprint;
  pinned_skill_ids?: string[];
}

export interface RunLog {
  id: string;
  pipeline_id: string;
  logged_at: string;
  status: 'success' | 'partial' | 'failed' | 'running';
  duration_ms?: number;
  notes?: string;
}

export interface Skill {
  id: string;
  created_at: string;
  name: string;
  trigger_phrase?: string;
  description?: string;
  text: string;
}

export interface SavedPrompt {
  id: string;
  created_at: string;
  name: string;
  description?: string;
  text: string;
  uses: number;
}

export interface SkillMatch {
  skill: Skill;
  relevance: 'HIGH' | 'MEDIUM';
  reason: string;
}

export interface ScanTask {
  task: string;
  automation_score: number;
  value_score: number;
  effort_score: number;
  priority_score: number;
  verdict: 'BUILD' | 'SKIP' | 'MODIFY';
  reason: string;
  quick_win: boolean;
}

export interface ScanResult {
  tasks: ScanTask[];
  top_pick: string;
  top_pick_reason: string;
}

export interface IntakeResult {
  client_summary: string;
  tasks: IntakeTask[];
  recommended_stack: string;
  top_task: string;
}

export interface IntakeTask {
  task: string;
  rationale: string;
  automation_score: number;
  value_score: number;
  quick_win: boolean;
}

export type PipelineStage =
  | 'input'
  | 'qualifying'
  | 'map-confirm'
  | 'blueprinting'
  | 'deploy'
  | 'blocked';

export type Plan = 'free' | 'pro' | 'agency';

export interface Subscription {
  plan: Plan;
  status: string;
  current_period_end?: string;
}
