import { useState } from 'react'
import SectionView from '../components/SectionView'
import SidebarNav from '../components/SidebarNav'
import TopBar from '../components/TopBar'
import { interviewEntries } from '../data/interviewContent'
import { modules, viewModes } from '../data/modules'
import { useLocalStorage } from '../hooks/useLocalStorage'
import type {
  AnswerMode,
  InterviewEntry,
  SearchResult,
  SectionId,
  ViewModeId,
} from '../types/interview'
import { searchEntries } from '../utils/search'

function InterviewPrepPage() {
  const [selectedSectionId, setSelectedSectionId] = useState<SectionId>(modules[0].id)
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [answerMode, setAnswerMode] = useLocalStorage<AnswerMode>(
    'aipm-answer-mode',
    'short',
  )
  const [selectedModeId, setSelectedModeId] = useLocalStorage<ViewModeId>(
    'aipm-view-mode',
    'all',
  )
  const [showImportantOnly, setShowImportantOnly] = useLocalStorage<boolean>(
    'aipm-show-important-only',
    false,
  )
  const [importantOverrides, setImportantOverrides] = useLocalStorage<
    Record<string, boolean>
  >('aipm-important-overrides', {})

  const selectedMode =
    viewModes.find((mode) => mode.id === selectedModeId) ?? viewModes[0]

  function resolveImportant(entry: InterviewEntry) {
    return importantOverrides[entry.id] ?? entry.important
  }

  const modeEntries = selectedMode.noteIds
    ? interviewEntries.filter((entry) => selectedMode.noteIds?.includes(entry.id))
    : interviewEntries

  const visibleEntries = showImportantOnly
    ? modeEntries.filter((entry) => resolveImportant(entry))
    : modeEntries

  const visibleModules = modules.filter((module) =>
    visibleEntries.some((entry) => entry.category === module.id),
  )

  const sectionCounts = modules.reduce<Partial<Record<SectionId, number>>>(
    (counts, module) => {
      counts[module.id] = visibleEntries.filter(
        (entry) => entry.category === module.id,
      ).length
      return counts
    },
    {},
  )

  const selectedModule =
    visibleModules.find((module) => module.id === selectedSectionId) ??
    visibleModules[0] ??
    null

  const currentEntries = selectedModule
    ? visibleEntries.filter((entry) => entry.category === selectedModule.id)
    : []

  const results = searchEntries(query, interviewEntries, modules)

  function handleModeChange(modeId: ViewModeId) {
    setSelectedModeId(modeId)
    setActiveEntryId(null)
  }

  function handleSectionSelect(sectionId: SectionId) {
    setSelectedSectionId(sectionId)
    setActiveEntryId(null)
  }

  function handleToggleImportant(entry: InterviewEntry) {
    setImportantOverrides((current) => ({
      ...current,
      [entry.id]: !(current[entry.id] ?? entry.important),
    }))
  }

  function handleResultSelect(result: SearchResult) {
    setSelectedModeId('all')
    setShowImportantOnly(false)
    setSelectedSectionId(result.entry.category)
    setActiveEntryId(result.entry.id)
    setQuery('')
  }

  return (
    <div className="min-h-screen px-4 py-6 md:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6 lg:flex-row">
        <SidebarNav
          modules={visibleModules}
          selectedModeId={selectedMode.id}
          selectedSectionId={selectedModule?.id ?? null}
          sectionCounts={sectionCounts}
          viewModes={viewModes}
          onModeChange={handleModeChange}
          onSectionSelect={handleSectionSelect}
        />

        <main className="min-w-0 flex-1 space-y-6">
          <TopBar
            answerMode={answerMode}
            currentMode={selectedMode}
            query={query}
            results={results}
            showImportantOnly={showImportantOnly}
            onAnswerModeChange={setAnswerMode}
            onQueryChange={setQuery}
            onResultSelect={handleResultSelect}
            onToggleImportantOnly={() => setShowImportantOnly((current) => !current)}
          />

          <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
            <SectionView
              activeEntryId={activeEntryId}
              answerMode={answerMode}
              entries={currentEntries}
              module={selectedModule}
              onToggleImportant={handleToggleImportant}
              resolveImportant={resolveImportant}
            />

            <div className="space-y-4">
              <div className="rounded-[28px] border border-[var(--panel-border)] bg-white/95 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  使用提示
                </p>
                <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                  <p>搜索支持标题、正文和标签，点击结果会自动跳转到对应模块。</p>
                  <p>“短版”适合 30-60 秒回答，“展开版”适合被追问时快速查看。</p>
                  <p>你可以手动把常用内容标成重点，系统会记住你的偏好。</p>
                </div>
              </div>

              <div className="rounded-[28px] border border-[var(--panel-border)] bg-white/95 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  当前统计
                </p>
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">总可见条目</p>
                    <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
                      {visibleEntries.length}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">重点条目</p>
                    <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">
                      {visibleEntries.filter((entry) => resolveImportant(entry)).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default InterviewPrepPage
