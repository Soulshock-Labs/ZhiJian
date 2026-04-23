const {
  API_BASE,
  describeApiBase,
  getApiBases,
  isAbsoluteUrl,
  normalizeApiBase,
} = require('./config')

const QUICK_TIMEOUT = 4000
const DEFAULT_REQUEST_TIMEOUT = 30000
const DEFAULT_DOWNLOAD_TIMEOUT = 45000
const DEFAULT_UPLOAD_TIMEOUT = 60000

const USER_TOKEN_KEY = 'user_token'

let activeApiBase = API_BASE

function shouldSkipUserToken(path = '') {
  const normalized = String(path || '').split('?')[0]
  return normalized === '/user/wxlogin'
}

function attachUserToken(payload = {}, path = '') {
  const data = { ...payload }
  if (shouldSkipUserToken(path)) {
    return data
  }
  try {
    const token = wx.getStorageSync(USER_TOKEN_KEY)
    if (token && data.user_token === undefined) {
      data.user_token = token
    }
  } catch (err) {
    // ignore storage errors
  }
  return data
}

function encodeForm(data = {}) {
  return Object.keys(data)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key] ?? '')}`)
    .join('&')
}

function setActiveApiBase(base = '') {
  const normalized = normalizeApiBase(base)
  if (normalized) {
    activeApiBase = normalized
  }
}

function getActiveApiBase() {
  return activeApiBase || API_BASE
}

function getTimeout(path = '', fallbackTimeout = DEFAULT_REQUEST_TIMEOUT) {
  const normalizedPath = String(path || '')
  if (normalizedPath === '/health' || normalizedPath === '/roadmap') {
    return QUICK_TIMEOUT
  }
  return fallbackTimeout
}

function getApiBaseCandidates(preferredBase = '') {
  const ordered = [
    normalizeApiBase(preferredBase),
    normalizeApiBase(getActiveApiBase()),
    ...getApiBases().map((base) => normalizeApiBase(base)),
  ].filter(Boolean)
  return Array.from(new Set(ordered))
}

function buildUrl(base, path) {
  if (isAbsoluteUrl(path)) {
    return normalizeApiBase(path)
  }
  const normalizedPath = String(path || '')
  const safePath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`
  return `${normalizeApiBase(base)}${safePath}`
}

function createError(message, retryable = false) {
  const error = new Error(message)
  error.retryable = retryable
  return error
}

function getErrorLabel(target = '') {
  const normalized = normalizeApiBase(target)
  if (!normalized) {
    return '后端'
  }
  return describeApiBase(normalized)
}

function normalizeTransportError(err, target, fallbackMessage = '请求失败') {
  const raw = String(err?.errMsg || err?.message || fallbackMessage)
  const label = getErrorLabel(target)
  if (raw.includes('url not in domain list')) {
    const hint =
      '请在微信公众平台 → 开发 → 开发管理 → 服务器域名 → request 合法域名 中添加 https://'
      + label
      + '（须备案类目一致）。仅开发工具调试可：详情 → 本地设置 → 不校验合法域名…'
    return createError(`域名未放行：${label}。${hint}`, true)
  }
  if (raw.includes('timeout')) {
    return createError(`连接 ${label} 超时`, true)
  }
  if (raw.includes('fail')) {
    return createError(`无法连接 ${label}`, true)
  }
  return createError(raw)
}

function normalizeHttpError(res, target) {
  const detail = Array.isArray(res.data?.detail)
    ? res.data.detail.map((item) => item.msg || JSON.stringify(item)).join('；')
    : (res.data?.detail || res.data?.message)
  return createError(`${getErrorLabel(target)}：${detail || `HTTP ${res.statusCode}`}`)
}

function mergeErrors(errors = [], fallbackMessage = '请求失败') {
  const messages = Array.from(new Set(
    errors
      .map((error) => error?.message || String(error || ''))
      .filter(Boolean)
  ))
  return createError(messages.join('；') || fallbackMessage)
}

async function withApiFallback(path, runner, options = {}) {
  const bases = getApiBaseCandidates(options.base)
  const errors = []
  for (let index = 0; index < bases.length; index += 1) {
    const base = bases[index]
    try {
      const result = await runner(base)
      setActiveApiBase(base)
      return result
    } catch (error) {
      errors.push(error)
      if (!error.retryable) {
        throw error
      }
    }
  }
  throw mergeErrors(errors, `${path} 请求失败`)
}

