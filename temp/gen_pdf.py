"""生成评审材料 PDF — 武汉震魂科技有限公司 + 小纸笺 + 第二批"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os, sys

# ── 字体：优先用系统中文字体 ──────────────────────────────────────────
FONT_CANDIDATES = [
    r"C:\Windows\Fonts\msyh.ttc",       # 微软雅黑
    r"C:\Windows\Fonts\simhei.ttf",     # 黑体
    r"C:\Windows\Fonts\simsun.ttc",     # 宋体
]
FONT_NAME = "Chinese"
for path in FONT_CANDIDATES:
    if os.path.exists(path):
        pdfmetrics.registerFont(TTFont(FONT_NAME, path))
        break
else:
    print("未找到中文字体，PDF 中文可能显示为方块。")
    FONT_NAME = "Helvetica"

# ── 颜色 ──────────────────────────────────────────────────────────────
BRAND   = colors.HexColor("#4A7C59")   # 品牌绿
INK     = colors.HexColor("#1E1C1A")
INK2    = colors.HexColor("#5A5754")
RULE    = colors.HexColor("#E5E2DE")
BG_CELL = colors.HexColor("#F7F5F2")

# ── 样式 ──────────────────────────────────────────────────────────────
def S(name, **kw):
    kw.setdefault("fontName", FONT_NAME)
    base = ParagraphStyle(name, **kw)
    return base

TITLE    = S("title",    fontSize=20, textColor=BRAND,  spaceAfter=4,  leading=28)
SUBTITLE = S("subtitle", fontSize=11, textColor=INK2,   spaceAfter=16, leading=16)
H1       = S("h1",       fontSize=13, textColor=INK,    spaceBefore=18, spaceAfter=6,  leading=20, fontName=FONT_NAME)
BODY     = S("body",     fontSize=10, textColor=INK,    spaceAfter=4,  leading=16)
BODY2    = S("body2",    fontSize=9,  textColor=INK2,   spaceAfter=2,  leading=14)
FOOTER   = S("footer",   fontSize=8,  textColor=INK2,   leading=12)

def table(data, col_widths):
    t = Table(data, colWidths=col_widths)
    t.setStyle(TableStyle([
        ("FONTNAME",        (0, 0), (-1, -1), FONT_NAME),
        ("FONTSIZE",        (0, 0), (-1, -1), 9),
        ("FONTSIZE",        (0, 0), (-1,  0), 9),
        ("FONTNAME",        (0, 0), (-1,  0), FONT_NAME),
        ("TEXTCOLOR",       (0, 0), (-1,  0), colors.white),
        ("BACKGROUND",      (0, 0), (-1,  0), BRAND),
        ("BACKGROUND",      (0, 1), (-1, -1), BG_CELL),
        ("ROWBACKGROUNDS",  (0, 1), (-1, -1), [BG_CELL, colors.white]),
        ("GRID",            (0, 0), (-1, -1), 0.4, RULE),
        ("TOPPADDING",      (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING",   (0, 0), (-1, -1), 6),
        ("LEFTPADDING",     (0, 0), (-1, -1), 8),
        ("RIGHTPADDING",    (0, 0), (-1, -1), 8),
        ("VALIGN",          (0, 0), (-1, -1), "MIDDLE"),
        ("TEXTCOLOR",       (0, 1), (-1, -1), INK),
    ]))
    return t

# ── 内容构建 ──────────────────────────────────────────────────────────
def build(out_path):
    doc = SimpleDocTemplate(
        out_path,
        pagesize=A4,
        leftMargin=2.8*cm, rightMargin=2.8*cm,
        topMargin=2.5*cm,  bottomMargin=2.5*cm,
    )
    W = A4[0] - 5.6*cm   # 可用宽度

    story = []

    # 标题区
    story.append(Paragraph("小纸笺", TITLE))
    story.append(Paragraph("AI 智能体产品评审材料", SUBTITLE))
    story.append(Paragraph("武汉震魂科技有限公司 · 2026 年 4 月", BODY2))
    story.append(HRFlowable(width="100%", thickness=1, color=RULE, spaceAfter=14))

    # 一、产品概述
    story.append(Paragraph("一、产品概述", H1))
    story.append(Paragraph(
        "小纸笺是面向幼儿园一线教师的 AI 工作台产品，核心功能为 AI 驱动的周计划生成与日教案生成。"
        "产品基于大语言模型，结合幼教领域专业知识库，帮助教师快速完成备课工作，"
        "显著降低重复劳动，提升教学准备质量。", BODY))
    story.append(Paragraph("<b>产品演示地址：</b>test.zhijian.me", BODY))

    # 二、核心功能
    story.append(Paragraph("二、核心功能", H1))
    func_data = [
        ["功能模块", "说明"],
        ["周计划生成", "输入主题、班级，AI 自动生成覆盖五大领域的完整周计划"],
        ["日教案生成", "基于周计划，一键展开任意一天的详细日教案"],
        ["文档导出",   "支持导出 Word 格式，可直接打印或上传园所系统"],
        ["账号体系",   "会员号登录，注册无需手机号，10 秒完成"],
    ]
    story.append(table(func_data, [W*0.25, W*0.75]))

    # 三、核心应用场景
    story.append(Paragraph("三、核心应用场景", H1))
    for line in [
        "幼儿园教师每周备课：主题输入 → 周计划生成 → 日教案细化 → 导出归档",
        "适用班级：小班、中班、大班",
        "支持教学流派：游戏化学习、蒙台梭利、主题教学等",
    ]:
        story.append(Paragraph(f"• {line}", BODY))

    # 四、定价说明
    story.append(Paragraph("四、定价说明", H1))
    price_data = [
        ["项目", "内容"],
        ["计费方式", "月度订阅制"],
        ["订阅价格", "9.9 元 / 月"],
        ["服务内容", "订阅期内无限次使用周计划、日教案等全部 AI 生成功能"],
        ["定价依据", "以普惠定价为原则，确保一线幼师群体的可及性；\n参考当前主流 AI 工具市场定价，结合产品现阶段体量设定"],
        ["价格构成", "含 AI 接口调用成本、服务器运营成本及产品维护成本"],
    ]
    story.append(table(price_data, [W*0.22, W*0.78]))

    # 五、联系方式
    story.append(Paragraph("五、联系方式", H1))
    story.append(Paragraph("公司名称：武汉震魂科技有限公司", BODY))
    story.append(Paragraph("提交邮箱：xiexinjing@mercallure.com", BODY))

    story.append(Spacer(1, 1*cm))
    story.append(HRFlowable(width="100%", thickness=0.5, color=RULE, spaceAfter=6))
    story.append(Paragraph("武汉震魂科技有限公司 · 小纸笺 · 第二批评审材料", FOOTER))

    doc.build(story)
    print("Generated PDF successfully.")

if __name__ == "__main__":
    out = os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        "武汉震魂科技有限公司+小纸笺+第二批.pdf"
    )
    build(out)
