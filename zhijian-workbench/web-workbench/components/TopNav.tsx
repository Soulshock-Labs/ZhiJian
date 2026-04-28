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
  const [spotlightSection, setSpotlightSection] = useState<"redeem" | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  function openLogin() {
    setAuthTab("login");
    setSpotlightSection(null);
    setAuthOpen(true);
  }

  function openRegister() {
    setAuthTab("register");
    setSpotlightSection(null);
    setAuthOpen(true);
  }

  function openRedeemEntry() {
    setAuthTab("register");
    setSpotlightSection("redeem");
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
    if (spotlightSection !== "redeem") {
      setAuthOpen(false);
    }
  }

  // 头像优先显示会员号后4位，其次用 account_id 派生
  const maskedMemberPrefix = user?.member_no?.[0] ? `${user.member_no[0]}****` : "未分配";
  const avatarLabel = user?.member_no?.[0] || user?.account_id?.[0]?.toUpperCase() || "U";

  const roleLabel: Record<string, string> = {
    teacher:          "幼师",
    org_admin:        "园长",
    guest:            "游客",
    platform_admin:   "管理员",
  };
  const topControlBase =
    "inline-flex h-10 items-center justify-center rounded-pill border border-rule bg-paper-hi px-5 text-meta font-semibold leading-none text-ink transition-colors whitespace-nowrap";

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
          {isLoggedIn && user?.role === "platform_admin" ? (
            <a
              href="#admin-console"
              className={`${topControlBase} hover:bg-paper-sunk`}
            >
              管理后台
            </a>
          ) : null}

          {isLoggedIn ? (
            <button
              type="button"
              onClick={openRedeemEntry}
              className={`${topControlBase} border-[color-mix(in_oklch,var(--color-success),transparent_65%)] bg-success-tint text-success-ink hover:bg-[color-mix(in_oklch,var(--color-success-tint),var(--color-white)_22%)]`}
            >
              兑换中心
            </button>
          ) : (
            <button
              type="button"
              onClick={openRedeemEntry}
              className={`${topControlBase} border-[color-mix(in_oklch,var(--color-success),transparent_65%)] bg-success-tint text-success-ink hover:bg-[color-mix(in_oklch,var(--color-success-tint),var(--color-white)_22%)]`}
            >
              内测兑换
            </button>
          )}

          <input
            className="hidden lg:block h-10 w-[172px] rounded-pill border border-rule bg-white px-4 text-meta text-ink placeholder:text-ink-4 focus:outline-none focus:border-brand focus:shadow-focus"
            placeholder="搜索教案、模板、主题"
          />

          {isLoggedIn && user ? (
            /* ── 已登录：显示次数 + 头像 + 下拉 ── */
            <div className="flex items-center gap-2">
              {/* Token 用量占位，后续接真实数据 */}
              <button className="flex h-10 min-w-[132px] flex-col items-start justify-center gap-1 rounded-pill border border-rule bg-paper-hi px-4 text-meta text-ink-2 hover:bg-paper-sunk whitespace-nowrap">
                <span className="text-[10px] text-ink-3 leading-none">本月用量</span>
                <div className="flex items-center gap-1.5 w-full">
                  <div className="flex-1 h-1 rounded-full bg-rule overflow-hidden">
                    <div className="h-full rounded-full bg-brand" style={{ width: "18%" }} />
                  </div>
                  <span className="font-num text-[11px] leading-none text-ink-2">18%</span>
                </div>
              </button>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex h-10 items-center gap-2 rounded-pill border border-transparent px-3 text-meta text-ink-2 hover:bg-paper-sunk transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-brand text-white grid place-items-center text-micro font-semibold select-none">
                    {avatarLabel}
                  </div>
                  <span className="hidden max-w-[72px] truncate text-meta leading-none text-ink-2 lg:block">
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
                      <p className="text-body-sm font-medium text-ink">当前账号</p>
                      <p className="mt-0.5 text-meta text-ink-3">
                        会员号 {maskedMemberPrefix} · {roleLabel[user.role] ?? user.role}
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
        spotlightSection={spotlightSection}
        isLoggedIn={isLoggedIn}
        authUser={user}
        onClose={() => {
          setAuthOpen(false);
          setSpotlightSection(null);
        }}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}
