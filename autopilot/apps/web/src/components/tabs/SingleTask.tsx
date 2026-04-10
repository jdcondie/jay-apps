import { usePipeline } from '../../hooks/usePipeline';
import { useSkills } from '../../hooks/useSkills';
import { useLibrary } from '../../hooks/useLibrary';
import { usePrompts } from '../../hooks/usePrompts';
import { InputScreen } from '../pipeline/InputScreen';
import { QualifyStage } from '../pipeline/QualifyStage';
import { MapConfirm } from '../pipeline/MapConfirm';
import { DeployPackage } from '../pipeline/DeployPackage';
import { Mono } from '../ui/Mono';
import { Btn } from '../ui/Btn';
import { buildExport, downloadJSON } from '../../lib/export';
import styles from './SingleTask.module.css';

export function SingleTask() {
  const pipeline = usePipeline();
  const { skills, detectSkills } = useSkills();
  const library  = useLibrary();
  const { add: addPrompt } = usePrompts();

  const {
    stage, task, setTask, stack, setStack,
    qualify, execMap, setExecMap, blueprint,
    error, pinnedSkills, setPinnedSkills,
    detectedSkills, injectedPrompt, setInjectedPrompt,
    currentPipelineId, setCurrentPipelineId,
    runQualify, runBlueprint, reset,
  } = pipeline;

  const handleQualify = () => runQualify(task, stack);

  const handleBlueprint = async () => {
    const bp = await runBlueprint();
    if (bp && qualify && execMap) {
      const saved = await library.save({
        task,
        task_title:    qualify.task_title,
        task_summary:  qualify.task_summary,
        software_stack: stack,
        overall_score: bp.overall_score,
        qualify,
        exec_map:      execMap,
        blueprint:     bp,
        pinned_skill_ids: pinnedSkills.map(s => s.id),
      });
      if (saved) setCurrentPipelineId(saved.id);
    }
  };

  const handleExport = () => {
    if (!blueprint || !qualify) return;
    const data = buildExport({
      id: currentPipelineId || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      task,
      task_title:    qualify.task_title,
      software_stack: stack,
      qualify,
      exec_map:      execMap || undefined,
      blueprint,
    });
    downloadJSON(data, `${qualify.task_title.replace(/\s+/g, '-').toLowerCase()}.json`);
  };

  const handleSavePrompt = async (name: string, text: string) => {
    await addPrompt({ name, text, description: `From pipeline: ${task.slice(0, 60)}` });
  };

  if (stage === 'input') {
    return (
      <InputScreen
        task={task}
        stack={stack}
        onTaskChange={setTask}
        onStackChange={setStack}
        onSubmit={handleQualify}
        loading={false}
        error={error}
      />
    );
  }

  if (stage === 'qualifying' || stage === 'blueprinting') {
    return <QualifyStage />;
  }

  if (stage === 'blocked') {
    return (
      <div className={styles.blocked}>
        <Mono red size="xs">SKIP — not worth automating</Mono>
        {qualify && <Mono dim size="xs">{qualify.verdict_reason}</Mono>}
        <Btn variant="ghost" onClick={reset}>Try a different task</Btn>
      </div>
    );
  }

  if (stage === 'map-confirm' && qualify && execMap) {
    return (
      <MapConfirm
        qualify={qualify}
        execMap={execMap}
        setExecMap={setExecMap}
        stack={stack}
        allSkills={skills}
        detectedSkills={detectedSkills}
        pinnedSkills={pinnedSkills}
        setPinnedSkills={setPinnedSkills}
        injectedPrompt={injectedPrompt}
        setInjectedPrompt={setInjectedPrompt}
        onConfirm={handleBlueprint}
        loading={false}
        error={error}
      />
    );
  }

  if (stage === 'deploy' && qualify && execMap && blueprint) {
    return (
      <DeployPackage
        qualify={qualify}
        execMap={execMap}
        blueprint={blueprint}
        stack={stack}
        pipelineId={currentPipelineId}
        task={task}
        pinnedSkills={pinnedSkills}
        onReset={reset}
        onExport={handleExport}
        onSavePrompt={handleSavePrompt}
      />
    );
  }

  return null;
}
