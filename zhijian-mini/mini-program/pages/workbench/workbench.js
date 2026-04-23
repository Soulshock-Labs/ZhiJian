const { describeApiBase } = require('../../utils/config')
const { request, downloadDoc, downloadRemoteFile, getActiveApiBase, uploadAndParse, writeBase64Doc } = require('../../utils/request')

const PHIL_OPTIONS = [
  { label: '五大领域', value: '五大领域' },
  { label: '蒙氏教育（AMI/AMS）', value: '蒙氏教育（AMI/AMS）' },
  { label: '瑞吉欧教育', value: '瑞吉欧教育' },
  { label: 'DAP 发展适宜性实践', value: 'DAP 发展适宜性实践' },
  { label: '华德福教育', value: '华德福教育' },
  { label: '项目化学习（PBL）', value: '项目化学习（PBL）' },
  { label: '自主游戏 / 游戏化课程', value: '自主游戏 / 游戏化课程' },
  { label: '传统文化 / 国学教育', value: '传统文化 / 国学教育' },
]

const ACTIVITY_OPTIONS = [
  { id: 'morning', label: '晨间活动' },
  { id: 'outdoor', label: '户外活动' },
  { id: 'environment', label: '环境创设' },
  { id: 'life', label: '生活活动' },
  { id: 'area', label: '区域活动' },
  { id: 'family', label: '家园联动' },
]

const DAY_OPTIONS = ['周一', '周二', '周三', '周四', '周五']
const SCENE_OPTIONS = ['晨间活动', '集体活动', '区域活动', '户外活动', '生活活动']
const FALLBACK_ROADMAP = {
  to_b: [
    { module: '模块1 园部学期-月-周计划', phase: 'P0', status: 'ready' },
    { module: '模块4 幼儿成长中台', phase: 'P1', status: 'reserved' },
  ],
  to_c: [
    { module: '模块2 日计划生成与调整并回流周计划', phase: 'P0', status: 'ready' },
    { module: '模块3 拍照观察与现场记录', phase: 'P0', status: 'ready' },
  ],
}

function mapGenerateErrorToUi(error) {
  const raw = String(error?.message || '').trim()
  const text = raw.toLowerCase()
  if (!raw) {
    return {
      title: '生成失败',
      content: '服务暂时不可用，请稍后重试。',
    }
  }

  if (
    raw.includes('未放行')
    || raw.includes('合法域名')
    || text.includes('domain list')
  ) {
    return {
      title: '网络受限',
      content: '当前访问环境受限，请使用已发布版本或联系管理员处理网络配置。',
    }
  }

  if (
    raw.includes('余额不足')
    || raw.includes('次数不足')
    || raw.includes('会员')
    || raw.includes('未授权')
    || text.includes('forbidden')
    || text.includes('unauthorized')
    || text.includes('http 401')
    || text.includes('http 403')
  ) {
    return {
      title: '服务未开通',
      content: '当前账号未开通生成权限，请联系管理员开通会员后继续使用。',
    }
  }

  if (
    raw.includes('超时')
    || raw.includes('无法连接')
    || text.includes('timeout')
    || text.includes('network')
    || text.includes('http 5')
  ) {
    return {
      title: '网络繁忙',
      content: '云端服务暂时繁忙，请稍后重试。',
    }
  }

  return {
    title: '生成失败',
    content: '本次生成未完成，请稍后重试或联系管理员。',
  }
}

function getBackendStatusText() {
  const label = describeApiBase(getActiveApiBase())
  if (label === '本机 127.0.0.1:8000') {
    return '已连本机'
  }
  if (label === 'zhijian.soulshock.cn') {
    return '已连云端'
  }
  return `已连 ${label}`
}

function buildKnowledgeSummary(knowledgeBase = {}) {
  if (!knowledgeBase || typeof knowledgeBase !== 'object') {
    return {
      text: '知识库未接入',
      note: '当前服务端还没有知识库索引。',
    }
  }
  const count = Number(knowledgeBase.doc_count || 0)
  const sourceCounts = knowledgeBase.source_counts || {}
  const national = Number(sourceCounts.national_standard || 0)
  const current = Number(sourceCounts.kindergarten_current || 0)
  const others = Number(sourceCounts.kindergarten_others || 0)
  const generated = knowledgeBase.generated_at_utc || ''
  return {
    text: `知识库 ${count} 份`,
    note: `国家 ${national} · 本园 ${current} · 他园 ${others}${generated ? ` · 刷新于 ${generated}` : ''}`,
  }
}

