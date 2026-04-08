import { diagnoseTask } from "@/lib/diagnose-engine";
import { getTaskTypeLabel } from "@/lib/module-router";
import type { PlannerStep, TaskPlanResult, TaskType } from "@/lib/types";

type PlannerInput = {
  goal: string;
  materials?: string;
  deadline?: string;
};

type StepTemplate = Omit<PlannerStep, "id">;

const BASE_REQUIRED_DOCS = [
  "目标描述（一句话）",
  "当前已有材料清单",
  "阶段验收标准（Done 定义）",
];

const REQUIRED_DOCS_BY_TASK: Record<TaskType, string[]> = {
  resume_optimization: ["简历 PDF/DOCX", "目标岗位 JD", "重点项目素材"],
  project_packaging: ["项目原始记录", "结果数据或口径说明", "关键决策记录"],
  interview_preparation: ["最新简历", "目标公司/岗位信息", "项目追问素材"],
  ai_workflow_guidance: ["当前流程描述", "可用工具清单", "约束条件（时间/质量）"],
  task_planning: ["任务范围边界", "时间与资源限制", "优先级约束"],
  unknown: ["问题背景补充说明"],
};

const STEP_TEMPLATES: Record<TaskType, StepTemplate[]> = {
  resume_optimization: [
    {
      title: "材料收拢与目标对齐",
      objective: "明确目标岗位与简历优化范围，避免无效修改。",
      input: "简历文件 + JD + 个人目标",
      output: "优化范围清单（保留项/必改项）",
      priority: "P0",
      relatedModule: "/resume",
      eta: "20-30 分钟",
    },
    {
      title: "执行规则评审",
      objective: "识别 P0/P1 问题并锁定先改项。",
      input: "上传后的解析文本",
      output: "问题分级清单",
      priority: "P0",
      relatedModule: "/resume",
      eta: "15-20 分钟",
    },
    {
      title: "生成与落地改写",
      objective: "把建议转成可直接替换文案。",
      input: "评审结果 + 原文片段",
      output: "可替换文案 + 完整草稿",
      priority: "P1",
      relatedModule: "/resume",
      eta: "30-45 分钟",
    },
    {
      title: "投递前快检",
      objective: "在投递前做最后一轮风险检查。",
      input: "改写后简历",
      output: "最终投递版本",
      priority: "P1",
      relatedModule: "/interview",
      eta: "15 分钟",
    },
  ],
  project_packaging: [
    {
      title: "提取项目事实",
      objective: "先把项目事实与证据拉齐。",
      input: "项目材料/复盘文档",
      output: "背景、用户、问题、方案、结果原始要点",
      priority: "P0",
      relatedModule: "/project",
      eta: "20-30 分钟",
    },
    {
      title: "结构化封装",
      objective: "形成可讲述的项目叙事主线。",
      input: "原始要点",
      output: "背景 -> 用户 -> 方案 -> 技术 -> 结果",
      priority: "P0",
      relatedModule: "/project",
      eta: "30-40 分钟",
    },
    {
      title: "准备追问素材",
      objective: "补齐面试常见追问证据。",
      input: "结构化项目稿",
      output: "追问清单 + 回答支撑证据",
      priority: "P1",
      relatedModule: "/interview",
      eta: "20-30 分钟",
    },
    {
      title: "反向校验可解释性",
      objective: "确保结果口径与技术选择可解释。",
      input: "项目稿 + 指标口径",
      output: "可复述版本",
      priority: "P1",
      relatedModule: "/project",
      eta: "20 分钟",
    },
  ],
  interview_preparation: [
    {
      title: "锁定面试范围",
      objective: "聚焦岗位核心能力，减少准备噪音。",
      input: "JD + 简历 + 项目稿",
      output: "高优先级面试主题清单",
      priority: "P0",
      relatedModule: "/interview",
      eta: "15-20 分钟",
    },
    {
      title: "生成高频问题",
      objective: "提前暴露高概率追问。",
      input: "简历与项目素材",
      output: "问题清单（含提问意图）",
      priority: "P0",
      relatedModule: "/interview",
      eta: "20 分钟",
    },
    {
      title: "构建回答框架",
      objective: "保证回答有结构、有证据、有结果。",
      input: "问题清单",
      output: "回答框架与证据提示",
      priority: "P1",
      relatedModule: "/interview",
      eta: "30-45 分钟",
    },
    {
      title: "模拟复盘",
      objective: "通过演练修正表达短板。",
      input: "回答草稿",
      output: "二次优化版回答",
      priority: "P1",
      relatedModule: "/workflow",
      eta: "20-30 分钟",
    },
  ],
  ai_workflow_guidance: [
    {
      title: "目标澄清",
      objective: "定义目标、边界和成功标准。",
      input: "目标描述 + 约束",
      output: "可执行目标说明",
      priority: "P0",
      relatedModule: "/workflow",
      eta: "15 分钟",
    },
    {
      title: "流程拆解",
      objective: "将任务拆为可交付步骤。",
      input: "目标说明",
      output: "分阶段步骤与输入输出",
      priority: "P0",
      relatedModule: "/planner",
      eta: "25 分钟",
    },
    {
      title: "AI 协作设计",
      objective: "明确每一步如何调用 AI。",
      input: "步骤清单 + 材料",
      output: "AI 协作脚本与质量门槛",
      priority: "P1",
      relatedModule: "/workflow",
      eta: "30 分钟",
    },
    {
      title: "执行回路",
      objective: "建立迭代与复盘机制。",
      input: "首轮结果",
      output: "优化后的工作流版本",
      priority: "P1",
      relatedModule: "/workflow",
      eta: "20 分钟",
    },
  ],
  task_planning: [
    {
      title: "确认任务边界",
      objective: "避免范围失控，先对齐目标边界。",
      input: "目标描述 + 约束条件",
      output: "任务边界说明",
      priority: "P0",
      relatedModule: "/planner",
      eta: "15 分钟",
    },
    {
      title: "拆解关键里程碑",
      objective: "把目标拆成可验收阶段。",
      input: "任务边界",
      output: "里程碑与阶段产出",
      priority: "P0",
      relatedModule: "/planner",
      eta: "20-30 分钟",
    },
    {
      title: "排序执行优先级",
      objective: "先做收益高且阻塞少的任务。",
      input: "里程碑清单",
      output: "P0/P1/P2 执行序列",
      priority: "P1",
      relatedModule: "/planner",
      eta: "20 分钟",
    },
    {
      title: "定义验收口径",
      objective: "每步都能判断是否完成。",
      input: "任务序列",
      output: "验收标准清单",
      priority: "P1",
      relatedModule: "/workflow",
      eta: "20 分钟",
    },
  ],
  unknown: [
    {
      title: "澄清目标",
      objective: "先把目标说清楚，避免错误开工。",
      input: "当前模糊描述",
      output: "一句话目标 + 截止时间",
      priority: "P0",
      relatedModule: "/diagnose",
      eta: "10 分钟",
    },
    {
      title: "补充最低材料",
      objective: "收集能支撑决策的基础材料。",
      input: "目标说明",
      output: "最小材料包",
      priority: "P0",
      relatedModule: "/planner",
      eta: "20 分钟",
    },
    {
      title: "重新诊断分流",
      objective: "确认下一步进入哪个模块。",
      input: "目标 + 材料",
      output: "模块建议",
      priority: "P1",
      relatedModule: "/diagnose",
      eta: "10 分钟",
    },
  ],
};

