import {
  config
} from './config.js'

// 根据环境判断域名
const version = __wxConfig.envVersion
const net_img_url = version === 'release' ? config.api_base_url_release : config.api_base_url_dev

const dfm_ad_img = `${net_img_url}/image/ad/ad_1.png`


export {
  dfm_ad_img
}