Page({
  data: {
    backendStatus: '检测中',
    backendNote: '开发者工具会优先连接本机 127.0.0.1:8000，连不上再尝试云端。',
    knowledgeStatus: '知识库检测中',
    knowledgeNote: '',
    selectedModule: 'home',
    showAdvanced: false,
    health: {},
    roadmap: { to_b: [], to_c: [] },
    theme: '春天来了',
    templateName: '',
    templatePath: '',
    templateId: '',
    templateCloudReady: false,
    philOptions: PHIL_OPTIONS,
    phil: PHIL_OPTIONS[0].value,
    activityOptions: ACTIVITY_OPTIONS,
    selectedActivities: ['outdoor', 'area'],
    weeklyPlan: null,
    weeklyLoading: false,
    dayOptions: DAY_OPTIONS,
    dailyDay: DAY_OPTIONS[0],
    dailyPreview: null,
    dailyLoading: false,
    obsTheme: '春天种植',
    obsChild: '',
    sceneOptions: SCENE_OPTIONS,
    obsScene: SCENE_OPTIONS[1],
    obsNote: '',
    obsPreview: null,
    obsLoading: false,
    voiceStatus: '点击麦克风，说一句主题',
    voiceRecording: false,
    templateSelecting: false,
    docGenerating: false,
  },

  onLoad() {
    this.initVoiceRecorder()
    this.refreshBackendState()
  },

  onPullDownRefresh() {
    this.refreshBackendState()
      .finally(() => {
        wx.stopPullDownRefresh()
      })
  },

  goHome() {
    const pages = getCurrentPages()
    if (pages.length > 1) {
      wx.navigateBack()
      return
    }
    wx.redirectTo({
      url: '/pages/index/index',
    })
  },

  initVoiceRecorder() {
    this.recorderManager = wx.getRecorderManager()
    this.recorderManager.onStart(() => {
      this.setData({
        voiceRecording: true,
        voiceStatus: '正在录音，松开后自动识别',
      })
    })
    this.recorderManager.onStop((res) => {
      this.handleVoiceStop(res).catch((error) => {
        this.setData({
          voiceRecording: false,
          voiceStatus: error.message || '语音识别失败',
        })
        wx.showToast({
          title: error.message || '语音识别失败',
          icon: 'none',
        })
      })
    })
    this.recorderManager.onError((error) => {
      this.setData({
        voiceRecording: false,
        voiceStatus: '录音失败，请重试',
      })
      wx.showToast({
        title: error.errMsg || '录音失败',
        icon: 'none',
      })
    })
  },

  async refreshBackendState() {
    try {
      const [health, roadmap, kbStatus] = await Promise.all([
        request('/health', 'GET'),
        request('/roadmap', 'GET'),
        request('/knowledge-base/status', 'GET'),
      ])
      const kb = kbStatus.knowledge_base || health.knowledge_base || {}
      const knowledgeSummary = buildKnowledgeSummary(kb)
      this.setData({
        health,
        roadmap: roadmap.tracks || { to_b: [], to_c: [] },
        backendStatus: getBackendStatusText(),
        backendNote: `当前使用 ${describeApiBase(getActiveApiBase())}`,
        knowledgeStatus: knowledgeSummary.text,
        knowledgeNote: knowledgeSummary.note,
      })
    } catch (error) {
      this.setData({
        backendStatus: '离线演示',
        roadmap: FALLBACK_ROADMAP,
        backendNote: error.message || '当前网络不稳定，已切换离线模式。联网后下拉刷新即可恢复。',
        knowledgeStatus: '知识库未同步',
        knowledgeNote: '刷新失败后无法确认服务端知识库是否已更新。',
      })
      console.error('[workbench] refreshBackendState failed', error)
    }
  },

  switchModule(e) {
    const module = e.currentTarget.dataset.module
    this.setData({
      selectedModule: module,
      showAdvanced: true,
    })
  },

  toggleAdvanced() {
    this.setData({
      showAdvanced: !this.data.showAdvanced,
    })
  },

  bindThemeInput(e) {
    this.setData({ theme: e.detail.value })
  },

  chooseTemplate() {
    if (this.data.templateSelecting) {
      return
    }
    this.setData({ templateSelecting: true })
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['docx'],
      success: (res) => {
        const file = res.tempFiles && res.tempFiles[0]
        if (!file || !file.path) {
          wx.showToast({ title: '没有选到模板', icon: 'none' })
          return
        }
        const name = file.name || file.path.split('/').pop() || 'template.docx'
        if (!/\.docx$/i.test(name)) {
          wx.showToast({ title: '请上传 .docx 模板', icon: 'none' })
          return
        }
        this.setData({
          templateName: name,
          templatePath: file.path,
          templateId: '',
          templateCloudReady: false,
        })
        wx.showToast({ title: '模板已选中', icon: 'success' })
      },
      fail: (error) => {
        if (!String(error?.errMsg || '').includes('cancel')) {
          wx.showToast({ title: '模板选择失败', icon: 'none' })
        }
      },
      complete: () => {
        this.setData({ templateSelecting: false })
      },
    })
  },

  onPhilChange(e) {
    const index = Number(e.detail.value)
    const selected = PHIL_OPTIONS[index]
    if (selected) {
      this.setData({ phil: selected.value })
    }
  },

  toggleActivity(e) {
    const id = e.currentTarget.dataset.id
    const current = this.data.selectedActivities.slice()
    const idx = current.indexOf(id)
    if (idx > -1) {
      current.splice(idx, 1)
    } else {
      current.push(id)
    }
    this.setData({ selectedActivities: current })
  },

  onDayChange(e) {
    const index = Number(e.detail.value)
    this.setData({ dailyDay: DAY_OPTIONS[index] || DAY_OPTIONS[0], dailyPreview: null })
  },

  bindObsThemeInput(e) {
    this.setData({ obsTheme: e.detail.value })
  },

  bindObsChildInput(e) {
    this.setData({ obsChild: e.detail.value })
  },

  onSceneChange(e) {
    const index = Number(e.detail.value)
    this.setData({ obsScene: SCENE_OPTIONS[index] || SCENE_OPTIONS[0] })
  },

  bindObsNoteInput(e) {
    this.setData({ obsNote: e.detail.value })
  },

  async generateDocument() {
    const theme = String(this.data.theme || '').trim()
    const templatePath = this.data.templatePath
    if (!theme) {
      wx.showToast({ title: '先写本周主题', icon: 'none' })
      return
    }
    if (!templatePath) {
      wx.showToast({ title: '请先上传模板', icon: 'none' })
      return
    }
    this.setData({ docGenerating: true })
    wx.showLoading({ title: '正在生成文档' })
    try {
      const payload = {
        theme,
        phil: this.data.phil,
        activities: JSON.stringify(this.data.selectedActivities),
        child_initiative: 'false',
        child_desc: '',
      }
      const res = await uploadAndParse('/generate', templatePath, {
        ...payload,
        client: 'mini',
      }, 'template')
      let filePath = ''
      if (res.file_base64) {
        filePath = await writeBase64Doc(res.file_base64, res.filename || 'paper.docx')
      } else if (res.download_url) {
        filePath = await downloadRemoteFile(res.download_url)
      } else {
        throw new Error('生成成功，但没有返回文件内容')
      }
      await new Promise((resolve, reject) => {
        wx.openDocument({
          filePath,
          showMenu: true,
          success: resolve,
          fail: reject,
        })
      })
      wx.showToast({ title: '文档已生成', icon: 'success' })
    } catch (error) {
      const ui = mapGenerateErrorToUi(error)
      console.error('[workbench] generateDocument failed', error)
      wx.showModal({
        title: ui.title,
        content: ui.content,
        showCancel: false,
      })
    } finally {
      wx.hideLoading()
      this.setData({ docGenerating: false })
    }
  },

  toggleVoiceInput() {
    if (this.data.voiceRecording) {
      this.stopVoiceInput()
      return
    }
    this.startVoiceInput()
  },

  startVoiceInput() {
    if (!this.recorderManager) {
      this.initVoiceRecorder()
    }
    wx.getSetting({
      success: (res) => {
        const hasRecord = res.authSetting['scope.record']
        if (hasRecord) {
          this.beginRecorder()
          return
        }
        wx.authorize({
          scope: 'scope.record',
          success: () => this.beginRecorder(),
          fail: () => {
            this.setData({ voiceStatus: '需要麦克风权限' })
            wx.showModal({
              title: '需要录音权限',
              content: '请在设置中打开录音权限后再使用语音输入。',
              confirmText: '去设置',
              success: (modalRes) => {
                if (modalRes.confirm) {
                  wx.openSetting()
                }
              },
            })
          },
        })
      },
      fail: () => this.beginRecorder(),
    })
  },

  beginRecorder() {
    try {
      this.setData({ voiceStatus: '开始说吧，松开后自动识别' })
      this.recorderManager.start({
        duration: 60000,
        sampleRate: 16000,
        numberOfChannels: 1,
        encodeBitRate: 96000,
        format: 'mp3',
      })
    } catch (error) {
      this.setData({ voiceStatus: '录音启动失败' })
      wx.showToast({
        title: '录音启动失败',
        icon: 'none',
      })
    }
  },

  stopVoiceInput() {
    if (this.recorderManager) {
      this.recorderManager.stop()
      this.setData({
        voiceStatus: '正在识别语音...',
      })
    }
  },

  async handleVoiceStop(res) {
    const filePath = res.tempFilePath
    if (!filePath) {
      throw new Error('没有拿到录音文件')
    }
    wx.showLoading({ title: '正在识别语音' })
    try {
      const data = await uploadAndParse('/transcribe-voice-mini', filePath, {
        prompt: '这是幼儿园老师口述的主题，请转成简短清晰的中文主题，不要加解释。',
      })
      const transcript = String(data.text || '').trim()
      if (!transcript) {
        throw new Error('没有识别到有效内容')
      }
      this.setData({
        theme: transcript,
        selectedModule: 'weekly',
        showAdvanced: true,
        voiceStatus: `已识别：${transcript}`,
        voiceRecording: false,
      })
      wx.showToast({
        title: '已填入主题',
        icon: 'success',
      })
    } finally {
      wx.hideLoading()
      this.setData({ voiceRecording: false })
    }
  },

  async generateWeekly() {
    const { theme, phil, selectedActivities } = this.data
    if (!theme.trim()) {
      wx.showToast({ title: '先填一个主题', icon: 'none' })
      return
    }
    this.setData({ weeklyLoading: true })
    try {
      const res = await request('/generate-weekly', 'POST', {
        theme,
        phil,
        activities: JSON.stringify(selectedActivities),
      })
      const weeklyPlan = res.weekly_plan || null
      this.setData({
        weeklyPlan,
        dailyPreview: null,
        weeklyLoading: false,
        selectedModule: 'daily',
        dailyDay: weeklyPlan?.days?.[0]?.day || this.data.dailyDay,
      })
      wx.showToast({ title: '周计划已生成', icon: 'success' })
    } catch (error) {
      this.setData({ weeklyLoading: false })
      wx.showToast({
        title: error.message || '周计划生成失败',
        icon: 'none',
      })
    }
  },

  async generateDailyPreview() {
    if (!this.data.weeklyPlan) {
      wx.showToast({ title: '请先生成周计划', icon: 'none' })
      return
    }
    this.setData({ dailyLoading: true })
    try {
      const res = await request('/preview-daily', 'POST', {
        weekly_plan: JSON.stringify(this.data.weeklyPlan),
        day: this.data.dailyDay,
        phil: this.data.phil,
      })
      this.setData({
        dailyPreview: res,
        dailyLoading: false,
      })
    } catch (error) {
      this.setData({ dailyLoading: false })
      wx.showToast({
        title: error.message || '日计划预览失败',
        icon: 'none',
      })
    }
  },

  async generateDailyDoc() {
    if (!this.data.weeklyPlan) {
      wx.showToast({ title: '请先生成周计划', icon: 'none' })
      return
    }
    this.setData({ dailyLoading: true })
    try {
      const filename = `${this.data.dailyDay}-日计划.docx`
      const filePath = await downloadDoc('/generate-daily', 'POST', {
        weekly_plan: JSON.stringify(this.data.weeklyPlan),
        day: this.data.dailyDay,
        phil: this.data.phil,
      }, filename)
      wx.openDocument({
        filePath,
        showMenu: true,
      })
      this.setData({ dailyLoading: false })
    } catch (error) {
      this.setData({ dailyLoading: false })
      wx.showToast({
        title: error.message || '日计划下载失败',
        icon: 'none',
      })
    }
  },

  async generateObservationPreview() {
    this.setData({ obsLoading: true })
    try {
      const res = await request('/preview-observation', 'POST', {
        theme: this.data.obsTheme,
        child_name: this.data.obsChild,
        scene: this.data.obsScene,
        note: this.data.obsNote,
        phil: this.data.phil,
        photo_names: '[]',
      })
      this.setData({
        obsPreview: res,
        obsLoading: false,
      })
    } catch (error) {
      this.setData({ obsLoading: false })
      wx.showToast({
        title: error.message || '观察记录预览失败',
        icon: 'none',
      })
    }
  },

  async generateObservationDoc() {
    this.setData({ obsLoading: true })
    try {
      const filePath = await downloadDoc('/generate-observation-mini', 'POST', {
        theme: this.data.obsTheme,
        child_name: this.data.obsChild,
        scene: this.data.obsScene,
        note: this.data.obsNote,
        phil: this.data.phil,
        photo_names: '[]',
      }, `${this.data.obsTheme || '观察记录'}.docx`)
      wx.openDocument({
        filePath,
        showMenu: true,
      })
      this.setData({ obsLoading: false })
    } catch (error) {
      this.setData({ obsLoading: false })
      wx.showToast({
        title: error.message || '观察记录下载失败',
        icon: 'none',
      })
    }
  },
})
