import type {
  RewriteResult,
  RewriteSuggestion,
  ReviewIssue,
  ReviewResult,
  RoleKey,
  RoleScore,
  Severity,
} from "@/lib/types";

type RuleInput = {
  ruleId: string;
  severity: Severity;
  title: string;
  reason: string;
  suggestion: string;
  hitRule: string;
  evidence?: string;
};

const SEVERITY_PENALTY: Record<Severity, number> = {
  P0: 14,
  P1: 9,
  P2: 5,
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

function hasAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

function firstMatchLine(lines: string[], patterns: RegExp[]): string | undefined {
  return lines.find((line) => hasAny(line, patterns));
}

function splitProjectBlocks(text: string): string[] {
  const blocks = normalizeText(text)
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0);

  const projectLike = blocks.filter((block) =>
    /(项目|系统|平台|产品|方案|负责|上线|模型|agent|改版|优化)/i.test(block),
  );

  if (projectLike.length > 0) return projectLike;
  return blocks.length > 0 ? blocks : [normalizeText(text)];
}

function findResultLine(lines: string[]): string | undefined {
  const numericResult = lines.find((line) => {
    const hasMetric =
      /(\d+(\.\d+)?\s*%|\d+(\.\d+)?\s*(倍|万|千|天|小时|分钟)|提升|降低|增长|节省|采纳率|准确率|转化)/.test(
        line,
      );
    const isContextOnly = /(背景|目标|场景)/.test(line);
    return hasMetric && !isContextOnly;
  });

  if (numericResult) return numericResult;

  return lines.find((line) => {
    const hasResultSignal = /(上线|提升|降低|增长|节省|采纳率|准确率|转化|效率|成本|\d+(\.\d+)?\s*%)/.test(
      line,
    );
    const isContextOnly = /(背景|目标|场景)/.test(line);
    return hasResultSignal && !isContextOnly;
  });
}

function shortLine(line: string, maxLen = 120): string {
  if (line.length <= maxLen) return line;
  return `${line.slice(0, maxLen - 1)}…`;
}

function pushIssue(issues: ReviewIssue[], input: RuleInput): void {
  issues.push({
    id: crypto.randomUUID(),
    ruleId: input.ruleId,
    severity: input.severity,
    title: input.title,
    reason: input.reason,
    suggestion: input.suggestion,
    hitRule: input.hitRule,
    evidence: input.evidence,
  });
}

function detectRepeatedPrefixes(lines: string[]): { prefix: string; sample: string; count: number }[] {
  const map = new Map<string, { count: number; sample: string }>();
  for (const line of lines) {
    const normalized = line.replace(/[^\p{L}\p{N}]/gu, "");
    if (normalized.length < 12) continue;
    const prefix = normalized.slice(0, 10);
    const current = map.get(prefix);
    if (current) {
      current.count += 1;
    } else {
      map.set(prefix, {
        count: 1,
        sample: line,
      });
    }
  }

  return [...map.entries()]
    .filter(([, value]) => value.count >= 3)
    .map(([prefix, value]) => ({ prefix, sample: value.sample, count: value.count }));
}

function detectDuplicatedLongLines(lines: string[]): { line: string; count: number }[] {
  const map = new Map<string, { count: number; line: string }>();
  for (const line of lines) {
    const normalized = line
      .replace(/\s+/g, "")
      .replace(/[，。,.!?！？；;:：]/g, "");
    if (normalized.length < 14) continue;
    const current = map.get(normalized);
    if (current) {
      current.count += 1;
    } else {
      map.set(normalized, { count: 1, line });
    }
  }

  return [...map.values()].filter((item) => item.count >= 2);
}

