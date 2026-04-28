const { request } = require('../../utils/request')

const REDEEM_USER_KEY = 'STA_REDEEM_USER_ID'

function normalizeInput(value = '') {
  return String(value || '').trim()
}

function buildResultText(response = {}) {
  if (!response || typeof response !== 'object') {
    return ''
  }
  const status = String(response.status || '').toLowerCase()
  const service = response.service || {}

  if (status === 'unused') {
    const lines = ['状态：未使用']
    const svcLabel = service.name || service.type || ''
    const days = service.days ? `${service.days} 天` : ''
    if (svcLabel) lines.push(`权益：${svcLabel}${days ? '（' + days + '）' : ''}`)
    if (response.token_type_label) lines.push(`类型：${response.token_type_label}`)
    if (response.expires_at) lines.push(`兑换截止：${String(response.expires_at).split('T')[0]}`)
    return lines.join('\n')
  }

  if (!response.ok) {
    return `状态：${response.message || status || '失败'}`
  }

  const granted = response.granted || {}
  if (service.type === 'membership') {
    const days = service.days ? `可使用 ${service.days} 天` : ''
    const until = granted.membership_until
      ? `到期至 ${String(granted.membership_until).split('T')[0]}` : ''
    return ['状态：成功', '会员已开通', days, until].filter(Boolean).join('\n')
  }
  const lines = [
    `状态：${response.message || '成功'}`,
    `权益：${service.name || granted.name || service.type || '已发放'}`,
  ]
  if (typeof granted.balance_total !== 'undefined') {
    lines.push(`余额：${granted.balance_total} 元`)
  }
  if (typeof granted.quota_total !== 'undefined') {
    lines.push(`次数：${granted.quota_total} 次`)
  }
  return lines.join('\n')
}

Page({
  data: {
    userId: '',
    code: '',
    submitting: false,
    querying: false,
    resultText: '',
  },

  onLoad() {
    try {
      const remembered = normalizeInput(wx.getStorageSync(REDEEM_USER_KEY))
      if (remembered) {
        this.setData({ userId: remembered })
      }
    } catch (error) {
      // ignore read error
    }
  },

  onUserIdInput(event) {
    this.setData({ userId: event.detail.value || '' })
  },

  onCodeInput(event) {
    this.setData({ code: event.detail.value || '' })
  },

  async submitRedeem() {
    const userId = normalizeInput(this.data.userId)
    const code = normalizeInput(this.data.code).toUpperCase()
    if (!userId) {
      wx.showToast({ title: '请先填写账号或手机号', icon: 'none' })
      return
    }
    if (!code) {
      wx.showToast({ title: '请先填写卡密', icon: 'none' })
      return
    }

    this.setData({ submitting: true, resultText: '' })
    try {
      const res = await request('/redeem', 'POST', {
        user_id: userId,
        code,
        source: 'mini_program_redeem',
      })
      const text = buildResultText(res)
      this.setData({
        resultText: text,
        code: res?.ok ? '' : code,
      })
      try {
        wx.setStorageSync(REDEEM_USER_KEY, userId)
      } catch (error) {
        // ignore write error
      }
      wx.showToast({
        title: res?.ok ? '兑换成功' : (res?.message || '兑换失败'),
        icon: 'none',
      })
    } catch (error) {
      const message = error?.message || '兑换失败'
      this.setData({
        resultText: `状态：error，${message}`,
      })
      wx.showModal({
        title: '兑换失败',
        content: message,
        showCancel: false,
      })
    } finally {
      this.setData({ submitting: false })
    }
  },

  async queryCode() {
    const code = normalizeInput(this.data.code).toUpperCase()
    if (!code) {
      wx.showToast({ title: '请先填写卡密', icon: 'none' })
      return
    }

    this.setData({ querying: true, resultText: '' })
    try {
      const res = await request(`/redeem/query?code=${encodeURIComponent(code)}`, 'GET')
      const text = buildResultText(res)
      this.setData({ resultText: text })
      wx.showToast({
        title: res?.message || (res?.ok ? '未使用' : '查询完成'),
        icon: 'none',
      })
    } catch (error) {
      const message = error?.message || '查询失败'
      this.setData({ resultText: `状态：error，${message}` })
      wx.showModal({
        title: '查询失败',
        content: message,
        showCancel: false,
      })
    } finally {
      this.setData({ querying: false })
    }
  },
})
