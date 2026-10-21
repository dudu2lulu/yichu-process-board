# 修改入口（静态 GitHub Pages，无构建、无依赖安装）

| 需求 | 只读/修改 |
|---|---|
| 报账与出差、P/Q列状态 | content/services/reimbursement.json |
| 工位与设备说明（公开入口） | content/services/equipment.json |
| 外协、数据、会议、签字 | content/services/outsourcing.json、data-transfer.json、meetings.json、signature.json 中对应一个 |
| 办公用品日期、限量提示、步骤 | content/services/office-supplies.json；仅有共同规则变更时再看 resources.json |
| 其他资源 | content/services/resources.json |
| 常用表格卡片 | content/documents.json |
| 增删事项、顺序 | content/index.json |
| 展示、搜索、样式 | assets/modules/render.js、search.js、assets/styles.css 中对应一个 |
| 维护界面 | maintain.html、assets/editor.js |

- 先用上表定位；不要默认读取 index.html、全部 JSON 或整个 assets。
- 业务规则、状态解释、日期、链接只写配置；渲染器不硬编码业务文案。
- JSON 保留字段、数组顺序及业务含义。改链接时仅在 content 中精确搜索该旧地址，更新实际引用。
- 文案/链接改动只跑 `node scripts/check.mjs <修改的JSON>` 和 `git diff --check`，无须构建或截图。
- 修改渲染/加载/搜索逻辑时，再针对对应交互做一次浏览器检查；结构性迁移才运行 `node scripts/check.mjs --all`。
- 发布：提交本次文件并推送 main；确认 GitHub Pages 最新构建终态。只核验改动资源，避免连续轮询和重复截图。
- 不修改设备后端、旧 Sites 副本或真实台账。当前未建立独立“报障”事项，不编造内容。
- 可视化维护及零 AI 发布方法：MAINTENANCE.md。
