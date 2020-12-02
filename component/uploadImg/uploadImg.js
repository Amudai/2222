// component/uploadImg/uploadImg.js
import {
  config
} from '../../utils/config.js'
var util = require('../../utils/util.js');

Component({
  /**
   * 组件的属性列表
   */
  properties: {
    orderId: {
      type: String
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    images: []

  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 图片操作的具体函数
    imageOperator() {
      let that = this;
      wx.chooseImage({
        count: 3,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: res => {
          const imgList = res.tempFilePaths;// 上传的图片数据
          const imageList = that.data.images;// 原始的图片数据
          let imageLenght = imageList.length;// 原来的图片数量
          let nowLenght = imgList.length;// 当前的图片数量
          if (imageLenght == 3) {
            wx.showToast({
              title: "数量已经有3张，请删除在添加...",
            })
          }
          if (imageLenght < 3) {
            let images = [];
            // 获取缺少的图片张数
            let residue = 3 - imageLenght;
            // 如果缺少的张数大于当前的的张数  
            if (residue >= nowLenght) {
              // 直接将两个数组合并为一个  
              images = imageList.concat(imgList);
            } else {
              // 否则截取当前的数组一部分  
              images = imageList.concat(imgList.slice(0, residue));
            }
            that.setData({
              images
            })
            that.getUploadImg()
          }
        }
      })

    },
    // 图片获取
    chooseImage() {
      this.imageOperator()
    },
    // 删除图片
    deleteImage(event) {
      const nowIndex = event.currentTarget.dataset.index;
      let images = this.data.images;
      images.splice(nowIndex, 1);
      this.setData({
        images
      })
    },
    // 预览图片
    previewIamge(event) {
      const nowIndex = event.currentTarget.dataset.index;
      const images = this.data.images;
      wx.previewImage({
        current: images[nowIndex],  //当前预览的图片
        urls: images,  //所有要预览的图片
      })
    },
    // 上传图片
    getUploadImg() {
      let that = this;
      var tempFilePaths = this.data.images; //总共个数
      var length = tempFilePaths.length;
      let gram = util.returnGram();
      let globalKey = wx.getStorageSync('globalKey');
      for (let i = 0; i < length; i++) {
        wx.uploadFile({
          url: config.api_base_url + '/api/store_order/upload_image',
          filePath: tempFilePaths[i],
          name: 'pics',
          header: {
            "Content-Type": "multipart/form-data"
          },
          formData: {
            request_object: 'mini_program',
            pics: tempFilePaths[0],
            user_id: globalKey.user_id,
            id: this.data.orderId,
            type: 'refund',
            timestamp: gram.timestamp,
            process: gram.process,
            token: gram.token,
          },
          success: function (res) {
            console.log(res)
          }
        })
      }

    }
  }
})