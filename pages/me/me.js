// pages/me.js
var app = getApp();
var util = require('../../utils/util.js');
var user_id = '';
var timer = null;
import {
  BusinessModel
} from '../../models/business.js'
const businessModel = new BusinessModel()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPhone: false,
    isUser: false,
    isshowModal: false,
    isAssistant: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.showModal();
    this.validateIsAssistant()
  },

  // 判断是否为店员
  validateIsAssistant() {
    const params = {
      store_id: 0
    }
    businessModel.isAssistant(params)
      .then((res) => {
        this.setData({
          isAssistant: res.is_assistant
        })
      })
  },

  showModal() {
    let me = this;

    app.showLoading();
    app.checkOpenid().then(() => {
      util.showModal(me, app);
    })

    let globalKey = wx.getStorageSync('globalKey');
    let newuser1 = globalKey.newuser1;
    if (globalKey.hasOwnProperty('newuser1')) {
      me.fetchAuthorize(newuser1);
    } else {
      let timer = setTimeout(function () {
        me.fetchAuthorize();
        clearTimeout(timer);
      }, 1000)

    }
  },

  closeshowModal(e) {
    let index = e.target.dataset.index || 0;
    if (index != 2 && index != 0) {
      wx.switchTab({
        url: '/pages/home/index'
      })
    }
  },

  showLoading() {
    app.showLoading();
  },

  fetchAuthorize(newuser1) {
    if (newuser1) {
      app.showLoading()
      this.setData({
        isPhone: false,
        isUser: false,
        isshowModal: false,
      })
    }
  },

  getUserInfo: function (e) {
    let that = this;
    app.getUserInfo(e, that, 1)
  },

  getPhoneNumber: function (e) {
    let that = this;
    app.getPhoneNumber(e, that, 1)

  },

  returnArr: function () {
    var globalKey = wx.getStorageSync('globalKey');
    let arr = [{
      user_id: this.data.user_id || globalKey.user_id,
    }]
    return arr;
  },
  getData() {
    return '';
  },

  // 跳转优惠券
  jumpToFudou() {
    wx.navigateTo({
      url: '../fudou/fudou'
    })
  },

  // 跳转店铺订单列表
  jumpToStoreList() {
    wx.navigateTo({
      url: '../storeOrder/storeOrder'
    })
  }
})