function normalizeText(text: string): string {
  return text.replace(/\r/g, "").trim();
}

function buildMilestones(taskType: TaskType): string[] {
  if (taskType === "resume_optimization") {
    return ["完成规则评审", "完成改写稿", "完成投递前快检"];
  }
  if (taskType === "project_packaging") {
    return ["完成项目结构化", "完成 60 秒讲述稿", "完成追问准备"];
  }
  if (taskType === "interview_preparation") {
    return ["完成高频问题清单", "完成回答框架", "完成一轮模拟复盘"];
  }
  if (taskType === "task_planning") {
    return ["完成任务边界定义", "完成里程碑拆解", "完成执行优先级排序"];
  }
  return ["完成目标澄清", "完成步骤设计", "完成首轮执行复盘"];
}

function buildRiskAlerts(taskType: TaskType, materials: string): string[] {
  const alerts: string[] = [];
  const normalized = materials.toLowerCase();

  if (!materials.trim()) {
    alerts.push("当前材料偏少，可能导致输出建议不够贴合。");
  }

  if (taskType === "resume_optimization" && !/jd|岗位|职位|job/i.test(normalized)) {
    alerts.push("缺少目标岗位信息，评审与改写难以定向优化。");
  }

  if (taskType === "project_packaging" && !/结果|提升|增长|降低|%|\d/i.test(normalized)) {
    alerts.push("项目结果证据偏少，面试说服力可能受限。");
  }

  if (taskType === "interview_preparation" && !/项目|案例|经历/i.test(normalized)) {
    alerts.push("素材里项目证据不足，回答深度可能不够。");
  }

  if (alerts.length === 0) {
    alerts.push("当前风险可控，建议按步骤推进并在每步后复盘。");
  }

  return alerts;
}

export function buildTaskPlan(input: PlannerInput): TaskPlanResult {
  const goal = normalizeText(input.goal);
  const materials = normalizeText(input.materials ?? "");
  const diagnosis = diagnoseTask({ goal, materials });
  const taskType = diagnosis.taskType;
  const templates = STEP_TEMPLATES[taskType] ?? STEP_TEMPLATES.unknown;

  const steps: PlannerStep[] = templates.map((template) => ({
    ...template,
    id: crypto.randomUUID(),
  }));

  const requiredDocs = [
    ...BASE_REQUIRED_DOCS,
    ...(REQUIRED_DOCS_BY_TASK[taskType] ?? REQUIRED_DOCS_BY_TASK.unknown),
  ];

  const summary = `已识别当前任务为「${getTaskTypeLabel(taskType)}」，建议从 ${diagnosis.recommendedModule} 模块开始，先完成 P0 步骤再推进 P1。`;

  return {
    summary,
    diagnosedTaskType: taskType,
    diagnosedTaskLabel: getTaskTypeLabel(taskType),
    recommendedRoute: diagnosis.recommendedRoute,
    requiredDocs: [...new Set(requiredDocs)],
    milestones: buildMilestones(taskType),
    riskAlerts: buildRiskAlerts(taskType, materials),
    steps,
  };
}