function request(path, method = 'GET', data = {}, options = {}) {
  const payload = method === 'GET' ? data : attachUserToken(data, path)
  return withApiFallback(path, (base) => new Promise((resolve, reject) => {
    wx.request({
      url: buildUrl(base, path),
      method,
      data: method === 'GET' ? data : encodeForm(payload),
      timeout: getTimeout(path, options.timeout || DEFAULT_REQUEST_TIMEOUT),
      header: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
          return
        }
        reject(normalizeHttpError(res, base))
      },
      fail: (err) => reject(normalizeTransportError(err, base)),
    })
  }), options)
}

function downloadDoc(path, method, data, filename = 'paper.docx', options = {}) {
  const payload = attachUserToken(data, path)
  return withApiFallback(path, (base) => new Promise((resolve, reject) => {
    wx.request({
      url: buildUrl(base, path),
      method,
      data: encodeForm(payload),
      responseType: 'arraybuffer',
      timeout: getTimeout(path, options.timeout || DEFAULT_DOWNLOAD_TIMEOUT),
      header: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      success: (res) => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(normalizeHttpError(res, base))
          return
        }
        const fs = wx.getFileSystemManager()
        const filePath = `${wx.env.USER_DATA_PATH}/${Date.now()}-${filename}`
        fs.writeFile({
          filePath,
          data: res.data,
          success: () => resolve(filePath),
          fail: (err) => reject(normalizeTransportError(err, base, '文件写入失败')),
        })
      },
      fail: (err) => reject(normalizeTransportError(err, base)),
    })
  }), options)
}

function uploadAndParse(path, filePath, formData = {}, fieldName = 'audio', options = {}) {
  const mergedForm = attachUserToken(formData, path)
  return withApiFallback(path, (base) => new Promise((resolve, reject) => {
    wx.uploadFile({
      url: buildUrl(base, path),
      filePath,
      name: fieldName,
      formData: mergedForm,
      timeout: getTimeout(path, options.timeout || DEFAULT_UPLOAD_TIMEOUT),
      success: (res) => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(normalizeHttpError(res, base))
          return
        }
        try {
          const parsed = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
          resolve(parsed)
        } catch (err) {
          reject(createError(`返回解析失败：${err.message || err}`))
        }
      },
      fail: (err) => reject(normalizeTransportError(err, base)),
    })
  }), options)
}

function writeBase64Doc(base64Data, filename = 'paper.docx') {
  return new Promise((resolve, reject) => {
    const fs = wx.getFileSystemManager()
    const safeName = String(filename || 'paper.docx').replace(/[\\/:*?"<>|]/g, '_')
    const filePath = `${wx.env.USER_DATA_PATH}/${Date.now()}-${safeName}`
    fs.writeFile({
      filePath,
      data: String(base64Data || ''),
      encoding: 'base64',
      success: () => resolve(filePath),
      fail: (err) => reject(createError(`文件写入失败：${err.errMsg || err.message || err}`)),
    })
  })
}

async function downloadRemoteFile(urlOrPath, options = {}) {
  if (isAbsoluteUrl(urlOrPath)) {
    return new Promise((resolve, reject) => {
      wx.downloadFile({
        url: normalizeApiBase(urlOrPath),
        timeout: options.timeout || DEFAULT_DOWNLOAD_TIMEOUT,
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.tempFilePath)
            return
          }
          reject(normalizeHttpError(res, urlOrPath))
        },
        fail: (err) => reject(normalizeTransportError(err, urlOrPath, '下载失败')),
      })
    })
  }

  return withApiFallback(urlOrPath, (base) => new Promise((resolve, reject) => {
    wx.downloadFile({
      url: buildUrl(base, urlOrPath),
      timeout: options.timeout || DEFAULT_DOWNLOAD_TIMEOUT,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.tempFilePath)
          return
        }
        reject(normalizeHttpError(res, base))
      },
      fail: (err) => reject(normalizeTransportError(err, base, '下载失败')),
    })
  }), options)
}

module.exports = {
  request,
  downloadDoc,
  encodeForm,
  downloadRemoteFile,
  getActiveApiBase,
  uploadAndParse,
  writeBase64Doc,
}
