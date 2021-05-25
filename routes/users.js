var express = require('express');
const db = require('../mysql');
var router = express.Router();
const Utils = require('./../utils/index')
const middle = require('./../middleware/index');

/* GET users listing. */
// 注册
router.post('/register', async (req, res) => {
	let { username, head_img, openid  } = req.body
	username = username.replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, "")
	if ( !username || !head_img || !openid ) {
		res.send({code: -1, msg: '缺少参数'})
	} else {
		let result = await db.select('*').from('user').where('openid', openid).queryRow().catch(err => {
			console.log( err )
			res.send({code: -1, msg: '系统繁忙'})
		})
		if ( result !== undefined ) {
			res.send({code: 200})
		} else {
			db.insert('user')
			.column('username', username)
			.column('head_img', head_img)
			.column('openid', openid)
			.column('register_time', new Date())
			.column('late_month', Utils.dateFormat(new Date(), 'MM'))
			.execute()
			.then(() => {
				res.send({code: 200})
			})
			.catch(err => {
				console.log(err)
				res.send({code: -1, msg: '系统繁忙'})
			})
		}
	}
})

// 登录
router.get('/login', middle.setLastMonth, middle.checkUser, async (req, res) => {
	let { openid } = req.query
	Utils.getUserInfo( openid ).then(async data => {
		if ( data ) {
			let userInfo = await db.select('*').from('user').where('openid', openid).queryRow().catch(err => {
				console.log( err )
				res.send({code: -1, msg: '系统繁忙'})
			})
			console.log(userInfo)
			res.send({code: 200, login: true, data, userInfo})
		} else {
			res.send({code: 200, login: false})
		}
	})
})

// 设置预算
router.post('/set-budget', middle.checkUser, (req, res) => {
	let { openid, budget } = req.body
	console.log(typeof budget, budget)
	if ( typeof budget != 'number' ) {
		res.send({code: -1, msg: '格式错误'})
	} else {
		db.update('user').column('budget', budget).where('openid', openid).execute().then(() => {
			res.send({code: 200})
		}).catch(err => {
			res.send({code: -1, msg: '系统繁忙'})
			console.log(err)
		})
	}
})

module.exports = router;