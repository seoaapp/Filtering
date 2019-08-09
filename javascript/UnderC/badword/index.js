// Filtering/javascript/PMH/restapi 참고
const discord = require('discord.js')
const hangul = require('hangul-js')
const isAlphabet = require('is-alphabetical')
const DB = require('umysql')
const config = require('./config.json')

const svc = new discord.Client()
const db = new DB('localhost', 'root', 'root', 'wordbot')

const test = async (query) => {
    let temp = { isKr: hangul.isHangul(query), isEn: isAlphabet(query), p: { kr: [], en: [], uni: [] }, res: false }
    let mode = temp.isKr ? 'kr' : (temp.isEn ? 'en' : 'uni')
    temp.p[mode][0] = { query: query, result: await check(query) }
    if (temp.p[mode][0].result) {
        temp.res = true
        return temp
    }

    let pureQuery = query.match(temp.isKr ? /[ㄱ-힣]/g : (temp.isEn ? /[a-zA-Z]/g : query)).join('')
    temp.p[mode][1] = { query: pureQuery, result: await check(pureQuery) }
    if (temp.p[mode][1].result) {
        temp.res = true
        return temp
    }

    let disaQuery = hangul.d(pureQuery)
    let reverse = temp.isKr || temp.isEn ? (conv(disaQuery, temp.isKr ? true : false)) : disaQuery
    reverse = temp.isEn ? hangul.a(reverse) : reverse
    temp.p[mode][2] = { disaQuery: disaQuery, query: reverse, result: await check(reverse, temp.isEn) }
    if (temp.p[mode][2].result) {
        temp.res = true
    }
    return temp
}

const conv = (query, toEn) => {
    let res = ''
    if (!query) return res
    query.forEach(val => {
        let index = config[toEn ? 'kr' : 'en'].indexOf(val)
        res += index >= 0 ? config[toEn ? 'en' : 'kr'][index] : val
    })
    return res
}

const check = async (query, isEn) => {
    query = Array.isArray(query) ? query.join() : query
    let bads = await db.select('badwords')
    let bRegex = JSON.stringify(bads).split('"').join('').split(',').join('|').split('{v:').join('').split('}').join('').replace('[', '').replace(']', '')
    let bTemp = query.match(bRegex) || []
    
    let fines = await db.select('finewords')
    let fRegex = JSON.stringify(fines).split('"').join('').split(',').join('|').split('{v:').join('').split('}').join('').replace('[', '').replace(']', '')
    if (isEn) fRegex = hangul.a(conv(hangul.d(fRegex), !isEn))
    let fTemp = query.match(fRegex) || []

    if (bTemp.length < 1) return false
    else {
        fTemp.forEach((val, i) => {
            let temp = val.match(bRegex)
            if (temp) bTemp.splice(bTemp.indexOf(temp[0]), 1)
        })

        if (bTemp.length < 1) return false
        return bTemp
    }
}

svc.login(config.token)

svc.on('ready', () => {
    console.log('BADWORD FILTERING ENGILE IS READY')
})

svc.on('message', async msg => {
    if (msg.author.bot) return
    if (msg.content.startsWith(config.prefix)) {

    } else {
        if (msg.channel.id === 'BADLEARN') {
            db.delete('finewords', { v: msg.content })
            if (await db.select('badwords', { v: msg.content })[0]) return
            db.insert('badwords', { v: msg.content })
        } else if (msg.channel.id === 'FINELEARN') {
            db.delete('badwords', { v: msg.content })
            if (await db.select('badwords', { v: msg.content })[0]) return
            db.insert('finewords', { v: msg.content })
        } else if (msg.channel.id === '609309970852347904' || msg.channel.id === '544141125607227402') {
            let r = await test(msg.content)
            msg.channel.send(JSON.stringify(r))
        }
    }
})