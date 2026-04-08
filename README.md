# AIPM Workbench（本地版）

一个面向 AI 产品经理求职场景的本地工作台 MVP。  
目标是把“简历优化 / 项目封装 / 面试准备 / 任务拆解”串成可执行流程，而不是单点工具。

## 当前状态（2026-04-08）

- P0 已完成：首页统一走 Diagnose 分流，Resume 模块接入流程，结果页有下一步建议。
- P1 已完成：改写结果双视图（分析视图 / 简历成稿视图），Project/Interview/Workflow/Planner 模块骨架可跑通。
- 约束保持：不做数据库、不做登录、不做云部署。

## 快速开始

前置要求：
- Node.js 20+
- npm 10+

```bash
cd /Users/yeeda/Documents/Cursor/MyWiki/aipm-tool
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## 推荐验证命令

```bash
npm run lint
npm run build
```

## 核心流程

1. 首页选择任务入口（统一进入 Diagnose）
2. Diagnose 回答 3 个问题（紧迫度 / 材料完整度 / 当前阻碍）
3. 系统分流到对应模块（`/resume`、`/project`、`/interview`、`/workflow`、`/planner`）
4. 模块输出结果，并给出下一步跳转建议

## 页面路由

- `/`：入口页（任务选择）
- `/diagnose`：诊断与分流
- `/resume`：简历上传与评审入口（支持 PDF/DOCX 上传）
- `/review`：简历评审结果
- `/rewrite`：改写结果（双视图）
- `/project`：项目封装模块（骨架可用）
- `/interview`：面试准备模块（骨架可用）
- `/workflow`：AI 工作流指导模块（骨架可用）
- `/planner`：任务拆解模块（骨架可用）

## API 路由（本地）

- `POST /api/upload`：上传并解析简历（PDF/DOCX）
- `POST /api/review`：多角色评审 + 问题分级
- `POST /api/rewrite`：输出改写建议与简历成稿
- `POST /api/diagnose`：任务识别 + 状态判断 + 分流建议
- `POST /api/project`：项目封装结果（结构化输出）
- `POST /api/interview`：面试问题与回答框架
- `POST /api/workflow`：AI 协作流程建议
- `POST /api/planner`：任务拆解与执行计划

## 文件上传说明

- 当前支持：`.pdf`、`.docx`
- 文件大小限制：`<= 8MB`
- 仅本地单用户内存存储，不落数据库

## 关键文档

- `MASTER_PLAN.md`：主计划与当前优先级
- `ARCHITECTURE_FOR_CODEX.md`：产品四层架构定义
- `docs/PRODUCT_BRIEF.md`：产品目标与模块概览
- `docs/MVP_SCOPE.md`：MVP 范围与验收标准
- `docs/KNOWLEDGE_BASE.md`：评审规则与素材来源

## 常见问题

### 1) `fatal: not a git repository`

请先进入项目目录再执行 git 命令：

```bash
cd /Users/yeeda/Documents/Cursor/MyWiki/aipm-tool
```

### 2) `Setting up fake worker failed ... pdf.worker.mjs`

先清掉构建缓存后重启：

```bash
cd /Users/yeeda/Documents/Cursor/MyWiki/aipm-tool
rm -rf .next
npm run dev
```

### 3) GitHub 推送时要求密码

HTTPS 推送请使用 GitHub PAT（Personal Access Token），不是 GitHub 登录密码。
