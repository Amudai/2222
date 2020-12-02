import {
  BusinessModel
} from '../models/business.js'

const businessModel = new BusinessModel()

class ScanCode {

  // 扫码付款码
  getScanCodeInfo(options, that) {
    let query = options.q
    let qrintostore = ''
    if (query != '' && query !== undefined) {
      query = unescape(query)
      console.log('query', query)
      if (query.indexOf('scan_pay') > 0 || query.indexOf('ab_pay') > 0) {
        let indexArr = query.split('q=')
        qrintostore = indexArr[1]
      }
    }
    if (qrintostore) {
      businessModel.getScanStoreInfo({ parameter: qrintostore })
        .then((res) => {
          that.getStoreInfo(res.store_id)
          that.setData({
            storeId: res.store_id
          })
        })
    }
  }
}

export {
  ScanCode
}