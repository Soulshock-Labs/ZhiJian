# zhijian.soulshock.cn 线上老版本参考

来源：

```text
commit 67f422e
feat: 添加导出格式选择器（Word/PDF/图片）
```

这个版本与 `https://zhijian.soulshock.cn/` 当前线上 HTML 完全一致，是核心生成链路的参考母版。

## 值得模仿的部分

1. **短链路**
   填主题 -> 选理念/班级/活动重点 -> 上传 `.docx` 模板 -> 生成并下载。

2. **上传模板是主路径**
   老版本不把模板上传藏在“模板中心”，而是放在生成流程中。

3. **预览和导出分离**
   - `POST /preview`：只看 AI 文案
   - `POST /generate`：套模板并下载文件

4. **错误提示明确**
   - 缺主题
   - 缺用户/兑换
   - 缺 `.docx`
   - 生成失败
   - 文件过小

5. **导出格式实用**
   `docx / pdf / png` 都挂在同一个生成链路上。

## 不直接照搬的部分

1. UI 不作为新版本目标。
2. 不继续把所有逻辑堆在单文件 `index.html` / `main.py`。
3. 不继续让核心生成、模板分析、兑换、反馈混在同一个主函数里。

## 新架构里的落点

前端：

```text
web-workbench/components/WeeklyPlanPanel.tsx
web-workbench/lib/api.ts
```

后端：

```text
routers/planning.py
services/planning_service.py
word_engine/docx_filler.py
word_engine/template_tools.py
prompt_engineering/prompt_config.py
```

下一步建议：

```text
routers/template.py
services/template_service.py
```

把老版本 `/generate` 的“上传模板 -> AI 内容 -> Word/PDF/图片导出”拆成可复用服务。
