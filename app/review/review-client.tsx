"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import type { ReviewResult } from "@/lib/types";

type ReviewResponse = {
  docId: string;
  fileName: string;
  review: ReviewResult;
};

function severityStyle(severity: "P0" | "P1" | "P2"): string {
  if (severity === "P0") return "border-red-200 bg-red-50 text-red-700";
  if (severity === "P1") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-sky-200 bg-sky-50 text-sky-700";
}

export default function ReviewClient() {
  const searchParams = useSearchParams();
  const docId = searchParams.get("docId");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ReviewResponse | null>(null);

  useEffect(() => {
    async function run() {
      if (!docId) {
        setError("缺少 docId，请返回简历模块重新上传。");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/review?docId=${docId}`);
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.message ?? "加载评审结果失败。");
        }
        setData(payload);
      } catch (fetchError) {
        const message =
          fetchError instanceof Error ? fetchError.message : "加载失败，请重试。";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    run();
  }, [docId]);

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-8">
      <main className="mx-auto w-full max-w-5xl rounded-3xl border border-line bg-panel p-6 shadow-lg sm:p-10">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium tracking-wide text-ink-soft">
              AIPM 简历评审结果（P1 规则评审版）
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              评审结果
            </h1>
            {data ? (
              <p className="mt-2 text-sm text-ink-soft">文件：{data.fileName}</p>
            ) : null}
          </div>
          <Link
            href="/diagnose?task=resume_optimization"
            className="inline-flex items-center justify-center rounded-xl border border-line bg-white px-4 py-2 text-sm font-medium text-foreground hover:border-accent hover:text-accent"
          >
            返回 Diagnose
          </Link>
        </div>

        {loading ? (
          <p className="rounded-xl border border-line bg-[#fffdfa] px-4 py-3 text-sm text-ink-soft">
            正在生成评审结果...
          </p>
        ) : null}

        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {data ? (
          <>
            <section className="grid gap-4 md:grid-cols-[220px_1fr]">
              <div className="rounded-2xl border border-line bg-[#fff7ef] p-5">
                <p className="text-xs tracking-wide text-ink-soft">总分</p>
                <p className="mt-2 text-5xl font-semibold text-accent">
                  {data.review.totalScore}
                </p>
                <p className="mt-1 text-sm text-ink-soft">/ 100</p>
              </div>
              <div className="rounded-2xl border border-line bg-white p-5">
                <p className="text-sm text-ink-soft">{data.review.summary}</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {data.review.roleScores.map((item) => (
                    <article
                      key={item.role}
                      className="rounded-xl border border-line bg-[#fcfbf8] p-3"
                    >
                      <p className="text-xs text-ink-soft">{item.role}</p>
                      <p className="mt-1 text-2xl font-semibold text-foreground">
                        {item.score}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-ink-soft">
                        {item.summary}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section className="mt-8">
              <h2 className="text-xl font-semibold text-foreground">问题列表（P0 / P1 / P2）</h2>
              <div className="mt-4 space-y-3">
                {data.review.issues.length === 0 ? (
                  <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    当前未检测到明显问题，建议继续优化表达细节。
                  </p>
                ) : (
                  data.review.issues.map((issue) => (
                    <article
                      key={issue.id}
                      className="rounded-2xl border border-line bg-white p-4"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${severityStyle(issue.severity)}`}
                        >
                          {issue.severity}
                        </span>
                        <h3 className="text-base font-semibold text-foreground">
                          {issue.title}
                        </h3>
                      </div>
                      <p className="mt-2 text-sm leading-7 text-ink-soft">
                        原因：{issue.reason}
                      </p>
                      <p className="mt-1 text-sm leading-7 text-ink-soft">
                        命中规则：{issue.hitRule}
                      </p>
                      <p className="mt-1 text-sm leading-7 text-ink-soft">
                        规则编号：{issue.ruleId}
                      </p>
                      {issue.evidence ? (
                        <p className="mt-1 text-sm leading-7 text-ink-soft">
                          命中证据：{issue.evidence}
                        </p>
                      ) : null}
                      <p className="mt-1 text-sm leading-7 text-foreground">
                        建议：{issue.suggestion}
                      </p>
                    </article>
                  ))
                )}
              </div>
            </section>

            <div className="mt-8">
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/rewrite?docId=${data.docId}`}
                  className="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong"
                >
                  查看改写结果
                </Link>
                <Link
                  href="/diagnose?task=project_packaging&goal=简历评审完成，下一步想把项目封装成可面试表达"
                  className="inline-flex items-center justify-center rounded-xl border border-line bg-white px-5 py-3 text-sm font-medium text-foreground hover:border-accent hover:text-accent"
                >
                  下一步：封装项目
                </Link>
                <Link
                  href="/diagnose?task=interview_preparation&goal=简历评审完成，下一步准备面试追问与回答框架"
                  className="inline-flex items-center justify-center rounded-xl border border-line bg-white px-5 py-3 text-sm font-medium text-foreground hover:border-accent hover:text-accent"
                >
                  下一步：准备面试
                </Link>
              </div>
            </div>

            <section className="mt-6 rounded-2xl border border-line bg-white p-5">
              <h2 className="text-lg font-semibold text-foreground">下一步建议</h2>
              <div className="mt-3 space-y-2">
                <p className="text-sm text-ink-soft">
                  1. 先进入改写页，关闭所有 P0/P1 问题并生成可替换文案。
                </p>
                <p className="text-sm text-ink-soft">
                  2. 改写完成后进入项目模块，补齐“背景-用户-方案-结果”叙事闭环。
                </p>
                <p className="text-sm text-ink-soft">
                  3. 最后进入面试模块，把关键项目转成高频问答框架。
                </p>
              </div>
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}
