"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { Severity, TaskPlanResult } from "@/lib/types";

function priorityStyle(priority: Severity): string {
  if (priority === "P0") return "border-red-200 bg-red-50 text-red-700";
  if (priority === "P1") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-sky-200 bg-sky-50 text-sky-700";
}

export default function PlannerPage() {
  const [goal, setGoal] = useState("");
  const [materials, setMaterials] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TaskPlanResult | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const urlGoal = new URLSearchParams(window.location.search).get("goal");
    if (urlGoal) {
      setGoal((prev) => prev || urlGoal);
    }
  }, []);

  async function buildPlan() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/planner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          goal,
          materials,
          deadline,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message ?? "任务拆解失败，请稍后重试。");
      }

      setResult(payload as TaskPlanResult);
    } catch (planError) {
      const message =
        planError instanceof Error ? planError.message : "任务拆解失败，请稍后重试。";
      setError(message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-8">
      <main className="mx-auto w-full max-w-5xl rounded-3xl border border-line bg-panel p-6 shadow-lg sm:p-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium tracking-wide text-ink-soft">
              AIPM Workbench · Task Planner
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              任务拆解（P1）
            </h1>
            <p className="mt-3 text-sm leading-7 text-ink-soft">
              输入目标后，生成步骤顺序、所需文档、风险提醒与推荐模块。
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/diagnose"
              className="inline-flex items-center justify-center rounded-xl border border-line bg-white px-4 py-2 text-sm font-medium text-foreground hover:border-accent hover:text-accent"
            >
              返回诊断页
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-xl border border-line bg-white px-4 py-2 text-sm font-medium text-foreground hover:border-accent hover:text-accent"
            >
              返回首页
            </Link>
          </div>
        </div>

        <section className="rounded-2xl border border-line bg-white p-5">
          <label className="block text-sm font-medium text-foreground">目标</label>
          <textarea
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            rows={4}
            className="mt-2 w-full rounded-xl border border-line bg-[#fffdfa] px-4 py-3 text-sm text-foreground outline-none focus:border-accent"
            placeholder="示例：本周完成 AI PM 简历优化并准备首轮面试。"
          />

          <label className="mt-4 block text-sm font-medium text-foreground">
            已有材料（可选）
          </label>
          <textarea
            value={materials}
            onChange={(event) => setMaterials(event.target.value)}
            rows={4}
            className="mt-2 w-full rounded-xl border border-line bg-[#fffdfa] px-4 py-3 text-sm text-foreground outline-none focus:border-accent"
            placeholder="示例：有 PDF 简历、2 个项目复盘、目标 JD。"
          />

          <label className="mt-4 block text-sm font-medium text-foreground">
            截止时间（可选）
          </label>
          <input
            value={deadline}
            onChange={(event) => setDeadline(event.target.value)}
            className="mt-2 w-full rounded-xl border border-line bg-[#fffdfa] px-4 py-3 text-sm text-foreground outline-none focus:border-accent"
            placeholder="示例：本周五晚 20:00 前"
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={buildPlan}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "拆解中..." : "生成任务拆解"}
            </button>
            <button
              type="button"
              onClick={() => {
                setGoal("");
                setMaterials("");
                setDeadline("");
                setError(null);
                setResult(null);
              }}
              className="inline-flex items-center justify-center rounded-xl border border-line bg-white px-5 py-3 text-sm font-medium text-foreground hover:border-accent hover:text-accent"
            >
              清空
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
              <h2 className="text-lg font-semibold text-foreground">诊断与建议</h2>
              <p className="mt-2 text-sm text-ink-soft">{result.summary}</p>
              <p className="mt-2 text-sm text-foreground">
                推荐模块：
                <Link
                  href={result.recommendedRoute}
                  className="ml-1 font-medium text-accent hover:underline"
                >
                  {result.recommendedRoute}
                </Link>
              </p>
            </article>

            <div className="grid gap-4 lg:grid-cols-2">
              <article className="rounded-2xl border border-line bg-white p-5">
                <h3 className="text-base font-semibold text-foreground">所需文档</h3>
                <div className="mt-3 space-y-2">
                  {result.requiredDocs.map((doc, index) => (
                    <p key={index} className="text-sm text-ink-soft">
                      {index + 1}. {doc}
                    </p>
                  ))}
                </div>
              </article>

              <article className="rounded-2xl border border-line bg-white p-5">
                <h3 className="text-base font-semibold text-foreground">里程碑</h3>
                <div className="mt-3 space-y-2">
                  {result.milestones.map((milestone, index) => (
                    <p key={index} className="text-sm text-ink-soft">
                      {index + 1}. {milestone}
                    </p>
                  ))}
                </div>
              </article>
            </div>

            <article className="rounded-2xl border border-line bg-white p-5">
              <h3 className="text-base font-semibold text-foreground">风险提醒</h3>
              <div className="mt-3 space-y-2">
                {result.riskAlerts.map((risk, index) => (
                  <p key={index} className="text-sm text-ink-soft">
                    - {risk}
                  </p>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-line bg-white p-5">
              <h3 className="text-base font-semibold text-foreground">执行步骤</h3>
              <div className="mt-4 space-y-3">
                {result.steps.map((step, index) => (
                  <div key={step.id} className="rounded-xl border border-line bg-[#fffdfa] p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${priorityStyle(step.priority)}`}
                      >
                        {step.priority}
                      </span>
                      <p className="text-sm font-semibold text-foreground">
                        Step {index + 1} · {step.title}
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-ink-soft">目标：{step.objective}</p>
                    <p className="mt-1 text-sm text-ink-soft">输入：{step.input}</p>
                    <p className="mt-1 text-sm text-ink-soft">产出：{step.output}</p>
                    <p className="mt-1 text-sm text-ink-soft">
                      预计耗时：{step.eta} · 关联模块：
                      <Link
                        href={step.relatedModule}
                        className="ml-1 font-medium text-accent hover:underline"
                      >
                        {step.relatedModule}
                      </Link>
                    </p>
                  </div>
                ))}
              </div>
            </article>
          </section>
        ) : null}
      </main>
    </div>
  );
}
