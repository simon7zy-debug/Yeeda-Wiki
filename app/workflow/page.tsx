"use client";

import Link from "next/link";
import { useState } from "react";

import type { WorkflowGuideResult } from "@/lib/types";

export default function WorkflowPage() {
  const [goal, setGoal] = useState("");
  const [materials, setMaterials] = useState("");
  const [constraints, setConstraints] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<WorkflowGuideResult | null>(null);

  async function generateWorkflow() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/workflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          goal,
          materials,
          constraints,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message ?? "工作流建议生成失败，请稍后重试。");
      }

      setResult(payload as WorkflowGuideResult);
    } catch (workflowError) {
      const message =
        workflowError instanceof Error
          ? workflowError.message
          : "工作流建议生成失败，请稍后重试。";
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
              AIPM Workbench · AI Workflow Guidance
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              AI 协作流程（P1）
            </h1>
            <p className="mt-3 text-sm leading-7 text-ink-soft">
              针对你的目标输出 5 阶段协作流程：目标澄清、材料收拢、首稿生成、评审修复、迭代沉淀。
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
            placeholder="示例：我想在一周内完成简历优化 + 项目表达 + 面试准备。"
          />

          <label className="mt-4 block text-sm font-medium text-foreground">
            已有材料（可选）
          </label>
          <textarea
            value={materials}
            onChange={(event) => setMaterials(event.target.value)}
            rows={4}
            className="mt-2 w-full rounded-xl border border-line bg-[#fffdfa] px-4 py-3 text-sm text-foreground outline-none focus:border-accent"
            placeholder="示例：PDF 简历、项目复盘、目标 JD。"
          />

          <label className="mt-4 block text-sm font-medium text-foreground">
            约束条件（可选）
          </label>
          <textarea
            value={constraints}
            onChange={(event) => setConstraints(event.target.value)}
            rows={3}
            className="mt-2 w-full rounded-xl border border-line bg-[#fffdfa] px-4 py-3 text-sm text-foreground outline-none focus:border-accent"
            placeholder="示例：每天只有 1 小时、周五前必须可投递。"
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={generateWorkflow}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "生成中..." : "生成流程建议"}
            </button>
            <button
              type="button"
              onClick={() => {
                setGoal("");
                setMaterials("");
                setConstraints("");
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
              <h2 className="text-lg font-semibold text-foreground">摘要</h2>
              <p className="mt-2 text-sm text-ink-soft">{result.summary}</p>
            </article>

            <article className="rounded-2xl border border-line bg-white p-5">
              <h3 className="text-base font-semibold text-foreground">5 阶段流程</h3>
              <div className="mt-4 space-y-3">
                {result.workflowSteps.map((step) => (
                  <div key={step.stage} className="rounded-xl border border-line bg-[#fffdfa] p-4">
                    <p className="text-sm font-semibold text-foreground">{step.stage}</p>
                    <p className="mt-2 text-sm text-ink-soft">目标：{step.objective}</p>
                    <p className="mt-1 text-sm text-ink-soft">AI 动作：{step.aiAction}</p>
                    <p className="mt-1 text-sm text-ink-soft">输入：{step.requiredInput}</p>
                    <p className="mt-1 text-sm text-ink-soft">输出：{step.expectedOutput}</p>
                    <p className="mt-1 text-sm text-foreground">质量门槛：{step.qualityGate}</p>
                  </div>
                ))}
              </div>
            </article>

            <div className="grid gap-4 lg:grid-cols-2">
              <article className="rounded-2xl border border-line bg-white p-5">
                <h3 className="text-base font-semibold text-foreground">协作规则</h3>
                <div className="mt-3 space-y-2">
                  {result.collaborationRules.map((rule, index) => (
                    <p key={index} className="text-sm text-ink-soft">
                      {index + 1}. {rule}
                    </p>
                  ))}
                </div>
              </article>

              <article className="rounded-2xl border border-line bg-white p-5">
                <h3 className="text-base font-semibold text-foreground">推荐工具组合</h3>
                <div className="mt-3 space-y-2">
                  {result.suggestedTools.map((tool, index) => (
                    <p key={index} className="text-sm text-ink-soft">
                      - {tool}
                    </p>
                  ))}
                </div>
              </article>
            </div>

            <article className="rounded-2xl border border-line bg-white p-5">
              <h3 className="text-base font-semibold text-foreground">下一步动作</h3>
              <div className="mt-3 space-y-2">
                {result.nextActions.map((item, index) => (
                  <p key={index} className="text-sm text-ink-soft">
                    {index + 1}. {item}
                  </p>
                ))}
              </div>
            </article>
          </section>
        ) : null}
      </main>
    </div>
  );
}
