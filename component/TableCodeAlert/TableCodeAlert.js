// component/TableCodeAlert/TableCodeAlert.js
var app = getApp()
var util = require('../../utils/util.js')

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    tablenumber:{
      type:String,
      value:'A03',
    },
    orderid:{
      type:String,
    },
    storeid:{
      type:String,
    }
  },
  //组件创建时触发 
  //本地存储中有一个tableCodeConfirmObject对象专门来记录每个预约订单是否已经确认桌码成功 {订单号:boolean,}
  created(){
    if (!wx.getStorageSync('tableCodeConfirmObject')){
      wx.setStorageSync('tableCodeConfirmObject', {})
    }
  },
  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    //确定
    handleClick(){
      const that = this
      let gram = util.returnGram()
      let user_id = wx.getStorageSync('globalKey')['user_id']
     
      wx.request({
        url: app.globalData.url + '/api/store_order/confirm_table_num',
        data: {
          order_id: that.data.orderid,
          store_id: that.data.storeid,
          user_id,
          table_number: that.data.tablenumber,
          timestamp: gram.timestamp,
          process: gram.process,
          token: gram.token
        },
        method: "post",
        success:function(res){
          if(res.data.status == 1){
            that.letBoolean2orderId(that.data.orderid) //根据订单号生成是否已经确认桌码成功的布尔值
            wx.showToast({
              title: '绑定桌码成功',
              icon:'none',
              complete:function(){
                that.triggerEvent('event', {}, {})//触发父组件的事件监听函数 让父组件关闭这个桌码弹窗组件
              }
            })
          }else{
            wx.showToast({
              title: res.data.message,
              icon:'none',
              duration: 2000,
            })
          }
        }
      })
    },
    //取消
    handleClickCancel(){
      this.triggerEvent('event', {}, {})//触发父组件的事件监听函数 让父组件关闭这个桌码弹窗组件
    },
    //根据订单号生成是否已经确认桌码成功的布尔值
    letBoolean2orderId(order_id){
      const locals = wx.getStorageSync('tableCodeConfirmObject')
      locals[order_id] = true
      wx.setStorageSync('tableCodeConfirmObject', locals)
    }
  }
})
