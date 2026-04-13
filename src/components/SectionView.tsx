import { useEffect, useState } from 'react'
import type { AnswerMode, InterviewEntry, ModuleMeta } from '../types/interview'
import { buildSectionCopyText, copyText } from '../utils/copy'
import ContentCard from './ContentCard'

interface SectionViewProps {
  activeEntryId: string | null
  answerMode: AnswerMode
  entries: InterviewEntry[]
  module: ModuleMeta | null
  onToggleImportant: (entry: InterviewEntry) => void
  resolveImportant: (entry: InterviewEntry) => boolean
}

function SectionView({
  activeEntryId,
  answerMode,
  entries,
  module,
  onToggleImportant,
  resolveImportant,
}: SectionViewProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!activeEntryId || !entries.some((entry) => entry.id === activeEntryId)) {
      return
    }

    const frame = window.requestAnimationFrame(() => {
      document
        .getElementById(activeEntryId)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [activeEntryId, entries])

  if (!module) {
    return (
      <section className="rounded-[28px] border border-dashed border-slate-300 bg-white/80 p-8 text-center shadow-[0_14px_40px_rgba(15,23,42,0.04)]">
        <h2 className="text-xl font-bold text-slate-900">当前筛选下没有可展示内容</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          你可以关闭“只看重点”，或者切回“全部内容”模式继续浏览。
        </p>
      </section>
    )
  }

  async function handleCopySection() {
    if (!module) {
      return
    }

    await copyText(buildSectionCopyText(module.title, entries, answerMode))
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <section className="rounded-[30px] border border-[var(--panel-border)] bg-white/95 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)] md:p-7">
      <div className="flex flex-col gap-5 border-b border-slate-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">
            {module.hint}
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">
            {module.title}
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
            {module.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">
            当前共 {entries.length} 条
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">
            {answerMode === 'short' ? '短版视图' : '展开版视图'}
          </span>
          <button
            type="button"
            onClick={handleCopySection}
            className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            {copied ? '模块已复制' : '复制本模块'}
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {entries.map((entry) => (
          <ContentCard
            key={entry.id}
            answerMode={answerMode}
            entry={entry}
            isActive={activeEntryId === entry.id}
            isImportant={resolveImportant(entry)}
            onToggleImportant={onToggleImportant}
          />
        ))}
      </div>
    </section>
  )
}

export default SectionView
