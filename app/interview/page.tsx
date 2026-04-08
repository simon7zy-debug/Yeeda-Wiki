"use client";

import Link from "next/link";
import { useState } from "react";

import type { InterviewPrepResult } from "@/lib/types";

function riskStyle(risk: "High" | "Medium" | "Low"): string {
  if (risk === "High") return "border-red-200 bg-red-50 text-red-700";
  if (risk === "Medium") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

export default function InterviewPage() {
  const [role, setRole] = useState("AI 产品经理");
  const [materials, setMaterials] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InterviewPrepResult | null>(null);

  async function generateInterviewPrep() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role,
          materials,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message ?? "面试准备生成失败，请稍后重试。");
      }

      setResult(payload as InterviewPrepResult);
    } catch (prepError) {
      const message =
        prepError instanceof Error ? prepError.message : "面试准备生成失败，请稍后重试。";
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
              AIPM Workbench · Interview Prep
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              面试准备（P1）
            </h1>
            <p className="mt-3 text-sm leading-7 text-ink-soft">
              根据简历与项目素材生成高频追问、回答框架和自检清单。
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
          <label className="block text-sm font-medium text-foreground">目标岗位</label>
          <input
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="mt-2 w-full rounded-xl border border-line bg-[#fffdfa] px-4 py-3 text-sm text-foreground outline-none focus:border-accent"
          />

          <label className="mt-4 block text-sm font-medium text-foreground">
            简历/项目素材
          </label>
          <textarea
            value={materials}
            onChange={(event) => setMaterials(event.target.value)}
            rows={10}
            className="mt-2 w-full rounded-xl border border-line bg-[#fffdfa] px-4 py-3 text-sm text-foreground outline-none focus:border-accent"
            placeholder="粘贴简历摘要、项目描述、关键结果等内容。"
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={generateInterviewPrep}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "生成中..." : "生成面试准备"}
            </button>
            <button
              type="button"
              onClick={() => {
                setMaterials("");
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
              <h2 className="text-lg font-semibold text-foreground">评审摘要</h2>
              <p className="mt-2 text-sm text-ink-soft">{result.summary}</p>
              <p className="mt-2 text-sm text-ink-soft">岗位：{result.role}</p>
            </article>

            <article className="rounded-2xl border border-line bg-white p-5">
              <h3 className="text-base font-semibold text-foreground">高频问题与回答框架</h3>
              <div className="mt-4 space-y-3">
                {result.questions.map((item, index) => (
                  <div key={item.id} className="rounded-xl border border-line bg-[#fffdfa] p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${riskStyle(item.riskLevel)}`}
                      >
                        {item.riskLevel}
                      </span>
                      <p className="text-sm font-semibold text-foreground">
                        Q{index + 1}. {item.question}
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-ink-soft">提问意图：{item.intent}</p>
                    <p className="mt-1 text-sm text-ink-soft">
                      回答框架：{item.answerFramework}
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      证据提示：{item.evidenceHint}
                    </p>
                  </div>
                ))}
              </div>
            </article>

            <div className="grid gap-4 lg:grid-cols-2">
              <article className="rounded-2xl border border-line bg-white p-5">
                <h3 className="text-base font-semibold text-foreground">自检清单</h3>
                <div className="mt-3 space-y-2">
                  {result.selfCheckList.map((item, index) => (
                    <p key={index} className="text-sm text-ink-soft">
                      {index + 1}. {item}
                    </p>
                  ))}
                </div>
              </article>

              <article className="rounded-2xl border border-line bg-white p-5">
                <h3 className="text-base font-semibold text-foreground">下一步建议</h3>
                <div className="mt-3 space-y-2">
                  {result.nextActions.map((item, index) => (
                    <p key={index} className="text-sm text-ink-soft">
                      {index + 1}. {item}
                    </p>
                  ))}
                </div>
              </article>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
