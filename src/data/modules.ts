import type { ModuleMeta, ViewModePreset } from '../types/interview'

export const modules: ModuleMeta[] = [
  {
    id: 'self-intro',
    title: '自我介绍',
    description: '用于开场建立第一印象，快速把你的经历、优势和岗位匹配度说清楚。',
    hint: '开场模块',
  },
  {
    id: 'question-bank',
    title: '高频题库',
    description: '放最常被追问的“为什么你适合”“为什么想做这件事”等标准题。',
    hint: '高频必看',
  },
  {
    id: 'projects',
    title: '三个核心项目',
    description: '用项目讲业务场景、方法论、落地动作和结果，方便面试官继续深挖。',
    hint: '案例证明',
  },
  {
    id: 'company-understanding',
    title: '吉客印公司理解',
    description: '整理对公司定位、业务结构、平台战略和岗位价值的理解。',
    hint: '公司认知',
  },
  {
    id: 'company-questions',
    title: '吉客印高频问题',
    description: '聚焦吉客印相关追问，包括 AI 落地点和你可以主动发起的问题。',
    hint: 'JD 定向',
  },
  {
    id: 'general-pm',
    title: '通用产品经理问题',
    description: '包含需求分析、优先级、跨团队协作和冲突处理等核心方法题。',
    hint: '方法论',
  },
  {
    id: 'ai-framework',
    title: 'AI产品经理四大能力框架',
    description: '把 AI 产品经理能力拆成结构化框架，方便快速回忆与输出。',
    hint: '能力框架',
  },
  {
    id: 'quick-notes',
    title: '临场速记',
    description: '临上场前看一眼的短句、提醒词和答题顺序，降低紧张时卡壳概率。',
    hint: '最后冲刺',
  },
]

export const viewModes: ViewModePreset[] = [
  {
    id: 'all',
    title: '全部内容',
    description: '查看全部模块，适合完整准备和按模块复习。',
  },
  {
    id: 'ten-minute',
    title: '面试前10分钟',
    description: '只保留最容易被问、最值得临门一脚复习的核心内容。',
    noteIds: [
      'intro-self',
      'fit-role',
      'req-priority',
      'cross-team-collab',
      'conflict-resolution',
      'geekprint-one-liner',
    ],
  },
  {
    id: 'company-jd',
    title: '公司/JD模式',
    description: '聚焦吉客印、商业模式、GiiMall、AI 落地点和反问面试官。',
    noteIds: [
      'geekprint-one-liner',
      'geekprint-company-understanding',
      'geekprint-business-model',
      'giimall-strategy',
      'geekprint-ai-landing',
      'ask-the-interviewer',
    ],
  },
]
