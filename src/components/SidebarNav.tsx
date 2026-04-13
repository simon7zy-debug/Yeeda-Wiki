import type {
  ModuleMeta,
  SectionId,
  ViewModeId,
  ViewModePreset,
} from '../types/interview'

interface SidebarNavProps {
  modules: ModuleMeta[]
  selectedModeId: ViewModeId
  selectedSectionId: SectionId | null
  sectionCounts: Partial<Record<SectionId, number>>
  viewModes: ViewModePreset[]
  onModeChange: (modeId: ViewModeId) => void
  onSectionSelect: (sectionId: SectionId) => void
}

function SidebarNav({
  modules,
  selectedModeId,
  selectedSectionId,
  sectionCounts,
  viewModes,
  onModeChange,
  onSectionSelect,
}: SidebarNavProps) {
  return (
    <aside className="flex w-full flex-col gap-4 lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)] lg:w-[300px] lg:min-w-[300px]">
      <div className="rounded-[28px] border border-[var(--panel-border)] bg-white/96 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">
          AI PM Prep Desk
        </p>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">
          AI产品经理面试备考网站
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          目标只做一件事：让你在面试前切换快、搜索快、复制快、临场扫读快。
        </p>
      </div>

      <div className="rounded-[28px] border border-[var(--panel-border)] bg-white/96 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          浏览模式
        </p>
        <div className="mt-4 space-y-2">
          {viewModes.map((mode) => {
            const isActive = mode.id === selectedModeId

            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => onModeChange(mode.id)}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                  isActive
                    ? 'border-sky-200 bg-sky-50 text-sky-800 shadow-sm'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="block text-sm font-semibold">{mode.title}</span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  {mode.description}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <nav className="rounded-[28px] border border-[var(--panel-border)] bg-white/96 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)]">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            模块导航
          </p>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
            {modules.length} 个模块
          </span>
        </div>

        <div className="mt-4 space-y-2">
          {modules.map((module) => {
            const isActive = module.id === selectedSectionId
            const count = sectionCounts[module.id] ?? 0

            return (
              <button
                key={module.id}
                type="button"
                onClick={() => onSectionSelect(module.id)}
                className={`flex w-full items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                  isActive
                    ? 'border-slate-900 bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div>
                  <span className="block text-sm font-semibold">{module.title}</span>
                  <span
                    className={`mt-1 block text-xs leading-5 ${
                      isActive ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {module.hint}
                  </span>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </nav>
    </aside>
  )
}

export default SidebarNav
