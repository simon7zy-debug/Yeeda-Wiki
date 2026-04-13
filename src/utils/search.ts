import type {
  InterviewEntry,
  ModuleMeta,
  SearchResult,
} from '../types/interview'

function normalize(value: string) {
  return value.toLowerCase()
}

function buildPreview(text: string, query: string) {
  const plainText = text.replace(/\s+/g, ' ').trim()
  const normalizedText = normalize(plainText)
  const matchIndex = normalizedText.indexOf(query)

  if (matchIndex === -1) {
    return `${plainText.slice(0, 88)}${plainText.length > 88 ? '...' : ''}`
  }

  const start = Math.max(0, matchIndex - 18)
  const end = Math.min(plainText.length, matchIndex + query.length + 48)
  const prefix = start > 0 ? '...' : ''
  const suffix = end < plainText.length ? '...' : ''

  return `${prefix}${plainText.slice(start, end)}${suffix}`
}

export function searchEntries(
  query: string,
  entries: InterviewEntry[],
  modules: ModuleMeta[],
) {
  const trimmedQuery = query.trim()

  if (!trimmedQuery) {
    return [] as SearchResult[]
  }

  const normalizedQuery = normalize(trimmedQuery)
  const moduleMap = Object.fromEntries(modules.map((module) => [module.id, module]))

  return entries
    .map((entry) => {
      const module = moduleMap[entry.category]

      if (!module) {
        return null
      }

      const title = normalize(entry.title)
      const shortVersion = normalize(entry.shortVersion)
      const longVersion = normalize(entry.longVersion)
      const tags = normalize(entry.tags.join(' '))
      const moduleTitle = normalize(module.title)

      let score = 0

      if (title.includes(normalizedQuery)) {
        score += 6
      }
      if (moduleTitle.includes(normalizedQuery)) {
        score += 4
      }
      if (tags.includes(normalizedQuery)) {
        score += 3
      }
      if (shortVersion.includes(normalizedQuery)) {
        score += 2
      }
      if (longVersion.includes(normalizedQuery)) {
        score += 1
      }

      if (score === 0) {
        return null
      }

      return {
        entry,
        module,
        preview: buildPreview(`${entry.shortVersion} ${entry.longVersion}`, normalizedQuery),
        score,
      } satisfies SearchResult
    })
    .filter((result): result is SearchResult => Boolean(result))
    .sort((left, right) => right.score - left.score)
    .slice(0, 8)
}
