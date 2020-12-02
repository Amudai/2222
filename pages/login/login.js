var md5 = require('../../utils/md5.js')
var interval = null //倒计时函数
var timestamp = Date.parse(new Date());
var val = 'fanbuyhainan' + timestamp.toString();
var hexMD5 = md5.hexMD5(val);
var app = getApp();

Page({
  data: {
    mobile: "",
    befor_enter_store_id: NaN,//从商铺详情页进来的商铺id
  },
  formSubmit: function (e) {
    var that = this
    console.log(e.detail.value)
    // console.log(e.detail.value.mobile)
    // console.log(e.detail.value.password)
    var mobile = e.detail.value.mobile;
    var status = "";
    var psd = md5.hexMD5(e.detail.value.password);
    // console.log(psd)
    if (mobile.trim().length != 11 || !/^1[3|4|5|6|7|8|9]\d{9}$/.test(mobile)) {
      wx.showModal({
        title: '提示',
        content: '手机号输入有误',
      })
    } else {
      wx.request({
        url: 'https://dfm.dianmengmeng.com/api/users/login',
        data: {
          request_object: app.globalData.request_object,
          mobile: e.detail.value.mobile,
          password: psd,
          timestamp: timestamp,
          process: hexMD5
        },
        // header: {},
        method: 'POST',
        dataType: 'json',
        responseType: 'text',
        success: function (res) {
          //登录成功 就把后端返回的用户信息数据存入微信全局变量  yeyuan
          console.log(39, res, that)
          app.globalData.user_id = res.data.data.user_id;
          app.globalData.token = res.data.data.token;
          let userInfokey = wx.getStorageSync('userInfokey');
          userInfokey.user_id = res.data.data.user_id
          userInfokey.token = res.data.data.token;
          wx.setStorageSync('userInfokey', userInfokey)
          status = res.data.status
          if (status == 1) {
            console.log('login success!!!!', that)
            if (that.befor_enter_store_id !== NaN) {
              wx.navigateTo({
                //登录成功 跳转到之前的商铺页面
                url: '../storeDetails/storeDetails?store_id=' + that.befor_enter_store_id,
              })
            }
          } else {
            console.log('login success!!!!', that)
            wx.showToast({
              title: '密码错误',
              icon: 'none'
            })
            console.log("出错了")
          }
        },
        fail: function (res) { },
        complete: function (res) { },
      })
    }


  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log('options', options)
    this.setData({
      befor_enter_store_id: options.store_id
    })
    console.log(this.data.befor_enter_store_id)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})