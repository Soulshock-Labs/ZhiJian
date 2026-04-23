const LINE_RPX = 44

Page({
  data: {
    descLines: [
      '你只要告诉我今天的主题，',
      '我就帮你一键生成能直接用的',
      '周计划、日计划和观察记录。',
    ],
    descIndex: 0,
    /** 整段文案条的 translateY（rpx），随手指拖动实时变化 */
    descTranslateY: 0,
    descTransition: 'none',
  },

  onLoad() {
    const sys = wx.getSystemInfoSync()
    this._rpxPerPx = 750 / sys.windowWidth
  },

  /** 阻止按钮上的滑动冒泡到页面，避免拖动手势抢点击 */
  catchVoid() {},

  openWorkbench() {
    wx.navigateTo({
      url: '/pages/workbench/workbench',
    })
  },
  openRedeem() {
    wx.navigateTo({
      url: '/pages/redeem/redeem',
    })
  },

  onDescGestureStart(e) {
    if (e.mark && e.mark.descBlock) {
      this._blockDescGesture = true
      return
    }
    this._blockDescGesture = false
    if (!e.touches || !e.touches.length) return
    this._descTouchStartY = e.touches[0].clientY
    this._descDragStartIndex = this.data.descIndex
    this.setData({ descTransition: 'none' })
  },

  onDescGestureMove(e) {
    if (this._blockDescGesture) return
    if (!e.touches || !e.touches.length) return
    const dyPx = e.touches[0].clientY - this._descTouchStartY
    const dragRpx = dyPx * this._rpxPerPx
    const idx = this._descDragStartIndex
    const base = -idx * LINE_RPX
    let translate = base + dragRpx
    const minY = -(this.data.descLines.length - 1) * LINE_RPX
    const maxY = 0
    const overshoot = 24
    translate = Math.max(minY - overshoot, Math.min(maxY + overshoot, translate))
    this.setData({ descTranslateY: translate })
  },

  onDescGestureEnd(e) {
    if (this._blockDescGesture) {
      this._blockDescGesture = false
      return
    }
    if (this._descTouchStartY === undefined) return

    const changed = e.changedTouches && e.changedTouches[0]
    const endY = changed ? changed.clientY : this._descTouchStartY
    const dyRpx = (endY - this._descTouchStartY) * this._rpxPerPx

    let idx = this._descDragStartIndex
    const maxIdx = this.data.descLines.length - 1

    if (dyRpx < -20) {
      idx = Math.min(maxIdx, idx + 1)
    } else if (dyRpx > 20) {
      idx = Math.max(0, idx - 1)
    } else {
      const t = this.data.descTranslateY
      const nearest = Math.round(-t / LINE_RPX)
      idx = Math.max(0, Math.min(maxIdx, nearest))
    }

    const finalY = -idx * LINE_RPX
    this.setData({
      descIndex: idx,
      descTranslateY: finalY,
      descTransition: 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)',
    })
    delete this._descTouchStartY
  },
})
