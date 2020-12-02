import {
  HTTP
}
from '../utils/http.js'

class HomeModel extends HTTP {
  
  // 首页数据
  getHomeData(data) {
    return this.request({
      url: '/api/mini_homepage/get_home_info',
      data
    })
  }

  // 福猫推荐数据
  getStoreList(data) {
    return this.request({
      url: '/api/mini_homepage/list_store_more',
      data
    })
  }

 

}

export {
  HomeModel
}