import {
  HTTP
}
from '../utils/http.js'

class BusinessModel extends HTTP {
  // 判断是否是店员
  isAssistant(data) {
    return this.request({
      url: '/api/user/is_assistant',
      data
    })
  }

  // 店员下单
  colletAddOrder(data) {
    return this.request({
      url: '/api/collectOrder/add_order',
      data
    })
  }

  // 获取收款详细
  getCollectOrderinfo(data) {
    return this.request({
      url: '/api/collectOrder/info',
      data
    })
  }

  // 店铺列表
  getStoreList(data) {
    return this.request({
      url: '/api/collectOrder/get_store_name',
      data
    })
  }

  // 店员订单列表
  getStoreOrderList(data) {
    return this.request({
      url: '/api/collectOrder/order_list',
      data
    })
  }

  // 店员订单详情
  getStoreOrderInfo(data) {
    return this.request({
      url: '/api/collectOrder/order_info',
      data
    })
  }

  // 店员取消订单
  storeOrdercancel(data) {
    return this.request({
      url: '/api/collectOrder/order_cancel',
      data
    })
  }

  // 打印
  storePrintOrder(data) {
    return this.request({
      url: '/api/collectOrder/print_order',
      data
    })
  }

  // 店员端用户下单
  storeUserToOrder(data) {
    return this.request({
      url: '/api/collect_order/to_order',
      data
    })
  }

  // 判断是否商家点单
  isCollect(data) {
    return this.request({
      url: '/api/collectOrder/is_collect',
      data
    })
  }


  // 订单支付结果
  payResult(data) {
    return this.request({
      url: '/api/collectOrder/pay_result',
      data
    })
  }


  // 订单核销
  checkOrder(data) {
    return this.request({
      url: '/api/collectOrder/check_order',
      data
    })
  }

  // 扫桌码确定订单接口
  getTableOrderInfo(data) {
    return this.request({
      url: '/api/nearby/get_table_order_info',
      data
    })
  }

  // 扫桌码确定店铺信息
  getScanStoreInfo(data) {
    return this.request({
      url: '/api/nearby/into_store',
      data
    })
  }
}

export {
  BusinessModel
}