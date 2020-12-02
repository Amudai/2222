var url = 'https://dfm.dianmengmeng.com/';
var request_object = 'mini_program';
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}
function resetGoods(store_id) {
  let order_info = [];
  let choosedList = {};
  let goodsItem = wx.getStorageSync('goodsItem');
  let chooseList = wx.getStorageSync('chooseList');

  for (var i in goodsItem) {
    goodsItem[i].select_nums = 0;
    for (var j in goodsItem[i].list_goods) {
      goodsItem[i].list_goods[j].num = 0;
    }

  }
  if (chooseList.hasOwnProperty(store_id)) {
    delete chooseList[store_id]

  }
  wx.setStorageSync('order_info', order_info)
  wx.setStorageSync('choosedList', choosedList)
  wx.setStorageSync('chooseList', chooseList)
  wx.setStorageSync('goodsItem', goodsItem)
}
function debounce(fn, time) {
  return function () {
    setTimeout(fn, time)
  }
}

function praseStrEmpty(str) {
  if (typeof (str) == 'undefined' || typeof (str) == "object") {
    return "";
  }
  return str;
}
// 处理没http的图片
function addUrl(obj, src) {

  let re = /^\//;
  if (src) {
    src = src.substring(0, src.length);
    for (let i = 0; i < obj.length; i++) {
      if (obj[i][src]) {
        obj[i][src] = obj[i][src].replace(re, url);
      }
    }
  }
  return obj
}
function throttle(fn, gapTime) {
  if (gapTime == null || gapTime == undefined) {
    gapTime = 1500
  }

  let _lastTime = null

  // 返回新的函数
  return function () {
    let _nowTime = + new Date()
    if (_nowTime - _lastTime > gapTime || !_lastTime) {
      fn.apply(this, arguments)   //将this和参数传给原函数
      _lastTime = _nowTime
    }
  }
}
function addHistory(keyName, newData) {
  let keyData = wx.getStorageSync(keyName) || [];
  let tempList = {};

  let len = 10;
  if (newData != '' && !this.isInArray(keyData, newData)) {
    tempList['name'] = newData;
    console.log(keyData)
    if (keyData.length < len) {
      keyData.push(tempList);
    } else {
      keyData = keyData.slice(1, len);
      keyData.push(newData);
    }
    console.log(92, keyData)
    wx.setStorageSync(keyName, keyData)
  }
}
// 判断是否有在数组内
function isInArray(arr, value) {

  for (var i = 0; i < arr.length; i++) {
    if (value === arr[i].name) {
      return i + 1;
    }
  }
  return false;
}



function formatNum(e) {  //正则验证金额输入框格式  
  let value = e.detail.value;
  value = value.replace(/^(\-)*(\d+)\.(\d{6}).*$/, '$1$2.$3')
  value = value.replace(/[\u4e00-\u9fa5]+/g, ""); //清除汉字    
  value = value.replace(/[^\d.]/g, ""); //清楚非数字和小数点     
  value = value.replace(".", "$#$").replace(/\./g, "").replace("$#$", "."); //只保留第一个小数点, 清除多余的   
  value = value.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');//只能输入两个小数  
  value = value.replace(/^\./g, ""); //验证第一个字符是数字而不是小数点      
  return value
}


var md5 = require('./md5.js');


function returnGram() {
  let globalKey = wx.getStorageSync('globalKey');
  let token = globalKey.token || '';
  var timestamp = Date.parse(new Date());
  var val = 'fanbuyhainan' + timestamp.toString() + token;
  var process = md5.hexMD5(val);

  let gram = [{
    token,
    timestamp,
    process
  }]
  return gram[0]
}

function debounce(fn, wait) {
  var timeout = null;
  return function () {
    if (timeout !== null) clearTimeout(timeout);
    timeout = setTimeout(fn, wait);
  }
}

