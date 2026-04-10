import type { Pipeline } from '@autopilot/shared';

export function buildExport(pipeline: Pipeline): object {
  const bp = pipeline.blueprint;
  return {
    project: pipeline.task_title || pipeline.task,
    version: '1.0',
    created: new Date().toISOString(),
    task: pipeline.task,
    stack: pipeline.software_stack || '',
    qualify: pipeline.qualify,
    exec_map: pipeline.exec_map,
    architect: {
      openclaw_role:  bp?.architect.openclaw_role,
      claude_role:    bp?.architect.claude_role,
      subagents:      bp?.architect.subagents,
      system_prompt:  bp?.architect.system_prompt,
    },
    scripts: bp?.replace.scripts || [],
    optimize: {
      log_targets:  bp?.optimize.log_targets,
      first_fix:    bp?.optimize.first_fix,
    },
    decisive_variable: bp?.decisive_variable,
    overall_score: bp?.overall_score,
  };
}

export function downloadJSON(data: object, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
