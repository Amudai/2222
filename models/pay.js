
import {
  HTTP
}
from '../utils/http.js'

class PayModel extends HTTP {
  //创建订单Id
  scanOrder(data) {
    return this.request({
      url: '/api/store_detail/scan_order',
      data
    })
  }
 // 通过订单号获取支付信息
  getPayInfo(data) {
    return this.request({
      url: '/v2/dfm/api/order/index/',
      data
    })
  }

}

export {
  PayModel
}