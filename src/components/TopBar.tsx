import SearchResults from './SearchResults'
import type {
  AnswerMode,
  SearchResult,
  ViewModePreset,
} from '../types/interview'

interface TopBarProps {
  answerMode: AnswerMode
  currentMode: ViewModePreset
  query: string
  results: SearchResult[]
  showImportantOnly: boolean
  onAnswerModeChange: (mode: AnswerMode) => void
  onQueryChange: (value: string) => void
  onResultSelect: (result: SearchResult) => void
  onToggleImportantOnly: () => void
}

function TopBar({
  answerMode,
  currentMode,
  query,
  results,
  showImportantOnly,
  onAnswerModeChange,
  onQueryChange,
  onResultSelect,
  onToggleImportantOnly,
}: TopBarProps) {
  return (
    <header className="rounded-[28px] border border-[var(--panel-border)] bg-white/92 p-4 shadow-[0_14px_40px_rgba(15,23,42,0.06)] backdrop-blur md:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="relative flex-1">
          <label
            htmlFor="global-search"
            className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"
          >
            全局搜索
          </label>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-inner shadow-slate-100">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-5 w-5 shrink-0 text-slate-400"
            >
              <path
                fill="currentColor"
                d="M10.5 4a6.5 6.5 0 1 0 4.06 11.57l4.43 4.43 1.41-1.41-4.43-4.43A6.5 6.5 0 0 0 10.5 4Zm0 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Z"
              />
            </svg>
            <input
              id="global-search"
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="搜索标题、正文、标签，如：GiiMall / 需求分析 / 自我介绍"
              className="w-full border-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </div>
          <SearchResults query={query} results={results} onSelect={onResultSelect} />
        </div>

        <div className="flex flex-col gap-4 xl:w-[360px]">
          <div>
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              回答视图
            </span>
            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5">
              {(['short', 'long'] as const).map((mode) => {
                const isActive = answerMode === mode

                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => onAnswerModeChange(mode)}
                    className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {mode === 'short' ? '短版 30-60 秒' : '展开版 追问查看'}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onToggleImportantOnly}
              className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${
                showImportantOnly
                  ? 'border-sky-200 bg-sky-50 text-sky-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
              }`}
            >
              {showImportantOnly ? '只看重点：开' : '只看重点：关'}
            </button>
            <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
              当前模式：{currentMode.title}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          当前模式说明
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-600">{currentMode.description}</p>
      </div>
    </header>
  )
}

export default TopBar
