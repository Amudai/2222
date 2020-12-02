import {
  HTTP
}
from '../utils/http.js'

class CouponModel extends HTTP {
  //获取福猫券列表
  getCouponList(data) {
    return this.request({
      url: '/api/coupon/mylist',
      data
    })
  }

  //可用福猫券列表
  getCouponAbleList(data) {
    return this.request({
      url: '/api/coupon/able_list',
      data
    })
  }

}

export {
  CouponModel
}