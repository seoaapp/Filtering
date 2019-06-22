/**
 * @name FilteringAPI
 * @description 이 API는 웹 전용 REST API입니다
 */

'use strict' // 엄격모드

/** Application Port */
const PORT = 8080

/** Loging Module */
const markup = require('chalk')

/** Rest API Module */
const express = require('express')
const cors = require('cors')

/** Dialogflow Module */
process.env.GOOGLE_APPLICATION_CREDENTIALS = './lib/BadWordsFilter-e34ed9d4dd5b.json'
const dialogflowId = 'badwordsfilter-esqgxe'
const dialogflow = require('dialogflow')

/** Nano ID Module */
const nanoid = require('nanoid')

/** Hangul Module */
const hangul = require('hangul-js')

/** English Module */
const isEnglish = require('is-alphabetical')

/** Dialogflow Client */
const dialogflowClient = new dialogflow.SessionsClient()

/** Rest API Router */
const app = express()
app.use(cors())

/** Bad Words DataBase */
const DB = require('../../../../public/BadWords.json')

/** Memory */
let temp = {}

app.get('/', (req, res) => {
  console.log(markup.cyan.underline('REQUEST') + ' ' + markup.cyan(req.ip + ' ' + req.protocol + ' ' + req.path))
  temp = {
    name: 'FilteringAPI',
    description: '이 API는 웹 전용 REST API입니다',
    사용법: '/check/<문장>',
    종료하려면: '/stop/'
  }
  res.send(temp)
  console.log(markup.green.underline('RESPONSE') + ' ' + markup.green(JSON.stringify(temp)))
})

app.get('/stop', (req, res) => {
  res.send("정상적으로 종료되었습니다")
  process.exit()
})

app.get('/check/:query', (req, res) => {
  console.log(markup.cyan.underline('REQUEST') + ' ' + markup.cyan(req.ip + ' ' + req.protocol + ' ' + req.path))

  /** @type {String} */
  let query = req.params.query
  let queryArr = query.split(' ')

  proc(query, (result) => {
    temp = {
      query: {
        sentense: query,
        length: query.length,
        splitBySpace: queryArr
      },
      result: result
    }
    res.send(temp)
    console.log(markup.gray('---------\n') + markup.green.underline('RESPONSE') + ' ' + markup.green(JSON.stringify(temp)))
  })

})

app.listen(PORT)
console.log(markup.hex('#7289DA').bold('Application is Booted! App on at http://localhost:' + PORT + '/'))

/* --------------------- */
/**
 * 욕설 체크
 * @param {String} query 욕설인지 체크할 문자열
 * @param {function(boolean)} cb 욕설 여/부 콜백
 */
function check (query, cb) {
  if (query.length > 0) {
    console.log(markup.yellow.underline('PROCESS') + ' ' + markup.yellow(dialogflowId) + ': ' + markup.red(query))
    let dialogflowPath = dialogflowClient.sessionPath(dialogflowId, nanoid())
  
    let dialogflowRequest = {
      session: dialogflowPath,
      queryInput: {
        text: {
          text: query,
          languageCode: 'ko-KR'
        }
      }
    }
  
    dialogflowClient.detectIntent(dialogflowRequest).then((dialogflowResponse) => {
      let dialogflowResponseText = dialogflowResponse[0].queryResult.fulfillmentText
  
      console.log(markup.magenta.underline('COMPLETE') + ' ' + markup.magenta(dialogflowResponseText))
      
      if (dialogflowResponseText.startsWith('badword: ')) {
        if (eval(dialogflowResponseText.split(' ')[1]) === true) {
          cb(true)
        } else {
          cb(false)
        }
      }
    })
  } else {
    cb(false)
  }
}

function proc (query, cb) {
  let isHangul = false
  query.split('').forEach((v, i) => {
    if (hangul.isHangul(v)) {
      isHangul = true
    }
  })
  if (isHangul) {
    console.log(markup.gray('---------KR-P1'))
    check(query, (first) => {
      if (first) {
        cb(true)
      } else {
        console.log(markup.gray('---------KR-P2'))
        let onlyKorean = ''
        query.split('').forEach((v, i) => {
          if (hangul.isHangul(v)) {
            onlyKorean += v
          }
        })
        check(onlyKorean, (second) => {
          if (second) {
            cb(true)
          } else {
            console.log(markup.gray('---------KR-P3'))
            let hangulArr = hangul.disassemble(onlyKorean)
            let toEng = ''
            hangulArr.forEach((v, i) => {
              if (DB.hanYongKey.koreans.includes(v)) {
                toEng += DB.hanYongKey.englishs[DB.hanYongKey.koreans.indexOf(v)]
              }
            })
            check(toEng, (third) => {
              if (third) {
                cb(true)
              } else {
                cb(false)
              }
            })
          }
        })
      }
    })
  } else {
    console.log(markup.gray('---------EN-P1'))
    check(query, (first) => {
      if (first) {
        cb(true)
      } else {
        console.log(markup.gray('---------EN-P2'))
        let onlyEnglish = ''
        query.split('').forEach((v) => {
          if (isEnglish(v)) {
            onlyEnglish += v
          }
        })
        check(onlyEnglish, (second) => {
          if (second) {
            cb(true)
          } else {
            console.log(markup.gray('---------EN-P3'))
            let toKor = ''
            onlyEnglish.split('').forEach((v) => {
              if (DB.hanYongKey.englishs.includes(v)) {
                toKor +=  DB.hanYongKey.koreans[DB.hanYongKey.englishs.indexOf(v)]
              }
            })
            toKor = hangul.assemble(toKor)
            check(toKor, (third) => {
              if (third) {
                cb(true)
              } else {
                cb(false)
              }
            })
          }
        })
      }
    })
  }
}