function buildRuleIssues(text: string): ReviewIssue[] {
  const issues: ReviewIssue[] = [];
  const lines = splitLines(text);
  const lineText = lines.join("\n");
  const blocks = splitProjectBlocks(text);

  const backgroundPatterns = [/背景/, /场景/, /用户/, /业务/, /目标/, /问题/];
  const actionPatterns = [/负责/, /主导/, /设计/, /搭建/, /实现/, /推进/, /落地/, /优化/];
  const resultPatterns = [
    /结果/,
    /上线/,
    /提升/,
    /降低/,
    /增长/,
    /节省/,
    /采纳率/,
    /准确率/,
    /转化/,
    /\d+(\.\d+)?\s*%/,
    /\d+(\.\d+)?\s*(倍|万|千|天|小时|分钟)/,
  ];

  const completeProjectCount = blocks.filter((block) => {
    const hasBackground = hasAny(block, backgroundPatterns);
    const hasAction = hasAny(block, actionPatterns);
    const hasResult = hasAny(block, resultPatterns);
    return hasBackground && hasAction && hasResult;
  }).length;

  const globalClosure =
    hasAny(lineText, backgroundPatterns) &&
    hasAny(lineText, actionPatterns) &&
    hasAny(lineText, resultPatterns);

  if (completeProjectCount === 0 && !globalClosure) {
    const evidence =
      firstMatchLine(lines, actionPatterns) ??
      firstMatchLine(lines, backgroundPatterns) ??
      lines[0];
    pushIssue(issues, {
      ruleId: "R1",
      severity: "P0",
      title: "项目表达不完整",
      reason: "未形成“背景 -> 做了什么 -> 结果”的完整闭环。",
      suggestion:
        "每个核心项目补齐三段式表达：背景（用户与问题）-> 行动（你的关键动作）-> 结果（量化变化）。",
      hitRule: "项目必须完整表达：背景 -> 做了什么 -> 结果",
      evidence: evidence ? shortLine(evidence) : undefined,
    });
  }

  const toolAsAbilityPatterns = [
    /(熟练|精通|擅长|会用).{0,8}(gpt|chatgpt|llm|ai工具|提示词)/i,
  ];
  const toolLine = firstMatchLine(lines, toolAsAbilityPatterns);
  if (toolLine) {
    pushIssue(issues, {
      ruleId: "R2",
      severity: "P1",
      title: "工具描述替代能力表达",
      reason: "文本中出现“会用某工具”式表达，能力呈现不够扎实。",
      suggestion:
        "改成“我如何设计策略、如何落地、结果如何变化”，避免把工具名当能力结论。",
      hitRule: "工具 ≠ 能力",
      evidence: shortLine(toolLine),
    });
  }

  const strengthLine = firstMatchLine(lines, [/(优势|擅长|能力强|精通|熟悉)/]);
  if (strengthLine) {
    const index = lines.findIndex((line) => line === strengthLine);
    const context = lines.slice(Math.max(0, index - 2), index + 3).join("\n");
    const hasExperienceSupport = /(项目|负责|落地|上线|结果|提升|降低|20\d{2}|指标)/.test(context);
    if (!hasExperienceSupport) {
      pushIssue(issues, {
        ruleId: "R3",
        severity: "P1",
        title: "优势缺少经历支撑",
        reason: "出现了主观能力表述，但附近缺少可验证的项目经历或结果证据。",
        suggestion:
          "把“优势”改成“在哪个项目做了什么动作，产生了什么结果”。",
        hitRule: "优势必须有经历支撑",
        evidence: shortLine(strengthLine),
      });
    }
  }

  const starLine = firstMatchLine(lines, [
    /【\s*[Ss]\s*】/,
    /【\s*[Tt]\s*】/,
    /【\s*[Aa]\s*】/,
    /【\s*[Rr]\s*】/,
    /\bSTAR\b/,
  ]);
  if (starLine) {
    pushIssue(issues, {
      ruleId: "R4",
      severity: "P1",
      title: "检测到 STAR 模板化标记",
      reason: "文本中出现 STAR 标签或对应结构标记。",
      suggestion: "移除模板标签，改成自然语言叙述项目逻辑。",
      hitRule: "不允许写【S】【T】【A】【R】",
      evidence: shortLine(starLine),
    });
  }

  const repeatedPrefixes = detectRepeatedPrefixes(lines);
  if (repeatedPrefixes.length > 0) {
    pushIssue(issues, {
      ruleId: "R5",
      severity: "P2",
      title: "多项目句式重复度偏高",
      reason: "检测到多段描述以高度相似的句式开头，影响阅读辨识度。",
      suggestion: "按项目类型区分叙述角度，避免每段都从同样句式起笔。",
      hitRule: "不同项目不能同一套句式",
      evidence: shortLine(
        `重复前缀样例：${repeatedPrefixes[0]?.sample ?? ""}（重复 ${repeatedPrefixes[0]?.count ?? 0} 次）`,
      ),
    });
  }

  const duplicatedLines = detectDuplicatedLongLines(lines);
  if (duplicatedLines.length > 0) {
    pushIssue(issues, {
      ruleId: "R6",
      severity: "P2",
      title: "经历内容存在重复",
      reason: "检测到多个长句重复出现，可能导致工作经历与项目经历信息重叠。",
      suggestion: "明确区分“工作经历”与“项目经历”层级，避免重复描述同一句事实。",
      hitRule: "工作经历与项目经历不能重复",
      evidence: shortLine(
        `重复样例：${duplicatedLines[0]?.line ?? ""}（出现 ${duplicatedLines[0]?.count ?? 0} 次）`,
      ),
    });
  }

  const hasQuantResult = hasAny(lineText, resultPatterns);
  const hasDataExplain = hasAny(lineText, [
    /来源/,
    /口径/,
    /计算/,
    /统计/,
    /样本/,
    /埋点/,
    /日志/,
    /评测/,
    /数据集/,
    /N=/i,
    /A\/B/i,
  ]);
  if (hasQuantResult && !hasDataExplain) {
    const metricLine = findResultLine(lines) ?? firstMatchLine(lines, resultPatterns);
    pushIssue(issues, {
      ruleId: "R7",
      severity: "P1",
      title: "数据结果缺少解释口径",
      reason: "出现了量化结果，但未说明数据来源或计算口径。",
      suggestion: "补充“数据来源 + 统计口径 + 时间范围”，让结果可解释。",
      hitRule: "数据必须可解释：怎么算的、来源是什么",
      evidence: metricLine ? shortLine(metricLine) : undefined,
    });
  }

  const englishExplainLine = firstMatchLine(lines, [/[A-Za-z]{3,}\s*[（(][^）)]{2,}[）)]/]);
  if (englishExplainLine) {
    pushIssue(issues, {
      ruleId: "E1",
      severity: "P2",
      title: "英文术语括号解释较重",
      reason: "检测到“英文术语 + 括号解释”表达，不够自然。",
      suggestion: "改为中文自然语言：写清动作、场景和作用即可。",
      hitRule: "表达规则：英文 + 括号解释 -> 自然语言表达",
      evidence: shortLine(englishExplainLine),
    });
  }

  const capabilityChecks: Array<{ name: string; patterns: RegExp[] }> = [
    { name: "模型选型能力", patterns: [/模型/, /选型/, /Qwen/i, /GPT/i, /SFT/i] },
    { name: "场景判断能力", patterns: [/场景/, /适用/, /边界/, /约束/] },
    { name: "用户需求拆解", patterns: [/需求/, /拆解/, /优先级/, /用户故事/, /痛点/] },
    { name: "技术边界理解", patterns: [/技术边界/, /trade-?off/i, /成本/, /性能/, /时延/] },
    { name: "数据评估能力", patterns: [/评估/, /评测/, /指标/, /badcase/i, /采纳率/] },
  ];

  const missingCapabilities = capabilityChecks
    .filter((item) => !hasAny(lineText, item.patterns))
    .map((item) => item.name);

  if (missingCapabilities.length >= 2) {
    pushIssue(issues, {
      ruleId: "A1",
      severity: missingCapabilities.length >= 3 ? "P1" : "P2",
      title: "AI PM 核心能力覆盖不足",
      reason: "简历中与 AI PM 相关的能力证据覆盖不均衡。",
      suggestion: `优先补充这些能力证据：${missingCapabilities.join("、")}。`,
      hitRule: "AI PM 核心能力：模型选型 / 场景判断 / 需求拆解 / 技术边界 / 数据评估",
      evidence: `缺失能力项：${missingCapabilities.join("、")}`,
    });
  }

  const focusChecks: Array<{ name: string; patterns: RegExp[] }> = [
    { name: "用户是谁", patterns: [/用户/, /客户/, /对象/, /人群/] },
    { name: "问题是否真实", patterns: [/问题/, /痛点/, /瓶颈/, /现状/] },
    { name: "为什么用 AI", patterns: [/为什么用\s*AI/i, /AI/, /智能/, /自动化/] },
    { name: "为什么选这个模型", patterns: [/选型/, /模型/, /Qwen/i, /GPT/i] },
    { name: "是否有方案对比", patterns: [/对比/, /备选/, /A\/B/i, /多方案/] },
    { name: "结果是否量化", patterns: resultPatterns },
  ];

  const missingFocus = focusChecks
    .filter((item) => !hasAny(lineText, item.patterns))
    .map((item) => item.name);

  if (missingFocus.length >= 2) {
    pushIssue(issues, {
      ruleId: "A2",
      severity: missingFocus.length >= 4 ? "P1" : "P2",
      title: "项目评审重点覆盖不足",
      reason: "项目叙述未覆盖关键评审点，影响说服力。",
      suggestion: `补齐这些重点：${missingFocus.join("、")}。`,
      hitRule: "项目评审重点：用户/问题/AI 选择/模型选择/方案对比/量化结果",
      evidence: `缺失重点：${missingFocus.join("、")}`,
    });
  }

  return issues;
}

