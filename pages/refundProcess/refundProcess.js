import {
  RefundModel
} from '../../models/refund.js'

const refundModel = new RefundModel()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    options: {},
    refundData: {},
    titlename: '申请进度'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getRefundInfo(options)
    this.setData({
      options: options
    })
  },
  // 点击返回按钮
  onClickLeft() {
    wx.navigateBack({
      complete: (res) => {},
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  // 获取退款进度
  getRefundInfo(options) {
    const params = {
      order_id: options.order_id
    }
    refundModel.getRefundInfo(params)
      .then((res) => {
        this.setData({
          refundData: res
        })
      })
  },
  // 取消退款
  cancelRefund() {
    const params = {
      order_id: this.data.options.order_id
    }
    refundModel.cancelRefund(params)
      .then((res) => {
        wx.showToast({
          title: '取消退款成功',
        })
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/myorder/myorder',
          })
        }, 2000)
      })
  },
  // 返回首页
  toHome() {
    // app.globalData.order_status = 2;
    wx.switchTab({
      url: '/pages/myorder/myorder',
    })
  },
})