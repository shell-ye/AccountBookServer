const db = require('./../mysql/index')
const Utils = require('./../utils/index')

const setLastMonth = ( req, res, next ) => {
    let month = Utils.dateFormat(new Date(), 'MM')
    let openid = req.route.methods.get ? req.query.openid : req.body.openid
    db.update('user').where('openid', openid).column('late_month', month).execute().then(() => {
        next()
    }).catch(err => {
        console.log(err)
        res.send({code: -1, msg: '系统繁忙'})
        return
    })
}

const checkUser = ( req, res, next ) => {
    let openid = req.route.methods.get ? req.query.openid : req.body.openid
    if ( !openid ) {
        res.send({code: -200, msg: '请先登录'})
    } else {
        next()
    }
}

module.exports = {
    setLastMonth,
    checkUser
}