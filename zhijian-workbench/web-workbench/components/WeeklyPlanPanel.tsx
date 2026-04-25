"use client";

import { useState } from "react";
import {
  generateWeekly,
  generateDaily,
  generateWeeklyDocumentWithTemplate,
  downloadBlob,
  type WeeklyDay,
  type WeeklyPlan,
} from "@/lib/api";
import { Button } from "./ui/Button";

type Props = {
  open: boolean;
  onClose: () => void;
};

function getStoredUserId(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem("user_id") || localStorage.getItem("STA_REDEEM_USER_ID") || "";
  } catch {
    return "";
  }
}

export function WeeklyPlanPanel({ open, onClose }: Props) {
  const [theme, setTheme] = useState("");
  const [phil, setPhil] = useState("游戏化学习");
  const [classLevel, setClassLevel] = useState("中班");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<WeeklyPlan | null>(null);
  const [dailyLoading, setDailyLoading] = useState<string | null>(null); // 正在生成日教案的 day
  const [dailyError, setDailyError] = useState<string | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [documentBusy, setDocumentBusy] = useState<"" | "process">("");
  const [documentNote, setDocumentNote] = useState("");
  const [model, setModel] = useState("deepseek-chat");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!theme.trim()) return;
    setLoading(true);
    setError(null);
    setPlan(null);
    try {
      const res = await generateWeekly({
        theme: theme.trim(),
        phil: phil.trim(),
        class_level: classLevel,
        model,
      });
      setPlan(res.weekly_plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "生成失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPlan(null);
    setError(null);
    setDailyError(null);
  };

  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".docx")) {
      setDocumentNote("请上传 .docx 文档");
      return;
    }
    setDocumentFile(file);
    setDocumentName(file.name);
    setDocumentNote("");
  };

  const handleGenerateFromDocument = async () => {
    if (!documentFile) {
      setDocumentNote("请先上传文档");
      return;
    }
    if (!theme.trim()) {
      setDocumentNote("请填写主题，或上传能识别标题的文档");
      return;
    }
    setDocumentBusy("process");
    setDocumentNote("");
    try {
      const blob = await generateWeeklyDocumentWithTemplate(documentFile, {
        theme: theme.trim(),
        phil: phil.trim(),
        class_level: classLevel,
        client: "web",
        user_id: getStoredUserId(),
      });
      const safeTheme = theme.trim().replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, "_");
      downloadBlob(blob, `周计划_${safeTheme || "纸笺"}.docx`);
      setDocumentNote("已生成 Word");
    } catch (err) {
      setDocumentNote(err instanceof Error ? err.message : "文档生成失败");
    } finally {
      setDocumentBusy("");
    }
  };

  const handleGenerateDaily = async (day: string) => {
    if (!plan || dailyLoading) return;
    setDailyLoading(day);
    setDailyError(null);
    try {
      const blob = await generateDaily({ weekly_plan: plan, day, phil });
      const safeName = (plan.week_theme ?? theme).replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, "_");
      downloadBlob(blob, `日教案_${safeName}_${day}.docx`);
    } catch (err) {
      setDailyError(
        err instanceof Error ? err.message : `${day} 日教案生成失败，请重试`
      );
    } finally {
      setDailyLoading(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rule-soft sticky top-0 bg-white z-10">
          <h2 className="text-h3 font-semibold text-ink">生成本周周计划</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-ink-3 hover:bg-paper-sunk flex items-center justify-center text-lg"
            aria-label="关闭"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5">
          {/* Form */}
          {!plan && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-body-sm font-medium text-ink mb-1.5">
                  周主题 <span className="text-danger">*</span>
                </label>
                <input
                  className="w-full px-3 py-2 rounded-md border border-rule bg-paper text-ink text-body-sm focus:outline-none focus:ring-2 focus:ring-brand/40 placeholder:text-ink-3"
                  placeholder="例：春天来了 / 我爱我家 / 小小科学家"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="rounded-md border border-rule-soft bg-paper-hi px-3 py-3">
                <label className="block text-body-sm font-medium text-ink mb-1.5">
                  上传模板或旧周计划
                </label>
                <input
                  type="file"
                  accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleDocumentUpload}
                  disabled={Boolean(documentBusy)}
                  className="block w-full text-body-sm text-ink file:mr-3 file:h-8 file:px-3 file:rounded-pill file:border file:border-rule file:bg-white file:text-body-sm file:text-ink hover:file:bg-paper-sunk"
                />
                {(documentName || documentNote) && (
                  <div className="mt-2 text-meta text-ink-3">
                    {documentName && <span className="text-ink-2">{documentName}</span>}
                    {documentNote && <span>{documentName ? " · " : ""}{documentNote}</span>}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-body-sm font-medium text-ink mb-1.5">教育理念</label>
                  <select
                    className="w-full px-3 py-2 rounded-md border border-rule bg-paper text-ink text-body-sm focus:outline-none"
                    value={phil}
                    onChange={(e) => setPhil(e.target.value)}
                  >
                    <option>游戏化学习</option>
                    <option>探究式学习</option>
                    <option>蒙台梭利</option>
                    <option>瑞吉欧</option>
                    <option>生活化学习</option>
                  </select>
                </div>
                <div>
                  <label className="block text-body-sm font-medium text-ink mb-1.5">班级</label>
                  <select
                    className="w-full px-3 py-2 rounded-md border border-rule bg-paper text-ink text-body-sm focus:outline-none"
                    value={classLevel}
                    onChange={(e) => setClassLevel(e.target.value)}
                  >
                    <option value="小班">小班</option>
                    <option value="中班">中班</option>
                    <option value="大班">大班</option>
                  </select>
                </div>
                <div>
                  <label className="block text-body-sm font-medium text-ink mb-1.5">生成模型</label>
                  <select
                    className="w-full px-3 py-2 rounded-md border border-rule bg-paper text-ink text-body-sm focus:outline-none"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    title="快模型3-8秒"
                  >
                    <option value="deepseek-chat">🚀 DeepSeek（快）</option>
                    <option value="moonshot-v1-8k">⚡ Kimi 轻量版（快）</option>
                  </select>
                </div>
              </div>

              {error && (
                <p className="text-body-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" type="button" onClick={onClose}>
                  取消
                </Button>
                {documentFile && (
                  <Button
                    variant="secondary"
                    type="button"
                    disabled={Boolean(documentBusy) || !theme.trim()}
                    onClick={handleGenerateFromDocument}
                  >
                    {documentBusy === "process" ? "生成中…" : "生成并下载 Word"}
                  </Button>
                )}
                <Button
                  variant="primary"
                  type="submit"
                  disabled={loading || !theme.trim()}
                >
                  {loading ? "AI 生成中…" : "生成周计划"}
                </Button>
              </div>
            </form>
          )}

          {/* Result */}
          {plan && (
            <div>
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-h3 font-semibold text-ink">{plan.week_theme ?? theme}</p>
                  <p className="text-meta text-ink-3 mt-0.5">
                    {classLevel} · {plan.philosophy ?? phil}
                  </p>
                </div>
                <Button variant="ghost" size="sm" type="button" onClick={handleReset}>
                  重新生成
                </Button>
              </div>

              <div className="space-y-2">
                {(plan.days ?? []).map((d: WeeklyDay) => (
                  <div
                    key={d.day}
                    className="flex gap-3 items-start rounded-md border border-rule-soft bg-paper-hi px-4 py-3 group"
                  >
                    <span className="font-mono text-brand font-semibold w-8 shrink-0 pt-0.5">
                      {d.day}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-body-sm text-ink font-medium">
                        {d.task || d.activity_name || d.domain || d.day}
                      </p>
                      {(d.focus || d.domain) && (
                        <p className="text-meta text-ink-3 mt-0.5">
                          聚焦：{d.focus || d.domain}
                        </p>
                      )}
                      {(d.hint || d.teacher_hint || d.process) && (
                        <p className="text-meta text-ink-3">
                          {d.hint || d.teacher_hint || d.process}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 pt-0.5">
                      {d.activity_type && (
                        <span className="text-meta text-ink-3">{d.activity_type}</span>
                      )}
                      <button
                        onClick={() => handleGenerateDaily(d.day)}
                        disabled={!!dailyLoading}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-meta text-brand hover:text-brand-hover font-medium disabled:opacity-30 whitespace-nowrap"
                        title={`生成 ${d.day} 日教案`}
                      >
                        {dailyLoading === d.day ? "生成中…" : "生成日教案 ↓"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {dailyError && (
                <p className="text-body-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2 mt-3">
                  {dailyError}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-5 border-t border-rule-soft mt-5">
                <Button variant="ghost" type="button" onClick={onClose}>
                  关闭
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
