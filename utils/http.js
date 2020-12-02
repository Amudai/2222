import {
  config
} from './config.js'
var util = require('./util.js');
var app = getApp();

// # 解构
class HTTP {
  request({
    url,
    data = {},
    method = 'POST',
    noRefetch = false,
    requestObj = {}
  }) {
    return new Promise((resolve, reject) => {
      this._request(url, resolve, reject, data, method, noRefetch, requestObj)
    })
  }
  // 2小时
  // 退出 短时间 二次重发机制
  _request(url, resolve, reject, data = {}, method = 'POST', noRefetch = false, requestObj = {}) {
    let globalKey = wx.getStorageSync('globalKey');
    let gram = util.returnGram();
    const version = __wxConfig.envVersion
    const baseUrl = version === 'release' ? config.api_base_url_release : config.api_base_url_dev
    wx.request({
      url: baseUrl + url,
      method: method,
      data: {
        request_object: 'mini_program',
        user_id: globalKey.user_id,
        timestamp: gram.timestamp,
        process: gram.process,
        token: gram.token,
        ...data
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      success: (res) => {
        let promiseQueue = app.globalData.promiseQueue;
        if (res.data.status === 1 || res.data.status === true) {
          if (requestObj.resolve) { //如果是promise队列中的请求。
            requestObj.resolve(res.data.data);
            let promiseQueueItem = promiseQueue.shift();
            if (app.globalData.exeQueue) { //如果队列可执行则循环队列，保持队列只被循环一次。
              app.globalData.exeQueue = false; //防止被多次循环。
              while (promiseQueueItem) {
                this.request({
                  url,
                  data,
                  method,
                  requestObj: promiseQueueItem
                })
                promiseQueueItem = promiseQueue.shift();
                app.globalData.promiseQueue = promiseQueue;
              }
              if (!promiseQueueItem) {
                app.globalData.exeQueue = true;
                app.globalData.needBeginLogin = true;
              }
            }
          } else {
            resolve(res.data.data)
          }

        } else {
          if (res.data.code == 403) {
            requestObj.resolve = resolve;
            promiseQueue.push(requestObj); //请求失败了，把该请求放到promise队列，等待更新token后重新调用。
            // if (!that.globalData.needBeginLogin) { //如果不需要重新登录
            //   return;
            // }
            //防止重复调用login。
            // app.globalData.promiseQueue = promiseQueue;
            app.globalData.needBeginLogin = false;
            this.getNewToken(() => { //获取完token以后执行回调
              //重新登陆以后调用一次队列中的promise；并设置队列为可循环状态。
              let promiseQueueItem = promiseQueue.shift();
              if (promiseQueueItem) {
                app.globalData.exeQueue = true;
                this.request({
                  url,
                  data,
                  method,
                  requestObj: promiseQueueItem
                })

                app.globalData.promiseQueue = promiseQueue;
              }
            }, true)

          } else {
            if (url !== '/api/collectOrder/pay_result') {
              this._show_error(res.data.message)
            }
            reject(res.data)
          }
        }
      },
      fail: (err) => {
        reject()
        this._show_error('出现一个小错误')
      }
    })

  }
  getNewToken(callBack) {
    this.request({
      url: '/api/user/get_now_token',
      data: {}
    }).then((res) => {
      console.log(res)
      let globalKey = wx.getStorageSync('globalKey');
      globalKey.token = res.token;
      app.globalData.token = res.token;
      wx.setStorageSync('globalKey', globalKey)
      callBack && callBack()

    }).catch(() => {

    })
  }
  _show_error(msg) {
    wx.showToast({
      title: msg,
      icon: 'none',
      duration: 2000
    })
  }

}

export {
  HTTP
}