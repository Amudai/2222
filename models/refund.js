
import {
  HTTP
}
  from '../utils/http.js'

class RefundModel extends HTTP {
  // 退款
  getRefund(data) {
    return this.request({
      url: '/api/mine_refund/insert_refund',
      data
    })
  }
  // 取消退款
  cancelRefund(data) {
    return this.request({
      url: '/api/mine_refund/cancel_refund',
      data
    })
  }

  // 查看退款记录
  getRefundInfo(data) {
    return this.request({
      url: '/api/mine_refund/refund_info',
      data
    })
  }
}

export {
  RefundModel
}