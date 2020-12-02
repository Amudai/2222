import {
  BusinessModel
} from '../../models/business.js'

const businessModel = new BusinessModel()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: false,
    orderDetail: {},
    collectId: '',
    goodsInfo: [],
    showMore: false
  },

  onLoad(options) {
    // 我获取订单详情
    this.getOrderDetails(options.collect_id)
    this.setData({
      collectId: options.collect_id
    })
  },

  // 我获取订单详情
  getOrderDetails(collect_id) {
    const params = {
      collect_id
    }
    businessModel.getStoreOrderInfo(params)
      .then((res) => {
        let goodsInfo = res.goods_info
        goodsInfo = goodsInfo.slice(0, 3)
        this.setData({
          orderDetail: res,
          goodsInfo
        })
      })
  },

  // 展开更多
  showMore() {
    let goodsInfo = this.data.orderDetail.goods_info
    this.setData({
      goodsInfo,
      showMore: true
    })
  },

  // 收起更多
  closeMore() {
    let goodsInfo = this.data.orderDetail.goods_info
    goodsInfo = goodsInfo.slice(0, 3)
    this.setData({
      goodsInfo,
      showMore: false
    })
  },

  // 取消订单
  handleCanelOrder() {
    let _this = this
    wx.showModal({
      title: '温馨提示！',
      content: '确定取消该订单？取消后订单无法恢复',
      success(res) {
        if (res.confirm) {
          const params = {
            collect_id: _this.data.collectId
          }
          businessModel.storeOrdercancel(params)
            .then((res) => {
              wx.showToast({
                title: '取消订单成功',
                icon: 'none',
                duration: 2000
              });
              setTimeout(() => {
                wx.navigateBack({
                  delta: 1
                })
              }, 2000)
            })
        }
      }
    })
  },

  showPopup() {
    this.setData({ show: true });
  },

  onClose() {
    this.setData({ show: false });
  },

  // 打印订单
  handlePrintOrder() {
    const params = {
      collect_id: this.data.collectId
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
            collect_id: _this.data.collectId,
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
  }
})