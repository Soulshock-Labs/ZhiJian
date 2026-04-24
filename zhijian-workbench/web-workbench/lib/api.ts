/**
 * 薄 API 客户端 —— web-workbench 通往 FastAPI 的唯一通道。
 *
 * 规则：
 * 1. dev 模式通过 NEXT_PUBLIC_API_BASE 指向本地 FastAPI（例如 http://localhost:8000）
 * 2. 生产 build 后，静态产物由 FastAPI 挂在 /workbench/，API 在同域根路径，留空即可
 * 3. 不依赖任何第三方 fetch 库，zero dependency
 * 4. 所有函数都写明返回类型，避免 any 蔓延
 */

const DEFAULT_API_BASE = "https://zhijian-api-46126657817.asia-east1.run.app";

export const API_BASE = (
  process.env.NEXT_PUBLIC_API_BASE || DEFAULT_API_BASE
).replace(/\/$/, "");

export class ApiError extends Error {
  constructor(public status: number, message: string, public body?: unknown) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  init?: RequestInit & { timeoutMs?: number },
): Promise<T> {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const ctrl = new AbortController();
  const timeoutMs = init?.timeoutMs ?? 15_000;
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      cache: "no-store",
      ...init,
      signal: ctrl.signal,
      headers: { Accept: "application/json", ...(init?.headers ?? {}) },
    });

    const text = await res.text();
    const body: unknown = text ? safeJson(text) : undefined;

    if (!res.ok) {
      throw new ApiError(res.status, `${res.status} ${res.statusText}`, body);
    }
    return body as T;
  } finally {
    clearTimeout(timer);
  }
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  return request<T>(path, { ...init, method: "GET" });
}

