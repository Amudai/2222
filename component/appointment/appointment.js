// component/appointment/appointment.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    arriveStore:{
      type:Boolean,
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    // arriveStore:true,
    // text:'到店',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    //点击白色区域切换
    // handleClick(){
    //   this.setData({
    //     arriveStore:!this.data.arriveStore
    //   })
    // },
    //点击到店
    isArriveStoreHandle(){
      this.setData({
        arriveStore:true,
      })
      this.triggerEvent('event', {arriveStore:this.data.arriveStore}, {})
    },
    //点击预约
    isNotArriveStoreHandle(){
      this.setData({
        arriveStore:false,
      })
      this.triggerEvent('event', { arriveStore: this.data.arriveStore }, {})
    }
  }
})
