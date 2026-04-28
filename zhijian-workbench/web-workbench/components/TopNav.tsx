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

  function openLogin() { setAuthTab("login"); setSpotlightSection(null); setAuthOpen(true); }
  function openRedeemEntry() { setAuthTab("register"); setSpotlightSection("redeem"); setAuthOpen(true); }

  function handleAuthSuccess(data: AuthResponse) {
    login({
      token: data.user_token,
      account_id: data.account_id,
      member_no: data.member_no,
      user_id: data.user_id,
      role: data.role || "teacher",
      org_id: data.org_id || "",
    });
    if (spotlightSection !== "redeem") setAuthOpen(false);
  }

  const maskedMemberPrefix = user?.member_no?.[0] ? `${user.member_no[0]}****` : "未分配";
  const avatarLabel = user?.member_no?.[0] || user?.account_id?.[0]?.toUpperCase() || "U";
  const roleLabel: Record<string, string> = {
    teacher: "幼师", org_admin: "园长", guest: "游客", platform_admin: "管理员",
  };

  return (
    <>
      {/* ── TopNav ── */}
      <header
        className="sticky top-0 z-[200] flex items-center h-14 px-6 border-b border-rule-soft"
        style={{ background: "rgba(246,241,231,.95)", backdropFilter: "blur(16px) saturate(1.2)" }}
      >
        {/* Brand */}
        <a className="flex items-center gap-2.5 mr-8 no-underline" href="#">
          <div
            className="w-[30px] h-[30px] flex items-center justify-center text-white rounded-[7px] text-[17px]"
            style={{ background: "var(--color-brand)", fontFamily: "'Ma Shan Zheng', serif" }}
          >
            笺
          </div>
          <span style={{ fontFamily: "'Ma Shan Zheng', serif", fontSize: "20px", color: "var(--color-ink)", letterSpacing: ".04em" }}>
            <small style={{ fontFamily: "'Noto Serif SC', serif", fontWeight: 300, fontSize: "11px", color: "var(--color-brand)", letterSpacing: ".3em", marginRight: "2px" }}>小</small>
            纸笺
          </span>
        </a>

        {/* Nav links */}
        <nav className="flex gap-0.5">
          {links.map((l, i) => (
            <button
              key={l}
              className={[
                "h-[34px] px-3.5 inline-flex items-center rounded-pill text-body-sm transition-all border",
                i === 0
                  ? "bg-paper-hi text-ink shadow-xs border-rule-soft"
                  : "bg-transparent text-ink-3 border-transparent hover:bg-paper-sunk hover:text-ink-2",
              ].join(" ")}
            >
              {l}
            </button>
          ))}
        </nav>

        <div className="flex-1" />

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={openRedeemEntry}
            className="h-8 px-3.5 rounded-pill text-meta font-semibold cursor-pointer border whitespace-nowrap"
            style={{ background: "var(--color-success-tint)", color: "var(--color-success-ink)", borderColor: "oklch(0.56 0.08 150 / 0.3)" }}
          >
            {isLoggedIn ? "兑换中心" : "内测兑换"}
          </button>

          <div className="hidden lg:flex items-center gap-2 h-[34px] w-44 px-3.5 rounded-pill border border-rule bg-paper-hi text-ink-3 text-meta cursor-text">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="9.5" y1="9.5" x2="12.5" y2="12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>搜索教案 / 模板</span>
          </div>

          {isLoggedIn && user ? (
            <div className="flex items-center gap-2">
              {/* Usage */}
              <button className="hidden lg:flex h-8 min-w-[110px] flex-col items-start justify-center gap-0.5 rounded-pill border border-rule bg-paper-hi px-3.5 text-meta text-ink-2 hover:bg-paper-sunk whitespace-nowrap">
                <span className="text-[10px] text-ink-3 leading-none">本月用量</span>
                <div className="flex items-center gap-1.5 w-full">
                  <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: "var(--color-rule)" }}>
                    <div className="h-full rounded-full" style={{ width: "18%", background: "var(--color-brand)" }} />
                  </div>
                  <span className="font-num text-[11px] leading-none text-ink-2">18%</span>
                </div>
              </button>
              {/* Avatar */}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(v => !v)}
                  className="flex h-8 items-center gap-2 rounded-pill border border-transparent px-2.5 text-meta text-ink-2 hover:bg-paper-sunk transition-colors"
                >
                  <div
                    className="w-8 h-8 rounded-full text-white grid place-items-center text-micro font-semibold select-none"
                    style={{ background: "var(--color-brand)" }}
                  >
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
                    className="absolute right-0 top-full mt-1 w-48 rounded-lg shadow-xl border border-rule overflow-hidden z-[300]"
                    style={{ background: "var(--color-paper)" }}
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
            <button
              onClick={openLogin}
              className="h-8 px-4 rounded-pill text-white text-meta font-semibold whitespace-nowrap shadow-sm"
              style={{ background: "var(--color-brand)" }}
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
        onClose={() => { setAuthOpen(false); setSpotlightSection(null); }}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}
