//index.js
//获取应用实例

var app = getApp();

var test = require('../../utils/WSCoordinate.js')
var zhuan_dingwei = require('../../utils/dingwei.js');
var util = require('../../utils/util.js');
var amap = require('../../utils/amap-wx.js');
var md5 = require('../../utils/md5.js');
var time = 1000;
let homedata = [];
//新增 10-18    导航菜单
var store_id = '';
var old_store_id = '';
var user_id = '';
var token = '';
var category_id = '';

import {
  HomeModel
} from '../../models/home.js'
const homeModel = new HomeModel()

Page({
  data: {
    showOpenLoal: false,
    searchTop: false, // 是否吸顶
    currentIndex: 0, // banner
    curCity: '', //当前城市
    fcity: '',
    page: 1, //加载更多的页数，默认是第0页
    isshowModal: false,
    isAdd: true,
    stores: [], //商品列表
    hide: false,
    status: 0,
    topNum: 0,
    isMask: true,
    isShowCate: false,
    isUser: false,
    isPhone: false,
    isCityMask: false, //是否获取城市定位
    isPosition: false, //是否定位
    isChooseCity: false,
    userlogosrc: '',
    statusBarHeight: 20,
    toBarHeight: 44
  },

  onShow() {
    console.log(wx.getStorageSync('userInfoKey'))
    console.log(app.logosrc)
    if (wx.getStorageSync('userInfoKey')) {
      this.setData({
        userlogosrc: wx.getStorageSync('userInfoKey').avatarUrl
      })
    }
    if (this.data.isChooseCity) {
      this.data.stores = []
      this.data.page = 1
      let localCur = wx.getStorageSync('localCur')
      this.getHomedata(this.data.curCity, localCur.longitude | 0, localCur.latitude | 0)
      this.getMoreData(this.data.page, this.data.curCity)
      this.data.isChooseCity = false
    }
  },
  // 初始化一次
  onLoad(options) {
    
    let _that = this;
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          statusBarHeight: res.statusBarHeight
        })
        if (res.platform == "ios") {
          this.setData({
            toBarHeight: 44
          })
        } else if (res.platform == "android") {
          this.setData({
            toBarHeight: 48
          })
        } else {
          this.setData({
            toBarHeight: 44
          })
        }
      }
    })
    console.log(options)
    // 获取地址
    // let localCur = wx.getStorageSync('localCur')
    // if (!localCur) {
    this.getLocal()
    // } else {
    //   this.getHomedata(localCur.city, localCur.longitude, localCur.latitude)
    //   this.getMoreData(this.data.page, localCur.city)
    // }
    let globalKey = wx.getStorageSync('globalKey');
    if (!globalKey.hasOwnProperty('user_id') && !globalKey.user_id) {
      app.checkOpenid().then(() => {
        util.showModal(this, app);
      })
    }
  },

  // 获取手机号码
  getPhoneNumber: function (e) {
    let that = this;
    app.getPhoneNumber(e, that, 4);
  },
  // 获取用户信息
  getUserInfo: function (e) {
    let that = this;
    app.getUserInfo(e, that, 4)
  },

  /*菜单列表导航*/
  toStoreDetail: function (e) {
    let that = this;
    let store_id = e.currentTarget.dataset.index.store_id;
    old_store_id = store_id
    let globalKey = wx.getStorageSync('globalKey');
    util.storeInfo(that, store_id, globalKey.user_id, app, 2); //把this通过实参传进去
  },

  // 获取地址
  getLocal() {
    wx.getLocation({ //调用微信api获取经纬度
      type: 'wgs84',
      altitude: true,
      isHighAccuracy: true,
      highAccuracyExpireTime: 4000,
      success: (res) => {
        console.log(res)
        if (res.errMsg == "getLocation:ok") {
          wx.showLoading({
            title: '位置信息获取中',
          })
          var myAmapFun = new amap.AMapWX({
            key: 'd909b59416287f4eeecfd7f57d4251c4'
          });
          myAmapFun.getRegeo({
            success: (data) => {
              console.log(data, 53)
              //成功回调
              if (data.length > 0) {
                let city = data[0].regeocodeData.addressComponent.city
                let localCur = {
                  city,
                  latitude: data[0].latitude,
                  longitude: data[0].longitude
                }
                wx.setStorageSync('localCur', localCur)
                let cityInfos = wx.getStorageSync('cityInfos') || {};
                if (cityInfos.hasOwnProperty("city") && cityInfos.city != city || util.praseStrEmpty(cityInfos.store_area) != '') {
                  wx.showModal({
                    title: '提示',
                    content: '您当前所在位置已发生变化，是否切换到当前所在位置？',
                    mask: true,
                    success: (res) => {
                      if (res.confirm) {
                        cityInfos = {};
                        wx.setStorageSync('cityInfos', cityInfos)
                        this.setData({
                          store_area: '',
                          city,
                          status: 1
                        })

                        this.getHomedata(city, localCur.longitude, localCur.latitude);
                        this.data.page = 1;
                        this.getMoreData(this.data.page, city)
                      } else if (res.cancel) {

                        let city = cityInfos.city;
                        if (cityInfos.area) {
                          city = cityInfos.area
                        }
                        this.getHomedata(city, localCur.longitude, localCur.latitude);
                        this.getMoreData(this.data.page, city)
                      }
                    }
                  })
                } else {
                  this.setData({
                    status: 1
                  })
                  this.getHomedata(city, localCur.longitude, localCur.latitude);
                  this.getMoreData(this.data.page, city)
                }
              }
            },
            complete: () => {
              this.setData({
                isCityMask: false
              })
            }
          })
        } else {
          wx.showToast({
            title: '请检查网络是或者定位是否开启',
            icon: 'none'
          })
        }
      },
      fail: (res) => {
        console.log(res, 65)
        //判断是否获得了用户地理位置授权
        if (res.errMsg == "getLocation:fail auth deny") {
          let localCur = wx.getStorageSync('localCur')
          if (localCur) {
            this.getHomedata(localCur.city, localCur.longitude, localCur.latitude)
            this.getMoreData(this.data.page, localCur.city)
          } else {
            this.getMoreData(this.data.page, '')
            this.getHomedata('', 0, 0)
          }
        } else if (res.errMsg == "getLocation:fail authorize no response") {
          this.openLoal()
        } else {
          let localCur = wx.getStorageSync('localCur')
          if (localCur) {
            this.getHomedata(localCur.city, localCur.longitude, localCur.latitude)
            this.getMoreData(this.data.page, localCur.city)
          } else {
            this.getMoreData(this.data.page, '')
            this.getHomedata('', 0, 0)
          }
        }
      }
    })

  },
  //开启是否定位弹窗
  openLoal() {
    this.setData({
      showOpenLoal: true
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    app.onshare()
  },

  // 切换城市
  changeCity() {
    let url = '';
    if (this.data.status == 2) {
      url = '../citys/citys?city=' + this.data.curCity + '&fcity=' + this.data.fcity
    } else {
      url = '../citys/citys?city=' + this.data.curCity
    }
    wx.navigateTo({
      url
    })
  },


  showModal() {
    let me = this;
    util.showModal(me, app);
  },

  // 获取数据
  getHomedata(curCity, longitude, latitude) {
    let store_city = curCity
    let store_area = ''
    if (this.data.status == 2) {
      store_area = curCity
      store_city = this.data.fcity
    }
    const params = {
      store_city,
      latitude,
      longitude,
      store_area
    }
    wx.showLoading()
    homeModel.getHomeData(params)
      .then((res) => {
        let homedata = res
        wx.hideLoading()
        homedata.curCity = curCity
        homedata.longitude = longitude
        homedata.latitude = latitude
        this.setHomeData(homedata, longitude, latitude, store_area, store_city)
      })
  },
  // 渲染数据
  setHomeData: function (homedata, longitude, latitude, store_area, curCity) {
    // let that = this;
    let list_ad = homedata.list_ad;

    let totalcategory = homedata.list_category;
    let list_headlines = homedata.list_headlines;
    let list_store_choice = homedata.list_store_choice;
    let list_store_save = homedata.list_store_save;
    list_ad = util.addUrl(list_ad, 'ad_pic');
    totalcategory = util.addUrl(totalcategory, 'category_pic');
    let list_category = totalcategory.slice(0, 5);
    let list_category_second = totalcategory.slice(5, 10);

    list_store_choice = util.addUrl(list_store_choice, 'store_logo');
    list_store_save = util.addUrl(list_store_save, 'store_logo');
    let isShowCate = false;
    if (homedata.is_show == 1) {
      isShowCate = true
    }
    this.setData({
      list_ad,
      list_category,
      list_headlines,
      list_store_choice,
      list_category_second,
      list_store_save,
      longitude,
      latitude,
      curCity,
      store_area,
      isMask: false,
      isShowCate
    })
  },

  // 获取更多店铺列表
  getMoreData(page, city) { //page是当前是第几页 2 
    let store_area = this.data.store_area || '';
    let store_city = this.data.curCity;
    let localCur = wx.getStorageSync('localCur')
    if (this.data.status == 2) {
      store_city = this.data.fcity;
    }
    store_city = city ? city : store_city;
    const params = {
      page,
      limit: 5,
      store_area,
      store_city,
      latitude: localCur.latitude,
      longitude: localCur.longitude,
    }
    wx.showLoading()
    homeModel.getStoreList(params)
      .then((res) => {
        wx.hideLoading()
        console.log('res', res)
        let list = this.data.stores
        list.push(...res)

        this.setData({
          stores: list
        })
        if (res.length < 5) {
          wx.showToast({
            title: '全部加载完成',
          })
          this.setData({
            isAdd: false
          })
          return false
        } else {
          this.setData({
            isAdd: true
          })
        }
        // let newData = res
        // let stores = this.data.stores
        // if (res.length <)
        // if (newData.length > 0) {
        //   // newData = util.addUrl(newData, 'store_logo');
        //   if (page == 1) {
        //     stores = newData
        //   } else {
        //     for (let i = 0; i < newData.length; i++) {
        //       //把请求到的商品遍历加入到当前实例的商品列表里去
        //       stores.push(newData[i])
        //     }
        //   }
        //   this.data.isAdd = true
        //   this.setData({
        //     stores,
        //     page,
        //     nomoreL: 2
        //   })
        // } else {
        //   wx.showToast({
        //     title: '到底了哦！',
        //   })
        //   this.setData({
        //     nomoreL: 1
        //   })
        // }
      })
  },
  //监听屏幕滚动 判断上下滚动
  onReachBottom(ev) {
    if (this.data.curCity) {
      // let that = this; //获取当前对象
      if (this.data.isAdd) {
        this.setData({
          isAdd: false
        })
        this.data.page++; //加载更多的页数加一
        this.getMoreData(this.data.page, '');
      }
    }
  },

  // 下拉刷新
  onPullDownRefresh: function () {
    wx.showNavigationBarLoading()
    this.onLoad()
    setTimeout(() => {
      wx.hideNavigationBarLoading()
      wx.stopPullDownRefresh()
    }, 2000);
  },

  // 吸顶
  getSearchScroll(event) {
    if (event.detail.isFixed) {
      this.setData({
        searchTop: true
      })
    } else {
      this.setData({
        searchTop: false
      })
    }
  },
  // 轮播图定位
  handleImgChange(e) {
    this.setData({
      currentIndex: e.detail.current
    })
  },

  handleOpenLoal() {
    wx.openSetting({
      success: (res) => {
        console.log('wzh', 'close ---')
        if (res.authSetting['scope.userLocation']) {
          this.getLocal();
          this.setData({
            isCityMask: false
          })
        }
      }
    })
  },
  // 关闭开启定位
  handleCloseLoal() {
    this.setData({
      showOpenLoal: false
    })
  },
})