export function apiPost<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
  return request<T>(path, {
    ...init,
    method: "POST",
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

// ---------- 具体接口封装 ----------

export type HealthResponse = {
  status?: string;
  [k: string]: unknown;
};

export function healthCheck(): Promise<HealthResponse> {
  return apiGet<HealthResponse>("/health");
}

// ---------- /knowledge-base/status ----------

export type KbStatusPayload = {
  enabled: boolean;
  doc_count: number;
  index_ready: boolean;
  generated_at_utc: string;
  bucket_counts: Record<string, number>;
  source_counts: Record<string, number>;
  profile_route_count: number;
};

export type KbStatusResponse = {
  status: string;
  knowledge_base: KbStatusPayload;
};

export function getKbStatus(): Promise<KbStatusResponse> {
  return apiGet<KbStatusResponse>("/knowledge-base/status");
}

// ---------- Form POST 助手（FastAPI Form 参数专用） ----------

export function apiPostForm<T>(
  path: string,
  data: Record<string, string>,
  init?: RequestInit & { timeoutMs?: number },
): Promise<T> {
  return request<T>(path, {
    ...init,
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      ...(init?.headers ?? {}),
    },
    body: new URLSearchParams(data).toString(),
    timeoutMs: init?.timeoutMs ?? 60_000, // AI 生成可能超 15s
  });
}

// ---------- 上传模板 / 按模板生成 ----------

export type UploadedTemplateResponse = {
  status: string;
  template_id: string;
  filename: string;
  size: number;
  storage?: "gcs" | "local" | string;
  uploaded_at_utc?: string;
};

export type MiniDocumentResponse = {
  status: string;
  download_url?: string;
  export_token?: string;
  filename?: string;
  engine?: string;
  storage?: "gcs" | "local" | string;
  file_base64?: string;
  document_id?: string;
  mode?: string;
  read?: DocumentReadResult;
};

export type DocumentReadResult = {
  format?: string;
  detected_kind?: string;
  title?: string;
  paragraphs?: number;
  tables?: number;
  table_rows?: number;
  text_chars?: number;
  outline?: string[];
  headings?: string[];
  preview_lines?: string[];
  text_preview?: string;
};

export type UploadedDocumentResponse = {
  status: string;
  document_id: string;
  filename: string;
  kind?: string;
  size?: number;
  storage?: "gcs" | "local" | string;
  uploaded_at_utc?: string;
  read?: DocumentReadResult;
};

export type MiniGenerateParams = {
  theme: string;
  phil?: string;
  activities?: string[] | string;
  child_initiative?: boolean;
  child_desc?: string;
  class_level?: string;
  client?: string;
  user_id?: string;
  user_token?: string;
};

function normalizeActivities(value: string[] | string | undefined): string {
  if (Array.isArray(value)) return JSON.stringify(value);
  return value ?? "[]";
}

function miniGenerateForm(params: MiniGenerateParams): Record<string, string> {
  return {
    theme: params.theme,
    phil: params.phil ?? "五大领域",
    activities: normalizeActivities(params.activities),
    child_initiative: String(Boolean(params.child_initiative)),
    child_desc: params.child_desc ?? "",
    class_level: params.class_level ?? "",
    client: params.client ?? "web",
    user_id: params.user_id ?? "",
    user_token: params.user_token ?? "",
  };
}

export function uploadTemplateFile(
  file: File,
  params: { client?: string; user_id?: string; user_token?: string } = {},
): Promise<UploadedTemplateResponse> {
  const body = new FormData();
  body.append("template", file);
  body.append("client", params.client ?? "web");
  if (params.user_id) body.append("user_id", params.user_id);
  if (params.user_token) body.append("user_token", params.user_token);

  return request<UploadedTemplateResponse>("/mini-template/upload", {
    method: "POST",
    body,
    timeoutMs: 60_000,
  });
}

export function generateMiniByTemplate(
  params: MiniGenerateParams & { template_id: string },
): Promise<MiniDocumentResponse> {
  return apiPostForm<MiniDocumentResponse>(
    "/generate-mini-by-template",
    {
      ...miniGenerateForm(params),
      template_id: params.template_id,
    },
    { timeoutMs: 90_000 },
  );
}

export function generateMiniWithTemplateFile(
  file: File,
  params: MiniGenerateParams,
): Promise<MiniDocumentResponse> {
  const body = new FormData();
  Object.entries(miniGenerateForm(params)).forEach(([key, value]) => {
    body.append(key, value);
  });
  body.append("template", file);

  return request<MiniDocumentResponse>("/generate-mini", {
    method: "POST",
    body,
    timeoutMs: 90_000,
  });
}

export async function generateWeeklyDocumentWithTemplate(
  file: File,
  params: MiniGenerateParams & { export_format?: "docx" | "pdf" | "png" | string },
): Promise<Blob> {
  const body = new FormData();
  Object.entries(miniGenerateForm({ ...params, client: params.client ?? "web" })).forEach(([key, value]) => {
    body.append(key, value);
  });
  body.append("export_format", params.export_format ?? "docx");
  body.append("template", file);

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 90_000);
  try {
    const res = await fetch(`${API_BASE}/generate`, {
      method: "POST",
      cache: "no-store",
      signal: ctrl.signal,
      body,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new ApiError(res.status, `${res.status} ${res.statusText}`, text);
    }

    return await res.blob();
  } finally {
    clearTimeout(timer);
  }
}

// ---------- 通用文档读取 / 处理 / 输出 ----------

export function uploadDocumentFile(
  file: File,
  params: { kind?: string; client?: string; user_id?: string; user_token?: string } = {},
): Promise<UploadedDocumentResponse> {
  const body = new FormData();
  body.append("document", file);
  body.append("kind", params.kind ?? "source");
  body.append("client", params.client ?? "web");
  if (params.user_id) body.append("user_id", params.user_id);
  if (params.user_token) body.append("user_token", params.user_token);

  return request<UploadedDocumentResponse>("/documents/upload", {
    method: "POST",
    body,
    timeoutMs: 60_000,
  });
}

export function processUploadedDocument(
  params: MiniGenerateParams & {
    document_id: string;
    mode?: "weekly" | "daily" | "observation" | string;
    day?: string;
    task?: string;
    child_name?: string;
    scene?: string;
    note?: string;
    include_base64?: boolean;
  },
): Promise<MiniDocumentResponse> {
  return apiPostForm<MiniDocumentResponse>(
    "/documents/process",
    {
      ...miniGenerateForm(params),
      document_id: params.document_id,
      mode: params.mode ?? "weekly",
      day: params.day ?? "周三",
      task: params.task ?? "",
      child_name: params.child_name ?? "",
      scene: params.scene ?? "活动现场",
      note: params.note ?? "",
      include_base64: String(Boolean(params.include_base64)),
    },
    { timeoutMs: 90_000 },
  );
}

// ---------- 内测 / 兑换 ----------

export type UserServiceState = {
  membership_until?: string;
  is_active_member?: boolean;
  balance?: number;
  quota?: number;
  [k: string]: unknown;
};

export type RegisterUserResponse = {
  ok: boolean;
  is_new?: boolean;
  user_id: string;
  created_at_utc?: string;
  service?: UserServiceState;
};

export type RedeemService = {
  type?: string;
  name?: string;
  days?: number;
  amount?: number;
  [k: string]: unknown;
};

export type RedeemResponse = {
  ok?: boolean;
  status?: string;
  message?: string;
  token_type?: string;
  token_type_label?: string;
  expires_at?: string;
  used_at_utc?: string;
  used_by?: string;
  description?: string;
  service?: RedeemService;
  granted?: Record<string, unknown>;
};

export function registerBetaUser(params: {
  user_id: string;
  phone?: string;
}): Promise<RegisterUserResponse> {
  return apiPost<RegisterUserResponse>("/user/register", {
    user_id: params.user_id,
    phone: params.phone ?? params.user_id,
  });
}

export function queryRedeemCode(code: string): Promise<RedeemResponse> {
  return apiGet<RedeemResponse>(`/redeem/query?code=${encodeURIComponent(code)}`);
}

export function redeemCode(params: {
  user_id: string;
  code: string;
  source?: string;
}): Promise<RedeemResponse> {
  return apiPost<RedeemResponse>("/redeem", {
    user_id: params.user_id,
    code: params.code,
    source: params.source ?? "web_workbench_redeem",
  });
}

// ---------- /generate-weekly ----------

export type WeeklyDay = {
  day: string;
  task: string;
  activity_name?: string;
  domain?: string;
  process?: string;
  teacher_hint?: string;
  focus?: string;
  activity_type?: string;
  hint?: string;
  [k: string]: unknown;
};

export type WeeklyPlan = {
  week_theme?: string;
  philosophy?: string;
  days: WeeklyDay[];
  [k: string]: unknown;
};

export type WeeklyPlanResponse = {
  status: string;
  weekly_plan: WeeklyPlan;
};

export function generateWeekly(params: {
  theme: string;
  phil: string;
  class_level?: string;
  activities?: string;
  model?: string;
}): Promise<WeeklyPlanResponse> {
  return apiPostForm<WeeklyPlanResponse>("/generate-weekly", {
    theme: params.theme,
    phil: params.phil,
    class_level: params.class_level ?? "中班",
    activities: params.activities ?? "[]",
    model: params.model ?? "",
  });
}

// ---------- /generate-daily（返回 .docx 二进制） ----------

export async function generateDaily(params: {
  weekly_plan: WeeklyPlan;
  day: string;
  phil: string;
}): Promise<Blob> {
  const url = `${API_BASE}/generate-daily`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 90_000); // 文档生成较慢

  try {
    const res = await fetch(url, {
      method: "POST",
      cache: "no-store",
      signal: ctrl.signal,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        weekly_plan: JSON.stringify(params.weekly_plan),
        day: params.day,
        phil: params.phil,
      }).toString(),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new ApiError(res.status, `${res.status} ${res.statusText}`, text);
    }

    return await res.blob();
  } finally {
    clearTimeout(timer);
  }
}

/** 触发浏览器下载一个 Blob 文件 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function downloadGeneratedDocument(result: MiniDocumentResponse): Promise<void> {
  const filename = result.filename || "纸笺文档.docx";
  if (result.file_base64) {
    const binary = atob(result.file_base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    downloadBlob(
      new Blob([bytes], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      }),
      filename,
    );
    return;
  }
  if (result.download_url) {
    const url = `${API_BASE}${result.download_url.startsWith("/") ? result.download_url : `/${result.download_url}`}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      throw new ApiError(res.status, `${res.status} ${res.statusText}`, await res.text());
    }
    downloadBlob(await res.blob(), filename);
    return;
  }
  throw new Error("生成成功，但没有返回可下载文件");
}
