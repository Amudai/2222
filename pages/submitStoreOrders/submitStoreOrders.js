
import {
  OrderModel
} from '../../models/order.js'
import {
  BusinessModel
} from '../../models/business.js'
import {
  FudouModel
} from '../../models/fudou.js'

const orderModel = new OrderModel()
const businessModel = new BusinessModel()
const fudouModel = new FudouModel()

Page({
  data: {
    isCheckFudou: true, // 是否使用福豆
    fudouDetail: {}, // 福豆数据
    discountBeans: 0, // 福豆抵扣金额
    isShowMore: false,
    showModalStatus: false, // 
    show: false, // 明细
    show_price: 0, // 实付金额
    goodsInfo: {}, // 用户扫码进来时显示数据
    isScan: false, // 是否时扫码
    canWeiFei: [], // 用户餐位费
    collectId: null,
    buttonClicked: false,
    showNoCan: null,
    orderIng: false
  },

  onLoad(option) {
    this.scanCodeToPay(option)
  },

  // 扫码进来付款
  scanCodeToPay(option) {
    let query = option.q
    let qrUser = ''
    if (query != '' && query !== undefined) {
      query = unescape(query)
      if (query.indexOf('get_collect') > 0) {
        let indexArr = query.split('q=')
        qrUser = indexArr[1]
      }
      console.log('qrUser', qrUser)
    }

    // 用户扫码进来
    if (qrUser) {
      this.getUserScanCode(qrUser)
    } else if (option.collect_id) {
      this.getUserScanCode(option.collect_id)
    } else {
      wx.showToast({
        title: '二维码有误',
        icon: 'none'
      })
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/home/index',
        })
      }, 1000)
    }
  },
  // 获取用户扫码登陆的数据
  getUserScanCode(val) {
    const params = {
      collect_id: val
    }
    businessModel.getStoreOrderInfo(params)
      .then((res) => {
        // if ()
        let canWeiFei = []
        canWeiFei = res.goods_info.filter(v => {
          return v.goods_name === '餐位费'
        })
        let canWeiFeiTotal = null
        let show_price = null
        let showNoCan = null
        if (canWeiFei.length > 0) {
          canWeiFeiTotal = (canWeiFei[0].goods_num * canWeiFei[0].goods_price).toFixed(2)
          show_price = res.pay_amount
          showNoCan = (res.pay_amount - canWeiFeiTotal).toFixed(2)
        } else {
          show_price = res.pay_amount
          showNoCan = res.pay_amount
        }
        let goodsItem = res.goods_info.filter(v => {
          return v.goods_name !== '餐位费'
        })

        this.setData({
          goodsInfo: res,
          canWeiFeiTotal,
          show_price,
          showNoCan,
          goodsItem: goodsItem.slice(0, 3),
          isScan: true,
          canWeiFei,
          collectId: val
        })
        this.getFudouDetail()
      })
      
  },

  // 是否使用福豆
  handleChangeIsFudou(e) {
    this.setData({
      isCheckFudou: e.detail
    })
  },

  // 获取福豆数据
  getFudouDetail() {
    fudouModel.getFudouDetail()
      .then((res) => {
        this.setData({
          fudouDetail: res
        })
        this.getOrderInfo(res.available / 100) // 整理数据
      }).catch((err) => {
        console.log(err)
        wx.showToast({
          title: err.msg,
          icon: 'none'
        })
      })
  },
  // 整理信息
  getOrderInfo(fudou) {
    // 计算商品价格
    let total = Number(this.data.goodsInfo.pay_amount)
    // 可抵扣金额
    let discountBeans = 0
    // 总金额打与福豆金额
    if (total > fudou) {
      discountBeans = fudou
    }
    // 总金额小于福豆金额
    if (total < fudou) {
      discountBeans = total - 1
    }
    // 总金额等于福豆金额
    if (total === fudou) {
      discountBeans = total - 1
    }

    this.setData({
      discountBeans: discountBeans.toFixed(2)
    })
  },

  // 跳转福猫券选择
  jumpToFudou() {
    // 验证是否登陆
    let user_id = wx.getStorageSync('globalKey').user_id

    //判断用户是否登录
    if (!user_id || user_id === undefined || wx.getStorageSync('userInfoKey') == false) { //没有登陆
      wx.navigateTo({
        url: '../index/index',
      })
    } else {
      wx.navigateTo({
        url: '../fudou/fudou'
      })
    }
  },

  // 展开更多
  showMore() {
    let goodsItem = []
    goodsItem = this.data.goodsInfo.goods_info.filter(v => {
      return v.goods_name !== '餐位费'
    })
    this.setData({
      goodsItem,
      isShowMore: true
    })
  },
  // 收起更多
  closeMore() {
    let goodsItem = this.data.goodsInfo.goods_info.slice(0, 3)
    this.setData({
      goodsItem,
      isShowMore: false
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
    // 验证是否登陆
    this.isUserLogin()
    const params = {
      beans: this.data.isCheckFudou ? (this.data.discountBeans * 100).toFixed(0) : 0,
      collect_id: this.data.collectId
    }
    if (this.data.orderIng) {
      params.again = 1
    }
    businessModel.storeUserToOrder(params)
      .then((res) => {
        if (res.ordering === 1) {
          wx.showToast({
            title: '已有用户扫码支付，若需支付请再次点击提交订单',
            icon: 'none'
          })
          this.setData({
            orderIng: true
          })
          return false
        }
        wx.navigateTo({
          url: '../pay/pay?order_id=' + res.order_id + '&store_id=' + this.data.goodsInfo.store_id + '&actual_money=' + res.actual_money + '&store_name=' + this.data.goodsInfo.store_name + '&store_logo=' + this.data.goodsInfo.store_logo,
        })
      })
      .catch(e => {
        console.log('3333', e)
      })
  },
  // 判断用户是否登陆
  isUserLogin() {
    let user_id = wx.getStorageSync('globalKey').user_id

    //判断用户是否登录
    if (!user_id || user_id === undefined || wx.getStorageSync('userInfoKey') == false) { //没有登陆
      wx.redirectTo({
        url: '../index/index',
      })
      return false
    }
  }
})