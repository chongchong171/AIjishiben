# AI记事本 (AI Notebook)

> 一个沉浸式、AI驱动的智能记事本应用
> 作者：汪成冲（女王大人）
> 创建时间：2026-05-07

---

## 项目概述

AI记事本是一个专为高频AI使用者设计的沉浸式记事工具。它解决了传统记事场景中的痛点：
- 临时文档堆积成山，过期文件难以清理
- 灵感、修改方案、进度记录散落各处
- 找不到需要的内容，或发现时已经过期

### 设计理念
- **氛围沉浸式**：GLSL美学风格的深色界面，玻璃态面板，环境背景动画
- **AI原生**：语音转文字、截图转文字、自动整理、智能标签
- **真实场景还原**：深度参考Notion、飞书文档、VS Code等办公软件的记事功能

---

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.2 | UI框架 |
| TypeScript | 5.3 | 类型安全 |
| Vite | 5.1 | 构建工具 |
| Tailwind CSS | 3.4 | 样式系统 |
| Framer Motion | 11.0 | 动画效果 |
| Web Speech API | - | 语音转文字 |
| Tesseract.js | 5.0 | 截图OCR |
| date-fns | 3.3 | 日期格式化 |
| lucide-react | 0.344 | 图标库 |

---

## 功能清单

### 1. 笔记管理
- ✅ 创建新笔记（按钮 + Ctrl+N 快捷键）
- ✅ 删除笔记（带确认提示）
- ✅ 标记已完成/未完成
- ✅ 归档笔记（软删除，可恢复）
- ✅ 复制笔记
- ✅ 置顶笔记
- ✅ 搜索/过滤（按标题和内容）
- ✅ 排序：创建时间、修改时间、标题

### 2. 富文本编辑器
- ✅ 粗体、斜体、下划线、删除线
- ✅ 字体大小选择（12px - 32px）
- ✅ 字体选择（Inter、JetBrains Mono、Georgia、Playfair Display、system-ui）
- ✅ 文字颜色选择器（预设 + 自定义）
- ✅ 高亮/背景颜色
- ✅ 无序列表、有序列表
- ✅ 待办清单（笔记内嵌）
- ✅ 引用块
- ✅ 代码块（等宽字体）
- ✅ 水平分割线
- ✅ 清除格式

### 3. AI功能
- ✅ **语音转文字**：录音按钮，Web Speech API实时转录，波形动画
- ✅ **截图转文字**：上传图片，Tesseract.js OCR识别
- ✅ **自动整理**：一键清理杂乱文本，生成结构化段落
- ✅ **AI摘要**：本地算法提取关键要点（无需外部API）
- ✅ **自动标签**：基于内容关键词智能推荐标签

### 4. 组织管理
- ✅ 标签/标签管理（增删改查）
- ✅ 彩色标签徽章
- ✅ 按标签过滤
- ✅ 时间戳：创建时间、最后修改时间
- ✅ 字数统计、字符数统计
- ✅ 预计阅读时间

### 5. UI/UX设计
- ✅ 深色主题（#0f172a 基础色）
- ✅ 玻璃态面板（border-white/10）
- ✅ 环境背景动画（CSS渐变动画）
- ✅ 流畅过渡动画
- ✅ 侧边栏笔记列表（可折叠）
- ✅ 编辑器专注模式（隐藏侧边栏）
- ✅ 响应式设计（平板/桌面）
- ✅ 键盘快捷键帮助面板（按 ? 显示）
- ✅ Toast通知
- ✅ 空状态引导

---

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| Ctrl+N | 新建笔记 |
| Ctrl+F | 聚焦搜索框 |
| ? | 显示快捷键帮助 |
| Esc | 关闭弹窗 |

---

## 项目结构

```
ai-notebook/
├── index.html              # 入口HTML
├── package.json            # 依赖配置
├── vite.config.ts          # Vite配置
├── tailwind.config.js      # Tailwind主题配置
├── tsconfig.json           # TypeScript配置
└── src/
    ├── main.tsx            # 应用入口
    ├── App.tsx             # 主组件
    ├── index.css           # 全局样式
    ├── types/
    │   └── index.ts        # 类型定义
    ├── hooks/
    │   ├── useNotes.ts     # 笔记CRUD
    │   ├── useTags.ts      # 标签管理
    │   ├── useSpeech.ts    # 语音识别
    │   ├── useOCR.ts       # 图片OCR
    │   └── useLocalStorage.ts # 本地存储
    ├── utils/
    │   ├── aiHelpers.ts    # AI辅助函数
    │   └── formatters.ts   # 格式化工具
    └── components/
        ├── Editor.tsx          # 富文本编辑器
        ├── Sidebar.tsx         # 侧边栏
        ├── NoteCard.tsx        # 笔记卡片
        ├── TagManager.tsx      # 标签管理器
        ├── VoiceRecorder.tsx   # 语音录制
        ├── ImageOCR.tsx        # 图片OCR
        ├── Toolbar.tsx         # 格式工具栏
        ├── ColorPicker.tsx     # 颜色选择器
        ├── ShortcutHelp.tsx     # 快捷键帮助
        ├── Toast.tsx           # 通知组件
        └── AmbientBackground.tsx # 背景动画
```

---

## 数据模型

### Note（笔记）
```typescript
interface Note {
  id: string;              // UUID
  title: string;           // 标题
  content: string;         // HTML内容
  createdAt: number;       // 创建时间戳
  updatedAt: number;       // 更新时间戳
  tags: string[];          // 标签ID数组
  isPinned: boolean;       // 是否置顶
  isCompleted: boolean;    // 是否完成
  isArchived: boolean;     // 是否归档
  color?: string;          // 可选颜色
}
```

### Tag（标签）
```typescript
interface Tag {
  id: string;      // UUID
  name: string;    // 名称
  color: string;   // 颜色代码
}
```

---

## 本地存储

所有数据保存在浏览器 LocalStorage 中：
- `ai-notebook-notes` - 笔记数据
- `ai-notebook-tags` - 标签数据

无需后端服务器，数据完全本地掌控。

---

## 启动方式

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

---

## 设计哲学

### 反AI模板感
- ❌ 不使用千篇一律的三卡片网格
- ❌ 不使用紫色渐变 + 白色背景
- ❌ 不堆砌玻璃态/阴影效果
- ✅ 排版做大部分工作（间距、分组、层级、对齐）
- ✅ 动效精致且有目的
- ✅ 交互必须有反馈

### 状态处理
- 初始加载 → loading指示器
- 内容 → 正常展示
- 空数据 → 有意图的空状态 + 下一步操作
- 请求失败 → 可见错误提示 + 重试按钮

---

## 更新日志

### 2026-05-07
- 项目初始化
- 完成所有核心功能开发
- TypeScript编译通过
- 准备推送到GitHub

---

*由瓜瓜（AI助手）为女王大人构建*