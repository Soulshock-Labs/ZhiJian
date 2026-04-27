"use client";

/**
 * AuthModal — 注册 / 登录弹窗
 *
 * 用法：
 *   <AuthModal open={open} onClose={() => setOpen(false)} onSuccess={(user) => …} />
 *
 * Tab 1：注册（手机号 + 密码 + 确认密码）
 * Tab 2：登录（手机号 + 密码）
 *
 * 成功后调用 onSuccess，父组件负责调用 login() 写入 useAuth。
 */

import { useEffect, useRef, useState } from "react";
import { ApiError, type AuthResponse, registerUser, loginUser } from "@/lib/api";

type Tab = "register" | "login";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (data: AuthResponse) => void;
  defaultTab?: Tab;
}

const INPUT_CLS =
  "h-10 w-full px-3 rounded-sm border border-rule bg-white text-body-sm text-ink placeholder:text-ink-4 focus:outline-none focus:border-brand focus:shadow-focus transition-colors";

const LABEL_CLS = "block text-meta text-ink-3 mb-1.5 font-medium";

export function AuthModal({ open, onClose, onSuccess, defaultTab = "login" }: AuthModalProps) {
  const [tab, setTab] = useState<Tab>(defaultTab);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const overlayRef = useRef<HTMLDivElement>(null);

  // 切 tab 时清空状态
  function switchTab(t: Tab) {
    setTab(t);
    setError("");
    setPassword("");
    setConfirm("");
  }

  // 按 ESC 关闭
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // 防止背景滚动
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  function validate(): string {
    const p = phone.trim();
    const pw = password.trim();
    if (p.length < 5)  return "手机号至少 5 位";
    if (pw.length < 6) return "密码至少 6 位";
    if (tab === "register" && pw !== confirm.trim()) return "两次密码不一致";
    return "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setBusy(true);
    setError("");
    try {
      const fn = tab === "register" ? registerUser : loginUser;
      const data = await fn({ phone: phone.trim(), password: password.trim() });
      onSuccess(data);
      // 重置表单
      setPhone("");
      setPassword("");
      setConfirm("");
    } catch (err: unknown) {
      // 尝试解析后端 detail
      let msg = "操作失败，请重试";
      if (err instanceof ApiError) {
        const body = err.body as { detail?: string } | undefined;
        msg = body?.detail || err.message;
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    /* Overlay */
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[500] flex items-center justify-center p-4"
      style={{ background: "rgba(30,28,26,0.55)", backdropFilter: "blur(3px)" }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      {/* Modal card */}
      <div className="relative w-full max-w-[380px] rounded-xl bg-paper shadow-2xl border border-rule overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-0">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-xs bg-brand text-white grid place-items-center font-wenkai text-[13px]">
              笺
            </span>
            <span className="font-wenkai text-body tracking-wider text-ink">纸笺幼师</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full text-ink-3 hover:bg-paper-sunk hover:text-ink grid place-items-center text-[18px] leading-none"
            aria-label="关闭"
          >
            ×
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-0 mx-6 mt-5 bg-paper-sunk rounded-lg p-1">
          {(["login", "register"] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => switchTab(t)}
              className={[
                "flex-1 h-8 rounded-md text-body-sm font-medium transition-all",
                tab === t
                  ? "bg-white text-ink shadow-xs"
                  : "text-ink-3 hover:text-ink",
              ].join(" ")}
            >
              {t === "login" ? "登录" : "注册"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pt-5 pb-6 flex flex-col gap-4">
          <div>
            <label className={LABEL_CLS}>手机号</label>
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="username"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="请输入手机号"
              className={INPUT_CLS}
              disabled={busy}
            />
          </div>

          <div>
            <label className={LABEL_CLS}>密码</label>
            <input
              type="password"
              autoComplete={tab === "register" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={tab === "register" ? "至少 6 位" : "请输入密码"}
              className={INPUT_CLS}
              disabled={busy}
            />
          </div>

          {tab === "register" && (
            <div>
              <label className={LABEL_CLS}>确认密码</label>
              <input
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="再次输入密码"
                className={INPUT_CLS}
                disabled={busy}
              />
            </div>
          )}

          {error && (
            <p className="text-meta text-[var(--color-danger,#c94040)] bg-[color-mix(in_oklch,#c94040,transparent_90%)] rounded-md px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-1 h-10 w-full rounded-pill bg-brand text-white text-body-sm font-semibold border border-brand shadow-sm hover:brightness-105 active:brightness-95 disabled:opacity-45 disabled:pointer-events-none transition-all"
          >
            {busy ? (tab === "register" ? "注册中…" : "登录中…") : (tab === "register" ? "创建账号" : "登录")}
          </button>

          <p className="text-center text-meta text-ink-3">
            {tab === "login" ? "还没有账号？" : "已有账号？"}
            <button
              type="button"
              onClick={() => switchTab(tab === "login" ? "register" : "login")}
              className="ml-1 text-brand hover:underline font-medium"
            >
              {tab === "login" ? "立即注册" : "去登录"}
            </button>
          </p>
        </form>

        {/* Role hint */}
        {tab === "register" && (
          <div className="mx-6 mb-5 -mt-2 text-meta text-ink-4 text-center">
            注册即代表你是幼师，角色可后续升级
          </div>
        )}
      </div>
    </div>
  );
}
