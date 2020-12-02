import {
  HTTP
}
  from '../utils/http.js'

class ComponentsModel extends HTTP {
  //获取福猫券列表
  getUnplodImg(data) {
    return this.request({
      url: '/api/store_order/upload_image',
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
  ComponentsModel
}