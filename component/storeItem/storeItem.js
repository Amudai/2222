// component/storeItem.js
var app = getApp();
var util = require('../../utils/util.js');
var old_store_id = '';
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    stores:{
      type:Array
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
    toStoreDetail: function (e) {
      let that = this;
      let store_id = e.currentTarget.dataset.index.store_id;
      old_store_id = store_id
      let globalKey = wx.getStorageSync('globalKey');
      util.storeInfo(that, store_id, globalKey.user_id, app, 2); //把this通过实参传进去
    },
  }
})
