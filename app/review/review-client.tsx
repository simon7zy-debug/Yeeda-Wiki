"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import ResumeReferenceRail from "@/components/resume/reference-rail";
import type { ReviewIssue, ReviewResult, Severity } from "@/lib/types";

type ReviewResponse = {
  docId: string;
  fileName: string;
  sourceLines: string[];
  review: ReviewResult;
};

const PRIORITY_ORDER: Severity[] = ["P0", "P1", "P2"];

const PRIORITY_META: Record<
  Severity,
  {
    label: string;
    sectionClass: string;
    badgeClass: string;
    hint: string;
  }
> = {
  P0: {
    label: "P0（立即修复）",
    sectionClass: "border-red-200 bg-red-50/50",
    badgeClass: "border-red-200 bg-red-50 text-red-700",
    hint: "优先修复，会直接影响投递通过率。",
  },
  P1: {
    label: "P1（本轮修复）",
    sectionClass: "border-amber-200 bg-amber-50/50",
    badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
    hint: "影响说服力和追问表现，建议本轮处理。",
  },
  P2: {
    label: "P2（精修优化）",
    sectionClass: "border-sky-200 bg-sky-50/50",
    badgeClass: "border-sky-200 bg-sky-50 text-sky-700",
    hint: "不影响主流程，但会影响阅读体验。",
  },
};

function groupIssuesByPriority(issues: ReviewIssue[]): Record<Severity, ReviewIssue[]> {
  return {
    P0: issues.filter((issue) => issue.severity === "P0"),
    P1: issues.filter((issue) => issue.severity === "P1"),
    P2: issues.filter((issue) => issue.severity === "P2"),
  };
}

export default function ReviewClient() {
  const searchParams = useSearchParams();
  const docId = searchParams.get("docId");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ReviewResponse | null>(null);
  const [activeLine, setActiveLine] = useState<number | null>(null);

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

  const groupedIssues = useMemo(
    () => (data ? groupIssuesByPriority(data.review.issues) : null),
    [data],
  );

  useEffect(() => {
    if (!data) return;
    const firstAnchoredIssue = data.review.issues.find((item) => item.sourceAnchor?.line);
    setActiveLine(firstAnchoredIssue?.sourceAnchor?.line ?? null);
  }, [data]);

  const hasIssues = (data?.review.issues.length ?? 0) > 0;

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-8">
      <main className="mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="rounded-3xl border border-line bg-panel p-6 shadow-lg sm:p-10">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium tracking-wide text-ink-soft">
                AIPM 简历评审结果（证据驱动版）
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
                <h2 className="text-xl font-semibold text-foreground">问题分组（P0 / P1 / P2）</h2>
                {!hasIssues ? (
                  <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    当前未检测到明显问题，建议继续优化表达细节。
                  </p>
                ) : (
                  <div className="mt-4 space-y-4">
                    {PRIORITY_ORDER.map((severity) => {
                      const issues = groupedIssues?.[severity] ?? [];
                      const meta = PRIORITY_META[severity];

                      if (issues.length === 0) return null;

                      return (
                        <section
                          key={severity}
                          className={`rounded-2xl border p-4 ${meta.sectionClass}`}
                        >
                          <div className="mb-3 flex flex-wrap items-center gap-3">
                            <span
                              className={`inline-flex rounded-md border px-2 py-0.5 text-xs font-semibold ${meta.badgeClass}`}
                            >
                              {meta.label}
                            </span>
                            <p className="text-xs text-ink-soft">
                              {issues.length} 项 · {meta.hint}
                            </p>
                          </div>

                          <div className="space-y-3">
                            {issues.map((issue) => (
                              <article
                                key={issue.id}
                                className="rounded-xl border border-line bg-white p-4"
                              >
                                <h3 className="text-base font-semibold text-foreground">
                                  {issue.issueSummary}
                                </h3>
                                <p className="mt-2 text-sm leading-7 text-ink-soft">
                                  为什么是问题：{issue.whyProblem}
                                </p>
                                <p className="mt-1 text-sm leading-7 text-ink-soft">
                                  违反规则：{issue.violatedRule}（{issue.ruleId}）
                                </p>

                                <div className="mt-3 rounded-lg border border-line bg-[#fffdfa] p-3">
                                  <p className="text-xs font-semibold text-ink-soft">直接替换建议</p>
                                  <p className="mt-1 text-sm text-ink-soft">
                                    原句：{issue.directReplacement.before}
                                  </p>
                                  <p className="mt-1 text-sm font-medium text-foreground">
                                    替换：{issue.directReplacement.after}
                                  </p>
                                </div>

                                <div className="mt-3 rounded-lg border border-line bg-white p-3">
                                  <p className="text-xs font-semibold text-ink-soft">Why This Matters</p>
                                  <p className="mt-1 text-sm text-ink-soft">
                                    HR 筛选风险：{issue.whyThisMatters.hrScreeningRisk}
                                  </p>
                                  <p className="mt-1 text-sm text-ink-soft">
                                    面试追问风险：{issue.whyThisMatters.interviewFollowUpRisk}
                                  </p>
                                  <p className="mt-1 text-sm text-ink-soft">
                                    可信度风险：{issue.whyThisMatters.credibilityRisk}
                                  </p>
                                </div>

                                {issue.sourceAnchor ? (
                                  <button
                                    type="button"
                                    className="mt-3 inline-flex items-center justify-center rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-medium text-foreground hover:border-accent hover:text-accent"
                                    onClick={() => setActiveLine(issue.sourceAnchor?.line ?? null)}
                                  >
                                    定位原文：第 {issue.sourceAnchor.line} 行
                                  </button>
                                ) : null}
                              </article>
                            ))}
                          </div>
                        </section>
                      );
                    })}
                  </div>
                )}
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
            </>
          ) : null}
        </section>

        <aside className="space-y-4">
          <ResumeReferenceRail title="评审参考栏" />
          {data ? (
            <section className="rounded-2xl border border-line bg-white p-5 lg:sticky lg:top-[27rem]">
              <h2 className="text-sm font-semibold text-foreground">原文定位（高亮映射）</h2>
              <p className="mt-2 text-xs text-ink-soft">
                点击左侧问题卡的“定位原文”可快速跳到对应句子。
              </p>
              <div className="mt-3 max-h-[360px] overflow-auto rounded-lg border border-line bg-[#fffdfa] p-2">
                {data.sourceLines.length === 0 ? (
                  <p className="px-2 py-1 text-xs text-ink-soft">暂无可展示的原文。</p>
                ) : (
                  data.sourceLines.map((line, index) => {
                    const lineNumber = index + 1;
                    const isActive = activeLine === lineNumber;
                    return (
                      <p
                        key={`${lineNumber}-${line.slice(0, 12)}`}
                        className={`rounded px-2 py-1 text-xs leading-6 ${
                          isActive
                            ? "bg-amber-100 text-foreground"
                            : "text-ink-soft hover:bg-amber-50"
                        }`}
                      >
                        <span className="mr-2 inline-block w-7 text-[10px] text-ink-soft">
                          {lineNumber}
                        </span>
                        {line}
                      </p>
                    );
                  })
                )}
              </div>
            </section>
          ) : null}
        </aside>
      </main>
    </div>
  );
}
