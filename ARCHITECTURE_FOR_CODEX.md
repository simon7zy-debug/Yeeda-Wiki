# ARCHITECTURE_FOR_CODEX.md

## 1. 项目当前状态

这是一个本地运行的 AIPM 工作台，当前已经在开发中。
已有能力偏向：

- 简历评审
- 文档优化
- 规则判断
- 提示词/工作流辅助

当前问题不是“功能不够”，而是“产品架构抽象层级不够高”。
现阶段需要做的不是推翻重写，而是：

**在现有功能之上，补齐产品主流程、诊断层和模块路由层。**

---

## 2. 产品重新定义

本产品不是单一的“简历工具”或“提示词工具”。

本产品应定义为：

# AIPM Workbench（本地版）

一个面向 AI 产品经理求职、项目封装、面试准备、AI 协作工作流设计的一站式本地工作台。

---

## 3. 核心目标

产品目标不是单点生成内容，而是帮助用户完成以下闭环：

1. 明确目标
2. 判断当前所处阶段
3. 拆解任务
4. 调用对应模块处理
5. 输出结果与下一步建议

---

## 4. 顶层产品架构

产品采用四层架构：

### Layer 1: Input Layer（输入层）

接收用户输入的各种材料与目标，包括但不限于：

- 简历
- JD
- 项目文档
- 会议纪要
- 老师规则
- 个人想法
- 模糊需求描述

职责：

- 收集原始信息
- 统一输入格式
- 为后续诊断提供上下文

---

### Layer 2: Diagnose Layer（诊断层）

这是核心路由层。

职责：

1. 判断用户当前要完成什么任务
2. 判断用户目前处于什么状态
3. 决定将请求分发到哪个能力模块

需要识别的任务类型包括：

- Resume Optimization
- Project Packaging
- Interview Preparation
- AI Workflow Guidance
- Task Planning / Document Planning

需要识别的用户状态包括：

- 目标模糊
- 目标清晰但缺材料
- 有材料但质量不足
- 已接近投递，需要快速优化
- 有项目但不会表达
- 有功能想法但不会拆解

---

### Layer 3: Capability Modules（能力模块层）

#### Module A: Resume Review

职责：

- 多角色评分
- 问题分级（P0 / P1 / P2）
- 改写建议
- 输出完整优化版本

#### Module B: Project Packaging

职责：

- 将项目封装为完整叙事
- 检查背景 / 用户 / 问题 / 方案 / 技术 / 结果完整性
- 输出面试表达版本
- 输出可追问问题

#### Module C: Interview Prep

职责：

- 从简历与项目中抽取高频追问
- 生成回答框架
- 检查是否能自圆其说
- 补充 AI PM 认知问题

#### Module D: AI Workflow Guidance

职责：

- 当用户目标模糊时，帮助澄清目标
- 当用户目标明确时，帮助拆解步骤
- 指导用户如何更有效地与 AI 协作
- 给出不同阶段的 AI 使用方式建议

#### Module E: Task Planner

职责：

- 根据目标输出任务分解
- 输出文档清单
- 输出步骤顺序
- 输出每一步所需输入与产出

---

### Layer 4: Output Layer（输出层）

系统最终输出给用户的结果，包括：

- 评分报告
- 问题清单
- 优先级建议
- 改写稿
- 项目讲述稿
- 面试问题与回答框架
- 下一步任务清单
- 推荐工作流

---

## 5. 产品主流程

系统主流程应为：

User Goal / Materials
-> Diagnose Task Type
-> Diagnose Current State
-> Route to Proper Module
-> Produce Output
-> Suggest Next Step

请确保 UI 和代码结构围绕这个主流程构建，而不是围绕零散功能堆叠。

---

## 6. 页面架构建议

### Page 1: Home / Entry

核心问题：
“你现在要完成什么？”

建议入口选项：

