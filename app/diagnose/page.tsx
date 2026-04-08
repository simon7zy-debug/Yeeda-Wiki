"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { DiagnoseResult, TaskType } from "@/lib/types";

type UrgencyOption = "urgent" | "week" | "normal";
type MaterialLevel = "low" | "medium" | "high";
type BlockerOption =
  | "unclear_goal"
  | "quality_low"
  | "cannot_express"
  | "need_plan"
  | "need_interview"
  | "none";

type TaskPreset = {
  label: string;
  defaultGoal: string;
  hint: string;
};

const TASK_PRESETS: Record<TaskType, TaskPreset> = {
  resume_optimization: {
    label: "优化简历",
    defaultGoal: "我想优化简历，尽快达到可投递状态。",
    hint: "重点目标：提升通过率、补齐证据、输出可投递版本。",
  },
  project_packaging: {
    label: "封装项目",
    defaultGoal: "我想把项目经历整理成可面试表达版本。",
    hint: "重点目标：结构化叙事（背景/用户/方案/结果）+ 追问准备。",
  },
  interview_preparation: {
    label: "准备面试",
    defaultGoal: "我想针对 AI 产品经理岗位做面试准备。",
    hint: "重点目标：高频问题、回答框架、证据闭环。",
  },
  ai_workflow_guidance: {
    label: "设计 AI 工作流",
    defaultGoal: "我想设计一套可执行的 AI 协作流程。",
    hint: "重点目标：目标澄清、步骤拆解、质量门槛。",
  },
  task_planning: {
    label: "拆解任务",
    defaultGoal: "我想把当前目标拆成可执行步骤。",
    hint: "重点目标：步骤顺序、文档清单、优先级。",
  },
  unknown: {
    label: "还没想清楚",
    defaultGoal: "我还没想清楚从哪里开始，需要先做诊断。",
    hint: "重点目标：先识别任务类型，再决定模块路径。",
  },
};

function isTaskType(value: string | null): value is TaskType {
  return (
    value === "resume_optimization" ||
    value === "project_packaging" ||
    value === "interview_preparation" ||
    value === "ai_workflow_guidance" ||
    value === "task_planning" ||
    value === "unknown"
  );
}

function blockerOptionsByTask(task: TaskType): Array<{ value: BlockerOption; label: string }> {
  if (task === "resume_optimization") {
    return [
      { value: "quality_low", label: "有简历但质量不够，担心过不了筛选" },
      { value: "unclear_goal", label: "目标岗位不够清晰" },
      { value: "cannot_express", label: "有项目经历但不会写成亮点" },
      { value: "none", label: "没有明显阻碍，想直接开始" },
    ];
  }

  if (task === "project_packaging") {
    return [
      { value: "cannot_express", label: "有项目但讲不清楚" },
      { value: "quality_low", label: "内容零散，缺结构和证据" },
      { value: "need_interview", label: "担心面试追问无法自圆其说" },
      { value: "none", label: "没有明显阻碍，想直接开始" },
    ];
  }

  if (task === "interview_preparation") {
    return [
      { value: "need_interview", label: "不知道会被问什么、怎么回答" },
      { value: "quality_low", label: "有答案但不够有说服力" },
      { value: "cannot_express", label: "项目说不清，怕追问" },
      { value: "none", label: "没有明显阻碍，想直接开始" },
    ];
  }

  if (task === "task_planning" || task === "ai_workflow_guidance") {
    return [
      { value: "need_plan", label: "不知道如何拆步骤和排优先级" },
      { value: "unclear_goal", label: "目标描述还不够清晰" },
      { value: "quality_low", label: "材料有但不足以支撑执行" },
      { value: "none", label: "没有明显阻碍，想直接开始" },
    ];
  }

  return [
    { value: "unclear_goal", label: "我还没想清楚目标" },
    { value: "need_plan", label: "不知道从哪里开始" },
    { value: "quality_low", label: "有材料但不确定质量够不够" },
    { value: "none", label: "没有明显阻碍，想直接开始" },
  ];
}

