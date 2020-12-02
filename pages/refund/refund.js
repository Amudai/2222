// pages/refund/refund.js
import { RefundModel } from '../../models/refund.js'
const refundModel = new RefundModel()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    refundData: {},
    refundReason: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      refundData: options
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  // 获取退款原因
  radioChange(e) {
    this.setData({
      refundReason: e.detail.value
    })
  },

  // 提交信息
  submitRefundInfo() {
    if (!this.data.refundReason) {
      wx.showToast({
        title: '退款原因不能为空',
        icon: 'none'
      })
      return
    }
    const parmas = {
      reason: this.data.refundReason,
      order_id: this.data.refundData.order_id
    }
    refundModel.getRefund(parmas)
      .then((res) => {
        wx.navigateTo({
          url: '../refundProcess/refundProcess?store_id=' + this.data.refundData.store_id + '&order_id=' + this.data.refundData.order_id
        })
      })
  }
})