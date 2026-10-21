# 日常维护：不需要 AI

编辑页：https://dudu2lulu.github.io/yichu-process-board/maintain.html

1. 选择要修改的事项或“常用表格与文档”。
2. 改日期、说明、步骤、状态解释或表格链接，查看下方预览。
3. 点击“检查并下载配置”，保留原文件名。
4. 点击“打开 GitHub 上传位置”，用有仓库写入权限的账号登录，上传刚下载的同名文件，点击 **Commit changes**。
5. GitHub Pages 自动发布。发布完成后刷新看板；编辑页不会直接写入线上文件。

界面可以增加/删除现有事项的步骤、入口和状态，以及常用文档卡片。新增整个事项时，需要添加一个事项 JSON，并在 content/index.json 登记顺序。

## 文件定位

- `content/services/`：一个事项一个 JSON；准确文件名见 AGENTS.md。
- `content/documents.json`：常用表格卡片；修改同一个表格地址时，也检查对应事项的入口。
- `content/index.json`：事项顺序和文件路径。
- `index.html`：页面骨架；`assets/styles.css`：原有样式。
- `assets/main.js`：事件绑定；`assets/modules/render.js`：详情展示；`search.js`：搜索；`data.js`：配置加载。
- `assets/editor.js`：可视化维护；`validate.js`：编辑页与本地检查共用的配置校验。

## 给后续 AI 的最小改动流程

改业务文案只打开对应 JSON；不要读整页或所有业务。改完运行：

```sh
node scripts/check.mjs content/services/reimbursement.json
git diff --check
```

把示例文件名换成本次实际修改的文件，可一次列多个。无构建步骤，无依赖安装。仅修改页面逻辑时进行一次相应浏览器检查；迁移或配置格式变化时才用 `node scripts/check.mjs --all`。

## 独立设备系统

公开看板的 equipment.json 只管说明和入口。真正申请、审批、导入和下载在独立设备系统维护；申请与审批记录不在公开仓库中。修改设备系统前先看该项目 AGENTS.md。
