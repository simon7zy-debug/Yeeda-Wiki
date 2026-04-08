type ResumeReferenceRailProps = {
  title?: string;
};

const STRUCTURE_GUIDANCE = [
  "求职定位一句话：岗位方向 + 你最强的业务场景。",
  "核心能力 3-4 条：每条都能映射到真实项目动作。",
  "代表项目 1-2 个：写清你负责什么、怎么做、带来什么结果。",
  "结果数字要配口径：来源、统计窗口、计算方式至少写 1 项。",
];

const BULLET_PATTERNS = [
  "场景与目标 + 你的动作 + 量化结果",
  "问题与约束 + 决策依据 + 落地结果",
  "跨团队协作对象 + 推进动作 + 交付产出",
];

const AIPM_EXAMPLES = [
  "面向客服质检场景，设计检索增强流程并上线，误报率下降至原来的 0.6 倍（7 日滚动口径）。",
  "围绕知识库问答场景完成模型选型与提示策略迭代，首轮响应准确率提升 11.8%。",
  "主导需求拆解与里程碑推进，联合研发和运营在 3 周内交付 MVP 并完成首批用户验证。",
];

export default function ResumeReferenceRail({ title = "简历参考栏" }: ResumeReferenceRailProps) {
  return (
    <aside className="rounded-2xl border border-line bg-white p-5 lg:sticky lg:top-6">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <p className="mt-2 text-xs leading-6 text-ink-soft">
        只提供结构与写法模式，帮助你快速改写成可投递版本。
      </p>

      <section className="mt-5">
        <h3 className="text-sm font-semibold text-foreground">强结构建议</h3>
        <div className="mt-2 space-y-2">
          {STRUCTURE_GUIDANCE.map((item) => (
            <p key={item} className="text-xs leading-6 text-ink-soft">
              • {item}
            </p>
          ))}
        </div>
      </section>

      <section className="mt-5">
        <h3 className="text-sm font-semibold text-foreground">强 Bullet 模式</h3>
        <div className="mt-2 space-y-2">
          {BULLET_PATTERNS.map((item) => (
            <p key={item} className="text-xs leading-6 text-ink-soft">
              • {item}
            </p>
          ))}
        </div>
      </section>

      <section className="mt-5">
        <h3 className="text-sm font-semibold text-foreground">AIPM 示例风格</h3>
        <div className="mt-2 space-y-2">
          {AIPM_EXAMPLES.map((item) => (
            <p key={item} className="rounded-lg border border-line bg-[#fffdfa] px-2.5 py-2 text-xs leading-6 text-ink-soft">
              {item}
            </p>
          ))}
        </div>
      </section>
    </aside>
  );
}
