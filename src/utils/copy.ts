import type { AnswerMode, InterviewEntry } from '../types/interview'

export async function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return
  }

  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.setAttribute('readonly', 'true')
  textArea.style.position = 'absolute'
  textArea.style.left = '-9999px'
  document.body.appendChild(textArea)
  textArea.select()
  document.execCommand('copy')
  document.body.removeChild(textArea)
}

export function buildEntryCopyText(entry: InterviewEntry, answerMode: AnswerMode) {
  const body = answerMode === 'short' ? entry.shortVersion : entry.longVersion

  return [`【${entry.title}】`, body, `标签：${entry.tags.join(' / ')}`].join('\n')
}

export function buildSectionCopyText(
  sectionTitle: string,
  entries: InterviewEntry[],
  answerMode: AnswerMode,
) {
  const entryBlocks = entries.map((entry) => buildEntryCopyText(entry, answerMode))
  return [`# ${sectionTitle}`, ...entryBlocks].join('\n\n')
}
