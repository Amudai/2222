import {
  BusinessModel
} from '../../models/business.js'

const businessModel = new BusinessModel()
let myGlobalTimeout = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    order_id: null,
    payData: {},
    times: 0,
    loadingStatus: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // console.log('options', options)
    // this.handleCheckOrder(options.order_id)
    // 384514
    this.getPayResult(options.order_id)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  // 核销订单
  handleCheckOrder(order_id) {
    const params = {
      order_id
    }
    businessModel.checkOrder(params)
      .then((res) => {
        console.log(res);
      })
  },

  // 获取支付结果数据
  getPayResult(order_id) {
    const params = {
      order_id
    }
    businessModel.payResult(params)
      .then((res) => {
        this.setData({
          payData: res,
          loadingStatus: false
        })
        clearTimeout(myGlobalTimeout);
        // this.handleCheckOrder(order_id);
      })
      .catch(res => {
        if (res.error_code === 4000) {
          this.setData({
            payData: res.data,
            loadingStatus: false
          })
          clearTimeout(myGlobalTimeout);
        } else if (this.data.times < 5) {
          const time = this.data.times + 1;
          this.setData({
            times: time
          })
          myGlobalTimeout = setTimeout(() => {
            this.getPayResult(order_id);
          }, 1000)
        } else {
          this.setData({
            payData: res.data,
            loadingStatus: false
          })
          clearTimeout(myGlobalTimeout);
        }
      })
  },

  // 跳转福猫礼券页面
  jumpToCoupon() {
    wx.navigateTo({
      url: '../coupon/coupon'
    })
  },
  //福豆页面
  jumpToFudou(){
    wx.navigateTo({
      url: '../fudou/fudou'
    })
  },
  // 返回首页
  goHome() {
    wx.switchTab({
      url: '../home/index',
    })
  },
  // 点击返回按钮
  onClickLeft() {
    if (this.data.payData.store_id) {
      wx.redirectTo({
        url: '../storeDetails/storeDetails?store_id=' + this.data.payData.store_id,
      })
    } else {
      wx.switchTab({
        url: '/pages/myorder/myorder',
      })
    }
    
  }
})