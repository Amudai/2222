
import {
  BusinessModel
} from '../../models/business.js'

const businessModel = new BusinessModel()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    active: '0',
    show: false,
    waitPayNum: null,
    cancelNum: null,
    total: null,
    storeList: [],
    storeOrderList: [],
    storeToPayOrderList: [],
    storeCancelOrderList: [],
    storeId: '',
    storeName: '',
    noMore0: false,
    noMore1: false,
    noMore3: false,
    page0: 1,
    page1: 1,
    page3: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let storeId = wx.getStorageSync('storeId')
    if (storeId) {
      this.setData({
        storeName: wx.getStorageSync('storeName'),
        storeId
      })
      this.data.storeOrderList = []
      this.data.storeToPayOrderList = []
      this.getStoreOrderList('0', 1) // 获取店铺店员订单
      this.getStoreOrderList('1', 1) // 获取店铺店员订单
    } else {
      this.getStoreList(1) // 获取店铺列表
    }
  },
  // 获取店铺列表
  getStoreList(val) {
    businessModel.getStoreList()
      .then((res) => {
        if (val === 1) {
          wx.setStorageSync('storeId', res[0].store_id)
          this.setData({
            storeName: res[0].store_name,
            storeId: res[0].store_id
          })
          this.getStoreOrderList('0', 1) // 获取店铺店员订单
        } else {
          this.setData({
            storeList: res
          })
        }
      })
  },
  //  获取全部店铺店员订单
  getStoreOrderList(active, page) {
    let params = {}
    params.store_id = wx.getStorageSync('storeId')
    params.page = page
    params.limit = 10
    if (active) {
      params.status = active
    }
    wx.showLoading({
      title: '正在加载中'
    })
    businessModel.getStoreOrderList(params)
      .then((res) => {
        setTimeout(() => {
          wx.hideLoading()
        }, 500)

        switch (active) {
          case '0':
            if (res.list.length < 10) {
              this.setData({
                noMore0: true
              })
            }
            let storeOrderList = this.data.storeOrderList
            storeOrderList.push(...res.list)
            let a = []
            a = this._nomalize(storeOrderList)
            this.setData({
              storeOrderList: this._nomalize(storeOrderList),
              cancelNum: res.cancel_num,
              total: res.total,
              waitPayNum: res.wait_pay_num
            })
            break
          case '1':
            if (res.list.length < 10) {
              this.setData({
                noMore1: true
              })
            }
            let storeToPayOrderList = this.data.storeToPayOrderList
            storeToPayOrderList.push(...res.list)
            this.setData({
              storeToPayOrderList: this._nomalize(storeToPayOrderList),
              cancelNum: res.cancel_num,
              total: res.total,
              waitPayNum: res.wait_pay_num
            })
            break
          case '3':
            if (res.list.length < 10) {
              this.setData({
                noMore3: true
              })
            }
            let storeCancelOrderList = this.data.storeCancelOrderList
            storeCancelOrderList.push(...res.list)
            this.setData({
              storeCancelOrderList: this._nomalize(storeCancelOrderList)
            })
            break
        }

      })
  },
  // 开启弹窗
  handleShowStore() {
    this.getStoreList() // 获取店铺列表
    this.setData({ show: true });
  },
  // 关闭弹窗
  onClose() {
    this.setData({ show: false });
  },
  // 选择店铺
  onChange(event) {
    wx.setStorageSync('storeId', event.detail)
    this.getStoreOrderList('0', 1) // 获取店铺店员订单
    // 重置所有数据
    this.setData({
      storeId: event.detail,
      active: '0',
      storeOrderList: [],
      storeToPayOrderList: [],
      storeCancelOrderList: [],
      noMore0: false,
      noMore1: false,
      noMore3: false,
      page0: 1,
      page1: 1,
      page3: 1,
      show: false
    });
  },
  // 切换tab
  handChangeTabs(e) {
    this.getStoreOrderList(e.detail.name, this.data['page' + e.detail.name])
    this.setData({
      active: e.detail.name
    })
  },
  // 获取店铺名字
  onClick(event) {
    const { name } = event.currentTarget.dataset;
    wx.setStorageSync('storeName', name)
    this.setData({
      storeName: name,
    });
  },

  // 跳转订单详情
  jumpToOrderDetail(e) {
    const collectId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../orderDetail/orderDetail?collect_id=' + collectId
    })
  },

  // 取消订单
  handleCanelOrder(e) {
    let collectId = e.currentTarget.dataset.id
    let _this = this
    wx.showModal({
      title: '温馨提示！',
      content: '确定取消该订单？取消后订单无法恢复',
      success(res) {
        if (res.confirm) {
          const params = {
            collect_id: collectId
          }
          businessModel.storeOrdercancel(params)
            .then((res) => {
              wx.showToast({
                title: '取消订单成功',
                icon: 'none',
              });
              _this.setData({
                noMore0: false,
                noMore1: false,
                page0: 1,
                page1: 1,
                storeOrderList: [],
                storeToPayOrderList: [],
              })
              _this.getStoreOrderList(_this.data.active)
            })
        }
      }
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    switch (this.data.active) {
      case '0':
        if (!this.data.noMore0) {
          this.data.page0++
          this.getStoreOrderList(this.data.active, this.data.page0);
        }
        break
      case '1':
        if (!this.data.noMore1) {
          this.data.page1++
          this.getStoreOrderList(this.data.active, this.data.page1);
        }
        break
      case '3':
        if (!this.data.noMore3) {
          this.data.page3++
          this.getStoreOrderList(this.data.active, this.data.page3);
        }
    }
  },

  // 去重
  _nomalize(arr) {
    const res = new Map();
    return arr.filter((arr) => !res.has(arr.id) && res.set(arr.id, 1))
  }
})