function isRuleRelevantToRole(ruleId: string, role: RoleKey): boolean {
  const mapping: Record<string, RoleKey[]> = {
    R1: ["HR", "PM", "技术", "设计", "项目管理"],
    R2: ["HR", "PM"],
    R3: ["HR", "PM"],
    R4: ["HR", "设计"],
    R5: ["HR", "设计"],
    R6: ["HR", "PM", "项目管理"],
    R7: ["PM", "技术", "项目管理"],
    E1: ["HR", "设计"],
    A1: ["PM", "技术"],
    A2: ["PM", "项目管理"],
  };

  const roles = mapping[ruleId];
  if (!roles) return true;
  return roles.includes(role);
}

function roleSummary(role: RoleKey, score: number): string {
  if (score >= 86) {
    return `${role} 视角下基础表达较好，进入精修阶段即可。`;
  }
  if (score >= 72) {
    return `${role} 视角下信息较完整，但关键证据仍可增强。`;
  }
  return `${role} 视角下存在明显短板，建议优先修复 P0/P1 项。`;
}

function buildRoleScores(issues: ReviewIssue[]): RoleScore[] {
  const bases: Record<RoleKey, number> = {
    HR: 86,
    PM: 85,
    技术: 82,
    设计: 84,
    项目管理: 83,
  };

  const roles: RoleKey[] = ["HR", "PM", "技术", "设计", "项目管理"];

  return roles.map((role) => {
    const penalty = issues.reduce((sum, issue) => {
      const unit = SEVERITY_PENALTY[issue.severity];
      return sum + (isRuleRelevantToRole(issue.ruleId, role) ? unit : Math.round(unit * 0.4));
    }, 0);

    const score = Math.max(38, Math.min(96, bases[role] - penalty));
    return {
      role,
      score,
      summary: roleSummary(role, score),
    };
  });
}

