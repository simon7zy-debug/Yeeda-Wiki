import { useState } from 'react'
import { buildEntryCopyText, copyText } from '../utils/copy'
import type { AnswerMode, InterviewEntry } from '../types/interview'

interface ContentCardProps {
  answerMode: AnswerMode
  entry: InterviewEntry
  isActive: boolean
  isImportant: boolean
  onToggleImportant: (entry: InterviewEntry) => void
}

function ContentCard({
  answerMode,
  entry,
  isActive,
  isImportant,
  onToggleImportant,
}: ContentCardProps) {
  const [copied, setCopied] = useState(false)
  const currentText =
    answerMode === 'short' ? entry.shortVersion : entry.longVersion

  async function handleCopy() {
    await copyText(buildEntryCopyText(entry, answerMode))
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <article
      id={entry.id}
      className={`rounded-[26px] border p-5 shadow-[0_12px_34px_rgba(15,23,42,0.05)] transition ${
        isImportant
          ? 'border-sky-200 bg-sky-50/70'
          : 'border-slate-200 bg-white'
      } ${isActive ? 'ring-2 ring-slate-900/70 ring-offset-2 ring-offset-transparent' : ''}`}
    >
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-bold tracking-tight text-slate-900">
              {entry.title}
            </h3>
            {isImportant ? (
              <span className="rounded-full border border-sky-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-sky-700">
                重点
              </span>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onToggleImportant(entry)}
            className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${
              isImportant
                ? 'border-sky-200 bg-white text-sky-700'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
            }`}
          >
            {isImportant ? '取消重点' : '标记重点'}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900"
          >
            {copied ? '已复制' : '复制本条'}
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-white/75 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          {answerMode === 'short' ? '短版答案' : '展开版答案'}
        </p>
        <p className="whitespace-pre-line text-sm leading-7 text-slate-700">
          {currentText}
        </p>
      </div>
    </article>
  )
}

export default ContentCard
