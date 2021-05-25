var express = require('express');
var router = express.Router();
const middle = require('./../middleware/index');
const db = require('../mysql');
const Utils = require('./../utils/index')

/* GET home page. */

// 增加记录
router.post('/add', middle.checkUser, (req, res) => {
	let { openid, status, type, remark, money, time } = req.body
	console.log(time)
	if ( status == undefined || !type || !money || !time ) {
		res.send({code: -1, msg: '缺少参数'})
	} else {
		db.insert('record').column('openid', openid).column('type', type).column('status', status).column('money', money).column('remark', remark).column('time', new Date(time)).execute().then(() => {
			res.send({code: 200})
		}).catch(err => {
			console.log(err)
			res.send({code: -1, msg: '系统繁忙'})
		})
	}
})

// 修改记录
router.post('/change', middle.checkUser, (req, res) => {
	let { status, type, money, remark, time, id } = req.body
	if ( !id ) {
		res.send({code: -1, msg: '缺少参数'})
	} else {
		db.update('record').column('status', status).column('type', type).column('money', money).column('remark', remark).column('time', new Date(time)).where('id', id).execute().then(() => {
			res.send({code: 200})
		}).catch(err => {
			res.send({code: -1, msg: '系统繁忙'})
			console.log(err)
		})
	}
})

// 删除记录
router.post('/del', middle.checkUser, (req, res) => {
	let { id } = req.body
	if ( !id ) {
		res.send({code: -1, msg: '缺少参数'})
	} else {
		db.delete('record').where('id', id).execute().then(() => {
			res.send({code: 200})
		}).catch(err => {
			res.send({code: -1, msg: '系统繁忙'})
			console.log(err)
		})
	}
})

// 查找记录
router.get('/search', middle.checkUser, (req, res) => {
	// type	1-id
	let { type } = req.query
	if ( !type ) {
		res.send({code: -1, msg: '缺少参数'})
	} else if ( type == 1 ) {
		db.select('*').from('record').where('id', req.query.id).queryRow().then(data => {
			res.send({code: 200, data})
		}).catch(err => {
			console.log(err)
			res.send({code: -1, msg: '系统繁忙'})
		})
	}
})

// 获取记录列表
router.get('/list', middle.checkUser, (req, res) => {
	let { openid, month, year } = req.query
	db.select('id, type, status, money, remark, time').from('record').where('openid', openid).where('time', month? `${ year }-${ month }` : Utils.dateFormat( new Date(), 'yyyy-MM'), 'like').orderby("time asc").queryList().then(data => {
		let list = {
			expenditure: 0,
			income: 0
		}
		data.forEach(item => {
			let dataMonth = Utils.dateFormat(item.time, 'dd')
			if ( list[dataMonth] ) {
				list[dataMonth].push(item)
			} else {
				list[dataMonth] = [item]
			}
			if ( item.status == 0 ) {
				list.expenditure = parseFloat(list.expenditure) + parseFloat(parseFloat(item.money) * 100)
			} else {
				list.income = parseFloat(list.income) + parseFloat(parseFloat(item.money) * 100)
			}
		})
		list.expenditure = Utils.addDotNum(list.expenditure / 100, 2)
		list.income = Utils.addDotNum(list.income / 100, 2)
		res.send({code: 200, data: list})
	}).catch(err => {
		console.log(err)
		res.send({code: -1, msg: '系统繁忙'})
	})
})

// 获取结余信息
router.get('/summary', middle.checkUser, (req, res) => {
	let { openid, year } = req.query
	db.select('*').from('record').where('openid', openid).where('time', year - 1 + '-12-31', 'gt').queryList().then(data => {
		console.log(data, openid)
		res.send({code: 200, data})
	}).catch(err => {
		console.log(err)
		res.send({code: -1, msg: '系统繁忙'})
	})
})

module.exports = router;
