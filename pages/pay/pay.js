// pages/payment/payment.js
var app = getApp();
var md5 = require('../../utils/md5.js');
var md51 = require('../../utils/md51.js');
var util = require('../../utils/util.js');

import {
  BusinessModel
} from '../../models/business.js'

const businessModel = new BusinessModel()

var store_id = '';
var order_id = '';
var user_id = '';
var newopenid1 = '';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    order_id: '',
    time: 2 * 60 * 60 * 1000,
    isCollect: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('支付页面数据：', options)
    let store_info = wx.getStorageSync('store_info');
    console.log('支付页面数据：', store_info)
    user_id = options.user_id;
    store_id = options.store_id;
    let order_id = options.order_id;
    this.isStoreCollect(order_id)
    newopenid1 = options.newopenid1;
    this.setData({
      store_name: options.store_name,
      store_logo: options.store_logo,
      actual_money: options.actual_money,
      order_id: order_id
    })
  },
  // 点击返回按钮
  onClickLeft() {
    wx.switchTab({
      url: '/pages/myorder/myorder',
    })
  },

  // 判断是否是商家点单
  isStoreCollect(order_id) {
    const params = {
      order_id: order_id
    }
    businessModel.isCollect(params)
      .then((res) => {
        this.setData({
          isCollect: res.is_collect
        })
      })
  },

  // 付款
  payForWechat: function () {
    var that = this;

    let gram = util.returnGram();
    let userInfokey = wx.getStorageSync('userInfokey');
    var globalKey = wx.getStorageSync('globalKey');
    var store_info = wx.getStorageSync('store_info');
    newopenid1 = globalKey.newopenid1;
    user_id = globalKey.user_id;
    var token = gram.token;
    let order_id = this.data.order_id
    //支付订单
    wx.request({
      url: app.globalData.url + '/v2/dfm/api/order/index/',
      data: {
        request_object: app.globalData.request_object,
        store_id,
        user_id,
        open_id: newopenid1,
        token,
        timestamp: gram.timestamp,
        process: gram.process,
        order_id,
        paid_type: 2,
        remark: that.data.textareaValue || store_info.textareaValue || '',//备注
        table_number: '',
        people_count: '',
      },
      method: 'POST',
      header: {
        'Content-Type': "application/x-www-form-urlencoded"
      },
      success: function (res) {
        console.log("支付账单返回数据", res.data)
        //此时应调用微信支付界面
        if (res.data.status == true) {
          wx.requestPayment({
            timeStamp: res.data.data.timeStamp,
            nonceStr: res.data.data.nonceStr,
            package: res.data.data.package,
            signType: res.data.data.signType,
            paySign: res.data.data.sign,
            success(res) {
              console.log(res)
              if (res.errMsg == "requestPayment:ok") {
                console.log('实际支付金额：', that.data.actual_money)
                // if (that.data.isCollect == 1) {
                  wx.redirectTo({
                    url: '../payResult/payResult?store_id=' + store_id + '&order_id=' + order_id
                  })
                // } else {
                //   wx.redirectTo({
                //     url: '../code/code?store_id=' + store_id + '&order_id=' + order_id + '&user_id=' + user_id + '&token=' + token + '&newopenid1=' + newopenid1 + '&store_name=' + that.data.store_name + '&actual_money=' + that.data.actual_money
                //   })
                // }
              }
            },
            fail(res) {
              console.log(94, res)
            }
          })
          // 将缓存的ol清空
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            duration: 3000,
            complete: function () {
              setTimeout(function () {
                wx.reLaunch({
                  url: '/pages/home/index',
                  //如果已经评价成功了的话就把评论按钮隐藏
                })
              }.bind(this), 2000)

            }
          })
        }
      },
      fail: function () {
        // fail
        console.log("支付订单请求失败");

        wx.showToast({
          title: "支付订单请求失败",
          icon: 'none',
          duration: 2000,
        })
      },
      complete: function () {
        // complete
      }
    })
  }
})