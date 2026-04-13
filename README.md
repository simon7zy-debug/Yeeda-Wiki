# AI产品经理面试备考网站

一个基于 `React + Vite + Tailwind CSS` 的本地单页网站，用来在面试前快速切换模块、搜索内容、复制答案，并在“短版 / 展开版”之间快速切换。

## 功能概览

- 左侧模块导航 + 右侧内容区
- 顶部全局搜索，支持搜索标题、正文和标签
- 每个模块一键复制，每条内容也可单独复制
- 短版 / 展开版切换
- 重点标记与“只看重点”筛选
- 面试前 10 分钟模式
- 公司 / JD 模式
- 内容数据独立维护，方便后续扩展

## 安装依赖

在项目目录执行：

```bash
npm install
```

## 本地启动

```bash
npm run dev
```

启动后按终端提示打开本地地址，通常是：

```text
http://localhost:5173
```

## 打包构建

```bash
npm run build
```

## 如何修改题库内容

主要修改两个文件：

- `src/data/modules.ts`
  - 管理左侧模块导航
  - 管理“全部内容 / 面试前10分钟 / 公司JD模式”这三种模式
- `src/data/interviewContent.ts`
  - 管理每一条具体内容

每条内容的数据结构如下：

```ts
{
  id: 'intro-self',
  title: '自我介绍',
  category: 'self-intro',
  shortVersion: '短版内容',
  longVersion: '展开版内容',
  tags: ['开场', 'AI产品经理'],
  important: true,
}
```

字段说明：

- `id`：唯一标识，不能重复
- `title`：标题
- `category`：所属模块，必须对应 `src/data/modules.ts` 里的模块 `id`
- `shortVersion`：短版回答
- `longVersion`：展开版回答
- `tags`：搜索标签
- `important`：是否默认标记为重点

## 如何新增模块

### 1. 在 `src/data/modules.ts` 增加一个模块

示例：

```ts
{
  id: 'my-new-module',
  title: '新的模块',
  description: '这里写模块说明',
  hint: '这里写简短提示',
}
```

注意：

- `id` 需要唯一
- 如果你新增的是全新模块，也要同步更新 `src/types/interview.ts` 里的 `SectionId`

### 2. 在 `src/data/interviewContent.ts` 中增加内容条目

只要把新条目的 `category` 指向刚才新增的模块 `id`，它就会自动出现在左侧导航和右侧内容区里。

## 如何修改模式内容

在 `src/data/modules.ts` 的 `viewModes` 里修改 `noteIds`：

- `ten-minute`：面试前 10 分钟模式
- `company-jd`：公司 / JD 模式

例如把某一条内容加入“面试前 10 分钟模式”：

```ts
noteIds: ['intro-self', 'fit-role', 'your-new-note-id']
```

## 目录结构

```text
src/
├─ components/
│  ├─ ContentCard.tsx
│  ├─ SearchResults.tsx
│  ├─ SectionView.tsx
│  ├─ SidebarNav.tsx
│  └─ TopBar.tsx
├─ data/
│  ├─ interviewContent.ts
│  └─ modules.ts
├─ hooks/
│  └─ useLocalStorage.ts
├─ pages/
│  └─ InterviewPrepPage.tsx
├─ types/
│  └─ interview.ts
├─ utils/
│  ├─ copy.ts
│  └─ search.ts
├─ App.tsx
├─ index.css
└─ main.tsx
```

## 后续你最可能改的地方

- 想改内容：改 `src/data/interviewContent.ts`
- 想改模块顺序或模式：改 `src/data/modules.ts`
- 想改页面布局：改 `src/pages/InterviewPrepPage.tsx`
- 想改单张卡片样式：改 `src/components/ContentCard.tsx`
