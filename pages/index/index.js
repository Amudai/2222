//logs.js
var app = getApp();
const util = require('../../utils/util.js')

Page({
  data: {
    isPhone: false,
    hasPhone: false,
    isClose: true,    //判断当前页面是打开还是返回页
    isUser: false,
    hasUser: false,
    befor_page_store_id:NaN,
  },
  onLoad: function (option) {
    console.log('扫描二维码返回的参数gdgdgdgdgd',option)
    this.setData({
      befor_page_store_id:option.store_id
    })
   
    console.log('wzh1232111','跳转')
  },
  checkPhone(){
    let globalKey = wx.getStorageSync('globalKey');
    if (globalKey.hasOwnProperty('newuser1') && app.globalData.newopenid1 != '' || globalKey.hasOwnProperty('newuser1') && globalKey.hasOwnProperty('newopenid1')) {
      this.setData({ hasUser: true })
    }
    let hasPhone = false;
    if (app.globalData.user_phone != '' || globalKey.hasOwnProperty('user_phone') && globalKey.user_phone != '') {
      hasPhone = true;
    }
    this.setData({
      hasPhone
    })
    console.log('wzh1232111', '跳转22222')
    //app.getquery(app.globalData.query, globalKey)  ////去判断扫码参数
  },
  getPhoneNumber(e) {
    let that = this;
    console.log('wzh1232111', '跳转3333333')
    app.getPhoneNumber(e, that, 2)
  },
  toIndex() {
    let globalKey = wx.getStorageSync('globalKey')
    
    if (app.globalData.query) {
      // if (globalKey.hasOwnProperty("newuser1")) {
      app.getquery(app.globalData.query, globalKey, 1)
      // }else{
      //   wx.hideLoading();
      // }
    }
    // util.reLaunchindex();
  },
  toHome(){
    wx.navigateTo({
      url: '../registered/registered?store_id='+this.data.befor_page_store_id
    })
  },
  getUserInfo(e) {
    let that = this;
    
    app.getUserInfo(e, that, 2);
    //app.location();
  },
  onUnload: function () {
    var that = this
    setTimeout(function () {
      that.setData({ isClose: true })
    }, 200)
  },
  onHide: function () {
    if (this.data.isClose) {
      console.log('重新打开')
    }
  },
  onShow: function () {
    let that=this;
    app.checkOpenid().then(() => {
      that.checkPhone()
    })
  },
})
