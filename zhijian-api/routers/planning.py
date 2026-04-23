"""
routers/planning.py — 周日联动路由（HTTP 薄层）
职责：解析请求、调用 services/planning_service、返回响应。
不包含任何业务逻辑，所有计算在 planning_service 完成。

接口：
    POST /generate-weekly      → 生成五天周计划 JSON
    POST /generate-term-plan   → 园部学期-月-周骨架
    POST /apply-daily-feedback → 日计划反馈回流周计划
    GET  /roadmap              → 模块分期配置
    POST /generate-daily       → 周→日联动导出 Word
    POST /preview-daily        → 日教案 JSON 预览（调试）
"""
from __future__ import annotations

import copy
import io
import json
import os
import re
from typing import Optional

from docx.opc.exceptions import PackageNotFoundError
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse

from word_engine.docx_filler import _build_content_disposition
from word_engine.aspose_filler import _export_http_headers
from services.planning_service import (
    generate_weekly_content,
    build_term_month_week_skeleton,
    generate_daily_content,
    fill_daily_word_template,
    _build_daily_structured_docx_bytes,
)

router = APIRouter()


# ── /generate-weekly ──────────────────────────────────────────────────
@router.post("/generate-weekly", tags=["周日联动"])
async def generate_weekly(
    theme:       str = Form(...,  description="周主题"),
    phil:        str = Form(...,  description="教育理念"),
    activities:  str = Form("[]", description="活动类型列表（JSON）"),
    class_level: str = Form("中班", description="班级（小班/中班/大班）"),
):
    """
    基于主题、理念和班级，自动生成高质量周计划。
    使用 Prompt 工程系统确保输出风格一致、质量稳定（可复现）。
    返回 JSON，前端可直接展示，并允许用户选择某一天生成日教案。
    """
    try:
        acts_list: list[str] = json.loads(activities) if activities else []
        if not isinstance(acts_list, list):
            acts_list = [str(acts_list)]
    except (json.JSONDecodeError, TypeError):
        acts_list = [a.strip() for a in activities.split(",") if a.strip()] if activities else []

    plan = generate_weekly_content(theme, phil, acts_list, class_level)
    return {"status": "ok", "weekly_plan": plan}


# ── /generate-term-plan ───────────────────────────────────────────────
@router.post("/generate-term-plan", tags=["园部计划"])
async def generate_term_plan(
    term_theme:  str = Form(..., description="学期主题"),
    start_month: int = Form(2,   description="起始月份（1-12）"),
    month_count: int = Form(5,   description="学期月数（1-6）"),
):
    """园部计划骨架生成：输出学期→月→周三级结构。"""
    if not (1 <= start_month <= 12):
        raise HTTPException(status_code=400, detail="start_month 必须在 1-12 之间")
    skeleton = build_term_month_week_skeleton(term_theme, start_month, month_count)
    return {"status": "ok", "term_plan": skeleton}


# ── /apply-daily-feedback ─────────────────────────────────────────────
@router.post("/apply-daily-feedback", tags=["周日联动"])
async def apply_daily_feedback(
    weekly_plan:       str = Form(..., description="周计划 JSON"),
    day:               str = Form(..., description="目标星期，如 周一"),
    completion_score:  int = Form(..., description="执行完成度（1-5）"),
    highlights:        str = Form("",  description="今日亮点"),
    risks:             str = Form("",  description="风险与问题"),
    adjust_suggestion: str = Form("",  description="下次调整建议"),
):
    """
    日计划执行后反馈回流周计划：
    将某天的完成度与复盘意见写回 weekly_plan，形成可迭代闭环。
    """
    if not (1 <= completion_score <= 5):
        raise HTTPException(status_code=400, detail="completion_score 必须在 1-5 之间")
    try:
        plan: dict = json.loads(weekly_plan)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="weekly_plan 不是合法 JSON")

    days: list[dict] = plan.get("days", [])
    target_idx = next((i for i, d in enumerate(days) if d.get("day") == day), None)
    if target_idx is None:
        raise HTTPException(status_code=400, detail=f"未找到目标日期：{day}")

    day_item = copy.deepcopy(days[target_idx])
    day_item["execution_feedback"] = {
        "completion_score": completion_score,
        "highlights":       highlights.strip(),
        "risks":            risks.strip(),
        "adjust_suggestion": adjust_suggestion.strip(),
    }
    day_item["status"] = "reviewed"
    days[target_idx]   = day_item
    plan["days"]       = days

    return {"status": "ok", "updated_weekly_plan": plan, "updated_day": day_item}


