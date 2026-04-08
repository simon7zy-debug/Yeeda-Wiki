import Link from "next/link";

type EntryCard = {
  title: string;
  description: string;
  href: string;
};

const ENTRY_CARDS: EntryCard[] = [
  {
    title: "优化简历",
    description: "上传 PDF/DOCX，获取多角色评审与改写建议。",
    href: "/diagnose?task=resume_optimization",
  },
  {
    title: "封装项目",
    description: "把项目整理成可讲述、可追问、可投递的叙事结构。",
    href: "/diagnose?task=project_packaging",
  },
  {
    title: "准备面试",
    description: "从简历与项目抽取高频问题，生成回答框架。",
    href: "/diagnose?task=interview_preparation",
  },
  {
    title: "设计 AI 工作流",
    description: "明确目标、约束与协作步骤，产出可执行流程。",
    href: "/diagnose?task=ai_workflow_guidance",
  },
  {
    title: "拆解一个任务",
    description: "输出步骤顺序、文档清单与执行节奏建议。",
    href: "/diagnose?task=task_planning",
  },
  {
    title: "我还没想清楚",
    description: "先做诊断，系统会判断任务类型并推荐模块。",
    href: "/diagnose?task=unknown",
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen px-4 py-10 sm:px-8">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(circle at 10% 10%, #f2c6a8 0%, transparent 35%), radial-gradient(circle at 85% 20%, #f0dbb9 0%, transparent 38%), radial-gradient(circle at 60% 85%, #d7e3d4 0%, transparent 45%)",
        }}
      />

      <main className="relative mx-auto w-full max-w-6xl rounded-3xl border border-line bg-panel/95 p-6 shadow-xl backdrop-blur sm:p-10">
        <div className="mb-8">
          <p className="mb-3 inline-flex rounded-full border border-line bg-white px-3 py-1 text-xs font-medium tracking-wide text-ink-soft">
            AIPM Workbench · 本地版
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            你现在要完成什么？
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-ink-soft sm:text-base">
            首页入口统一先进入 Diagnose。完成 2-3 个问题后，系统再分流到对应模块。现有简历评审功能已保留，并作为 Resume Review
            节点接入主流程。
          </p>
        </div>

        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {ENTRY_CARDS.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group rounded-2xl border border-line bg-white p-5 transition hover:border-accent hover:shadow-md"
            >
              <h2 className="text-lg font-semibold text-foreground group-hover:text-accent">
                {card.title}
              </h2>
              <p className="mt-2 text-sm leading-7 text-ink-soft">{card.description}</p>
            </Link>
          ))}
        </section>

        <section className="mt-8 rounded-2xl border border-line bg-white p-5">
          <h2 className="text-lg font-semibold text-foreground">快速诊断入口</h2>
          <p className="mt-2 text-sm text-ink-soft">
            如果你不确定该从哪个模块开始，可以先用诊断页做任务识别和状态判断。
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/diagnose?task=resume_optimization&goal=我这周要投AI产品经理，先把简历优化到可投递状态"
              className="inline-flex items-center justify-center rounded-xl border border-line bg-[#fffdfa] px-4 py-2 text-sm font-medium text-foreground hover:border-accent hover:text-accent"
            >
              用“简历投递”模板诊断
            </Link>
            <Link
              href="/diagnose?task=project_packaging&goal=我有项目经历但不会讲，想整理成可面试表达"
              className="inline-flex items-center justify-center rounded-xl border border-line bg-[#fffdfa] px-4 py-2 text-sm font-medium text-foreground hover:border-accent hover:text-accent"
            >
              用“项目表达”模板诊断
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
