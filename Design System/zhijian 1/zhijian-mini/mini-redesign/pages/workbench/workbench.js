// pages/workbench/workbench.js
const app = getApp();

Page({
  data: {
    greeting: '你好，老师！今天想从哪里开始？',
    dateLabel: '',
    weekLabel: '',
    weekPct: 18,
    kvFiles: [
      { icon: '📄', name: '春天主题周计划模板.docx', date: '3天前' },
      { icon: '📷', name: '户外活动观察_0425.jpg',   date: '昨天' },
    ],
    recentItems: [
      { id: '1', icon: '📋', iconBg: '#fdf0ea', title: '春天来了 · 周计划', meta: '中班 · 今天 10:23' },
      { id: '2', icon: '📝', iconBg: '#edf7f2', title: '小小科学家 · 日教案', meta: '大班 · 昨天 14:07' },
      { id: '3', icon: '💬', iconBg: '#edf4fc', title: '家长沟通 · 月末总结', meta: '中班 · 3天前' },
    ],
  },

  onLoad() {
    this._updateDateInfo();
    this._updateWeekProgress();
  },

  onShow() {
    this._updateDateInfo();
    this._updateWeekProgress();
  },

  _updateDateInfo() {
    const now = new Date();
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const h = now.getHours();
    const period = h < 6 ? '凌晨' : h < 12 ? '上午' : h < 18 ? '下午' : '晚上';
    const weekNo = Math.ceil(now.getDate() / 7);
    this.setData({
      dateLabel: `${weekdays[now.getDay()]} · ${period}`,
      weekLabel: `第 ${weekNo} 周`,
    });
  },

  _updateWeekProgress() {
    const now = new Date();
    const day = now.getDay() || 7; // 1=Mon...7=Sun
    const secIntoDay = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    const totalSec = 5 * 24 * 3600;
    const elapsed = Math.min((day - 1) * 24 * 3600 + secIntoDay, totalSec);
    const pct = Math.min((elapsed / totalSec) * 100, 100).toFixed(1);
    this.setData({ weekPct: pct });
  },

  goGenerate() {
    wx.switchTab({ url: '/pages/generate/generate' });
  },

  openRecent(e) {
    const id = e.currentTarget.dataset.id;
    wx.showToast({ title: `打开记录 #${id}`, icon: 'none' });
  },

  uploadDoc() {
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['docx', 'pdf', 'jpg', 'png'],
      success: (res) => {
        const file = res.tempFiles[0];
        const newFile = { icon: '📄', name: file.name, date: '刚刚' };
        this.setData({ kvFiles: [newFile, ...this.data.kvFiles] });
        wx.showToast({ title: '上传成功', icon: 'success' });
      },
    });
  },
});
