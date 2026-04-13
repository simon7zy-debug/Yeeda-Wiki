export type SectionId =
  | 'self-intro'
  | 'question-bank'
  | 'projects'
  | 'company-understanding'
  | 'company-questions'
  | 'general-pm'
  | 'ai-framework'
  | 'quick-notes'

export type ViewModeId = 'all' | 'ten-minute' | 'company-jd'

export type AnswerMode = 'short' | 'long'

export interface ModuleMeta {
  id: SectionId
  title: string
  description: string
  hint: string
}

export interface InterviewEntry {
  id: string
  title: string
  category: SectionId
  shortVersion: string
  longVersion: string
  tags: string[]
  important: boolean
}

export interface ViewModePreset {
  id: ViewModeId
  title: string
  description: string
  noteIds?: string[]
}

export interface SearchResult {
  entry: InterviewEntry
  module: ModuleMeta
  preview: string
  score: number
}
