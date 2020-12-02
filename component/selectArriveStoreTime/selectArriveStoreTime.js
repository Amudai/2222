// component/selectArriveStoreTime/selectArriveStoreTime.js
var app = getApp();
var util = require('../../utils/util.js');

Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },
  //在组件实例刚刚被创建时执行
  created(){
    this.makeArriveTimeArray()
  },
  /**
   * 组件的初始数据
   */
  data: {
    arriveTimeArr:[],//到店时刻数组
    current:NaN,//当前点击的预计到店时刻item的数组索引
  },
  /**
   * 组件的方法列表
   */
  methods: {
    //获取预约到店到店时刻数组
    makeArriveTimeArray(){
      const that = this
      let gram = util.returnGram()
      let user_id = wx.getStorageSync('globalKey')['user_id']
      wx.request({
        url: app.globalData.url + '/api/store_detail/get_appointment_arrival_time',
        data:{
          user_id,
          timestamp: gram.timestamp,
          process: gram.process,
          token: gram.token,
          request_object: app.globalData.request_object,
        },
        method:'POST',
        success:function(data){
          if(data.data.status == 1){
            that.setData({
              arriveTimeArr: data.data.data.appointment_time
            }) 
          }else{
            wx.showToast({
              title: data.data.message,
              icon:'none',
              duration: 4000,
            })
          }
        }
      })
    },
    //每个时刻item点击触发事件
    handleItemClick(opt){
      let {index:current,text,canchoose} = opt.currentTarget.dataset
      if(canchoose == 0){//时刻不可选择
        return
      }
      this.setData({
        current,
      })
      this.triggerEvent('event1', {text}, {})
    },
    //通知父组件去关闭这个子组件视图
    close(){
      this.triggerEvent('event',{},{})
    }
  }
})
