const CLOUD_API_BASE = 'https://zhijian-api-46126657817.asia-east1.run.app'
const LOCAL_API_BASE = 'http://127.0.0.1:8000'
const API_OVERRIDE_KEY = 'STA_API_BASE'

function normalizeApiBase(value = '') {
  return String(value || '')
    .trim()
    .replace(/\/+$/, '')
}

function isAbsoluteUrl(value = '') {
  return /^https?:\/\//i.test(String(value || '').trim())
}

function getStoredApiBase() {
  try {
    const stored = normalizeApiBase(wx.getStorageSync(API_OVERRIDE_KEY))
    return isAbsoluteUrl(stored) ? stored : ''
  } catch (error) {
    return ''
  }
}

function getApiBases() {
  const stored = getStoredApiBase()
  if (stored) {
    // 允许开发者工具或本地调试时显式切到 localhost。
    // 如果存了自定义地址，就优先使用它，再回退到云端。
    return [stored, CLOUD_API_BASE]
  }
  return [CLOUD_API_BASE]
}

function getDefaultApiBase() {
  return getApiBases()[0] || CLOUD_API_BASE
}

function describeApiBase(base = '') {
  const normalized = normalizeApiBase(base)
  if (!normalized) {
    return '未配置'
  }
  if (normalized === LOCAL_API_BASE) {
    return '本机 127.0.0.1:8000'
  }
  if (normalized === CLOUD_API_BASE) {
    // 与 CLOUD_API_BASE 一致：正式域名是 zhijian，勿写 run.app（易误导合法域名配置）
    return 'zhijian.soulshock.cn'
  }
  // 自定义 API 地址（如 *.run.app）：显示主机名，便于在微信后台填 request 合法域名
  const hostMatch = normalized.match(/^https?:\/\/([^/]+)/i)
  if (hostMatch) {
    return hostMatch[1]
  }
  return normalized.replace(/^https?:\/\//i, '')
}

module.exports = {
  API_BASE: getDefaultApiBase(),
  API_OVERRIDE_KEY,
  CLOUD_API_BASE,
  LOCAL_API_BASE,
  describeApiBase,
  getApiBases,
  getDefaultApiBase,
  isAbsoluteUrl,
  normalizeApiBase,
}
