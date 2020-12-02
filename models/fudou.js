import {
  HTTP
}
from '../utils/http.js'

class FudouModel extends HTTP {
  
  //福豆详情
  getFudouDetail(data) {
    return this.request({
      url: '/v2/dfm/api/bean/account',
      data
    })
  }

  //福豆明细列表
  getFudouList(data) {
    return this.request({
      url: '/v2/dfm/api/bean/log',
      data
    })
  }

  // 计算福豆
  getXiaofeiFudou(data) {
    return this.request({
      url: '/v2/dfm/api/bean/count',
      data
    })
  }

}

export {
  FudouModel
}