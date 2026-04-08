import { getModuleNameByTaskType, getRouteByTaskType, getTaskTypeLabel } from "@/lib/module-router";
import type { DiagnoseResult, TaskType, UserState } from "@/lib/types";

type DiagnoseUrgency = "urgent" | "week" | "normal";
type DiagnoseMaterialLevel = "low" | "medium" | "high";
type DiagnoseBlocker =
  | "unclear_goal"
  | "quality_low"
  | "cannot_express"
  | "need_plan"
  | "need_interview"
  | "none";

type DiagnoseInput = {
  goal: string;
  materials?: string;
  taskHint?: TaskType;
  urgency?: DiagnoseUrgency;
  materialLevel?: DiagnoseMaterialLevel;
  blocker?: DiagnoseBlocker;
};

type TaskRule = {
  taskType: TaskType;
  patterns: RegExp[];
  reason: string;
};

const TASK_RULES: TaskRule[] = [
  {
    taskType: "resume_optimization",
    patterns: [/简历/i, /\bcv\b/i, /履历/i, /投递/i, /岗位/i, /\bjd\b/i, /通过率/i],
    reason: "输入中包含简历/投递相关关键词。",
  },
  {
    taskType: "project_packaging",
    patterns: [/项目封装/i, /项目表达/i, /讲项目/i, /项目复盘/i, /案例包装/i, /背景.{0,8}结果/i],
    reason: "输入中包含项目叙事与封装相关关键词。",
  },
  {
    taskType: "interview_preparation",
    patterns: [/面试/i, /追问/i, /回答框架/i, /自我介绍/i, /mock/i, /反问/i],
    reason: "输入中包含面试准备相关关键词。",
  },
  {
    taskType: "ai_workflow_guidance",
    patterns: [/工作流/i, /workflow/i, /agent/i, /自动化/i, /协作流程/i, /提示词/i, /prompt/i, /mcp/i],
    reason: "输入中包含 AI 协作流程相关关键词。",
  },
  {
    taskType: "task_planning",
    patterns: [/拆解/i, /规划/i, /计划/i, /roadmap/i, /步骤/i, /里程碑/i, /待办/i, /todo/i, /怎么开始/i],
    reason: "输入中包含任务拆解与规划相关关键词。",
  },
];

const BLURRY_GOAL_PATTERNS = [/不清楚/i, /没想清楚/i, /迷茫/i, /不知道/i, /随便看看/i];
const URGENT_PATTERNS = [/今天/i, /明天/i, /马上/i, /尽快/i, /急/i, /本周内/i];
const LOW_QUALITY_PATTERNS = [/不通过/i, /太乱/i, /不够好/i, /逻辑不清/i, /不会写/i, /没有亮点/i];
const PROJECT_EXPRESSION_PATTERNS = [/有项目/i, /不会表达/i, /讲不清/i, /说不明白/i];
const IDEA_PATTERNS = [/功能想法/i, /产品想法/i, /想做/i, /要做/i];
const DECOMPOSE_PATTERNS = [/拆解/i, /优先级/i, /步骤/i, /里程碑/i, /计划/i];

function normalizeInput(input: DiagnoseInput): string {
  return `${input.goal}\n${input.materials ?? ""}`.replace(/\r/g, "").trim().toLowerCase();
}

function hasAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

function toStateLabel(state: UserState): string {
  if (state === "goal_blurry") return "目标模糊";
  if (state === "goal_clear_missing_material") return "目标清晰但缺材料";
  if (state === "has_material_quality_low") return "有材料但质量不足";
  if (state === "near_delivery_fast_opt") return "接近投递，需快速优化";
  if (state === "has_project_cannot_express") return "有项目但不会表达";
  if (state === "feature_idea_not_decomposed") return "有想法但不会拆解";
  return "材料基本可执行";
}

function detectTaskType(text: string, input: DiagnoseInput): {
  taskType: TaskType;
  confidence: number;
  reasoning: string[];
} {
  if (input.taskHint && input.taskHint !== "unknown") {
    return {
      taskType: input.taskHint,
      confidence: 94,
      reasoning: [`已接收入口任务参数：${getTaskTypeLabel(input.taskHint)}。`],
    };
  }

  const scoreMap = new Map<TaskType, number>();
  const reasoningMap = new Map<TaskType, string[]>();

  const taskTypes: TaskType[] = [
    "resume_optimization",
    "project_packaging",
    "interview_preparation",
    "ai_workflow_guidance",
    "task_planning",
  ];

  for (const taskType of taskTypes) {
    scoreMap.set(taskType, 0);
    reasoningMap.set(taskType, []);
  }

  for (const rule of TASK_RULES) {
    const hitCount = rule.patterns.reduce(
      (sum, pattern) => sum + (pattern.test(text) ? 1 : 0),
      0,
    );

    if (hitCount > 0) {
      scoreMap.set(rule.taskType, (scoreMap.get(rule.taskType) ?? 0) + hitCount);
      reasoningMap.get(rule.taskType)?.push(`${rule.reason}（命中 ${hitCount} 项）`);
    }
  }

  const sorted = [...scoreMap.entries()].sort((a, b) => b[1] - a[1]);
  const [top, second] = sorted;
  const topScore = top?.[1] ?? 0;
  const secondScore = second?.[1] ?? 0;

  if (topScore <= 0) {
    return {
      taskType: "unknown",
      confidence: 40,
      reasoning: ["未识别到明确任务关键词，建议先做目标澄清。"],
    };
  }

  const taskType = top?.[0] ?? "unknown";
  const confidence = Math.max(
    45,
    Math.min(95, 55 + (topScore - secondScore) * 12 + topScore * 3),
  );
  const reasoning = reasoningMap.get(taskType) ?? [];

  return {
    taskType,
    confidence,
    reasoning:
      reasoning.length > 0
        ? reasoning
        : ["识别到相关关键词，建议进入对应模块继续处理。"],
  };
}

