import {
  HTTP
}
from '../utils/http.js'

class StoreModel extends HTTP {
  // 获取商店信息
  getStoreInfo(data) {
    return this.request({
      url: '/api/store_detail/get_store_info_new',
      data
    })
  }
  // 获取商品信息
  getGoodsInfo(data) {
    return this.request({
      url: '/api/store_detail/list_store_goods',
      data
    })
  }
  // 获取平价信息
  getEvaInfo(data) {
    return this.request({
      url: '/api/store_detail/list_user_evaluate',
      data
    })
  }

}

export {
  StoreModel
}