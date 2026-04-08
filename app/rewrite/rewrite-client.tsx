"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import type { RewriteResult } from "@/lib/types";

type RewriteResponse = {
  docId: string;
  fileName: string;
  rewrite: RewriteResult;
};

export default function RewriteClient() {
  const searchParams = useSearchParams();
  const docId = searchParams.get("docId");
  const [viewMode, setViewMode] = useState<"analysis" | "delivery">("analysis");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<RewriteResponse | null>(null);

  useEffect(() => {
    async function run() {
      if (!docId) {
        setError("缺少 docId，请返回简历模块重新上传。");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/rewrite?docId=${docId}`);
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.message ?? "加载改写结果失败。");
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
              AIPM 简历改写结果（P1 规则驱动版）
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
              改写结果
            </h1>
            {data ? (
              <p className="mt-2 text-sm text-ink-soft">文件：{data.fileName}</p>
            ) : null}
          </div>
          <div className="flex gap-3">
            <Link
              href={docId ? `/review?docId=${docId}` : "/diagnose?task=resume_optimization"}
              className="inline-flex items-center justify-center rounded-xl border border-line bg-white px-4 py-2 text-sm font-medium text-foreground hover:border-accent hover:text-accent"
            >
              返回评审页
            </Link>
            <Link
              href="/diagnose?task=resume_optimization"
              className="inline-flex items-center justify-center rounded-xl border border-line bg-white px-4 py-2 text-sm font-medium text-foreground hover:border-accent hover:text-accent"
            >
              返回 Diagnose
            </Link>
          </div>
        </div>

        {loading ? (
          <p className="rounded-xl border border-line bg-[#fffdfa] px-4 py-3 text-sm text-ink-soft">
            正在生成改写建议...
          </p>
        ) : null}

        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {data ? (
          <div className="space-y-6">
            <section className="rounded-2xl border border-line bg-white p-5">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setViewMode("analysis")}
                  className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition ${
                    viewMode === "analysis"
                      ? "bg-accent text-white"
                      : "border border-line bg-white text-foreground hover:border-accent hover:text-accent"
                  }`}
                >
                  分析视图
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("delivery")}
                  className={`inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition ${
                    viewMode === "delivery"
                      ? "bg-accent text-white"
                      : "border border-line bg-white text-foreground hover:border-accent hover:text-accent"
                  }`}
                >
                  简历成稿视图
                </button>
              </div>
            </section>

            {viewMode === "analysis" ? (
              <>
                <section className="rounded-2xl border border-line bg-white p-5">
                  <h2 className="text-lg font-semibold text-foreground">可直接替换建议</h2>
                  <div className="mt-4 space-y-3">
                    {data.rewrite.quickFixes.map((item) => (
                      <article key={item.issueId} className="rounded-xl border border-line p-3">
                        <p className="text-xs text-ink-soft">原句 / 原问题</p>
                        <p className="mt-1 text-sm text-foreground">{item.before}</p>
                        <p className="mt-3 text-xs text-ink-soft">建议替换为</p>
                        <p className="mt-1 text-sm font-medium text-foreground">{item.after}</p>
                      </article>
                    ))}
                  </div>
                </section>

                <section className="rounded-2xl border border-line bg-white p-5">
                  <h2 className="text-lg font-semibold text-foreground">项目表达优化示例</h2>
                  <pre className="mt-4 overflow-x-auto rounded-xl border border-line bg-[#fffdfa] p-4 text-sm leading-7 whitespace-pre-wrap text-foreground">
                    {data.rewrite.optimizedProjectSample}
                  </pre>
                </section>

                <section className="rounded-2xl border border-line bg-white p-5">
                  <h2 className="text-lg font-semibold text-foreground">优化后完整版本（分析草稿）</h2>
                  <pre className="mt-4 overflow-x-auto rounded-xl border border-line bg-[#fffdfa] p-4 text-sm leading-7 whitespace-pre-wrap text-foreground">
                    {data.rewrite.fullDraft}
                  </pre>
                </section>
              </>
            ) : (
              <>
                <section className="rounded-2xl border border-line bg-white p-5">
                  <h2 className="text-lg font-semibold text-foreground">简历成稿（可投递视图）</h2>
                  <pre className="mt-4 overflow-x-auto rounded-xl border border-line bg-[#fffdfa] p-4 text-sm leading-7 whitespace-pre-wrap text-foreground">
                    {data.rewrite.resumeDeliveryDraft ?? data.rewrite.fullDraft}
                  </pre>
                </section>

                <section className="rounded-2xl border border-line bg-white p-5">
                  <h2 className="text-lg font-semibold text-foreground">投递前检查清单</h2>
                  <div className="mt-3 space-y-2">
                    {(data.rewrite.deliveryChecklist ?? []).length > 0 ? (
                      (data.rewrite.deliveryChecklist ?? []).map((item, index) => (
                        <p key={index} className="text-sm text-ink-soft">
                          {index + 1}. {item}
                        </p>
                      ))
                    ) : (
                      <p className="text-sm text-ink-soft">
                        建议至少检查：项目闭环、量化结果、数据口径、优势证据映射。
                      </p>
                    )}
                  </div>
                </section>
              </>
            )}

            <section className="rounded-2xl border border-line bg-white p-5">
              <h2 className="text-lg font-semibold text-foreground">下一步建议</h2>
              <div className="mt-3 space-y-2">
                <p className="text-sm text-ink-soft">
                  1. 把“可直接替换建议”合并进你的简历，并生成投递版文件。
                </p>
                <p className="text-sm text-ink-soft">
                  2. 进入项目模块，把核心项目整理成“可讲述 + 可追问”版本。
                </p>
                <p className="text-sm text-ink-soft">
                  3. 进入面试模块，基于新版本简历生成高频问答框架。
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/diagnose?task=project_packaging&goal=简历改写完成，下一步封装项目表达"
                  className="inline-flex items-center justify-center rounded-xl border border-line bg-white px-5 py-3 text-sm font-medium text-foreground hover:border-accent hover:text-accent"
                >
                  下一步：封装项目
                </Link>
                <Link
                  href="/diagnose?task=interview_preparation&goal=简历改写完成，下一步准备面试问题与回答"
                  className="inline-flex items-center justify-center rounded-xl border border-line bg-white px-5 py-3 text-sm font-medium text-foreground hover:border-accent hover:text-accent"
                >
                  下一步：准备面试
                </Link>
              </div>
            </section>
          </div>
        ) : null}
      </main>
    </div>
  );
}
