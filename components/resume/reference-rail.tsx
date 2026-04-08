"use client";

import { useState } from "react";

type TabKey = "structure" | "summary" | "project" | "bullet_compare";

type ResumeReferenceRailProps = {
  title?: string;
  defaultTab?: TabKey;
};

const TAB_ITEMS: Array<{ key: TabKey; label: string }> = [
  { key: "structure", label: "结构模板" },
  { key: "summary", label: "个人简介示例" },
  { key: "project", label: "主项目示例" },
  { key: "bullet_compare", label: "强弱 Bullet 对比" },
];

const STRUCTURE_TEMPLATE = [
  "求职定位：目标岗位 + 核心方向（1 行）",
  "个人简介：你解决过什么问题、擅长什么方法、带来过什么结果（2-3 行）",
  "核心能力：3-4 条可被项目证据支撑的能力项",
  "工作经历：职责范围 + 关键推进动作 + 业务影响",
  "代表项目：背景 / 关键动作 / 决策依据 / 结果口径",
];

const SUMMARY_EXAMPLES = [
  "AI 产品经理，聚焦智能应用从需求拆解到落地交付，擅长在多方协作场景下推动复杂项目上线并持续复盘优化。",
  "面向企业知识与客服场景，能够完成问题建模、方案选型与指标闭环，推动 AI 功能从验证走向稳定业务价值。",
  "具备 AI 产品与数据评估能力，能够在效果、成本、交付节奏之间做可解释决策，并形成可复用方法。",
];

const PROJECT_EXAMPLES = [
  [
    "- 项目背景：面向客服质检场景，原流程人工抽检效率低、漏检率高。",
    "- 关键动作：主导需求拆解、评估方案对比并推进检索增强链路落地。",
    "- 决策依据：基于准确率、响应时延与成本三项指标选择技术路线。",
    "- 项目结果：上线后误报率下降至原来的 0.6 倍（7 日滚动口径）。",
  ].join("\n"),
  [
    "- 项目背景：知识问答场景中答案一致性不足，用户重复提问率高。",
    "- 关键动作：设计提示策略与评估流程，联动研发完成迭代发布。",
    "- 决策依据：对比多套方案在 badcase 覆盖率与可维护性上的表现。",
    "- 项目结果：首轮回答准确率提升 11.8%，重复提问率明显下降。",
  ].join("\n"),
];

const BULLET_COMPARE = [
  {
    weak: "负责 AI 项目推进，提升了产品效果。",
    strong:
      "负责客服质检 AI 项目从需求拆解到上线推进，3 周内完成首版交付，误报率下降至原来的 0.6 倍（7 日滚动口径）。",
    reason: "补齐了场景、动作、周期、结果和统计口径。",
  },
  {
    weak: "熟练使用 GPT，优化问答能力。",
    strong:
      "针对知识问答场景设计检索增强策略并落地，首轮回答准确率提升 11.8%，同时将响应时延控制在目标范围内。",
    reason: "从“工具名”转为“方法+结果”，更能证明能力。",
  },
];

const INTERNAL_RULES = [
  "项目必须形成“背景 -> 做了什么 -> 结果”闭环。",
  "工具不等于能力，必须写清动作与结果。",
  "优势描述必须有经历或数据证据支撑。",
  "数据结果要补来源、统计口径或时间窗口。",
];

const EXTERNAL_CONVENTIONS = [
  "通常建议使用结果导向 Bullet：动作动词开头 + 量化结果结尾。",
  "一般优先展示近 3-5 年与目标岗位最相关经历。",
  "常见做法是控制版面可扫读性，避免长段落堆叠与术语过载。",
  "公开求职实践普遍强调“可验证成果”优于“主观形容词”。",
];

function tabButtonClass(active: boolean): string {
  if (active) {
    return "bg-accent text-white border-accent";
  }
  return "border-line bg-white text-foreground hover:border-accent hover:text-accent";
}

export default function ResumeReferenceRail({
  title = "简历参考栏",
  defaultTab = "structure",
}: ResumeReferenceRailProps) {
  const [activeTab, setActiveTab] = useState<TabKey>(defaultTab);

  return (
    <aside className="rounded-2xl border border-line bg-white p-5 lg:sticky lg:top-6">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <p className="mt-2 text-xs leading-6 text-ink-soft">
        以模板和对照示例为主，帮助你从“会写”升级到“能投”。
      </p>

      <section className="mt-4">
        <div className="grid grid-cols-2 gap-2">
          {TAB_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveTab(item.key)}
              className={`rounded-lg border px-2.5 py-2 text-xs font-medium transition ${tabButtonClass(
                activeTab === item.key,
              )}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-4 rounded-lg border border-line bg-[#fffdfa] p-3">
        {activeTab === "structure" ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground">推荐简历结构</p>
            {STRUCTURE_TEMPLATE.map((item) => (
              <p key={item} className="text-xs leading-6 text-ink-soft">
                • {item}
              </p>
            ))}
          </div>
        ) : null}

        {activeTab === "summary" ? (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground">个人简介参考写法</p>
            {SUMMARY_EXAMPLES.map((item) => (
              <p key={item} className="rounded-md border border-line bg-white px-2 py-1.5 text-xs leading-6 text-ink-soft">
                {item}
              </p>
            ))}
          </div>
        ) : null}

        {activeTab === "project" ? (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-foreground">主项目参考块</p>
            {PROJECT_EXAMPLES.map((item, index) => (
              <pre
                key={`project-${index + 1}`}
                className="overflow-x-auto rounded-md border border-line bg-white px-2 py-1.5 text-xs leading-6 whitespace-pre-wrap text-ink-soft"
              >
                {item}
              </pre>
            ))}
          </div>
        ) : null}

        {activeTab === "bullet_compare" ? (
          <div className="space-y-3">
            <p className="text-xs font-semibold text-foreground">强弱 Bullet 对比</p>
            {BULLET_COMPARE.map((item) => (
              <article key={item.weak} className="rounded-md border border-line bg-white p-2">
                <p className="text-[11px] font-semibold text-red-700">弱写法</p>
                <p className="mt-1 text-xs leading-6 text-ink-soft">{item.weak}</p>
                <p className="mt-2 text-[11px] font-semibold text-emerald-700">强写法</p>
                <p className="mt-1 text-xs leading-6 text-foreground">{item.strong}</p>
                <p className="mt-2 text-[11px] text-ink-soft">为何更强：{item.reason}</p>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <section className="mt-4 rounded-lg border border-line p-3">
        <h3 className="text-xs font-semibold text-foreground">Grounded Guidance</h3>
        <p className="mt-1 text-[11px] text-ink-soft">
          下方分为“内部规则”和“外部公开约定”，来源边界清晰，不直接粘贴版权模板。
        </p>

        <div className="mt-3 rounded-md border border-line bg-[#fffdfa] p-2.5">
          <p className="text-[11px] font-semibold text-foreground">Internal Rules（你的知识库规则）</p>
          <div className="mt-1 space-y-1">
            {INTERNAL_RULES.map((item) => (
              <p key={item} className="text-xs leading-6 text-ink-soft">
                • {item}
              </p>
            ))}
          </div>
        </div>

        <div className="mt-3 rounded-md border border-line bg-[#fffdfa] p-2.5">
          <p className="text-[11px] font-semibold text-foreground">
            External Conventions（公开简历通行做法）
          </p>
          <div className="mt-1 space-y-1">
            {EXTERNAL_CONVENTIONS.map((item) => (
              <p key={item} className="text-xs leading-6 text-ink-soft">
                • {item}
              </p>
            ))}
          </div>
        </div>
      </section>
    </aside>
  );
}