function detectCurrentState(text: string, input: DiagnoseInput, taskType: TaskType): UserState {
  const goal = input.goal.trim();
  const materials = (input.materials ?? "").trim();

  if (input.blocker === "unclear_goal") {
    return "goal_blurry";
  }

  if (input.urgency === "urgent") {
    return "near_delivery_fast_opt";
  }

  if (input.blocker === "cannot_express") {
    return "has_project_cannot_express";
  }

  if (input.blocker === "need_plan") {
    return "feature_idea_not_decomposed";
  }

  if (input.blocker === "quality_low") {
    return "has_material_quality_low";
  }

  if (input.materialLevel === "low") {
    return "goal_clear_missing_material";
  }

  if (!goal || hasAny(text, BLURRY_GOAL_PATTERNS)) {
    return "goal_blurry";
  }

  if (hasAny(text, URGENT_PATTERNS)) {
    return "near_delivery_fast_opt";
  }

  if (taskType === "project_packaging" && hasAny(text, PROJECT_EXPRESSION_PATTERNS)) {
    return "has_project_cannot_express";
  }

  if (
    (taskType === "task_planning" || taskType === "ai_workflow_guidance") &&
    hasAny(text, IDEA_PATTERNS) &&
    !hasAny(text, DECOMPOSE_PATTERNS)
  ) {
    return "feature_idea_not_decomposed";
  }

  if (goal.length >= 6 && materials.length < 8) {
    return "goal_clear_missing_material";
  }

  if (materials.length >= 8 && hasAny(text, LOW_QUALITY_PATTERNS)) {
    return "has_material_quality_low";
  }

  return "ready_for_execution";
}

function buildNextActions(taskType: TaskType, state: UserState): string[] {
  const commonByState: Record<UserState, string[]> = {
    goal_blurry: [
      "先用一句话写清目标（想达到什么结果、截止时间是什么）。",
      "补充当前已有材料清单，避免无材料直接开工。",
    ],
    goal_clear_missing_material: [
      "先补齐最低必要材料，再进入执行模块。",
      "把材料控制在 1-3 份核心文档，优先高相关内容。",
    ],
    has_material_quality_low: [
      "先处理 P0/P1 关键问题，再做表达层优化。",
      "每条结论尽量补“证据 + 结果”两部分。",
    ],
    near_delivery_fast_opt: [
      "先做 30 分钟快速体检，优先修复高风险项。",
      "完成修复后马上进行一轮定向改写与复核。",
    ],
    has_project_cannot_express: [
      "按“背景 -> 用户 -> 方案 -> 结果”重排项目叙事。",
      "为每个项目准备 1 个可量化结果和 1 个可追问细节。",
    ],
    feature_idea_not_decomposed: [
      "先把目标拆成 3-5 个可执行步骤。",
      "给每一步定义输入、产出和验收标准。",
    ],
    ready_for_execution: [
      "当前材料可执行，建议直接进入推荐模块。",
      "完成第一轮结果后再回到诊断页做下一步规划。",
    ],
  };

  const taskSpecific: Record<TaskType, string> = {
    resume_optimization: "进入简历模块上传 PDF/DOCX，直接启动评审与改写链路。",
    project_packaging: "进入项目模块，补充项目背景、用户、方案、结果四类信息。",
    interview_preparation: "进入面试模块，基于简历/项目生成追问清单和回答框架。",
    ai_workflow_guidance: "进入工作流模块，明确场景、约束、协作步骤与输出格式。",
    task_planning: "进入任务拆解模块，输出步骤顺序、文档清单与执行节奏。",
    unknown: "先做目标澄清，再由系统推荐具体执行模块。",
  };

  return [...commonByState[state], taskSpecific[taskType]];
}

export function diagnoseTask(input: DiagnoseInput): DiagnoseResult {
  const normalized = normalizeInput(input);
  const task = detectTaskType(normalized, input);
  const currentState = detectCurrentState(normalized, input, task.taskType);
  const recommendedRoute = getRouteByTaskType(task.taskType);
  const reasoning = [...task.reasoning];

  if (input.urgency === "week") {
    reasoning.push("时间窗口为 1-2 周，建议优先完成主路径并减少分支任务。");
  }
  if (input.urgency === "normal") {
    reasoning.push("当前不算紧急，可采用“先结构后细节”的稳态推进方式。");
  }
  if (input.materialLevel === "high") {
    reasoning.push("材料基础较完整，可直接进入执行模块。");
  }
  if (input.materialLevel === "medium") {
    reasoning.push("材料部分可用，建议边执行边补证据。");
  }
  if (input.blocker === "need_interview") {
    reasoning.push("你提到的核心阻碍与面试准备相关，建议尽快进入 Interview 模块。");
  }

  return {
    taskType: task.taskType,
    taskTypeLabel: getTaskTypeLabel(task.taskType),
    currentState,
    currentStateLabel: toStateLabel(currentState),
    recommendedModule: getModuleNameByTaskType(task.taskType),
    recommendedRoute,
    confidence: task.confidence,
    reasoning,
    nextActions: buildNextActions(task.taskType, currentState),
  };
}
