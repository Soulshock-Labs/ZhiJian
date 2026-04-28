// pages/generate/generate.js
const app = getApp();

Page({
  data: {
    step: 'form',  // 'form' | 'thinking' | 'result'
    theme: '',
    classOptions: ['小班', '中班', '大班'],
    classIndex: 1,
    philOptions: ['游戏化学习', '探究式学习', '蒙台梭利', '瑞吉欧', '生活化学习'],
    philIndex: 0,
    refFileName: '',
    refFilePath: '',
    planDays: [],
  },

  onThemeInput(e) {
    this.setData({ theme: e.detail.value });
  },

  onClassChange(e) {
    this.setData({ classIndex: Number(e.detail.value) });
  },

  onPhilChange(e) {
    this.setData({ philIndex: Number(e.detail.value) });
  },

  chooseFile() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['docx', 'pdf', 'jpg', 'jpeg', 'png'],
      success: (res) => {
        const file = res.tempFiles[0];
        this.setData({ refFileName: file.name, refFilePath: file.path });
      },
      fail: () => {},
    });
  },

  clearFile() {
    this.setData({ refFileName: '', refFilePath: '' });
  },

  submit() {
    const { theme, classOptions, classIndex, philOptions, philIndex } = this.data;
    if (!theme.trim()) {
      wx.showToast({ title: '请填写周主题', icon: 'none' });
      return;
    }
    const userToken = app.globalData.userToken;
    if (!userToken) {
      wx.showModal({
        title: '请先登录',
        content: '登录后才能使用 AI 生成功能',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({ url: '/pages/profile/profile' });
          }
        },
      });
      return;
    }

    this.setData({ step: 'thinking' });

    // 调用后端 API
    wx.request({
      url: 'https://api.zhijian.me/generate/weekly',
      method: 'POST',
      data: {
        theme: theme.trim(),
        class_level: classOptions[classIndex],
        phil: philOptions[philIndex],
        user_token: userToken,
        model: 'deepseek-chat',
      },
      success: (res) => {
        if (res.data && res.data.weekly_plan) {
          const days = (res.data.weekly_plan.days || []).map(d => ({
            day: d.day,
            title: d.task || d.activity_name || d.domain || d.day,
            focus: d.focus || d.domain || d.hint || '',
          }));
          this.setData({ step: 'result', planDays: days });
        } else {
          this._handleError('生成失败，请重试');
        }
      },
      fail: () => {
        this._handleError('网络异常，请检查连接');
      },
    });
  },

  _handleError(msg) {
    this.setData({ step: 'form' });
    wx.showToast({ title: msg, icon: 'none', duration: 2500 });
  },

  downloadWord() {
    const userToken = app.globalData.userToken;
    wx.showLoading({ title: '生成文档中…' });
    wx.request({
      url: 'https://api.zhijian.me/generate/weekly/document',
      method: 'POST',
      responseType: 'arraybuffer',
      data: {
        theme: this.data.theme,
        class_level: this.data.classOptions[this.data.classIndex],
        phil: this.data.philOptions[this.data.philIndex],
        user_token: userToken,
      },
      success: (res) => {
        wx.hideLoading();
        const fileName = `周计划_${this.data.theme}.docx`;
        const filePath = `${wx.env.USER_DATA_PATH}/${fileName}`;
        const fs = wx.getFileSystemManager();
        fs.writeFile({
          filePath,
          data: res.data,
          encoding: 'binary',
          success: () => {
            wx.openDocument({ filePath, showMenu: true });
          },
          fail: () => wx.showToast({ title: '保存失败', icon: 'none' }),
        });
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '下载失败，请重试', icon: 'none' });
      },
    });
  },

  downloadDaily(e) {
    const day = e.currentTarget.dataset.day;
    wx.showToast({ title: `${day} 日教案下载中…`, icon: 'loading', duration: 1500 });
    // 实际接入参考 downloadWord 逻辑，endpoint: /generate/daily
  },

  reset() {
    this.setData({ step: 'form', planDays: [], theme: '' });
  },
});