function buildSummary(issues: ReviewIssue[]): string {
  if (issues.length === 0) {
    return "未检测到明显硬规则问题，可进入表达精修与面试话术打磨阶段。";
  }

  const p0Count = issues.filter((item) => item.severity === "P0").length;
  const p1Count = issues.filter((item) => item.severity === "P1").length;
  const p2Count = issues.filter((item) => item.severity === "P2").length;
  const topRules = issues
    .slice(0, 3)
    .map((item) => item.ruleId)
    .join(" / ");

  return `共发现 ${issues.length} 个问题（P0 ${p0Count}、P1 ${p1Count}、P2 ${p2Count}）。建议优先处理 P0，再处理规则 ${topRules}。`;
}

export function buildRuleBasedReview(text: string): ReviewResult {
  const normalized = normalizeText(text);
  const issues = buildRuleIssues(normalized);
  const roleScores = buildRoleScores(issues);
  const totalScore = Math.round(
    roleScores.reduce((sum, item) => sum + item.score, 0) / roleScores.length,
  );

  return {
    totalScore,
    summary: buildSummary(issues),
    roleScores,
    issues,
  };
}

function buildQuickFixes(issues: ReviewIssue[]): RewriteSuggestion[] {
  if (issues.length === 0) {
    return [
      {
        issueId: "no-issue",
        before: "当前简历已满足主要硬规则。",
        after: "建议补充 1-2 条可量化结果，并提升语句颗粒度。",
      },
    ];
  }

  return issues.slice(0, 6).map((issue) => ({
    issueId: issue.id,
    before: issue.evidence ?? issue.title,
    after: issue.suggestion,
  }));
}

