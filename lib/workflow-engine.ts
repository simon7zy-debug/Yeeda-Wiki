import { diagnoseTask } from "@/lib/diagnose-engine";
import type { WorkflowGuideResult, WorkflowStep } from "@/lib/types";

type WorkflowInput = {
  goal: string;
  materials?: string;
  constraints?: string;
};

function normalizeText(text: string): string {
  return text.replace(/\r/g, "").trim();
}

function joinInput(...parts: string[]): string {
  return parts
    .map((part) => normalizeText(part))
    .filter((part) => part.length > 0)
    .join("\n");
}

export function buildWorkflowGuide(input: WorkflowInput): WorkflowGuideResult {
  const goal = normalizeText(input.goal);
  const materials = normalizeText(input.materials ?? "");
  const constraints = normalizeText(input.constraints ?? "");
  const diagnosis = diagnoseTask({ goal, materials });
  const combined = joinInput(goal, materials, constraints);

  const workflowSteps: WorkflowStep[] = [
    {
      stage: "Stage 1 · Clarify",
      objective: "把目标转成可执行定义，明确成功标准。",
      aiAction: "让 AI 输出“目标一句话 + 验收标准 + 截止时间”。",
      requiredInput: goal || "补充目标描述",
      expectedOutput: "可执行目标定义",
      qualityGate: "目标能在一句话内说明“做什么、何时完成、如何判断完成”。",
    },
    {
      stage: "Stage 2 · Gather",
      objective: "收拢最小必要材料，避免信息噪声。",
      aiAction: "让 AI 按任务类型给出“必须材料清单/可选材料清单”。",
      requiredInput: materials || "补充已有材料",
      expectedOutput: "最小材料包",
      qualityGate: "材料能覆盖决策所需信息，且不超过 3 组核心文档。",
    },
    {
      stage: "Stage 3 · Draft",
      objective: "用 AI 生成首版产物或结构草稿。",
      aiAction: `根据诊断结果（${diagnosis.taskTypeLabel}）生成首版输出。`,
      requiredInput: combined || "目标与材料输入",
      expectedOutput: "首版草稿（可评审）",
      qualityGate: "首版输出具备结构完整性，可进行问题定位。",
    },
    {
      stage: "Stage 4 · Review",
      objective: "对首版草稿做问题分级与修复优先级排序。",
      aiAction: "让 AI 按 P0/P1/P2 输出问题，并给出可直接替换建议。",
      requiredInput: "首版草稿",
      expectedOutput: "问题清单 + 修复建议",
      qualityGate: "P0 问题必须全部关闭后再进入下一轮。",
    },
    {
      stage: "Stage 5 · Iterate",
      objective: "基于反馈完成二次优化，并沉淀可复用模板。",
      aiAction: "让 AI 输出优化版 + 模板化提示词 + 下次复用说明。",
      requiredInput: "问题清单 + 修复记录",
      expectedOutput: "可交付版本 + 可复用流程模板",
      qualityGate: "输出已可直接使用，且具备复用价值。",
    },
  ];

  const collaborationRules = [
    "先让 AI 判断任务类型，再进入具体模块，避免盲目生成。",
    "每次只让 AI 处理一个阶段，减少上下文污染。",
    "要求 AI 输出“原因 + 修改建议 + 示例”，不要只要结论。",
    "每轮都保留版本号，便于回滚和对比改进效果。",
  ];

  const suggestedTools = [
    "Diagnose 模块（任务识别与分流）",
    "对应能力模块（Resume/Project/Interview/Planner）",
    "本地文档管理（保留版本与素材）",
  ];

  const nextActions = [
    `先进入推荐模块：${diagnosis.recommendedModule}（${diagnosis.recommendedRoute}）。`,
    "完成首版后回到本页执行 Stage 4/5 的复盘与迭代。",
    "把高质量流程沉淀成你的个人 SOP 模板。",
  ];

  return {
    summary: `已识别当前目标偏向「${diagnosis.taskTypeLabel}」，建议采用 5 阶段 AI 协作流程推进。`,
    workflowSteps,
    collaborationRules,
    suggestedTools,
    nextActions,
  };
}
