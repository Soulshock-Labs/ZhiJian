"use client";

/**
 * AuthModal — 注册 / 登录弹窗
 *
 * 注册：只填密码 → 系统自动分配会员号（如 10000）
 * 登录：会员号 + 密码
 *
 * 手机号只在小程序绑定时使用，Web 完全不涉及。
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
  const [tab, setTab]           = useState<Tab>(defaultTab);
  const [memberNo, setMemberNo] = useState("");   // 登录用
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [busy, setBusy]         = useState(false);
  const [error, setError]       = useState("");
  const [newMemberNo, setNewMemberNo] = useState(""); // 注册成功后显示
  const overlayRef = useRef<HTMLDivElement>(null);

  function switchTab(t: Tab) {
    setTab(t);
    setError("");
    setPassword("");
    setConfirm("");
    setMemberNo("");
    setNewMemberNo("");
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  function validate(): string {
    const pw = password.trim();
    if (tab === "login" && !memberNo.trim()) return "请填写会员号";
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
      if (tab === "register") {
        const data = await registerUser({ password: password.trim() });
        setNewMemberNo(data.member_no || "");
        // 注册成功先展示会员号，3秒后回调
        setTimeout(() => {
          onSuccess(data);
          setPassword("");
          setConfirm("");
          setNewMemberNo("");
        }, 3000);
      } else {
        const data = await loginUser({
          member_no: memberNo.trim(),
          password:  password.trim(),
        });
        onSuccess(data);
        setMemberNo("");
        setPassword("");
      }
    } catch (err: unknown) {
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
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[500] flex items-center justify-center p-4"
      style={{ background: "rgba(30,28,26,0.55)", backdropFilter: "blur(3px)" }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
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
                tab === t ? "bg-white text-ink shadow-xs" : "text-ink-3 hover:text-ink",
              ].join(" ")}
            >
              {t === "login" ? "登录" : "注册"}
            </button>
          ))}
        </div>

        {/* 注册成功：显示会员号 */}
        {newMemberNo ? (
          <div className="px-6 py-8 text-center">
            <p className="text-meta text-ink-3 mb-2">注册成功！你的会员号是</p>
            <p className="font-num text-[2.5rem] font-bold text-brand tracking-widest">{newMemberNo}</p>
            <p className="text-meta text-ink-4 mt-3">请牢记此号码，登录时使用</p>
            <p className="text-meta text-ink-3 mt-4">3秒后自动进入…</p>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} className="px-6 pt-5 pb-6 flex flex-col gap-4">

            {/* 登录：会员号输入框 */}
            {tab === "login" && (
              <div>
                <label className={LABEL_CLS}>会员号</label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="username"
                  value={memberNo}
                  onChange={(e) => setMemberNo(e.target.value)}
                  placeholder="请输入会员号（如 10000）"
                  className={INPUT_CLS}
                  disabled={busy}
                />
              </div>
            )}

            {/* 注册：说明文字 */}
            {tab === "register" && (
              <div className="bg-paper-sunk rounded-lg px-4 py-3">
                <p className="text-meta text-ink-2">
                  注册后系统自动分配你的会员号，请妥善保存，登录时使用。
                </p>
              </div>
            )}

            <div>
              <label className={LABEL_CLS}>密码</label>
              <input
                type="password"
                autoComplete={tab === "register" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={tab === "register" ? "设置密码（至少 6 位）" : "请输入密码"}
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
              {busy
                ? (tab === "register" ? "注册中…" : "登录中…")
                : (tab === "register" ? "创建账号" : "登录")}
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
        )}
      </div>
    </div>
  );
}
