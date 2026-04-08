"use client";

import Link from "next/link";
import { useState } from "react";

import type { ProjectPackagingResult } from "@/lib/types";

export default function ProjectPage() {
  const [projectText, setProjectText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProjectPackagingResult | null>(null);

  async function packageProject() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/project", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectText,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message ?? "项目封装失败，请稍后重试。");
      }

      setResult(payload as ProjectPackagingResult);
    } catch (packageError) {
      const message =
        packageError instanceof Error ? packageError.message : "项目封装失败，请稍后重试。";
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
              AIPM Workbench · Project Packaging
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              项目封装（P1）
            </h1>
            <p className="mt-3 text-sm leading-7 text-ink-soft">
              把原始项目材料重排成可讲述、可追问、可面试验证的结构化版本。
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
          <label className="block text-sm font-medium text-foreground">项目材料</label>
          <textarea
            value={projectText}
            onChange={(event) => setProjectText(event.target.value)}
            rows={10}
            className="mt-2 w-full rounded-xl border border-line bg-[#fffdfa] px-4 py-3 text-sm text-foreground outline-none focus:border-accent"
            placeholder="示例：我负责某 AI 产品项目，目标用户是... 问题是... 我们采取了... 最终结果..."
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={packageProject}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "封装中..." : "开始封装"}
            </button>
            <button
              type="button"
              onClick={() => {
                setProjectText("");
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
              <h2 className="text-lg font-semibold text-foreground">结构化封装结果</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-line bg-[#fffdfa] p-3">
                  <p className="text-xs text-ink-soft">背景</p>
                  <p className="mt-1 text-sm text-foreground">{result.structure.background}</p>
                </div>
                <div className="rounded-xl border border-line bg-[#fffdfa] p-3">
                  <p className="text-xs text-ink-soft">用户</p>
                  <p className="mt-1 text-sm text-foreground">{result.structure.user}</p>
                </div>
                <div className="rounded-xl border border-line bg-[#fffdfa] p-3">
                  <p className="text-xs text-ink-soft">问题</p>
                  <p className="mt-1 text-sm text-foreground">{result.structure.problem}</p>
                </div>
                <div className="rounded-xl border border-line bg-[#fffdfa] p-3">
                  <p className="text-xs text-ink-soft">方案</p>
                  <p className="mt-1 text-sm text-foreground">{result.structure.solution}</p>
                </div>
                <div className="rounded-xl border border-line bg-[#fffdfa] p-3">
                  <p className="text-xs text-ink-soft">技术</p>
                  <p className="mt-1 text-sm text-foreground">{result.structure.tech}</p>
                </div>
                <div className="rounded-xl border border-line bg-[#fffdfa] p-3">
                  <p className="text-xs text-ink-soft">结果</p>
                  <p className="mt-1 text-sm text-foreground">{result.structure.result}</p>
                </div>
              </div>
            </article>

            <article className="rounded-2xl border border-line bg-white p-5">
              <h3 className="text-base font-semibold text-foreground">60 秒讲述稿</h3>
              <pre className="mt-3 overflow-x-auto rounded-xl border border-line bg-[#fffdfa] p-4 text-sm leading-7 whitespace-pre-wrap text-foreground">
                {result.narrative60s}
              </pre>
            </article>

            <div className="grid gap-4 lg:grid-cols-2">
              <article className="rounded-2xl border border-line bg-white p-5">
                <h3 className="text-base font-semibold text-foreground">面试追问清单</h3>
                <div className="mt-3 space-y-2">
                  {result.interviewFollowUps.map((item, index) => (
                    <p key={index} className="text-sm text-ink-soft">
                      {index + 1}. {item}
                    </p>
                  ))}
                </div>
              </article>

              <article className="rounded-2xl border border-line bg-white p-5">
                <h3 className="text-base font-semibold text-foreground">缺失信息</h3>
                <div className="mt-3 space-y-2">
                  {result.missingInfo.length === 0 ? (
                    <p className="text-sm text-emerald-700">关键信息较完整，可直接进入面试准备。</p>
                  ) : (
                    result.missingInfo.map((item, index) => (
                      <p key={index} className="text-sm text-ink-soft">
                        - {item}
                      </p>
                    ))
                  )}
                </div>
              </article>
            </div>

            <article className="rounded-2xl border border-line bg-white p-5">
              <h3 className="text-base font-semibold text-foreground">下一步建议</h3>
              <div className="mt-3 space-y-2">
                {result.nextActions.map((action, index) => (
                  <p key={index} className="text-sm text-ink-soft">
                    {index + 1}. {action}
                  </p>
                ))}
              </div>
              <div className="mt-4">
                <Link
                  href="/interview"
                  className="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white hover:bg-accent-strong"
                >
                  去面试模块继续
                </Link>
              </div>
            </article>
          </section>
        ) : null}
      </main>
    </div>
  );
}
