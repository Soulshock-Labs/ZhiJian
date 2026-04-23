"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import {
  type RedeemResponse,
  queryRedeemCode,
  redeemCode,
  registerBetaUser,
} from "@/lib/api";

const USER_ID_KEY = "user_id";
const REDEEM_USER_KEY = "STA_REDEEM_USER_ID";

function normalizeInput(value: string): string {
  return value.trim();
}

function serviceLabel(response?: RedeemResponse): string {
  const service = response?.service ?? {};
  const name = service.name || service.type || response?.description || "";
  if (!name) return "";
  if (service.days) return `${name} · ${service.days} 天`;
  if (service.amount) return `${name} · ${service.amount}`;
  return String(name);
}

function resultText(response?: RedeemResponse): string {
  if (!response) return "";
  const status = response.status || "";
  const message = response.message || "";
  const service = serviceLabel(response);
  if (response.ok) {
    return [message || "可用", service, response.expires_at ? `截止 ${String(response.expires_at).split("T")[0]}` : ""]
      .filter(Boolean)
      .join(" · ");
  }
  return [message || status || "未完成", service].filter(Boolean).join(" · ");
}

export function BetaRedeemPanel() {
  const [account, setAccount] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState<"register" | "query" | "redeem" | "">("");
  const [registerNote, setRegisterNote] = useState("内测版 · 轻量高效");
  const [redeemNote, setRedeemNote] = useState("等待卡密");

  const canSubmit = useMemo(() => Boolean(normalizeInput(account)), [account]);
  const canUseCode = useMemo(() => canSubmit && Boolean(normalizeInput(code)), [account, code, canSubmit]);

  useEffect(() => {
    try {
      const remembered = localStorage.getItem(USER_ID_KEY) || localStorage.getItem(REDEEM_USER_KEY) || "";
      if (remembered) setAccount(remembered);
    } catch {
      // ignore storage
    }
  }, []);

  function rememberAccount(value: string) {
    try {
      localStorage.setItem(USER_ID_KEY, value);
      localStorage.setItem(REDEEM_USER_KEY, value);
    } catch {
      // ignore storage
    }
  }

  async function handleRegister() {
    const userId = normalizeInput(account);
    if (!userId) {
      setRegisterNote("请填写账号");
      return;
    }
    setBusy("register");
    try {
      const res = await registerBetaUser({ user_id: userId });
      rememberAccount(res.user_id || userId);
      const quota = res.service?.quota ?? 0;
      const member = res.service?.is_active_member ? "会员已开通" : "内测账号已记录";
      setRegisterNote(`${member}${quota ? ` · ${quota} 次` : ""}`);
    } catch (error) {
      setRegisterNote(error instanceof Error ? error.message : "内测登记失败");
    } finally {
      setBusy("");
    }
  }

  async function handleQuery() {
    const cardCode = normalizeInput(code).toUpperCase();
    if (!cardCode) {
      setRedeemNote("请填写卡密");
      return;
    }
    setBusy("query");
    try {
      const res = await queryRedeemCode(cardCode);
      setRedeemNote(resultText(res) || "已查询");
    } catch (error) {
      setRedeemNote(error instanceof Error ? error.message : "查询失败");
    } finally {
      setBusy("");
    }
  }

  async function handleRedeem() {
    const userId = normalizeInput(account);
    const cardCode = normalizeInput(code).toUpperCase();
    if (!userId || !cardCode) {
      setRedeemNote(!userId ? "请填写账号" : "请填写卡密");
      return;
    }
    setBusy("redeem");
    try {
      rememberAccount(userId);
      const res = await redeemCode({ user_id: userId, code: cardCode });
      setRedeemNote(resultText(res) || (res.ok ? "兑换成功" : "兑换失败"));
      if (res.ok) setCode("");
    } catch (error) {
      setRedeemNote(error instanceof Error ? error.message : "兑换失败");
    } finally {
      setBusy("");
    }
  }

  return (
    <section id="beta-redeem" className="pb-9 grid gap-3 lg:grid-cols-[0.82fr_1fr] max-w-[980px]">
      <Card variant="raised" size="sm" className="min-h-[218px] bg-[color-mix(in_oklch,var(--color-paper-hi),var(--color-white)_28%)]">
        <div className="flex h-[66px] items-start justify-between gap-3">
          <div>
            <span className="inline-flex h-5 items-center gap-1 rounded-pill bg-success-tint px-2.5 text-micro font-medium leading-none text-success-ink">
              <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
              AI 就绪
            </span>
            <h2 className="font-wenkai text-h3 font-normal text-success-ink mt-2">内测中心</h2>
            <p className="text-meta text-ink-2 mt-0.5">纸笺 · 幼师工作台 · v1.2.1</p>
          </div>
          <span className="h-7 px-3 rounded-pill bg-success border border-success inline-flex items-center text-meta font-semibold leading-none text-white shadow-xs">
            内测版
          </span>
        </div>

        <div className="mt-4">
          <label className="sr-only">账号</label>
          <input
            value={account}
            onChange={(event) => setAccount(event.target.value)}
            className="h-8 w-full px-3 rounded-sm border border-rule bg-white text-body-sm text-ink placeholder:text-ink-4 focus:border-brand focus:shadow-focus"
            placeholder="手机号 / 邮箱"
          />
        </div>

        <div className="mt-3 flex flex-col sm:flex-row gap-3 sm:items-center">
          <button
            type="button"
            disabled={!canSubmit || Boolean(busy)}
            onClick={handleRegister}
            className="h-8 px-5 rounded-pill bg-success text-white text-body-sm font-semibold border border-success shadow-sm hover:brightness-105 active:brightness-95 disabled:opacity-45 disabled:pointer-events-none sm:min-w-[124px]"
          >
            {busy === "register" ? "登记中" : "加入内测"}
          </button>
          <p className="text-meta text-ink-2">{registerNote}</p>
        </div>
      </Card>

      <Card variant="raised" size="sm" className="min-h-[218px] bg-[color-mix(in_oklch,var(--color-paper-hi),var(--color-white)_24%)]">
        <div className="flex h-[66px] items-start justify-between gap-3">
          <div>
            <span className="inline-flex h-5 items-center gap-1 rounded-pill bg-success-tint px-2.5 text-micro font-medium leading-none text-success-ink">
              <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
              权益
            </span>
            <h2 className="font-wenkai text-h3 font-normal text-success-ink mt-2">兑换中心</h2>
            <p className="text-meta text-ink-2 mt-0.5">卡密兑换 · 次数 · 会员 · 余额</p>
          </div>
          <a href="#top" className="h-7 px-3 rounded-pill bg-paper-hi border border-rule inline-flex items-center text-meta leading-none text-ink-2 hover:bg-paper-sunk">
            返回顶部
          </a>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            value={account}
            onChange={(event) => setAccount(event.target.value)}
            className="h-8 w-full px-3 rounded-sm border border-rule bg-white text-body-sm text-ink placeholder:text-ink-4 focus:border-brand focus:shadow-focus"
            placeholder="手机号 / 邮箱"
          />
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            className="h-8 w-full px-3 rounded-sm border border-rule bg-white text-body-sm text-ink placeholder:text-ink-4 focus:border-brand focus:shadow-focus"
            placeholder="卡密"
          />
        </div>

        <div className="mt-3 flex flex-col sm:flex-row gap-3 sm:items-center">
          <button
            type="button"
            disabled={!canUseCode || Boolean(busy)}
            onClick={handleRedeem}
            className="h-8 px-5 rounded-pill bg-success text-white text-body-sm font-semibold border border-success shadow-sm hover:brightness-105 active:brightness-95 disabled:opacity-45 disabled:pointer-events-none"
          >
            {busy === "redeem" ? "兑换中" : "立即兑换"}
          </button>
          <Button
            variant="secondary"
            size="sm"
            disabled={!normalizeInput(code) || Boolean(busy)}
            onClick={handleQuery}
          >
            {busy === "query" ? "查询中" : "查询状态"}
          </Button>
          <p className="text-meta text-ink-2 sm:ml-auto">{redeemNote}</p>
        </div>
      </Card>
    </section>
  );
}