function returnOrderInfo(user_id, order_id) {
  wx.request({
    url: url + '/api/store_order/get_order_info',
    data: {
      request_object,
      user_id,
      order_id,
      timestamp: gram.timestamp,
      process: gram.process,
      token: gram.token
    },
    method: 'POST',
    header: {
      'Content-Type': "application/x-www-form-urlencoded"
    },
    success: function (res) {
      if (res.data.status == 1) {
        let newdata = res.data.data;
        console.log("我的订单详情返回数据", res.data)
        return newdata
      } else {
        console.log("我的订单详情请求失败", res.data)
      }
    },
    fail: function () {
      // fail
      console.log("服务器响应失败");
      app.showMind();

    },
    complete: function () {
      // complete
    }
  })
}
function returnCode(qrcode_url) {
  new QRCode('myQrcode', {
    text: qrcode_url,
    width: 46,
    height: 46,
    padding: 0, // 生成二维码四周自动留边宽度，不传入默认为0
    correctLevel: QRCode.CorrectLevel.L, // 二维码可辨识度
    callback: (res) => {
      // console.log(res.path, 71111)
      let myQrcodeSrc = [];
      myQrcodeSrc.push(res.path)
      // 接下来就可以直接调用微信小程序的api保存到本地或者将这张二维码直接画在海报上面去，看各自需求
      return myQrcodeSrc
    }
  })
}
function login(userinfo, mobile, me, num, app, scene, login_url) {

  let gram = returnGram();
  let globalKey = wx.getStorageSync('globalKey');
  let localcur = wx.getStorageSync('localcur');

  wx.setStorageSync('userInfoKey', userinfo);
  console.log(globalKey, gram, scene, 16777, 'utils', app.globalData.scene, app.globalData.store_id)
  let temparr = {};
  let openid = '';
  if (globalKey.hasOwnProperty('newopenid1') || app.globalData.newopenid1 != '') {
    openid = globalKey.newopenid1 || app.globalData.newopenid1
  } else {
    wx.showModal({
      title: '登录失败',
      content: '访问超时，请重试！',
    })
    wx.hideLoading();
    return;
  }
  wx.request({
    url: login_url + '/api/mini_program/login',
    data: {
      request_object,
      nickname: userinfo.nickName,
      sex: userinfo.gender,
      headimgurl: userinfo.avatarUrl,
      country: userinfo.country,
      city: localcur.city || userinfo.city || '',
      province: userinfo.province,
      unionid: '',
      nickname: userinfo.nickName,
      openid: openid,
      timestamp: gram.timestamp,
      process: gram.process,
      mobile: mobile || '',
      store_id: app.globalData.store_id || '',
      scene: app.globalData.scene || ''
    },
    method: 'POST',
    success: function (res) {
      console.log(res, 178, 'login', mobile)

      if (res.data.status == 1) {
        wx.hideLoading();
        temparr.user_id = res.data.data.user_id;
        temparr.token = res.data.data.token;
        globalKey.user_id = res.data.data.user_id;
        globalKey.token = res.data.data.token;
        app.globalData.user_id = res.data.data.user_id;
        app.globalData.token = res.data.data.token;

        globalKey.newuser1 = '1';
        app.globalData.newuser1 = '1';
        wx.setStorageSync('globalKey', globalKey)
        wx.showToast({
          title: '登录成功',
        })
        if (num == 1) {
          let arr = me.returnArr();
          let user_id = arr[0].user_id;
          console.log(num, 204);
          if (user_id) {
            arr[0].order_status = me.data.isActive
            me.getData(arr[0]);
            me.setData({
              nodata: false,
            })
          }
        }
        console.log(num, 205);
        if (num == 2) {
          wx.navigateBack({
            delta: 1
          })
        }

        if (num == 4) {
          me.setData({
            zIndex: 0,

          })
        }
        console.log(243333333333)
        me.setData({
          isUser: false,
          isPhone: false,
          isshowModal: false,
          user_id: res.data.data.user_id,
          token: globalKey.token, isUser: false, isshowModal: false, userinfo
        })
      } else {
        wx.showToast({
          icon: 'none',
          title: '登录失败，正在跳转至首页',
        })
        wx.switchTab({
          url: '/pages/home/index',
        })
      }

    },
    fail(res) {
      app.showMind();
    }
  })
}
function reLaunchindex() {
  wx.switchTab({
    url: '../home/index',
  })
}
function showModal(me, app, isHome) {
  wx.hideLoading();
  let globalKey = wx.getStorageSync('globalKey');
  let userInfo = wx.getStorageSync('userInfoKey');
  let newuser1 = praseStrEmpty(app.globalData.newuser1) != '' ? app.globalData.newuser1 : globalKey.newuser1;;

  let user_phone = praseStrEmpty(app.globalData.user_phone) != '' ? app.globalData.user_phone : globalKey.user_phone;
  console.log(userInfo, user_phone, newuser1, globalKey.user_id, app.globalData.user_id, 'showModal', praseStrEmpty(user_phone) != '', praseStrEmpty(newuser1) != '');
  let isPhone = false;
  let isshowModal = false;
  let isUser = false;
  let logosrc = '../../images/logo.png';
  if (praseStrEmpty(user_phone) == '') {
    isPhone = true
  }
  if (praseStrEmpty(newuser1) == '') {
    isUser = true;
    isshowModal = true;

  } else {
    if (isHome == 'home') {
      logosrc = userInfo.avatarUrl;
    }
  }

  me.setData({
    isPhone,
    isUser,
    isshowModal,
    logosrc
  })
  // if (praseStrEmpty(user_phone) != '') {
  //   me.setData({
  //     isPhone: false,
  //     isshowModal: false,
  //   })
  // } else {
  //   me.setData({
  //     isPhone: true,
  //     isshowModal: false,
  //   })
  // }
  // 用户
  // if (praseStrEmpty(newuser1)  != ''){
  //   me.setData({
  //     isshowModal: false,
  //     isUser: false,
  //   })
  // } else {
  //   me.setData({
  //     isUser: true,
  //     isshowModal: true,
  //   }) 
  // }

}
function storeInfo(that, store_id, user_id, scene, app, index) {
  // 店铺详情
  console.log('店铺id：', store_id, user_id, scene, app, index)
  let gram = returnGram();
  user_id = user_id || '';
  wx.navigateTo({
    url: "/pages/storeDetails/storeDetails?store_id=" + store_id + "&user_id=" + user_id + "&token=" + gram.token + "&category_id=" + ''
  })
}
//点击锁定
function buttonClicked(self) {
  self.setData({
    buttonClicked: true
  })

  setTimeout(function () {
    self.setData({
      buttonClicked: false
    })
  }, 500)

}
module.exports = {
  formatTime,
  throttle,
  addUrl,
  isInArray,
  addHistory,
  formatNum,
  returnGram,
  returnOrderInfo,
  returnCode,
  login,
  storeInfo,
  showModal,
  praseStrEmpty,
  reLaunchindex,
  resetGoods,
  url,
  buttonClicked,
  debounce
}