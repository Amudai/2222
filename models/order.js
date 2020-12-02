import {
  HTTP
}
from '../utils/http.js'

class OrderModel extends HTTP {
  //创建订单Id
  creatOrderId(data) {
    return this.request({
      url: '/api/store_detail/insert_order_new',
      data
    })
  }


}

export {
  OrderModel
}