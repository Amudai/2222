var app = getApp();
var util = require('../../utils/util.js');
import {
  StoreModel
} from '../../models/storeDetails.js';
import {
  BusinessModel
} from '../../models/business.js'


const businessModel = new BusinessModel()
const storeModel = new StoreModel()

var store_id = '';
var user_id = '';
var token = '';
var goodsItem = []
var comment_item_HEIGHT;
Page({
  data: {
    loading: true, // 骨架屏loading
    tableNumber: '', // 桌号编码
    userNum: '', // 用餐人数
    radio: '1', // 用餐方式
    showDialog: false, // 选择用餐方式弹窗
    showCart: false, // 购物车
    scrollTop: 0, //
    opacity: 0.6, //点击加图标颜色变浅
    clickHistoryArr: [], //点击加图标被加入的数组
    curClickGood: NaN,
    currentTab: 0, //优惠商品，用户评价，温馨提示面板切换
    tabArr: { //左侧选项卡
      curHdIndex: 0,
      curBdIndex: 0
    },
    imgUrls: [],
    tips: [],
    store_score: '', //店铺评分
    stars: [0, 1, 2, 3, 4],
    normalSrc: '../../images/storeDetails/normal.png',
    selectedSrc: '../../images/storeDetails/selected.png',
    halfSrc: '../../images/storeDetails/half.png',
    distance: "1.2km",
    viewClassName: 'productImage',
    foodList: [], //商品信息
    goodsType: [],
    storeInfo: {},
    orderCost: 0, //订餐消费
    orderName: '',
    orderList: {},
    oli: [],
    goods_pics: "",
    storeDetails: {
      status: 1
    },
    goods_id: 0,
    discountDe: [], //折扣详情
    discountId: [], //具体的折扣id
    currentGoodsType: null, //当前左侧选择项名称
    currentGoodsTypeIndex: null, //当前左侧选择项所属下标
    business: true, //是否营业
    swiperCurrent: 0, // 当前轮播页码
    totalSwiper: 0, //总页码
    goods_movedTop: '0',
    // 左边栏
    itemTopArray: [],
    isContentCanFloat: [],
    isAddItemTopArray: true,
    categoryBoxScrollIntoView: 1,
    cartBoxStatus: false, //是否查看已经点商品
    catBoxtop: 0,
    total_num: 0, //已经选择了多少商品的总数量
    goods_selenum: 0,
    noGood: true,
    order_cost: 0, //订单总价
    tempTop: 0,
    isMask: false,
    shopCar: null,
    leftTop: 0,
    lastHigh: 0,
    // 左 => 右联动 右scroll-into-view 所需的id
    toView: null,
    // 当前左侧选择的
    currentLeftSelect: null,
    // 右侧每类数据到顶部的距离（用来与 右 => 左 联动时监听右侧滚动到顶部的距离比较）
    eachRightItemToTop: [],
    choosedList: {},
    choosedNum: 0,
    initPos: {},
    posArr: [],
    topArr: {},
    options: {}, // 传值
    currentClickInput: '',
    specificationAlertIsShow: false, //商品规格弹窗是否显示
    qrintostore: '',
    qrtable: '',
    tabCur: 0,
    mainCur: 0,
    verticalNavTop: 0,
    load: true,
    imgshow: false, //商品图片弹窗是否显示
    showGoodsImgurl: '', //显示的商品图片路径
    status: '1', //用餐人数的方式1输入人数，2表示加菜或加商品，不收取餐位费
  },
  onShow: function () {
    setTimeout(() => {
      if (wx.getStorageSync('chooseList')) { //购物车列表
        //通过桌码进入店铺详情页
        let qrtable = this.data.qrtable
        let qrintostore = this.data.qrintostore
        if (qrintostore == '' && qrtable) {
          this.getTableInfo(qrtable)
        } else if (qrintostore && qrtable == '') {
          this.intoStore(qrintostore)
        } else {
          //通过正常方式进入
          if (this.data.options) {
            this.loadStoreInfo(this.data.options)
          }

        }
      }
    }, 1500);
    this.setData({
      isMask: false,
    })

  },
  onLoad: function (options) {
    console.log('wzh--', options)
    var isEnter = wx.getStorageSync('user_isEnter_storeDetail')
    if (!isEnter) {
      wx.setStorageSync('user_isEnter_storeDetail', false)
      isEnter = false
    }
    this.setData({
      options: options,
      user_isEnter_storeDetail: isEnter
    })
    let query = options.q
    let qrintostore = ''
    let qrtable = ''
    if (query != '' && query !== undefined) {
      query = unescape(query)
      if (query.indexOf('get_table_info') > 0 || query.indexOf('testqr') > 0) {
        let indexArr = query.split('q=')
        qrtable = indexArr[1]

      } else if (query.indexOf('into_store') > 0 || query.indexOf('ab_store') > 0) {
        let indexArr = query.split('parameter=')
        qrintostore = indexArr[1]
      }
    }

    this.setData({
      qrintostore,
      qrtable
    })

    //通过桌码进入店铺详情页
    wx.showLoading({

    })
    if (qrintostore == '' && qrtable) {
      this.getTableInfo(qrtable)
    } else if (qrintostore && qrtable == '') {
      this.intoStore(qrintostore)
    } else {
      //通过正常方式进入
      let tableList = wx.getStorageSync('tableList') || {};
      var timestamp = Date.parse(new Date())
      //设置一个过期时间，到期后用于清除桌码

      let tableinfo = tableList[options.store_id]
     
      if (tableinfo) {
        if (tableinfo.timeout > timestamp) {
          this.setData({
            tableNumber:tableinfo.tableNumber
          })
        } else {
          delete tableList[options.store_id]
          wx.setStorageSync('tableList', tableList)
        }
      }

      this.loadStoreInfo(options)
    }

  },
  handleShowImg(event) {
    console.log(event.currentTarget.dataset.url)
    this.setData({
      imgshow: true, //商品图片弹窗是否显示
      showGoodsImgurl: event.currentTarget.dataset.url
    })
  },
  onCloseImgShow() {
    this.setData({
      imgshow: false, //商品图片弹窗是否显示

    })
  },
  // 是否加菜
  handleChangeOrderType(e) {
    this.setData({
      status: e.detail
    })

  },
  TabSelect(e) {
    let tabCur = e.currentTarget.dataset.tabindex;
    let mainCur = e.currentTarget.dataset.tabindex;
    let verticalNavTop = (e.currentTarget.dataset.tabindex - 1) * 50
    this.setData({
      tabCur,
      mainCur,
      verticalNavTop,
      currentLeftSelect: e.currentTarget.dataset.id
    })
  },
  VerticalMain(e) {
    let that = this;
    let tabHeight = 0;
    if (this.data.load) {
      for (let i = 0; i < this.data.goodsItem2.length; i++) {
        let view = wx.createSelectorQuery().select("#main-" + i);
        view.fields({
          size: true
        }, data => {
          this.data.goodsItem2[i].top = tabHeight;
          tabHeight = tabHeight + data.height;
          this.data.goodsItem2[i].bottom = tabHeight;
        }).exec();
      }

      this.data.load = false
    }
    let scrollTop = e.detail.scrollTop
    for (let i = 0; i < this.data.goodsItem2.length; i++) {
      if (scrollTop > this.data.goodsItem2[i].top && scrollTop < this.data.goodsItem2[i].bottom - 10) {
        this.setData({
          verticalNavTop: (i - 1) * 50,
          currentLeftSelect: this.data.goodsItem2[i].id
        })
        return false
      }
    }
  },
  showBigImg(e) {
    let arrImgs = []
    for (let i = 0; i < this.data.imgUrls.length; i++) {
      arrImgs.push(this.data.imgUrls[i].store_pic)
    }
    wx.previewImage({
      current: e.currentTarget.id, // 当前显示图片的http链接
      urls: arrImgs // 需要预览的图片http链接列表
    })
  },
  //通过正常方式进入
  loadStoreInfo(options) {
    let globalKey = wx.getStorageSync('globalKey');
    //获取该页面加载携带过来的商铺ID
    store_id = options.store_id
    //获取该页面加载携带的用户id
    user_id = options.user_id || globalKey.user_id;
    // 获得商店信息
    this.getStoreInfo(store_id, user_id, true)
    // 获取商品信息
    // this.getGoodInfo(store_id, user_id)
  },
  // 扫桌码进入店铺
  getTableInfo(q) {
    let gram = util.returnGram()
    let that = this;
    wx.request({
      url: app.globalData.url + '/api/nearby/get_table_info',
      data: {
        q,
        parameter: q,
        process: gram.process,
      },
      method: 'POST',
      success(res) {
        if (res.data.status == 1) {
          let store_id = res.data.data.store_id;
          let globalKey = wx.getStorageSync('globalKey');
          // wx.setStorageSync('get_table_info', res.data.data);

          let tableNumber = res.data.data.table_number
          that.setData({
            tableNumber
          })
          let tableList = wx.getStorageSync('tableList') || {};
          var timestamp = Date.parse(new Date()) + 4 * 60 * 60 * 1000
          //设置一个过期时间，到期后用于清除桌码
          let tabbleInfo = {
            tableNumber: res.data.data.table_number,
            timeout: timestamp
          }
          tableList[store_id] = tabbleInfo
          wx.setStorageSync('tableList', tableList)
          that.getTableOrderInfo(tableNumber, store_id)
          that.getStoreInfo(store_id, globalKey.user_id, true);
          // that.getGoodInfo(store_id, globalKey.user_id);
          //记录来源提交给登录绑定店铺
          app.globalData.scene = 4;
          app.globalData.store_id = store_id;
        }
      }
    })

  },

  // 扫码跳转确认订单
  getTableOrderInfo(table_number, store_id) {
    const params = {
      table_number,
      store_id
    }
    businessModel.getTableOrderInfo(params)
      .then((res) => {
        if (res.type === 1) {
          wx.navigateTo({
            url: '../pendingPayment/pendingPayment?order_id=' + res.order_id + 'store_id' + store_id,
          })
        }
        if (res.type === 2) {
          wx.navigateTo({
            url: '../submitStoreOrders/submitStoreOrders?collect_id=' + res.collect_order_id,
          })
        }
      })
  },

  // 进入店铺
  intoStore(parameter) {
    let gram = util.returnGram()
    let that = this;
    wx.request({
      url: app.globalData.url + '/api/nearby/into_store',
      data: {
        parameter: parameter,
        process: gram.process,
      },
      method: 'POST',
      success(res) {
        console.log('wzh----', res.data)
        if (res.data.status == 1) {
          let store_id = res.data.data.store_id
          //记录来源提交给登录绑定店铺
          app.globalData.scene = 3
          app.globalData.store_id = store_id

          let globalKey = wx.getStorageSync('globalKey')
          that.getStoreInfo(store_id, globalKey.user_id, true)
          // that.getGoodInfo(store_id, globalKey.user_id)
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
      }
    })
  },
  // 获得商店信息
  getStoreInfo(store_id, user_id, isActivityStatus) {
    const params = {
      store_id: store_id,
      page: 1,
      limit: 100,
    }
    storeModel.getStoreInfo(params)
      .then((res) => {
        wx.hideLoading({
          complete: (res) => {},
        })
        let data = res.store_info;
        data.takeout_startorder = Number(data.takeout_startorder)
        let store_info = wx.getStorageSync('store_info')
        store_info = data;
        store_info.store_id = store_id
        wx.setStorageSync('store_info', store_info)
        app.globalData.store_info = store_info
        this.setData({
          storeInfo: data,
          choosedList: {},
          category_id: data.category_id
        })
        this.getGoodInfo(store_id, user_id)
        this.setStore()
      }).catch(() => {
        wx.hideLoading({
          complete: (res) => {},
        })
      })
  },
  // 获得商品信息
  getGoodInfo(store_id) {
    const params = {
      store_id: store_id,
      page: 1,
      limit: 100,
    }
    storeModel.getGoodsInfo(params)
      .then((res) => {
        let goodsItem = res;
        for (let i = 0; i < goodsItem.length; i++) {
          goodsItem[i].id = 'id' + i;
          goodsItem[i].select_nums = 0;
          let goods = goodsItem[i].list_goods;
          goods = util.addUrl(goods, 'goods_pic')
          for (let j = 0; j < goods.length; j++) {
            goods[j].num = 0;
          }
        }
        goodsItem = goodsItem.filter(function (res) {
          return res.list_goods.length > 0
        });
        this.setData({
          goodsItem
        })
        setTimeout(() => {
          this.setData({
            loading: false
          })
        }, 500)
        console.log(goodsItem)
        this.setGoods(); //获取商品
      })
  },
  // 存店铺
  setStore() {
    let store_info = wx.getStorageSync('store_info');
    //获取该商铺信息数组里面的商铺介绍图片数组  [{},{},{}] 
    var list = store_info.list_store_pics;
    console.log(store_info, '店铺详情117', store_info)
    //处理这个数组，得到一个新数组
    list = util.addUrl(list, 'store_pic');
    //创建一个新数组
    var array1 = new Array();
    //获取该页面信息对象里面的商家小提醒的数组
    var tips = store_info.list_tips;
    //遍历商家小提醒的数组，把所有的小提醒添加到新创建的数组中
    for (var index in tips) {
      array1.push(tips[index].tips);
    }

    //判断是否在当前营业时间内
    //更改状态
    this.setData({
      choosedList: {},
      storeDetails: store_info, //商铺信息对象
      imgUrls: list, //商铺的介绍图片数组
      totalSwiper: list.length, //商铺的介绍图片有多少张
      tips: array1, //该页面小提醒数组
      store_score: store_info.store_score, //该商家的评分
      isMask: false, //？
      category_id: store_info.category_id //改商铺的分类id 
    })
  },
  // 存商品
  setGoods() {

    //购物车读取的是缓存的里面的购物车一维数组   我改成了读取缓存里面的购物车副本对象 键名是商铺id 键值是数组
    //每次加载页面时 =》 都从本地存储购物车副本对象通过商铺id获取购物车数组

    let that = this;
    //获取商品列表数组  对象数组
    goodsItem = this.data.goodsItem
    console.log(goodsItem)
    let store_id = wx.getStorageSync('store_info').store_id;
    //获取购物车数组 二维数组
    let choosedList = wx.getStorageSync('chooseList') || {};
    console.log('获取本地购物车数组114：', choosedList)
    console.log('store_id', store_id)
    //一维数组
    let storeChoosed = {}
    if (choosedList.hasOwnProperty(store_id)) {
      storeChoosed = choosedList[store_id]
    }
    let order_info = wx.getStorageSync('order_info') || {};
    let totalCont = goodsItem.length; //商品组的长度

    if (goodsItem && totalCont > 0) {
      //每遍历到一个商品分类组，就要遍历这个商品分类组中的商品列表数组下的所有商品，其实就是二维数组的遍历算法
      for (let i = 0; i < goodsItem.length; i++) {
        for (let j = 0; j < goodsItem[i].list_goods.length; j++) {
          let goodsid = goodsItem[i].list_goods[j].goods_id
          goodsItem[i].list_goods[j].goods_desc_other = goodsItem[i].list_goods[j].goods_desc === undefined ? '' : goodsItem[i].list_goods[j].goods_desc.replace(/\n/g, ""); //把每个商品的商品描述中的\n替换成空

          if (goodsItem[i].list_goods[j].goods_desc_other.length >= 18) { //如果商品描述太长了就做截取处理
            goodsItem[i].list_goods[j].goods_desc_other = goodsItem[i].list_goods[j].goods_desc_other.slice(0, 18) + '...'
          } else {
            goodsItem[i].list_goods[j].goods_desc_other = goodsItem[i].list_goods[j].goods_desc_other
          }

          if (goodsItem[i].list_goods[j].stock_count > 0) {
            goodsItem[i].list_goods[j].noGood = true
          } else {
            goodsItem[i].list_goods[j].noGood = false
          }
          if (storeChoosed.hasOwnProperty(goodsid)) {
            goodsItem[i].list_goods[j].num = storeChoosed[goodsid].goods_selenum //改变商品列表的当前遍历元素的num属性，从而会改变input里面的值
            if (goodsItem[i].select_nums === undefined) {
              goodsItem[i].select_nums = storeChoosed[goodsid].goods_selenum
            } else {
              goodsItem[i].select_nums += storeChoosed[goodsid].goods_selenum //分类数组的选择数量被累加给当前遍历的购物车元素的选择数
            }
          }
          goodsItem[i].list_goods[j].isload = true
        }
      }

      var before_select = 0
      let amount = 0
      for (let x in storeChoosed) {
        if (storeChoosed[x] !== null) {
          if (storeChoosed[x].goods_selenum !== undefined) {
            before_select += storeChoosed[x].goods_selenum
            amount += storeChoosed[x].goods_selenum * storeChoosed[x].goods_price
          }
        }

      }
      // that.localtion(1);//获取当前位置与店家之间的距离
      order_info.order_cost = new Number(amount).toFixed(2) //四舍五入保留两位
      wx.setStorageSync('order_info', order_info)
      wx.setStorageSync('choosedList', storeChoosed)
      let choosedNum = Object.keys(storeChoosed).length
      that.setData({
        //total_num: order_info.total_num || before_select,//购物车总数量先从订单总数读 读不到去全局购物车变量读
        total_num: before_select, //购物车总数量先从订单总数读 读不到去全局购物车变量读
        order_cost: order_info.order_cost || 0, //改变订单总价的状态机 =》 是从本地存储中的订单对象中读到的
        goodsItem,
        noGood: that.data.noGood,
        choosedList: storeChoosed,
        chooseList: storeChoosed,
        choosedNum
      })
      that.initGoodsItem()


      wx.hideLoading({
        complete() {
          that.setData({
            showSkeleton: 0
          })
        }
      })
    }
    // 获取屏幕高度
    wx.getSystemInfo({
      success: function (res) {
        let clientHeight = res.windowHeight;
        that.data.sysHeight = clientHeight - 44;
        that.setData({
          tab1h: that.data.sysHeight
        })
      },
    })
    if (goodsItem.length > 0) {
      that.setData({
        currentLeftSelect: goodsItem[0].id,
        tcategory: goodsItem[0].category,
        tintroduce: goodsItem[0].introduce,
      })
    } else {
      wx.hideLoading();
    }

  },
  // 打电话
  to_call(e) {
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.telephone,
    })
  },
  // 去付款
  toPay: function (e) {
    this.setData({
      radio: '1',
      userNum: ''
    })
    if (this.data.total_num > 0) { //已经选购了商品  已选商品数量大于0d 
      let globalKey = wx.getStorageSync('globalKey')
      let storeInfo = wx.getStorageSync('store_info')
      user_id = globalKey.user_id
      //判断用户是否登录
      if (!user_id || user_id === undefined || wx.getStorageSync('userInfoKey') == false) { //没有登陆

        wx.navigateTo({
          url: '../index/index?store_id=' + storeInfo.store_id,
        });
        return
      } else {

        if (storeInfo.category_id == 1) {
          this.setData({
            status: '1',
            showDialog: true
          })
        } else {
          wx.navigateTo({
            url: '../submitOrder/submitOrder?storeId=' +
              storeInfo.store_id + '&userNum=' +
              this.data.userNum + '&radio=1' + '&category_id=' + storeInfo.category_id + '&tableNumber=' + this.data.tableNumber
          })
        }
      }
    }
  },
  // 查看已选择的商品
  openCart(e) {

    let num = e.currentTarget.dataset.num;
    if (num > 0) {
      this.setData({
        showCart: true,
        choosedList: wx.getStorageSync('choosedList')
      })
    } else {
      wx.showToast({
        icon: 'none',
        title: '您的购物车是空的，请添加商品！',
      })
    }
  },
  // 清空购物车里的所有东西
  deleFn(data) {
    if (this.data.total_num > 0) {
      let store_info = wx.getStorageSync('store_info')
      let store_id = store_info.store_id
      let order_info = [];
      let choosedList = {};
      //清空本地存储购物车
      wx.setStorageSync('choosedList', choosedList);
      //清空本地存储订单对象
      wx.setStorageSync('order_info', order_info);
      //清空本地存储本地购物车副本
      //清除选择的商品重新加载店铺
      const chooseList = wx.getStorageSync('chooseList') //获取本地存储购物车副本对象
      chooseList[store_id] = [] //把数组中对应商铺id的数组清空
      delete chooseList[store_id] //把对象中对应id属性删除
      wx.setStorageSync('chooseList', chooseList) //重新赋值
      this.setData({
        showCart: false
      })

      //清除购物车方式一
      //通过桌码进入店铺详情页
      if (this.data.qrintostore == '' && this.data.qrtable) {
        this.getTableInfo(this.data.qrtable)
      } else if (this.data.qrintostore && this.data.qrtable == '') {
        this.intoStore(this.data.qrintostore)
      } else {
        //通过正常方式进入
        this.loadStoreInfo(this.data.options)
      }
    }
  },
  //增加数量
  addToCart: function (e) {
    if (!this.data.user_isEnter_storeDetail) { //用户从没有进入过任何一个店铺详情页
      setTimeout(() => {
        this.setData({
          user_isEnter_storeDetail: true,
        })
        wx.setStorageSync('user_isEnter_storeDetail', true)
      }, 2000)

      this.setData({
        currentClickInput: e.currentTarget.dataset.goodsid,
      })

      // return;
    }
    console.log('isarray:' + Array.isArray(this.data.choosedList))
    var dataset = e.currentTarget.dataset;
    console.log(e.currentTarget.dataset)
    if (dataset.goods_count > dataset.goods_selenum) {
      this.changeNum(dataset, 'up', 1);
    } else {
      wx.showToast({
        title: '没有更多了',
        icon: 'none',
      })
    }

  },
  //减少数量
  reduceFromCart: function (e) {
    console.log('ddd', this.data)
    var dataset = e.currentTarget.dataset;
    if (dataset.goods_selenum > 0) {
      this.changeNum(dataset, 'down', 1);
    }
  },
  //查询商品id是否在数组内
  selectGoodsIdInArray: function (id) {
    var arr = this.data.clickHistoryArr
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] == id) {
        return id++
      }
    }
    return false
  },
  f1() {
    return false
  },
  // 改变数量
  changeNum: function (dataset, type = 'up', num = 1) { //每次点击加减图标都会调用这个方法 它改变了状态机从而每次都会重新渲染视图！！！
    console.log('我要改变数量了啊，dataset:', dataset)
    if (!wx.getStorageSync('chooseList')) { //如果没有创建本地存储购物车副本 那么创建一个本地存储购物车副本
      wx.setStorageSync('chooseList', {})
    }
    let choosedList = wx.getStorageSync('choosedList') //状态机里面的购物车数组
    let index = dataset.index;
    console.log(index, 113); //当前点击的商铺的索引
    let goodindex = dataset.goodindex; //当前点击的商品的id
    let copyGoodItems = this.data.goodsItem2; //商铺列表副本数组
    console.log(this.data.goodsItem2)
    let curGood = copyGoodItems[index];
    let curGoodInfo = curGood.list_goods[goodindex]; //当前商品对象


    console.log(curGoodInfo, 112);
    //如果不在已点击数组里，就加入、、把商品id加入数组

    switch (type) {
      case 'up':
        if (choosedList.hasOwnProperty(dataset.goodsid)) {
          choosedList[dataset.goodsid].goods_selenum += num;
          curGoodInfo.num += num
        } else {
          dataset.goods_selenum += 1
          choosedList[dataset.goodsid] = dataset
          curGoodInfo.num = 1
        }
        break;
      case 'down':
        if (choosedList.hasOwnProperty(dataset.goodsid)) {
          choosedList[dataset.goodsid].goods_selenum -= num;
          curGoodInfo.num -= num
          if (choosedList[dataset.goodsid].goods_selenum <= 0) {
            delete choosedList[dataset.goodsid]
            curGoodInfo.num = 0

          }
        } else {
          return
        }
        break;
      case 'input':
        if (num < 0) {
          return
        }
        if (choosedList.hasOwnProperty(dataset.goodsid)) {
          choosedList[dataset.goodsid].goods_selenum = num;
          curGoodInfo.num = num
        } else {
          dataset.goods_selenum = num
          choosedList[dataset.goodsid] = dataset
          curGoodInfo.num = num
        }
        if (choosedList[dataset.goodsid].goods_selenum <= 0) {
          delete choosedList[dataset.goodsid]
          curGoodInfo.num = 0
        }
        break;
    }

    if (!this.selectGoodsIdInArray(curGoodInfo.goods_id)) {
      this.data.clickHistoryArr.push(curGoodInfo.goods_id)
    }

    this.setData({
      curClickGood: curGoodInfo.goods_id,
      clickHistoryArr: this.data.clickHistoryArr
    })
    //计算总价
    var order_info = {};
    order_info.order_cost = 0;
    order_info.total_num = 0;

    let select_nums = 0; //该分类下加入购物车的总数量
    for (let item of curGood.list_goods) {
      select_nums += item.num === undefined ? 0 : item.num;
    }
    //把计算出来的总数量  赋值给  分类对象的已选择数量属性
    curGood.select_nums = select_nums;
    copyGoodItems[index].select_nums = select_nums

    //遍历购物车数组 得到总数量 总价格
    console.log('wzg123+' + Object.keys(choosedList).length)
    for (let k in choosedList) {
      if (choosedList[k].goods_price !== undefined) {
        order_info.total_num += choosedList[k].goods_selenum
        let totalPrice = choosedList[k].goods_price * choosedList[k].goods_selenum //计算总价
        order_info.order_cost += totalPrice
      }
    }
    order_info.order_cost = order_info.order_cost.toFixed(2) //对购物车总价进行四舍五入操作
    if (order_info.total_num == 0) {
      this.data.cartBoxStatus = false
    }
    let choosedNum = Object.keys(choosedList).length
    //更新状态机
    if (order_info.total_num <= 0 && this.data.showCart) {
      this.setData({
        showCart: false
      })
    }
    console.log('wzhaddcart:', goodsItem)
    this.setData({
      cartBoxStatus: this.data.cartBoxStatus,
      total_num: order_info.total_num,
      order_cost: order_info.order_cost,
      goodsItem2: copyGoodItems,
      choosedList: choosedList,
      choosedNum
    })

    //本地存储中的购物车副本
    const chooseList = wx.getStorageSync('chooseList')
    chooseList[wx.getStorageSync('store_info').store_id] = choosedList
    //更新本地存储
    wx.setStorageSync('order_info', order_info);

    wx.setStorageSync('choosedList', choosedList);

    wx.setStorageSync('chooseList', chooseList); //更新本地存储中的购物车副本
    //每次改变数量 都保存到全局变量一份
  },

  //  切换tab
  handleClickTab(event) {
    // console.log('event', event)
    this.setData({
      currentTab: event.detail.index
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    let store_info = wx.getStorageSync('store_info');
    if (res.from === 'button') {}
    return {
      title: store_info.store_name,
      path: 'pages/storeDetails/storeDetails?store_id=' + store_info.store_id,
    }
  },

  getAllRects() {
    // 获取商品数组的位置信息
    wx.createSelectorQuery().selectAll('.comment_item').boundingClientRect(function (rects) {
      comment_item_HEIGHT = rects[0].height
    }).exec()
  },

  // 跳转营业资质
  navigator() {
    wx.navigateTo({
      url: '../businessQualification/businessQualification?store_id=' + store_id + '&user_id=' + user_id + '&token=' + token
    })
  },
  // 跳转举报商家
  report() {
    wx.navigateTo({
      url: '../reportBusiness/reportBusiness?store_id=' + store_id + '&user_id=' + user_id + '&token=' + token
    })
  },
  //生成一个goodsItems数组的副本
  initGoodsItem: function () {
    var arr = new Array(this.data.goodsItem.length)
    let posArr = []
    for (let i = 0; i < this.data.goodsItem.length; i++) {
      arr[i] = {}
      arr[i].select_nums = this.data.goodsItem[i].select_nums
      arr[i].category = this.data.goodsItem[i].category
      arr[i].id = this.data.goodsItem[i].id
      arr[i].introduce = this.data.goodsItem[i].introduce
      arr[i].goods_type = this.data.goodsItem[i].goods_type
      arr[i].list_goods = new Array(this.data.goodsItem[i].list_goods.length)
      arr[i].load_num = 0
      for (let j = 0; j < arr[i].list_goods.length; j++) {
        arr[i].list_goods[j] = {}
        arr[i].list_goods[j].isload = false
        posArr.push({
          i,
          j
        })
      }
    }
    // let initPos = posArr.slice(0, 4)
    let initPos = posArr
    //初始化商铺商品列表数组
    //初始化记录
    for (let obj of initPos) {
      arr[obj.i].list_goods[obj.j] = this.data.goodsItem[obj.i].list_goods[obj.j]
      arr[obj.i].load_num++
    }
    this.setData({
      goodsItem2: arr,
      goodsItem: this.data.goodsItem,
      posArr,
      initPos, //取索引记录数组的最后一个位置对象存入到状态机中
    })
    setTimeout(() => {
      // this.getAllHeightMessage() //this
    }, 0)
  },

  //导航
  guide() {
    wx.openLocation({
      latitude: wx.getStorageSync('store_info').store_latitude, //该店铺经纬度
      longitude: wx.getStorageSync('store_info').store_longitude,
      scale: 18
    })
  },

  //点击选规格 加载规格弹窗子组件
  LoadSpecificationAlertComponent(res) {
    let {
      goodindex,
      index
    } = res.currentTarget.dataset
    const goods = this.data.goodsItem[index].list_goods[goodindex]
    //如果是json字符串那么就要转成数组
    if (typeof (goods.goods_attributes) === 'string') {
      goods.goods_attributes = JSON.parse(goods.goods_attributes)
      for (let i = 0; i < goods.goods_attributes.length; i++) {
        goods.goods_attributes[i].attr_value = goods.goods_attributes[i].attr_value.split(',')
      }
    }
    this.setData({
      specificationAlertIsShow: true,
      goods,
    })
  },
  //监听选择商品规格子组件中的 加入购物车 点击的监听函数
  specificationAddCart(data) {
    console.log('dasdadsasdasdasd------')
    const {
      goodsObject,
      str,
    } = data.detail
    const {
      index,
      goodindex,
    } = this.getPositionByGoodsid(goodsObject.goods_id)
    console.log('sdasdasd', goodsObject)
    this.changeNum({
      index,
      goodindex,
      goodsid: goodsObject.goods_id,
      discount_price: goodsObject.discount_price,
      goods_count: goodsObject.goods_count,
      goods_name: goodsObject.goods_name,
      goods_pic: goodsObject.goods_pic,
      goods_price: goodsObject.goods_price,
      goods_selenum: goodsObject.num,
      goods_price: goodsObject.goods_price,
      selectedGoods_attributes: str,
      stock_count: goodsObject.stock_count,
    }) //加入购物车 改变数量

    //关闭商品规格选择弹窗子组件
    this.setData({
      specificationAlertIsShow: false,
    })
  },
  // 关闭选规格弹窗
  closeCard() {
    this.setData({
      specificationAlertIsShow: false,
    })
  },
  //根据商品id在goodsitem数组里面找到这个商品的坐标
  getPositionByGoodsid(goodsid) {
    for (let i = 0; i < this.data.goodsItem.length; i++) {
      for (let j = 0; j < this.data.goodsItem[i].list_goods.length; j++) {
        if (this.data.goodsItem[i].list_goods[j].goods_id == goodsid) {
          return {
            index: i,
            goodindex: j,
          }
        }
      }
    }
    return false
  },
  // 点击返回按钮
  onClickLeft() {
    wx.switchTab({
      url: '/pages/home/index',
    })
  },

  // 关闭购物车
  onCloseCart() {
    this.setData({
      showCart: false
    })
  },

  // 选择用餐方式弹窗
  handleSelectCan() {
    if (this.data.radio != 3 && this.data.status == '1' && this.data.userNum < 1 && this.data.storeInfo.meel_fee_switch == 1) {
      wx.showToast({
        title: '用餐人数不能少于1人！',
        icon: 'none'
      })
      return false
    }
    let store_info = wx.getStorageSync('store_info')
    let userNum = this.data.status == '2' ? '0' : this.data.userNum

    this.setData({
      showDialog: false
    })
    wx.navigateTo({
      url: '../submitOrder/submitOrder?storeId=' +
        store_info.store_id + '&userNum=' + userNum +
        '&radio=' + this.data.radio + '&category_id=' + store_info.category_id + '&tableNumber=' + this.data.tableNumber
    })
  },

  // 关闭选择用餐方式弹窗
  onCloseDialog() {
    this.setData({
      showDialog: false,
    })
  },
  // 获取用餐人数
  getUserNumChange(e) {
    console.log('e', e)
    this.setData({
      userNum: e.detail
    })
  },
  validateNumber(val) {
    return val.replace(/\D/g, '')
  },
  // 用餐方式
  handleChangeCan(event) {
    this.setData({
      radio: event.detail
    })
    // if(event.detail=='3'){
    //   this.setData({
    //     isCheckAdd: false
    //   })
    // }
  },
})