- 优化简历
- 封装项目
- 准备面试
- 设计 AI 工作流
- 拆解一个任务
- 我还没想清楚

---

### Page 2: Intake

用于输入材料：

- 文本粘贴
- 文件上传
- 选择已有规则/知识
- 输入当前目标

---

### Page 3: Diagnose

输出：

- 当前任务类型
- 当前材料完整度
- 推荐优先处理模块
- 下一步建议

---

### Page 4+: Workbench Pages

建议拆分为独立页面或工作台：

- /resume
- /project
- /interview
- /workflow
- /planner

---

### Final Results

每个模块输出统一结构：

- Summary
- Score (if applicable)
- Problems
- Recommended Actions
- Rewritten / Generated Content
- Next Step

---

## 7. 代码架构建议

建议按以下目录重构或补齐：

app/
  page.tsx                 # 首页入口
  intake/page.tsx          # 输入页
  diagnose/page.tsx        # 诊断页
  resume/page.tsx          # 简历模块
  project/page.tsx         # 项目模块
  interview/page.tsx       # 面试模块
  workflow/page.tsx        # AI 协作指导模块
  planner/page.tsx         # 任务拆解模块

components/
  intake/
  diagnose/
  result/
  shared/

lib/
  parser/                  # 文档解析
  diagnose/                # 任务识别、状态识别
  router/                  # 模块路由逻辑
  evaluators/              # 评分器
  rewriters/               # 改写器
  planners/                # 任务拆解器

data/
  rules/
  prompts/
  examples/
  schemas/

docs/
  ARCHITECTURE_FOR_CODEX.md
  MVP_SCOPE.md
  PRODUCT_BRIEF.md
  KNOWLEDGE_BASE.md

---

## 8. 当前最重要的调整，不是重写，而是补 3 件事

### Priority P0

补“诊断层”

- 在现有功能前增加 Diagnose page / logic
- 先判断用户要做什么，再进入模块
- 避免用户一进来就只能做简历评审

### Priority P0

补“任务拆解模块”

- 输入目标
- 输出步骤
- 输出所需文档
- 输出模块建议

### Priority P1

重构首页入口

- 不再把产品定义为单一简历工具
- 改为 AIPM Workbench 的统一入口

---

## 9. 对现有功能的映射关系

现有功能不要删除，请重新挂载：

- 简历评分 -> Resume Review Module
- 规则判断 -> Diagnose + Resume Review
- 提示词辅助 -> AI Workflow Guidance
- 文档输出 -> Project Packaging / Planner
- 多角色分析 -> Resume Review / Interview Prep

---

## 10. Codex 执行要求

请按以下顺序执行，不要直接大改：

### Step 1

阅读以下文档：

- AGENTS.md
- docs/PRODUCT_BRIEF.md
- docs/KNOWLEDGE_BASE.md
- docs/MVP_SCOPE.md
- docs/ARCHITECTURE_FOR_CODEX.md

### Step 2

先输出：

1. 你对当前产品架构的理解
2. 现有代码与目标架构的差距
3. 最小改动路径
4. 你计划修改哪些文件

### Step 3

优先做最小可运行重构：

- 新增 Diagnose page
- 重构首页入口
- 增加模块路由逻辑
- 不要先做复杂 UI 美化
- 不要先做数据库和用户系统

### Step 4

完成后输出：

- 修改文件清单
- 启动方式
- 当前支持的主流程
- 下一步建议

---

## 11. 非目标（当前不要做）

- 不做登录系统
- 不做多用户
- 不做支付
- 不做复杂数据库
- 不做云端部署
- 不做花哨动画优先级高于主流程

---

## 12. 成功标准

第一阶段成功标准不是功能数量，而是：

1. 用户进入首页后，能明确选择目标
2. 系统能先诊断再分流
3. 简历、项目、面试、workflow、planner 成为统一工作台的一部分
4. 现有功能被保留并合理挂载
5. 产品从“工具集合”升级为“流程型工作台”

