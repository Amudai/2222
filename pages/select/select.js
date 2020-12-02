// pages/select/select.js
var app = getApp();
var util = require('../../utils/util.js');
var md5 = require('../../utils/md5.js');
//新增 10-18    导航菜单
var store_id = '';
var user_id = '';
var token = '';
var category_id = '';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    result:false,
    isOk:true,
    noResult:true,
    topNum: 0,
    isAdd: true,//是否下拉增加
    selectNum:1,
    stores:[],
    nearList:[],
    nomore:1,
    old_storeid:NaN,//上一次搜索的店铺id
  },
  //----------------------------商店路由导航开始---------------------
  /*菜单列表导航*/
  toStoreDetail: function (e) {
    //yeyuan
    console.log('旧的店铺id：',this.data.old_storeid)
    console.log('新的店铺id：', e.currentTarget.dataset.index.store_id)
    
    if (e.currentTarget.dataset.index.store_id === this.data.old_storeid) {//如果是进去了一家旧的店铺

    } else {//如果是进去了一家新店铺,清除本地存储的购物车和订单数据
      wx.setStorageSync('choosedList', {})
      wx.setStorageSync('order_info', {})
      this.setData({
        old_storeid: e.currentTarget.dataset.index.store_id
      })
    }

    let that = this;
    let store_id = e.currentTarget.dataset.index.store_id;
    that.setData({
      store_id
    })
    let scene = util.praseStrEmpty(this.options.scene);
    util.storeInfo(that, store_id, user_id, scene, app, 2);
  },
  //-------------------商店路由导航结束---------------------

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

    //清空本地储存中的购物车信息
    wx.setStorageSync('choosedList', {})
    //清空本地储存中的订单信息
    wx.setStorageSync('order_info', {})
  
    console.log(options,'select')
    let city = options.city;

    let nearList = wx.getStorageSync('nearList') ;
    console.log(nearList)
    let that=this;
    if (city) {
      this.data.city = city;
      this.data.longitude = options.longitude;
      this.data.latitude = options.latitude;

      this.setData({ city, nearList});
      this.hotList(city);
    }
    if (options.store_area !=''){
      this.data.store_area = options.store_area
    }
    wx.getSystemInfo({
      success: function(res) {
        console.log(res)
        if (res.screenHeight){
          let noStoreH = res.screenHeight -168;
          that.setData({
            noStoreH,
            contentH: noStoreH,
          })
        }
      },
    })
  },

  // 删除最近搜索
  delefn: function () {
    let nearList=[];
    wx.setStorageSync('nearList', nearList);
    this.setData({
      nearList
    })
  },
  hotList: function (city) {
    let that=this;
    var timestamp = Date.parse(new Date());
    var val = 'fanbuyhainan' + timestamp.toString();
    var process = md5.hexMD5(val);
    wx.request({
      url: app.globalData.url + '/api/mini_homepage/list_hot_store',
      method: "post",
      data: {
        timestamp,
        process,
        city,
        request_object: app.globalData.request_object,
      },
      success: function (res) {
        console.log('select', res.data.data)
        if (res.data.status == '1') {
          that.setData({
            hotList:res.data.data
          })
        }
      },fail(){

        app.showMind();
      }
    })
  },
  // 点击热门或者最近搜索
  gotoselect: function (e) {
    let store_name = e.currentTarget.dataset.value;
    console.log('跳转去搜索结果展示页面',e)
    this.getSelectData(store_name,this.data.city,1,1);
  },
  // 获取input输入值
  inputup:function(e){
    this.value=e.detail.value;
  },
  // 点击搜索
  select: function () {
    let fromSelect=true;
    let that = this;
    if (that.data.isOk){
      that.data.isOk=false;
      let timer =setTimeout(function () {
        that.data.isOk = true;
       },1000)
      console.log(that.value,63)
      that.getSelectData(that.value, that.data.city, 1, fromSelect)
    }
  },
 
  getSelectData: function (store_name, store_city, selectNum, fromSelect) {
    let that = this;
    console.log('fromSelect:',fromSelect)
    util.addHistory('nearList', store_name);// 加入最近搜索
    var timestamp = Date.parse(new Date());
    var val = 'fanbuyhainan' + timestamp.toString();
    var process = md5.hexMD5(val);
    wx.request({
      url: app.globalData.url + '/api/mini_homepage/list_store_search',
      method: "post",
      data: {
        request_object: app.globalData.request_object,
        timestamp,
        process,
        store_city,
        store_name,
        store_area:that.data.store_area||'',
        page: selectNum ,
        longitude: that.data.longitude||'',
        latitude: that.data.latitude|| '',
        limit:10,
      },
      success: function (res) {
        console.log(selectNum,'select106', res.data.data)

        if (res.data.status == '1') {
          let newData = util.addUrl(res.data.data,'store_logo');
          let stores = that.data.stores;
          
          if (fromSelect == 1) {//如果是搜索框过来的会用新店铺数组替换老店铺数组
            stores = newData
          }else{//如果不是会追加
            for (let i = 0; i < newData.length;i++){
              stores.push(newData[i])
            }
          }
          
          if (newData.length > 0 ) {
            that.data.isAdd = true
            that.setData({
              stores,
              result: true,
              noResult: true,
              selectNum,
            })
          }else{
            if (selectNum == 1) {
              wx.showToast({
                title: '没有相关店铺哦！',
              })
              that.setData({
                noResult: false,
                result: false,
                nomore: 2
              })
            }else{
              that.data.nomore = 2
              wx.showToast({
                title: '没有数据了哦！',
              })
            }
          }
        }
      }
    })
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
  onShareAppMessage: function (res) {

    app.onshare()

  },

  contentScroll: function (ev) {
    console.log(ev);
    let that = this;
    let selectNum = that.data.selectNum;
    console.log(that.data)
    if (that.data.isAdd) {
      that.data.isAdd = false;
      selectNum++;
      console.log(that.data.nomore)

      if (that.data.nomore==1){
        that.getSelectData(that.value, that.data.city, selectNum)

      }

    }


  },
  // 获取滚动条当前位置
  scrolltoupper: function (e) {
    // console.log(e)
    if (e.detail.scrollTop > 100) {
      this.setData({
        floorstatus: true
      });
    } else {
      this.setData({
        floorstatus: false
      });
    }
  },
  //回到顶部
  toTop: function (e) {  // 一键回到顶部
    this.setData({
      topNum: 0
    });
  },
})