// component/storeDetails/specification/specification.js
Component({
	/**
	 * 组件的属性列表
	 */
	properties: {
		goodsObject: {
			type: Object,
		},
		choose_spc: {
			type: Object,
		}
	},
	//组件创建时回调
	ready() {
		console.log(this.properties.goodsObject, '规格弹窗子组件接收到的商品对象')
		let selectArr = []
		
		//选择规格的时候给的默认规格
		for (let i = 0; i < this.properties.goodsObject.goods_attributes.length; i++) {
			let secArr = []
			secArr.push({
				index1: i,
				index2: 0,
				v: this.properties.goodsObject.goods_attributes[i].attr_value[0]
			})
			selectArr[i] = secArr
		}
		this.setData({
			selectedArr: selectArr
		})
		console.log(this.data.selectedArr)
	},
	/**
	 * 组件的初始数据
	 */
	data: {
		selectedArr: [], //已选规格的记录数组
		isSHow: true,
	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		//每个规格item被点击时触发的回调函数
		handleItemClick(data) {
			let {
				v: value,
				index1,
				index2,
			} = data.currentTarget.dataset
			const dataset = data.currentTarget.dataset

			if (!this.data.selectedArr[dataset.index1]) { //如果没有维护一个二维数组就根据当前选择对象的一维索引为索引创建一个数组
				this.data.selectedArr[dataset.index1] = []
			}

			this.data.selectedArr[dataset.index1].push(dataset)

			for (let i = 0; i < this.data.selectedArr.length; i++) {
				if (Array.isArray(this.data.selectedArr[i])) {
					this.data.selectedArr[i].splice(0, this.data.selectedArr[i].length - 1)
				}
			}
			this.setData({
				selectedArr: this.data.selectedArr,
				current: {
					index1,
					index2,
				},
			})
			console.log(this.data.selectedArr, 2011)
		},
		//加入购物车按钮被点击时触发
		addToCar() {
			console.log('asdasdasdasd=======')
			let str = ''
			for (let item of this.data.selectedArr) {
				for (let items of item) {
					str += items.v
				}
			}
			console.log(str)
			if(!this.data.goodsObject.choose_spc){
				this.data.goodsObject.choose_spc={}
			}
			this.data.goodsObject.choose_spc[str]={
				num:1,
				arr:this.data.selectedArr
			}
			// this.data.goodsObject.selectedGoods_attributes = this.data.selectedArr
			console.log('asdasdasdasd=====----==', this.data.goodsObject)
			this.triggerEvent('event', {
				goodsObject: this.data.goodsObject,
				str
			}, {})
		},
		close() {
			this.triggerEvent('close')
		}
	}
})