function getBestLine(lines: string[], patterns: RegExp[], fallback: string): string {
  const matched = firstMatchLine(lines, patterns);
  if (!matched) return fallback;
  return shortLine(matched, 80);
}

function buildOptimizedProjectSample(sourceText: string): string {
  const lines = splitLines(sourceText);

  const background = getBestLine(
    lines,
    [/背景/, /场景/, /用户/, /业务/, /目标/, /问题/],
    "服务某行业用户，核心问题是流程效率低、人工成本高。",
  );
  const action = getBestLine(
    lines,
    [/负责/, /主导/, /设计/, /搭建/, /落地/, /优化/],
    "我负责需求拆解、方案设计与关键模块推进，完成从方案到上线闭环。",
  );
  const resultLine = findResultLine(lines);
  const result = resultLine
    ? shortLine(resultLine, 80)
    : "上线后在效率与质量指标上实现可量化改善。";

  return [
    "【背景】",
    background,
    "",
    "【我做了什么】",
    action,
    "",
    "【结果】",
    result,
  ].join("\n");
}

function buildFullDraft(sourceText: string, review: ReviewResult): string {
  const lines = splitLines(sourceText).slice(0, 8);
  const digest = lines.length > 0 ? lines.join("；") : "原始简历内容待补充。";

  return [
    "个人简介（草稿）：",
    "我聚焦 AI 产品经理方向，能够完成需求拆解、方案设计、模型与技术路径判断，并推动项目落地与结果复盘。",
    "",
    "项目经历（草稿）：",
    buildOptimizedProjectSample(sourceText),
    "",
    "当前评审摘要：",
    review.summary,
    "",
    "原文摘要（用于继续精修）：",
    digest,
  ].join("\n");
}

function pickCapabilityBullets(text: string): string[] {
  const capabilityMap: Array<{ label: string; patterns: RegExp[] }> = [
    {
      label: "需求拆解与优先级管理",
      patterns: [/需求/, /拆解/, /优先级/, /用户故事/, /痛点/],
    },
    {
      label: "AI 方案设计与模型选型",
      patterns: [/模型/, /选型/, /llm/i, /gpt/i, /qwen/i, /rag/i, /agent/i],
    },
    {
      label: "数据评估与指标复盘",
      patterns: [/评估/, /评测/, /指标/, /提升/, /降低/, /增长/, /采纳率/, /准确率/],
    },
    {
      label: "跨团队协作与项目推进",
      patterns: [/推进/, /协作/, /对齐/, /研发/, /设计/, /业务/, /落地/],
    },
  ];

  const matched = capabilityMap
    .filter((item) => hasAny(text, item.patterns))
    .map((item) => item.label);

  if (matched.length >= 3) {
    return matched.slice(0, 4);
  }

  return [
    "需求拆解与优先级管理",
    "AI 方案设计与模型选型",
    "数据评估与指标复盘",
    "跨团队协作与项目推进",
  ];
}

