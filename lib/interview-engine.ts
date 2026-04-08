import type { InterviewPrepResult, InterviewQuestion } from "@/lib/types";

type InterviewInput = {
  role?: string;
  materials: string;
};

function normalizeText(text: string): string {
  return text.replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim();
}

function splitLines(text: string): string[] {
  return normalizeText(text)
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function pickEvidence(lines: string[], patterns: RegExp[], fallback: string): string {
  const hit = lines.find((line) => patterns.some((pattern) => pattern.test(line)));
  return hit ?? fallback;
}

function riskByEvidence(evidence: string): "High" | "Medium" | "Low" {
  if (/需要补充|暂无|未提供/.test(evidence)) return "High";
  if (/提升|增长|降低|结果|上线|%|\d/.test(evidence)) return "Low";
  return "Medium";
}

function createQuestion(
  question: string,
  intent: string,
  answerFramework: string,
  evidenceHint: string,
): InterviewQuestion {
  return {
    id: crypto.randomUUID(),
    question,
    intent,
    answerFramework,
    evidenceHint,
    riskLevel: riskByEvidence(evidenceHint),
  };
}

export function buildInterviewPrep(input: InterviewInput): InterviewPrepResult {
  const role = input.role?.trim() || "AI 产品经理";
  const text = normalizeText(input.materials);
  const lines = splitLines(text);

  const projectEvidence = pickEvidence(
    lines,
    [/项目/, /负责/, /方案/, /落地/, /上线/],
    "暂无清晰项目证据，请补充项目背景与关键动作。",
  );
  const resultEvidence = pickEvidence(
    lines,
    [/结果/, /提升/, /降低/, /增长/, /节省/, /准确率/, /转化/, /\d+(\.\d+)?\s*%/],
    "暂无量化结果证据，请补充关键指标变化与口径。",
  );
  const modelEvidence = pickEvidence(
    lines,
    [/模型/, /选型/, /llm/i, /agent/i, /rag/i, /gpt/i, /qwen/i],
    "暂无模型选型证据，请补充技术选择理由与替代方案。",
  );
  const userEvidence = pickEvidence(
    lines,
    [/用户/, /客户/, /对象/, /人群/, /需求/, /痛点/],
    "暂无用户与需求证据，请补充目标用户和真实问题。",
  );

  const questions: InterviewQuestion[] = [
    createQuestion(
      "请你用 60 秒介绍一下自己，并说明为什么适合这个岗位。",
      "评估你是否能把经历与岗位要求做直接映射。",
      "背景 -> 关键经历 -> 与岗位匹配点 -> 当前目标。",
      projectEvidence,
    ),
    createQuestion(
      "讲一个你主导或关键参与的 AI 项目，重点说你的决策。",
      "验证你是否具备端到端项目 ownership。",
      "背景/用户问题 -> 方案选择 -> 你的关键动作 -> 结果。",
      projectEvidence,
    ),
    createQuestion(
      "为什么选择这个模型或技术方案？有做过备选对比吗？",
      "验证模型选型能力与技术边界意识。",
      "约束条件 -> 候选方案 -> 对比维度 -> 最终取舍。",
      modelEvidence,
    ),
    createQuestion(
      "你如何确认用户问题真实存在，而不是主观判断？",
      "评估问题定义与需求分析能力。",
      "用户画像 -> 证据来源 -> 问题量化 -> 优先级判断。",
      userEvidence,
    ),
    createQuestion(
      "这个项目最核心的结果是什么？数据口径如何定义？",
      "验证结果可解释性与数据意识。",
      "指标定义 -> 数据来源 -> 统计窗口 -> 结果变化。",
      resultEvidence,
    ),
    createQuestion(
      "如果上线后效果不达预期，你会怎么定位与迭代？",
      "评估问题定位与闭环迭代能力。",
      "症状拆解 -> 假设列表 -> 验证实验 -> 调整路径。",
      "建议准备：失败案例 + 定位过程 + 复盘结论。",
    ),
    createQuestion(
      "你和研发、设计、业务协作时，如何推动跨团队落地？",
      "评估沟通推进能力与项目管理能力。",
      "目标对齐 -> 节点管理 -> 风险前置 -> 结果复盘。",
      "建议准备：一段跨团队推进的真实经历。",
    ),
    createQuestion(
      "你未来 6 个月在 AI PM 方向最想补齐什么能力？",
      "评估成长性与自我认知。",
      "当前短板 -> 学习路径 -> 可衡量里程碑。",
      "建议准备：能力提升计划与可验证成果。",
    ),
  ];

  const highRiskCount = questions.filter((item) => item.riskLevel === "High").length;
  const summary =
    highRiskCount >= 3
      ? "当前面试素材风险较高，建议先补齐项目证据与量化结果，再进入高强度演练。"
      : "当前可进入面试演练阶段，建议优先攻克 High/Medium 风险问题。";

  const selfCheckList = [
    "每个回答是否包含“你做了什么”，而不只是团队做了什么？",
    "每个项目是否能说清楚“为什么这样选”而非只报结论？",
    "每个结果是否能说明口径、来源和时间范围？",
    "是否准备了至少 1 个失败/受挫案例及复盘？",
    "是否能在 60 秒和 3 分钟两种时长下讲同一项目？",
  ];

  const nextActions = [
    "先按风险等级演练：High -> Medium -> Low。",
    "把 High 风险问题改成书面答案，再做口头复述。",
    "如素材不足，先回到项目模块补齐证据再二次生成问题。",
  ];

  return {
    summary,
    role,
    questions,
    selfCheckList,
    nextActions,
  };
}
