const db = require('./../mysql/index')

// 时间转换
const dateFormat = (date, fmt) => {
    date = new Date(+date)
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
    }
    let o = {
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'h+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds()
    }
    for (let k in o) {
        if (new RegExp(`(${k})`).test(fmt)) {
        let str = o[k] + ''
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : ('00' + str).substr(str.length))
        }
    }
    return fmt
}

// 数字添加小数点
const addDotNum = ( num, dotPosition ) => {
    if ( typeof num != String ) {
        num = num.toString()
    }
    if ( num.indexOf('.') != -1 ) {
        return parseFloat(num).toFixed(dotPosition)
    } else {
        let zeor = ''
        for ( let i = 0; i < dotPosition; i++ ) {
            zeor += '0'
        }
        return num + '.' + zeor
    }
}

// 处理用户信息
const getUserInfo = async openid => {
    let user = await db.select('*').from('user').where('openid', openid).queryRow()
    if ( user ) {
        let initData = {
            register_time: user.register_time, // 注册时间
            late_month: user.late_month, // 最后使用月份
            budget: parseFloat( parseFloat( user.budget ).toFixed(2) ), // 每月预算
            record_num: 0, // 总记录条数
            income_count: 0, // 总收入
            expenditure_count: 0, // 总支出
            income_month: 0, // 月总收入
            expenditure_month: 0, // 月总支出
        }
        let record = await db.select('*').from('record').where('openid', openid).queryList()
        if ( record.length ) {
            initData.record_num = record.length
            record.forEach(item => {
                let sameMonth = dateFormat(new Date(), 'MM') == dateFormat(item.time, 'MM')
                if ( item.status == 1 ) {
                    // 收入
                    if ( sameMonth ) {
                        initData.income_month += parseFloat( parseFloat( item.money ).toFixed(2) )
                    }
                    initData.income_count += parseFloat( parseFloat( item.money ).toFixed(2) )
                } else {
                    // 支出
                    if ( sameMonth ) {
                        initData.expenditure_month += parseFloat( parseFloat( item.money ).toFixed(2) )
                    }
                    initData.expenditure_count += parseFloat( parseFloat( item.money ).toFixed(2) )
                }
            })
        }
        return initData
    } else {
        return false
    }
}

module.exports = {
    dateFormat,
    addDotNum,
    getUserInfo
}