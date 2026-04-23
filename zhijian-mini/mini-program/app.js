const { API_BASE } = require('./utils/config')
const { request } = require('./utils/request')

App({
  onLaunch() {
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    wx.login({
      success: (res) => {
        const code = res.code
        if (!code) {
          return
        }
        request('/user/wxlogin', 'POST', { code })
          .then((data) => {
            if (data && data.user_token) {
              wx.setStorageSync('user_token', data.user_token)
            }
            if (data && data.openid) {
              wx.setStorageSync('openid', data.openid)
            }
          })
          .catch(() => {})
      },
      fail: () => {},
    })
  },
  globalData: {
    userInfo: null,
    apiBase: API_BASE,
  }
})
