import {
  OrderModel
} from '../../models/order.js'
import {
  BusinessModel
} from '../../models/business.js'
import {
  FudouModel
} from '../../models/fudou.js'
var util = require('../../utils/util.js');
const orderModel = new OrderModel()
const businessModel = new BusinessModel()
const fudouModel = new FudouModel()

Page({
  data: {
    storeGoods: [], // 展示商品信息
    goodsItem: [], // 共有商品数据
    storeInfo: {}, // 店铺信息
    userNum: null, // 用餐人数
    fudouDetail: {}, // 福豆数量
    isCheckFudou: false, // 是否使用福豆
    eatType: '', // 用餐方式
    canTotal: null, // 餐位费
    discountBeans: 0, // 福豆抵扣金额
    returnBeans: 0, // 返豆
    showAmount: 0, // 实付金额
    totalAmout: 0, // 总金额
    isAssistant: 0, // 是否为店员 0 是 1 否
    isShowMore: false,
    showModalStatus: false, // 
    show: false, // 明细
    buttonClicked: false,
    userInput: '', //备注
    tableNumber: '', //桌号
    timeNum: '12:00',
    haveChooseTime: false,
    minHour: 0,
    maxHour: 23,
    timeshow: false, //选择时间的弹层显示
    userAddress: '',
    userAddressSave: '',
    category_id: ''
  },

  onLoad(option) {
    // console.log('option', option)
    let storeId = option.storeId
    this.validateIsAssistant(storeId)
    let category_id = option.category_id
    let userNum = Number(option.userNum) || 0
    console.log(userNum)
    let eatType = option.radio
    let tableNumber = option.tableNumber
    let goodsItem = wx.getStorageSync('chooseList')[storeId]
    let storeInfo = wx.getStorageSync('store_info')
    console.log(option)
    console.log(Object.values(goodsItem))
    // 判断是否为店员

    this.setData({
      goodsItem: Object.values(goodsItem),
      storeInfo,
      userNum,
      storeId,
      eatType,
      category_id,
      tableNumber,
      storeGoods: Object.values(goodsItem).slice(0, 3)
    })
    let distributionObject = {}
    if (storeInfo.takeoutfood == 1) {
      if (wx.getStorageSync('store_info').distribution_data.goods_price != null) {
        distributionObject.bool = true
        distributionObject.price = wx.getStorageSync('store_info').distribution_data.goods_price
        this.data.distribution_fee = distributionObject.price
        this.setData({
          distributionObject: distributionObject
        })
      }
    }

    this.getFudouDetail()
  },

  onShow() {

  },
  //打开选择时间的弹层
  handleOpenTime() {
    this.setData({
      timeshow: true
    })
    console.log(this.data.timeshow)
  },
  onCloseTime() {
    this.setData({
      timeshow: false
    })
  },
  onTimeChange(event) {
    console.log(event)
    this.setData({
      timeNum: event.detail,
      haveChooseTime: true,
      timeshow: false
    });
  },
  // 获取福豆数据
  getFudouDetail() {
    fudouModel.getFudouDetail()
      .then((res) => {
        this.setData({
          fudouDetail: res
        })
        console.log(res,'you65')
        this.getOrderInfo(this.data.goodsItem, res.available / 100) // 整理数据
      }).catch((error) => {
        wx.showToast({
          title: error.msg,
          icon: 'none'
        })
      })
  },

  // 判断是否为店员
  validateIsAssistant(store_id) {
    const params = {
      store_id
    }
    businessModel.isAssistant(params)
      .then((res) => {
        this.setData({
          isAssistant: res.is_assistant
        })
      })
  },

  // 展开更多
  showMore() {
    let storeGoods = this.data.goodsItem
    this.setData({
      storeGoods,
      isShowMore: true
    })
  },
  // 收起更多
  closeMore() {
    let storeGoods = this.data.goodsItem.slice(0, 3)
    this.setData({
      storeGoods,
      isShowMore: false
    })
  },
  // 是否使用福豆
  handleChangeIsFudou(e) {
    this.setData({
      isCheckFudou: e.detail
    })

  },


  // 整理信息
  getOrderInfo(goodsItem, fudou) {
    // 计算商品价格
    let showPrice = 0
    goodsItem.map((item) => {
      return item.goods_price * item.goods_selenum
    }).forEach(v => {
      showPrice += v
    })

    // 计算餐位费
    let canTotal = 0
    if (this.data.eatType != 3 && this.data.category_id == 1) {
      if (this.data.storeInfo.meel_fee_switch == 1) {
        canTotal = this.data.userNum * this.data.storeInfo.meel_data.goods_price
      }
    }
    //配送费
    let distribution_fee = 0
    if (this.data.eatType == 3) {
      distribution_fee = Number(this.data.distributionObject.price)
    }
    // 总金额
    let total = showPrice + canTotal + distribution_fee
    const params = {
      order_amount: total,
      store_id: this.data.storeId
    }
    fudouModel.getXiaofeiFudou(params)
      .then((res) => {
        this.setData({
          returnBeans: res.bean
        })
      })
    // 可抵扣金额
    let discountBeans = 0
    // 计算可抵扣金额
    // 总金额打与福豆金额  total - 1来处理支付必须1元以上 total=10 total- 1 =9   fudou=8  discountBeans=8 实际支付2元
    if (total - 1 >= fudou) {
      discountBeans = fudou
    }

    // 总金额小于福豆金额 比如total=10 total- 1 =9   fudou=10  discountBeans=9 实际支付1元
    if (total - 1 < fudou&&total - 1 >0) {
      discountBeans = total - 1
    }

    // 实付金额
    let showAmount = (total - discountBeans).toFixed(2)
    this.setData({
      canTotal,
      showAmount,
      totalAmout: total.toFixed(2),
      discountBeans: discountBeans.toFixed(2),
      showPrice: showPrice.toFixed(2)
    })
  },
  // 明细
  openDetails() {
    this.setData({
      show: true,
      showModalStatus: true
    })
  },
  // 关闭
  onClose() {
    this.setData({
      show: false,
      showModalStatus: false
    })
  },
  //输入框输入桌号
  onChangeTable(event) {
    this.data.tableNumber = event.detail
  },
  //送餐地址
  // 获取地址
  getAddress() {
    var that = this;
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.address']) {
          wx.chooseAddress({
            success(res) {

              that.setData({
                userAddress: (res.provinceName + res.cityName + res.countyName + res.detailInfo).substring(0, 20),
                userAddressSave: res.provinceName + res.cityName + res.countyName + res.detailInfo + ',' + res.userName + ',' + res.telNumber,
              });
            }
          })
        } else {
          if (res.authSetting['scope.address'] == false) {
            wx.openSetting({
              success(res) {
                console.log(res.authSetting)
              }
            })
          } else {
            wx.chooseAddress({
              success(res) {

                that.setData({
                  userAddress: res.provinceName + res.cityName + res.countyName + res.detailInfo + ',' + res.userName + ',' + res.telNumber,
                  userAddressSave: res.provinceName + res.cityName + res.countyName + res.detailInfo + ',' + res.userName + ',' + res.telNumber,

                });
              }
            })
          }
        }
      }
    })
  },
  //获取备注
  onChangeRemark(e) {
    this.data.userInput = event.detail
    console.log(event.detail);
  },
  // 支付
  wechatPay() {
    this.setData({
      buttonClicked: true
    })
    setTimeout(() => {
      this.setData({
        buttonClicked: false
      })
    }, 500)

    if (!this.data.storeId || this.data.storeId === undefined) {
      wx.reLaunch({
        url: '../home/index',
      });
    }
    //去微信支付
    if (this.data.userInput.length > 50) {
      wx.showToast({
        title: '备注不能超过50个字',
        icon: 'none'
      })
      return
    }

    if (this.data.eatType == 2) {
      if (!this.data.haveChooseTime) {
        wx.showToast({
          title: '请选择预约到店时间',
          icon: 'none'
        })
        return
      }
    }
    // 桌码不能为空
    if (!this.data.tableNumber && this.data.isAssistant === 1) {
      wx.showToast({
        title: '请填写桌号',
        icon: 'none'
      })
      return
    }
    let discount_goods = this._getDiscountGoods()
    const params = {
      store_id: this.data.storeId,
      discount_goods,
      remark: this.data.userInput || '', //备注
      table_number: this.data.tableNumber || 1,
      people_count: this.data.userNum || 1,
      order_type: this.data.eatType, //1到店(默认)，2，预约。3，外卖
      appointment_time: this.data.haveChooseTime ? this.data.timeNum : '', //string	预约时间 形如”11: 32” ；当订单类型 order_type 为2时 有值
      address: this.data.userAddressSave, //配送地址
      beans: this.data.isCheckFudou ? (this.data.discountBeans * 100).toFixed(0) : 0
    }
    if (this.data.isAssistant === 1) {
      businessModel.colletAddOrder(params)
        .then((res) => {
          util.resetGoods(this.data.storeId)
          wx.redirectTo({
            url: '../businessCheck/businessCheck?collect_id=' + res.collect_id + '&store_id=' + this.data.storeId,
          })
        })
    } else {
      orderModel.creatOrderId(params)
        .then((res) => {
          util.resetGoods(this.data.storeId)
          wx.redirectTo({
            url: '../pay/pay?order_id=' + res.order_id + '&store_id=' + this.data.storeId + '&actual_money=' + res.actual_money + '&store_name=' + this.data.storeInfo.store_name + '&store_logo=' + this.data.storeInfo.store_logo,
          })
        })
    }
  },
  // 格式话上传商品数据
  _getDiscountGoods() {
    //增加配送费及餐位费
    let goodsItem = wx.getStorageSync('chooseList')[this.data.storeId]
    let discountGoods = [];
    for (var item in goodsItem) {
      if (goodsItem[item]["goodsid"] == null) {
        continue
      }
      const params = {
        goods_id: goodsItem[item]["goodsid"],
        goods_num: goodsItem[item]["goods_selenum"],
        goods_type: goodsItem[item]["goods_type"],
        goods_attributes: goodsItem[item]["selectedGoods_attributes"]
      }
      discountGoods.push(params)
    }
    // //餐位费处理环节 如果有的话当作一个商品传给后端 后端会计算它
    if (Number(this.data.userNum)>0&&this.data.storeInfo.meel_fee_switch == 1 && this.data.eatType !== 3) {
      const params1 = {
        goods_id: wx.getStorageSync('store_info')['meel_data']['goods_id'],
        goods_num: this.data.userNum,
        goods_type: ''
      }
      discountGoods.push(params1)
    }

    if (this.data.eatType == '3' && wx.getStorageSync('store_info').distribution_data.goods_price != null) {
      var obj2 = {
        goods_id: wx.getStorageSync('store_info')['distribution_data']['goods_id'],
        goods_num: 1,
        goods_type: ''
      }
      discountGoods.push(obj2)
    }
    return JSON.stringify(discountGoods);
  }

})