function buildDeliveryChecklist(review: ReviewResult): string[] {
  const checks = [
    "每个核心项目至少保留 1 条可量化结果，并写清统计口径。",
    "避免“会用工具”式表达，改成“你做了什么动作 + 结果变化”。",
    "同一项目不要在工作经历和项目经历重复陈述同一句话。",
    "所有优势描述都要有对应经历或结果证据支撑。",
  ];

  const hasProjectClosureIssue = review.issues.some((item) => item.ruleId === "R1");
  if (hasProjectClosureIssue) {
    checks.unshift("按“背景 -> 做了什么 -> 结果”补齐每个核心项目闭环。");
  }

  const hasDataIssue = review.issues.some((item) => item.ruleId === "R7");
  if (hasDataIssue) {
    checks.unshift("补充数据来源、统计窗口与计算方式，确保结果可解释。");
  }

  return checks.slice(0, 6);
}

function buildResumeDeliveryDraft(sourceText: string, review: ReviewResult): string {
  const lines = splitLines(sourceText);
  const lineText = lines.join("\n");

  const headline = getBestLine(
    lines,
    [/AI/, /产品经理/, /负责/, /主导/, /项目/, /落地/],
    "聚焦 AI 产品经理方向，具备从需求拆解到方案落地的完整实践经验。",
  );

  const background = getBestLine(
    lines,
    [/背景/, /场景/, /业务/, /用户/, /问题/, /痛点/],
    "面向真实业务场景识别关键问题，并围绕用户价值定义产品目标。",
  );
  const action = getBestLine(
    lines,
    [/负责/, /主导/, /设计/, /搭建/, /实现/, /推进/, /落地/, /优化/],
    "负责需求拆解、方案设计与跨团队推进，驱动方案落地上线。",
  );
  const result = findResultLine(lines)
    ? shortLine(findResultLine(lines) ?? "", 100)
    : "通过结构化迭代实现效率与质量的可量化提升。";
  const techDecision = getBestLine(
    lines,
    [/模型/, /选型/, /RAG/i, /Agent/i, /LLM/i, /GPT/i, /Qwen/i, /技术/, /架构/],
    "根据场景约束完成技术路线判断，平衡效果、成本与交付节奏。",
  );
  const collaboration = getBestLine(
    lines,
    [/协作/, /推进/, /研发/, /设计/, /业务/, /对齐/, /节奏/],
    "能够与研发、设计、业务团队高频协作，推动关键节点按计划完成。",
  );

  const capabilityBullets = pickCapabilityBullets(lineText);

  return [
    "【求职方向】",
    "AI 产品经理（AIPM）",
    "",
    "【个人简介】",
    headline,
    "擅长从用户问题出发，完成需求拆解、方案设计、落地推进与结果复盘，能够在不确定场景下快速形成可执行方案。",
    "",
    "【核心能力】",
    ...capabilityBullets.map((item) => `- ${item}`),
    "",
    "【核心项目经历】",
    "- 项目背景：",
    `  ${background}`,
    "- 关键动作：",
    `  ${action}`,
    "- 技术与策略：",
    `  ${techDecision}`,
    "- 项目结果：",
    `  ${result}`,
    "",
    "【协作与推进】",
    `- ${collaboration}`,
    "- 具备目标对齐、风险前置与节奏管理能力，可持续推动跨团队协作。",
    "",
    "【投递前自检（建议）】",
    ...buildDeliveryChecklist(review).slice(0, 3).map((item) => `- ${item}`),
  ].join("\n");
}

export function buildRuleBasedRewrite(text: string, review: ReviewResult): RewriteResult {
  return {
    quickFixes: buildQuickFixes(review.issues),
    optimizedProjectSample: buildOptimizedProjectSample(text),
    fullDraft: buildFullDraft(text, review),
    resumeDeliveryDraft: buildResumeDeliveryDraft(text, review),
    deliveryChecklist: buildDeliveryChecklist(review),
  };
}
