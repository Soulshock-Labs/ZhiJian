"use client";

import { useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { AuthModal } from "./AuthModal";
import type { AuthResponse } from "@/lib/api";

export function TopNav() {
  const links = ["工作台", "周计划", "日教案", "观察记录", "模板"];
  const { user, isLoggedIn, login, logout } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [menuOpen, setMenuOpen] = useState(false);

  function openLogin() {
    setAuthTab("login");
    setAuthOpen(true);
  }

  function handleAuthSuccess(data: AuthResponse) {
    login({
      token: data.user_token,
      account_id: data.account_id,
      member_no: data.member_no,
      user_id: data.user_id,
      role: data.role || "teacher",
      org_id: data.org_id || "",
    });
    setAuthOpen(false);
  }

  // 头像优先显示会员号后4位，其次用 account_id 派生
  const avatarLabel = user
    ? user.member_no.slice(-4) || user.account_id.replace(/\D/g, "").slice(-4) || user.account_id[0]?.toUpperCase() || "U"
    : "";

  const roleLabel: Record<string, string> = {
    teacher:          "幼师",
    org_admin:        "园长",
    guest:            "游客",
    platform_admin:   "管理员",
  };

  return (
    <>
      <header
        className="sticky top-0 z-[200] flex items-center gap-6 h-[var(--nav-h-desktop)] px-7 bg-paper border-b border-rule"
        style={{ backdropFilter: "saturate(1.1)" }}
      >
        <div className="flex items-center gap-2 font-wenkai text-h3 tracking-wider">
          <span className="w-7 h-7 rounded-xs bg-brand text-white grid place-items-center font-wenkai text-[16px]">
            笺
          </span>
          <span>小纸笺</span>
        </div>
        <nav className="flex gap-2 ml-7">
          {links.map((l, i) => (
            <a
              key={l}
              className={[
                "h-9 px-4 inline-flex items-center rounded-pill text-body-sm whitespace-nowrap",
                "transition-colors cursor-pointer",
                i === 0
                  ? "bg-paper-hi text-ink shadow-xs"
                  : "text-ink-2 hover:bg-paper-sunk hover:text-ink",
              ].join(" ")}
            >
              {l}
            </a>
          ))}
        </nav>
        <div className="flex-1" />
        <div className="flex items-center gap-3">
          {/* 兑换中心 — 已登录才显示，未登录引导注册 */}
          <a
            href="#beta-redeem"
            className="h-7 px-3 rounded-pill bg-success-tint border border-[color-mix(in_oklch,var(--color-success),transparent_65%)] text-micro font-semibold text-success-ink hover:bg-[color-mix(in_oklch,var(--color-success-tint),var(--color-white)_22%)] whitespace-nowrap"
          >
            兑换中心
          </a>

          <input
            className="hidden lg:block h-8 w-[180px] px-3 rounded-sm border border-rule bg-white text-meta text-ink placeholder:text-ink-4 focus:outline-none focus:border-brand focus:shadow-focus"
            placeholder="搜索教案、模板、主题"
          />

          {isLoggedIn && user ? (
            /* ── 已登录：显示次数 + 头像 + 下拉 ── */
            <div className="flex items-center gap-2">
              <button className="h-8 px-4 rounded-pill bg-paper-hi border border-rule text-meta text-ink-2 hover:bg-paper-sunk whitespace-nowrap">
                <span className="font-num">128</span> 次
              </button>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex items-center gap-1.5 h-8 px-2 rounded-pill hover:bg-paper-sunk transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-brand text-white grid place-items-center text-micro font-semibold select-none">
                    {avatarLabel}
                  </div>
                  <span className="text-meta text-ink-2 hidden lg:block max-w-[72px] truncate">
                    {roleLabel[user.role] ?? user.role}
                  </span>
                  <svg className="w-3 h-3 text-ink-3" viewBox="0 0 12 12" fill="none">
                    <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {menuOpen && (
                  <div
                    className="absolute right-0 top-full mt-1 w-48 bg-paper rounded-lg shadow-xl border border-rule overflow-hidden z-[300]"
                    onMouseLeave={() => setMenuOpen(false)}
                  >
                    <div className="px-4 py-3 border-b border-rule">
                      <p className="text-body-sm font-medium text-ink truncate">{user.user_id}</p>
                      <p className="text-meta text-ink-3 mt-0.5">
                        会员号 {user.member_no || "未分配"} · {roleLabel[user.role] ?? user.role}
                      </p>
                    </div>
                    <button
                      onClick={() => { logout(); setMenuOpen(false); }}
                      className="w-full text-left px-4 py-2.5 text-body-sm text-ink-2 hover:bg-paper-sunk hover:text-ink transition-colors"
                    >
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ── 未登录：登录按钮 ── */
            <button
              onClick={openLogin}
              className="h-8 px-4 rounded-pill bg-brand text-white text-meta font-semibold hover:brightness-105 active:brightness-95 whitespace-nowrap shadow-sm"
            >
              登录 / 注册
            </button>
          )}
        </div>
      </header>

      <AuthModal
        open={authOpen}
        defaultTab={authTab}
        onClose={() => setAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}