export default function DiagnosePage() {
  const [selectedTask, setSelectedTask] = useState<TaskType>("unknown");
  const [goal, setGoal] = useState("");
  const [materials, setMaterials] = useState("");
  const [urgency, setUrgency] = useState<UrgencyOption>("week");
  const [materialLevel, setMaterialLevel] = useState<MaterialLevel>("medium");
  const [blocker, setBlocker] = useState<BlockerOption>("none");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnoseResult | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const taskParam = params.get("task");
    const goalParam = params.get("goal");

    if (isTaskType(taskParam)) {
      setSelectedTask(taskParam);
      if (!goalParam) {
        setGoal(TASK_PRESETS[taskParam].defaultGoal);
      }
    } else {
      setGoal(TASK_PRESETS.unknown.defaultGoal);
    }

    if (goalParam) {
      setGoal(goalParam);
    }
  }, []);

  const blockerOptions = useMemo(
    () => blockerOptionsByTask(selectedTask),
    [selectedTask],
  );

  useEffect(() => {
    setBlocker("none");
  }, [selectedTask]);

  async function runDiagnose() {
    setLoading(true);
    setError(null);

    try {
      const normalizedGoal = goal.trim() || TASK_PRESETS[selectedTask].defaultGoal;

      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task: selectedTask,
          goal: normalizedGoal,
          materials,
          urgency,
          materialLevel,
          blocker,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message ?? "诊断失败，请稍后重试。");
      }

      setResult(payload as DiagnoseResult);
    } catch (diagnoseError) {
      const message =
        diagnoseError instanceof Error ? diagnoseError.message : "诊断失败，请稍后重试。";
      setError(message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  const flowTargetHref = result
    ? `${result.recommendedRoute}?from=diagnose&task=${result.taskType}`
    : "/diagnose";

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-8">
      <main className="mx-auto w-full max-w-5xl rounded-3xl border border-line bg-panel p-6 shadow-lg sm:p-10">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium tracking-wide text-ink-soft">
              AIPM Workbench · Diagnose Layer（流程入口）
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              先诊断，再分流
            </h1>
            <p className="mt-3 text-sm leading-7 text-ink-soft">
              当前入口任务：{TASK_PRESETS[selectedTask].label}。先回答 3 个问题，再进入模块执行。
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-line bg-white px-4 py-2 text-sm font-medium text-foreground hover:border-accent hover:text-accent"
          >
            返回首页
          </Link>
        </div>

        <section className="rounded-2xl border border-line bg-white p-5">
          <div className="rounded-xl border border-line bg-[#fffdfa] px-4 py-3 text-sm text-ink-soft">
            {TASK_PRESETS[selectedTask].hint}
          </div>

          <label className="mt-4 block text-sm font-medium text-foreground">
            问题 1：当前时间紧迫度
          </label>
          <select
            value={urgency}
            onChange={(event) => setUrgency(event.target.value as UrgencyOption)}
            className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-foreground outline-none focus:border-accent"
          >
            <option value="urgent">3 天内要交付（紧急）</option>
            <option value="week">1-2 周内要推进</option>
            <option value="normal">暂无硬截止，先搭好流程</option>
          </select>

          <label className="mt-4 block text-sm font-medium text-foreground">
            问题 2：你当前材料完整度
          </label>
          <select
            value={materialLevel}
            onChange={(event) => setMaterialLevel(event.target.value as MaterialLevel)}
            className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-foreground outline-none focus:border-accent"
          >
            <option value="low">材料很少，基本没有可用内容</option>
            <option value="medium">有一些材料，但还比较零散</option>
            <option value="high">材料基本齐全，可以直接执行</option>
          </select>

          <label className="mt-4 block text-sm font-medium text-foreground">
            问题 3：当前最大阻碍
          </label>
          <select
            value={blocker}
            onChange={(event) => setBlocker(event.target.value as BlockerOption)}
            className="mt-2 w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-foreground outline-none focus:border-accent"
          >
            {blockerOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <label className="mt-4 block text-sm font-medium text-foreground">
            目标补充（可选）
          </label>
          <textarea
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            rows={3}
            className="mt-2 w-full rounded-xl border border-line bg-[#fffdfa] px-4 py-3 text-sm text-foreground outline-none focus:border-accent"
            placeholder="可补充你的目标细节。"
          />

          <label className="mt-4 block text-sm font-medium text-foreground">
            材料补充（可选）
          </label>
          <textarea
            value={materials}
            onChange={(event) => setMaterials(event.target.value)}
            rows={3}
            className="mt-2 w-full rounded-xl border border-line bg-[#fffdfa] px-4 py-3 text-sm text-foreground outline-none focus:border-accent"
            placeholder="可补充已有简历/JD/项目材料。"
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={runDiagnose}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "诊断中..." : "生成分流建议"}
            </button>
            <button
              type="button"
              onClick={() => {
                setGoal(TASK_PRESETS[selectedTask].defaultGoal);
                setMaterials("");
                setUrgency("week");
                setMaterialLevel("medium");
                setBlocker("none");
                setError(null);
                setResult(null);
              }}
              className="inline-flex items-center justify-center rounded-xl border border-line bg-white px-5 py-3 text-sm font-medium text-foreground hover:border-accent hover:text-accent"
            >
              重置
            </button>
          </div>
        </section>

        {error ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {result ? (
          <section className="mt-6 space-y-4">
            <article className="rounded-2xl border border-line bg-white p-5">
              <p className="text-xs tracking-wide text-ink-soft">诊断结果</p>
              <h2 className="mt-1 text-2xl font-semibold text-foreground">
                {result.taskTypeLabel}
              </h2>
              <p className="mt-2 text-sm text-ink-soft">
                当前状态：{result.currentStateLabel} · 推荐模块：{result.recommendedModule} ·
                置信度 {result.confidence}%
              </p>
            </article>

            <article className="rounded-2xl border border-line bg-white p-5">
              <h3 className="text-lg font-semibold text-foreground">推荐路径与下一步</h3>
              <div className="mt-3 space-y-2">
                {result.reasoning.map((line, index) => (
                  <p key={index} className="text-sm text-ink-soft">
                    - {line}
                  </p>
                ))}
              </div>
              <div className="mt-3 space-y-2">
                {result.nextActions.map((action, index) => (
                  <p key={index} className="text-sm text-foreground">
                    {index + 1}. {action}
                  </p>
                ))}
              </div>
              <div className="mt-5">
                <Link
                  href={flowTargetHref}
                  className="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong"
                >
                  进入推荐模块（流程继续）
                </Link>
              </div>
            </article>
          </section>
        ) : null}
      </main>
    </div>
  );
}
