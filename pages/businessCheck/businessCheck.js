// pages/businessCheck/businessCheck.js
import {BusinessModel} from '../../models/business.js'

const businessModel = new BusinessModel()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderInfo: {},
    collect_id: '',
    store_id: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getOrderInfo(options)
    this.setData({
      collect_id: options.collect_id,
      store_id: options.store_id
    })
  },
  // 获取收款详细
  getOrderInfo(options) {
    const parmas = {
      collect_id: options.collect_id,
      store_id: options.store_id
    }
    businessModel.getCollectOrderinfo(parmas)
      .then((res) => {
        this.setData({
          orderInfo: res
        })
      })
  },
  
  // 打印订单
  handlePrintOrder() {
    const params = {
      collect_id: this.data.collect_id
    }
    businessModel.storePrintOrder(params)
      .then((res) => {
        if (res.has_print === 1) {
          this.handleTwoPrintOrder()
        } else {
          wx.showToast({
            title: '打印订单成功',
            icon: 'none'
          })
        }
      })
  },
  // 二次打印
  handleTwoPrintOrder() {
    let _this = this
    wx.showModal({
      title: '温馨提示！',
      content: '该订单已打印过 确定要再次打印订单？',
      success(res) {
        if (res.confirm) {
          const params = {
            collect_id: _this.data.collect_id,
            print_again: 1
          }
          businessModel.storePrintOrder(params)
            .then((res) => {
              wx.showToast({
                title: '打印订单成功',
                icon: 'none',
                duration: 2000
              })
            })
        }
      }
    })
  },

  // 点击返回按钮
  onClickLeft() {
    wx.navigateTo({
      url: '../storeDetails/storeDetails?store_id=' + this.data.store_id,
    })
  },
})