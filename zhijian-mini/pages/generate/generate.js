// pages/generate/generate.js
const app = getApp();
const { request, downloadDoc } = require('../../utils/request');

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
          if (res.confirm) wx.switchTab({ url: '/pages/profile/profile' });
        },
      });
      return;
    }

    this.setData({ step: 'thinking' });

    // 使用统一 request 封装，自动带 user_token + 正确后端地址
    request('/generate-weekly', 'POST', {
      theme: theme.trim(),
      class_level: classOptions[classIndex],
      phil: philOptions[philIndex],
      activities: JSON.stringify(['区域活动', '户外活动']),
      user_token: userToken,
    })
      .then((res) => {
        const days = (res.days || []).map(d => ({
          day: d.day,
          title: d.task || d.activity_name || d.domain || d.day,
          focus: d.focus || d.domain || d.hint || '',
        }));
        this.setData({ step: 'result', planDays: days });
      })
      .catch(() => {
        this._handleError('生成失败，请重试');
      });
  },

  _handleError(msg) {
    this.setData({ step: 'form' });
    wx.showToast({ title: msg, icon: 'none', duration: 2500 });
  },

  downloadWord() {
    const { theme, classOptions, classIndex, philOptions, philIndex } = this.data;
    const userToken = app.globalData.userToken;
    wx.showLoading({ title: '生成文档中…' });

    downloadDoc(
      '/generate-weekly',
      'POST',
      {
        theme,
        class_level: classOptions[classIndex],
        phil: philOptions[philIndex],
        activities: JSON.stringify(['区域活动', '户外活动']),
        user_token: userToken,
        export_format: 'docx',
      },
      `周计划_${theme}.docx`,
    )
      .then((filePath) => {
        wx.hideLoading();
        wx.openDocument({ filePath, showMenu: true });
      })
      .catch(() => {
        wx.hideLoading();
        wx.showToast({ title: '下载失败，请重试', icon: 'none' });
      });
  },

  downloadDaily(e) {
    const day = e.currentTarget.dataset.day;
    wx.showToast({ title: `${day} 日教案暂未开放`, icon: 'none', duration: 1500 });
  },

  reset() {
    this.setData({ step: 'form', planDays: [], theme: '' });
  },
});
