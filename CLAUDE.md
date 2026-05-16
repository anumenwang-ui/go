# gocontrolife — GO 个人生活助理

## 概述
纯前端静态 SPA，个人生活管理看板。React 19 + Vite 8 + TypeScript + Tailwind CSS 3.4。
数据全部存在用户浏览器 localStorage，无后端、无数据库、无用户系统。

## 关键命令
```bash
cd /Users/yymc/vibecoding/gocontrolife/app
npm run dev          # 开发服务器
npm run build        # 构建（tsc + vite build）
npm run test:e2e     # Playwright E2E 测试
```

## 架构
- `/app/src/data/types.ts` — 所有数据类型（Task, EnglishMaterial, Vocabulary, SpeechTopic, Member 等）
- `/app/src/data/storage.ts` — localStorage CRUD 层
- `/app/src/data/focus.ts` — 今日焦点计算规则（精力 × 重要性 × isTodayFocus）
- `/app/src/hooks/useAppData.tsx` — 全局状态 Context + 9 个 action hooks
- `/app/src/pages/` — 6 个页面：Dashboard, Tasks, Ritual, Media, Members, Review
- `/app/src/components/` — 可复用组件

## 路由（HashRouter，兼容 GitHub Pages）
- `/#/` → Dashboard（首页）
- `/#/tasks` → 任务
- `/#/ritual` → 语言库（英语 + 演讲练习）
- `/#/media` → 阅读室
- `/#/members` → 会员
- `/#/review` → 回顾

## 部署
- **平台**: GitHub Pages
- **仓库**: github.com/anumenwang-ui/gocontrolife
- **站点**: https://anumenwang-ui.github.io/gocontrolife/
- **方式**: GitHub Actions，推送 main 自动部署
- **配置**: `base: "./"`, HashRouter, PWA (vite-plugin-pwa)

## 设计风格
- 配色：Stone 暖灰系 + Amber 琥珀点缀
- Logo：聚焦环形 + 琥珀色内核（favicon.svg）
- 字体：系统默认中文
