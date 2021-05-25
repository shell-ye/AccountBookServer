var express = require('express');
const db = require('../mysql');
var router = express.Router();
const middle = require('./../middleware/index');

/* GET home page. */
router.get('/list', middle.checkUser, (req, res) => {
    let { openid } = req.query
    if ( !openid ) {
        res.send({code: 0, msg: '缺少参数'})
    } else {
        db.select('*').from('tobuy').where('openid', openid).queryList().then(data => {
            res.send({code: 200, data})
        }).catch(err => {
			console.log(err)
			res.send({code: -1, msg: '系统繁忙'})
		})
    }
})

router.post('/add', middle.checkUser, (req, res) => {
    let { openid, name, money } = req.body
    if ( !openid || !name || !money ) {
        console.log(openid, name, money)
        res.send({code: 0, msg: '缺少参数'})
    } else {
        db.insert('tobuy')
			.column('openid', openid)
			.column('name', name)
			.column('status', 0)
			.column('money', money)
			.execute()
			.then(() => {
				res.send({code: 200})
			})
			.catch(err => {
				console.log(err)
				res.send({code: -1, msg: '系统繁忙'})
			})
    }
})

router.post('/edit', middle.checkUser, (req, res) => {
    let { type, id } = req.body
    if ( type == 1 ) {
        // 修改
        let { name, status, money } = req.body
        db.update('tobuy').column('name', name).column('status', parseInt(status)).column('money', parseInt(money)).where('id', id).execute().then(() => {
            res.send({code: 200})
        }).catch(err => {
			console.log(err)
			res.send({code: -1, msg: '系统繁忙'})
		})
    } else {
        // 删除
        db.delete('tobuy').where('id', id).execute().then(() => {
            res.send({code: 200})
        }).catch(err => {
			console.log(err)
			res.send({code: -1, msg: '系统繁忙'})
		})
    }
})

module.exports = router;
