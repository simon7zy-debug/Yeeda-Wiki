import type { ProjectPackagingResult } from "@/lib/types";

type ProjectInput = {
  projectText: string;
};

function normalizeText(text: string): string {
  return text.replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim();
}

function splitLines(text: string): string[] {
  return normalizeText(text)
    .split(/[\n。；;]+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function shortLine(line: string, maxLen = 120): string {
  if (line.length <= maxLen) return line;
  return `${line.slice(0, maxLen - 1)}…`;
}

function pickField(
  lines: string[],
  patterns: RegExp[],
  fallback: string,
  options?: {
    exclude?: RegExp[];
  },
): { value: string; hit: boolean } {
  const candidates = lines.filter((line) =>
    patterns.some((pattern) => pattern.test(line)),
  );
  const matched =
    candidates.find(
      (line) => !(options?.exclude ?? []).some((pattern) => pattern.test(line)),
    ) ?? candidates[0];
  if (!matched) {
    return { value: fallback, hit: false };
  }
  return { value: shortLine(matched), hit: true };
}

export function buildProjectPackaging(input: ProjectInput): ProjectPackagingResult {
  const rawText = normalizeText(input.projectText);
  const lines = splitLines(rawText);

  const background = pickField(
    lines,
    [/背景/, /场景/, /业务/, /目标/, /现状/],
    "需要补充：项目背景与业务上下文是什么，为什么现在必须解决。",
  );
  const user = pickField(
    lines,
    [/用户/, /客户/, /对象/, /人群/],
    "需要补充：目标用户是谁，用户规模与典型场景是什么。",
  );
  const problem = pickField(
    lines,
    [/问题/, /痛点/, /挑战/, /瓶颈/, /低效/],
    "需要补充：用户或业务当前的关键问题，以及不解决的代价。",
  );
  const solution = pickField(
    lines,
    [/方案/, /策略/, /设计/, /搭建/, /实现/, /落地/, /优化/],
    "需要补充：你提出了什么方案，关键动作和决策依据是什么。",
  );
  const tech = pickField(
    lines,
    [/模型/, /llm/i, /agent/i, /rag/i, /技术/, /架构/, /接口/, /pipeline/i],
    "需要补充：关键技术路线、模型选择原因以及边界权衡。",
  );
  const result = pickField(
    lines,
    [/结果/, /提升/, /降低/, /增长/, /节省/, /转化/, /准确率/, /\d+(\.\d+)?\s*%/, /上线/],
    "需要补充：量化结果、统计口径与时间范围。",
    {
      exclude: [/负责/, /设计/, /推进/, /搭建/],
    },
  );

  const missingInfo: string[] = [];
  if (!background.hit) missingInfo.push("背景与业务上下文");
  if (!user.hit) missingInfo.push("目标用户定义");
  if (!problem.hit) missingInfo.push("问题与痛点证据");
  if (!solution.hit) missingInfo.push("方案动作与决策依据");
  if (!tech.hit) missingInfo.push("技术路线与模型选择理由");
  if (!result.hit) missingInfo.push("量化结果与数据口径");

  const narrative60s = [
    "我负责了一个 AI 产品项目，从问题定义到上线复盘全流程推进。",
    `先说背景：${background.value}`,
    `目标用户是：${user.value}`,
    `核心问题在于：${problem.value}`,
    `我采取的方案是：${solution.value}`,
    `技术层面关键点是：${tech.value}`,
    `最终结果是：${result.value}`,
  ].join("\n");

  const interviewFollowUps = [
    "你为什么判断这个问题优先级最高？",
    "为什么选择当前模型/技术路线，而不是其他方案？",
    "如果核心指标未达标，你会如何定位问题并调整？",
    "这个项目里你个人最关键的贡献是什么？",
  ];

  const nextActions = [
    "先补齐 missingInfo 中的高优先级项（尤其是结果口径与决策依据）。",
    "把 60 秒讲述稿扩展成 3 分钟深度版，用于面试追问场景。",
    "进入面试模块生成追问清单并准备回答框架。",
  ];

  return {
    structure: {
      background: background.value,
      user: user.value,
      problem: problem.value,
      solution: solution.value,
      tech: tech.value,
      result: result.value,
    },
    narrative60s,
    interviewFollowUps,
    missingInfo,
    nextActions,
  };
}
