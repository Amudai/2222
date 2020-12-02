import {
  PayModel
} from '../../models/pay.js'
import {
  FudouModel
} from '../../models/fudou.js'
import {
  StoreModel
} from '../../models/storeDetails.js'
import {
  ScanCode
} from '../../utils/scan.js'
import {
  dfm_ad_img
} from '../../utils/net_img.js'

const scanCode = new ScanCode()
const storeModel = new StoreModel()
const fudouModel = new FudouModel()
const payModel = new PayModel()
const oilgun = ['3号油枪','4号油枪']
Page({

  /**
   * 页面的初始数据
   */
  data: {
    payMoney: null, // 输入金额
    showAmount: 0, // 付款金额
    storeInfo: {}, // 商店信息
    payCheck: false, // 支付确认锁
    showDialog: false, // 是否显示弹窗
    isCheckFudou: false, // 是否选择福豆
    fudouDetail: {}, // 福豆数据
    dfm_ad_img: dfm_ad_img,
    //新增数据
    show:false,
    columns:['3号油枪','4号油枪']
  },

  showPopup(event){
    this.setData({show:true})
    // const result=await wx.showActionSheet({
    //   itemList: ['请选择油枪号','3号油枪','4号油枪'],
    // })
    console.log("按下")
  },
  onClose(){
    this.setData({show:false})
  },
  onConfirm(event) {
    const { picker, value, index } = event.detail;
    console.log("确认")
  },
  onChange(event) {
    const { picker, value, index } = event.detail;
    picker.setColumnValues(1, oilgun[value[0]]);
    console.log("修改")
  },
  onCancel() {
    console.log("取消")
  },
  onLoad: function (options) {
    let that = this
    scanCode.getScanCodeInfo(options, that)
  },

  // 商店信息
  getStoreInfo(store_id) {
    storeModel.getStoreInfo({
        store_id
      })
      .then((res) => {
        this.setData({
          storeInfo: res.store_info
        })
      })
  },

  // 获取福豆数据
  getFudouDetail() {
    fudouModel.getFudouDetail()
      .then((res) => {
        console.log(res, '福豆数据')
        this.setData({
          fudouDetail: res
        })
        // 可抵扣金额
        let discountBeans = 0
        let total = (Number(this.data.payMoney) * 100).toFixed(0)

        let fudou = res.available
        // let fudou = 9
        // 计算可抵扣金额
        // 总金额打与福豆金额  total - 1来处理支付必须1元以上 total=10 total- 1 =9   fudou=8  discountBeans=8 实际支付2元
        if (total - 100 >= fudou) {
          discountBeans = fudou
        }

        // 总金额小于福豆金额 比如total=10 total- 1 =9   fudou=10  discountBeans=9 实际支付1元
        if (total - 100 < fudou && total - 100 > 0) {
          discountBeans = total - 100
        }
        this.setData({
          discountBeans,
          showAmount: Number(this.data.payMoney).toFixed(2)
        })
      }).catch((error) => {
        console.log(error, '福豆数据')
      })

  },

  // 改变按钮状态
  handleChangeMoney(e) {
    // 兼容IOS会出现可以输入汉字的BUG
    let num = e.detail
      .replace(/[^\d.]/g, "")
      .replace(/^0\d+|^\./g, "")
      .replace(/\.{2,}/g, ".")
      .replace(".", "$#$")
      .replace(/\./g, "")
      .replace("$#$", ".")
      .replace(/^(\d+)\.(\d\d).*$/, "$1.$2")
    if (num) {
      this.setData({
        payCheck: true,
        payMoney: num
      })
    } else {
      this.setData({
        payCheck: false,
        payMoney: null
      })
    }
  },

  // 弹窗确认
  handleSelectCan() {
    let store_id = this.data.storeId
    const params = {
      store_id,
      amount: this.data.payMoney,
      beans: this.data.discountBeans
    }
    payModel.scanOrder(params)
      .then((res) => {
        let order_id = res.order_id
        let globalKey = wx.getStorageSync('globalKey')
        let params1 = {
          store_id: this.data.storeId,
          open_id: globalKey.newopenid1,
          order_id,
          paid_type: 2
        }
        payModel.getPayInfo(params1)
          .then((res1) => {
            wx.requestPayment({
              timeStamp: res1.timeStamp,
              nonceStr: res1.nonceStr,
              package: res1.package,
              signType: res1.signType,
              paySign: res1.sign,
              success(res) {
                console.log(res)
                if (res.errMsg == "requestPayment:ok") {
                  wx.redirectTo({
                    url: '../payResult/payResult?store_id=' + store_id + '&order_id=' + order_id
                  })
                }
              },
              fail(res) {
                console.log(94, res)
              }
            })
          })
      })
  },

  // 开启弹窗
  handleOpenDialog() {
    //判断用户是否登录
    let globalKey = wx.getStorageSync('globalKey')
    //  let storeInfo = wx.getStorageSync('store_info')
    let user_id = globalKey.user_id
    if (!user_id || user_id === undefined || wx.getStorageSync('userInfoKey') == false) { //没有登陆
      wx.navigateTo({
        url: '../index/index?store_id=' + this.data.storeId,
      });
      return
    } else {
      // 登录状态
      this.getFudouDetail()
      this.setData({
        showDialog: true
      })
    }

  },

  // 关闭选择用餐方式弹窗
  onCloseDialog() {
    this.setData({
      showAmount: Number(this.data.payMoney).toFixed(2),
      isCheckFudou: false,
      showDialog: false
    })
  },

  // 是否使用福豆
  handleChangeIsFudou(e) {
    if (e.detail) {
      let showAmount = (this.data.payMoney - this.data.discountBeans / 100).toFixed(2)
      this.setData({
        isCheckFudou: e.detail,
        showAmount
      })
    } else {
      this.setData({
        isCheckFudou: e.detail,
        showAmount: this.data.payMoney
      })
    }

  },

  // 跳转商店
  jumpToStore() {
    wx.navigateTo({
      url: '../storeDetails/storeDetails?store_id=' + this.data.storeId
    })
  }
})