"use client";

/**
 * useAuth — 轻量登录态管理（localStorage + 内存 state）
 *
 * 存储结构（localStorage）：
 *   zj_user_token   string   登录 token
 *   zj_user_id      string   用户 ID（手机号）
 *   zj_user_role    string   角色：teacher / org_admin / platform_admin
 *   zj_org_id       string   所属园所 ID（暂时为 ""）
 *
 * 对外暴露：
 *   user        { token, user_id, role, org_id } | null
 *   login()     写入并广播
 *   logout()    清除并广播
 *   isLoggedIn  boolean
 */

import { useEffect, useState, useCallback } from "react";

const KEYS = {
  token:   "zj_user_token",
  user_id: "zj_user_id",
  role:    "zj_user_role",
  org_id:  "zj_org_id",
} as const;

export type AuthUser = {
  token:   string;
  user_id: string;
  role:    string;
  org_id:  string;
};

function readFromStorage(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const token   = localStorage.getItem(KEYS.token)   || "";
    const user_id = localStorage.getItem(KEYS.user_id) || "";
    if (!token || !user_id) return null;
    return {
      token,
      user_id,
      role:   localStorage.getItem(KEYS.role)   || "teacher",
      org_id: localStorage.getItem(KEYS.org_id) || "",
    };
  } catch {
    return null;
  }
}

function writeToStorage(user: AuthUser) {
  try {
    localStorage.setItem(KEYS.token,   user.token);
    localStorage.setItem(KEYS.user_id, user.user_id);
    localStorage.setItem(KEYS.role,    user.role);
    localStorage.setItem(KEYS.org_id,  user.org_id);
    // 同时更新旧 key，兼容 BetaRedeemPanel 等旧逻辑
    localStorage.setItem("user_id", user.user_id);
    localStorage.setItem("STA_REDEEM_USER_ID", user.user_id);
  } catch {
    // ignore
  }
}

function clearStorage() {
  try {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}

// ── 简单的跨组件广播（同 tab 内用自定义事件） ──
const AUTH_EVENT = "zj_auth_change";

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);

  // 首次挂载时从 storage 读取
  useEffect(() => {
    setUser(readFromStorage());

    function onAuthChange() {
      setUser(readFromStorage());
    }

    window.addEventListener(AUTH_EVENT, onAuthChange);
    return () => window.removeEventListener(AUTH_EVENT, onAuthChange);
  }, []);

  const login = useCallback((userData: AuthUser) => {
    writeToStorage(userData);
    setUser(userData);
    window.dispatchEvent(new Event(AUTH_EVENT));
  }, []);

  const logout = useCallback(() => {
    clearStorage();
    setUser(null);
    window.dispatchEvent(new Event(AUTH_EVENT));
  }, []);

  return {
    user,
    isLoggedIn: Boolean(user),
    login,
    logout,
  };
}
