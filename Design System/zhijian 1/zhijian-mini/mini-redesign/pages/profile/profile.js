// pages/profile/profile.js
const app = getApp();

Page({
  data: {
    isLoggedIn: false,
    avatarLetter: 'U',
    roleName: '',
    maskedMember: 'Z****',
    roleLabel: '幼师',
    usagePct: 18,
    usedCount: 9,
    totalCount: 50,
    menuItems: [
      { icon: '📋', label: '我的教案',   count: 14, action: 'plans'   },
      { icon: '📝', label: '观察记录',   count: 8,  action: 'obs'     },
      { icon: '💬', label: '家园沟通',   count: 22, action: 'comms'   },
      { icon: '📚', label: '知识库文件', count: 3,  action: 'kvault'  },
    ],
    loginModalVisible: false,
    loginTab: 'login',
    loginAccount: '',
    loginPassword: '',
  },

  onShow() {
    const g = app.globalData;
    if (g.isLoggedIn) {
      const letter = (g.memberNo?.[0] || 'Z').toUpperCase();
      const roleMap = { teacher: '幼师', org_admin: '园长', platform_admin: '管理员', guest: '游客' };
      this.setData({
        isLoggedIn: true,
        avatarLetter: letter,
        maskedMember: g.memberNo ? `${g.memberNo.slice(0,2)}****` : 'Z****',
        roleLabel: roleMap[g.role] || '幼师',
      });
    } else {
      this.setData({ isLoggedIn: false });
    }
  },

  openLogin() {
    this.setData({ loginModalVisible: true, loginTab: 'login' });
  },

  closeLogin() {
    this.setData({ loginModalVisible: false });
  },

  setTab(e) {
    this.setData({ loginTab: e.currentTarget.dataset.tab });
  },

  onAccountInput(e)  { this.setData({ loginAccount:  e.detail.value }); },
  onPasswordInput(e) { this.setData({ loginPassword: e.detail.value }); },

  doLogin() {
    const { loginAccount, loginPassword, loginTab } = this.data;
    if (!loginAccount.trim() || !loginPassword.trim()) {
      wx.showToast({ title: '请填写账号和密码', icon: 'none' });
      return;
    }
    wx.showLoading({ title: loginTab === 'login' ? '登录中…' : '注册中…' });

    const endpoint = loginTab === 'login'
      ? 'https://api.zhijian.me/auth/login'
      : 'https://api.zhijian.me/auth/register';

    wx.request({
      url: endpoint,
      method: 'POST',
      data: { account: loginAccount.trim(), password: loginPassword.trim() },
      success: (res) => {
        wx.hideLoading();
        if (res.data?.user_token) {
          app.login({
            token: res.data.user_token,
            memberNo: res.data.member_no || '',
            role: res.data.role || 'teacher',
          });
          this.setData({ loginModalVisible: false });
          this.onShow();
          wx.showToast({ title: '登录成功', icon: 'success' });
        } else {
          wx.showToast({ title: res.data?.message || '登录失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '网络异常，请重试', icon: 'none' });
      },
    });
  },

  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确认退出当前账号？',
      confirmText: '退出',
      confirmColor: '#c0402a',
      success: (res) => {
        if (res.confirm) {
          app.logout();
          this.setData({ isLoggedIn: false });
          wx.showToast({ title: '已退出', icon: 'none' });
        }
      },
    });
  },

  openRedeem() {
    wx.showToast({ title: '兑换中心即将上线', icon: 'none' });
  },

  openAbout() {
    wx.showModal({
      title: '关于小纸笺',
      content: '小纸笺 v1.0.0\n智能创作助手\nhello@zhijian.me',
      showCancel: false,
      confirmText: '好的',
    });
  },

  onMenuItem(e) {
    const action = e.currentTarget.dataset.action;
    wx.showToast({ title: `${action} 功能即将上线`, icon: 'none' });
  },
});
