import type { SearchResult } from '../types/interview'

interface SearchResultsProps {
  query: string
  results: SearchResult[]
  onSelect: (result: SearchResult) => void
}

function SearchResults({ query, results, onSelect }: SearchResultsProps) {
  if (!query.trim()) {
    return null
  }

  return (
    <div className="absolute top-[calc(100%+0.75rem)] z-20 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.12)]">
      {results.length > 0 ? (
        <ul className="max-h-96 overflow-y-auto p-2">
          {results.map((result) => (
            <li key={result.entry.id}>
              <button
                type="button"
                onClick={() => onSelect(result)}
                className="flex w-full flex-col rounded-xl px-4 py-3 text-left transition hover:bg-slate-50"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm font-semibold text-slate-900">
                    {result.entry.title}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                    {result.module.title}
                  </span>
                </div>
                <span className="mt-2 text-sm leading-6 text-slate-600">
                  {result.preview}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="px-4 py-5 text-sm text-slate-500">
          没有找到和 “{query.trim()}” 相关的内容。
        </div>
      )}
    </div>
  )
}

export default SearchResults
