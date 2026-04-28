// app.js
App({
  globalData: {
    userInfo: null,
    isLoggedIn: false,
    userToken: '',
    memberNo: '',
    role: 'teacher',
  },

  onLaunch() {
    const token = wx.getStorageSync('zj_user_token') || '';
    const memberNo = wx.getStorageSync('zj_member_no') || '';
    if (token) {
      this.globalData.isLoggedIn = true;
      this.globalData.userToken = token;
      this.globalData.memberNo = memberNo;
    }
  },

  login(info) {
    this.globalData.isLoggedIn = true;
    this.globalData.userToken = info.token;
    this.globalData.memberNo = info.memberNo || '';
    this.globalData.role = info.role || 'teacher';
    wx.setStorageSync('zj_user_token', info.token);
    wx.setStorageSync('zj_member_no', info.memberNo || '');
  },

  logout() {
    this.globalData.isLoggedIn = false;
    this.globalData.userToken = '';
    this.globalData.memberNo = '';
    wx.removeStorageSync('zj_user_token');
    wx.removeStorageSync('zj_member_no');
  },
});