# ── /roadmap ──────────────────────────────────────────────────────────
@router.get("/roadmap", tags=["版本规划"])
async def roadmap():
    """模块分期配置：P0 已落地，P1/P2 预留，供前端展示与后续接口扩展。"""
    return {
        "status":  "ok",
        "version": "v1.2.0",
        "tracks": {
            "to_b": [
                {"module": "模块1 园部学期-月-周计划",  "phase": "P0", "status": "ready"},
                {"module": "模块4 幼儿成长中台",        "phase": "P1", "status": "reserved"},
                {"module": "模块6 家园沟通中台",        "phase": "P1", "status": "reserved"},
                {"module": "模块7 教师发展中台",        "phase": "P2", "status": "reserved"},
            ],
            "to_c": [
                {"module": "模块2 日计划生成与调整并回流周计划", "phase": "P0", "status": "ready"},
                {"module": "模块3 拍照观察与现场记录",           "phase": "P0", "status": "ready"},
                {"module": "模块5 多场景活动引擎",               "phase": "P2", "status": "reserved"},
                {"module": "模块7 教师个人档案与成长",           "phase": "P2", "status": "reserved"},
            ],
        },
    }


# ── /generate-daily ───────────────────────────────────────────────────
@router.post("/generate-daily", tags=["周日联动"])
async def generate_daily(
    weekly_plan: str            = Form(..., description="周计划 JSON（由 /generate-weekly 返回或前端暂存）"),
    day:         str            = Form(..., description="目标星期，如 周一"),
    phil:        str            = Form(..., description="教育理念"),
    template:    Optional[UploadFile] = File(None, description="日教案 Word 模板 (.docx，可选)"),
):
    """
    周→日联动：将周计划中某一天拆解为四维日教案并导出 Word。

    四维结构：**导入**（情境激活）→ **过程**（分步操作）→ **延伸**（区域/家园）→ **反思**（观察要点）

    · 有模板：识别模板关键字单元格并回填
    · 无模板：生成结构化（非表格）日计划文档
    """
    template_bytes: Optional[bytes] = None
    if template is not None:
        if not (template.filename or "").lower().endswith(".docx"):
            raise HTTPException(status_code=400, detail="仅支持 .docx 格式")
        template_bytes = await template.read()
        if not template_bytes:
            raise HTTPException(status_code=400, detail="上传的文件为空")

    try:
        plan: dict = json.loads(weekly_plan)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="weekly_plan 不是合法 JSON")

    days: list[dict] = plan.get("days", [])
    target = next((d for d in days if d.get("day") == day), None)
    if not target:
        raise HTTPException(
            status_code=400,
            detail=f"在周计划中未找到「{day}」，可用值：{[d.get('day') for d in days]}",
        )

    week_theme = plan.get("week_theme", "本周主题")
    task = (
        target.get("task")
        or target.get("activity_name")
        or target.get("title")
        or target.get("domain")
        or day
    )

    daily_content = generate_daily_content(
        week_theme=week_theme,
        day=day,
        task=task,
        phil=phil,
    )

    if template_bytes:
        try:
            filled_bytes, export_engine = fill_daily_word_template(
                template_bytes=template_bytes,
                daily_content=daily_content,
                week_theme=week_theme,
                day=day,
                phil=phil,
            )
        except PackageNotFoundError:
            raise HTTPException(status_code=400, detail="模板解析失败，请确认上传的是有效 .docx 文件")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"日教案模板填充失败：{e}")
        original_name = os.path.basename(template.filename or "daily-template.docx")
        original_name = re.sub(r'[\\/*?:"<>|]+', "_", original_name)
        if not original_name.lower().endswith(".docx"):
            original_name += ".docx"
    else:
        filled_bytes  = _build_daily_structured_docx_bytes(
            daily_content=daily_content,
            week_theme=week_theme,
            day=day,
            phil=phil,
            source_day=target,
        )
        export_engine = "python-docx-structured"
        original_name = re.sub(r'[\\/*?:"<>|]+', "_", f"{week_theme}_{day}_日计划.docx")

    h = {"Content-Disposition": _build_content_disposition(original_name)}
    h.update(_export_http_headers(export_engine))
    return StreamingResponse(
        io.BytesIO(filled_bytes),
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers=h,
    )


# ── /preview-daily ────────────────────────────────────────────────────
@router.post("/preview-daily", tags=["调试"])
async def preview_daily(
    weekly_plan: str = Form(...),
    day:         str = Form(...),
    phil:        str = Form(...),
):
    """返回日教案 AI 内容 JSON，用于前端预览调试（不生成 Word）。"""
    try:
        plan = json.loads(weekly_plan)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="weekly_plan 不是合法 JSON")
    days   = plan.get("days", [])
    target = next((d for d in days if d.get("day") == day), None)
    if not target:
        raise HTTPException(status_code=400, detail=f"未找到「{day}」")
    content = generate_daily_content(
        week_theme=plan.get("week_theme", ""),
        day=day,
        task=target.get("task", ""),
        phil=phil,
    )
    return {"status": "ok", "day": day, "task": target.get("task"), "content": content}
