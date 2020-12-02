import {
  FudouModel
} from '../../models/fudou.js'
const fudouModel = new FudouModel()
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    fudouDetail: {},
    fudouList: [],
    tabs: [{
        label: '全部',
        value: 0
      },
      {
        label: '收入',
        value: 1
      },
      {
        label: '支出',
        value: 2
      },
    ],
    currentIndex: 0,
    page: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.getFudouDetail()
    this.getFudouList()
  },
  // 获取福豆数据
  getFudouDetail() {
    fudouModel.getFudouDetail()
      .then((res) => {
        console.log(res,'福豆数据')
        this.setData({
          fudouDetail: res
        })
      }).catch((error) => {
        console.log(error,'福豆数据')
       
       
      })
  },

  // 获取福豆明细列表
  getFudouList(type, page) {
    const params = {
      page: page || 1,
      limit: 10,
      type: type || 0
    }
    fudouModel.getFudouList(params)
      .then((res) => {
        console.log('res', res)
        let list = this.data.fudouList
        list.push(...res)

        this.setData({
          fudouList: list
        })
        if (res !== null && res.length < 10) {
          wx.showToast({
            title: '全部加载完成',
          })
          return false
        }
      })
  },

  // 切换tabs
  handleChangetabs(e) {
    this.setData({
      page: 1,
      currentIndex: e.target.dataset.value,
      fudouList: []
    })
    this.getFudouList(e.target.dataset.value, 1)
  },

  // 跳转福豆规则
  jumpToFudouRule() {
    wx.navigateTo({
      url: '../fudouRule/fudouRule',
    })
  },

  onReachBottom() {
    console.log('1111')
    this.data.page++
    this.getFudouList(this.data.currentIndex, this.data.page)
  }


})