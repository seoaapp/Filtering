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

/** UUID Module */
const uuid = require('uuid/v4')

/** Hangul Module */
const hangul = require('hangul-js')

/** English Module */
const isAlphabet = require('is-alphabetical')

/** Dialogflow Client */
const dialogflowClient = new dialogflow.SessionsClient()

/** Dialogflow Intent Client */
const dialogIntentsClient = new dialogflow.IntentsClient();

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
  res.send('정상적으로 종료되었습니다')
  process.exit()
})

app.get('/check', (req, res) => {
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

app.get('/add/:indicator/:query', (req, res) => {
  console.log(markup.cyan.underline('REQUEST') + ' ' + markup.cyan(req.ip + ' ' + req.protocol + ' ' + req.path))

  let target = {}
  dialogIntentsClient.listIntents({intentView: 'INTENT_VIEW_FULL', parent: dialogIntentsClient.projectAgentPath(dialogflowId)}).then((dialogflowResponse) => {
    dialogflowResponse[0].forEach((v, i) => {
      if (v.displayName === req.params.indicator) {
        target = v
      }
    })

    req.params.query.split(' ').forEach((v, i) => {
      let isDuplicate = false
      target.trainingPhrases.forEach((v1, i1) => {
        if (v1.parts[0].text === v) isDuplicate = true
      })

      if (!isDuplicate) {
        target.trainingPhrases[target.trainingPhrases.length] = {
          'parts': [{
            'text': v,
            'entityType': '',
            'alias': '',
            'userDefined': false
          }],
          'name': uuid(),
          'type': 'EXAMPLE',
          'timesAddedCount': 0
        }
      }
    })

    dialogIntentsClient.updateIntent({intent: target, languageCode: 'ko'}).then(() => {
      res.sendStatus(200)
      console.log(markup.green.underline('RESPONSE') + ' ' + markup.green('200 OK'))
    }).catch((err) => {
      res.send(err)
      console.log(markup.green.underline('RESPONSE') + ' ' + markup.green(JSON.stringify(err)))
    })
  })
})

app.get('/check/:query', (req, res) => {
  console.log(markup.cyan.underline('REQUEST') + ' ' + markup.cyan(req.ip + ' ' + req.protocol + ' ' + req.path))

  /** @type {String} */
  let query = req.params.query
  let queryArr = query.split(' ')

  temp = {
    query: query,
    process: {

    }
  }
  proc(query, (result) => {
    temp.result = result
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
    let dialogflowPath = dialogflowClient.sessionPath(dialogflowId, uuid())
  
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
  temp.process.preProcess = {
    isHangul: isHangul
  }
  if (isHangul) {
    temp.process['KR-P1'] = { }
    console.log(markup.gray('---------KR-P1'))
    check(query, (first) => {
      temp.process['KR-P1'].dialogflow = {
        input: query,
        output: first
      }
      if (first) {
        cb(true)
      } else {
        temp.process['KR-P2'] = { unicodeCheck: [] }
        console.log(markup.gray('---------KR-P2'))
        let onlyKorean = ''
        query.split('').forEach((v, i) => {
          if (hangul.isHangul(v)) {
            onlyKorean += v
          }
          temp.process['KR-P2'].unicodeCheck[i] = { character: v, isHangul: hangul.isHangul(v), fullSentence: onlyKorean }
        })
        check(onlyKorean, (second) => {
          temp.process['KR-P2'].dialogflow = {
            input: onlyKorean,
            output: second
          }
          if (second) {
            cb(true)
          } else {
            temp.process['KR-P3'] = { disassembleHangul: [], hanYongKey: [] }
            console.log(markup.gray('---------KR-P3'))
            let hangulArr = hangul.disassemble(onlyKorean)
            temp.process['KR-P3'].disassembleHangul = hangulArr
            let toEng = ''
            hangulArr.forEach((v, i) => {
              if (DB.hanYongKey.koreans.includes(v)) {
                toEng += DB.hanYongKey.englishs[DB.hanYongKey.koreans.indexOf(v)]
                temp.process['KR-P3'].hanYongKey[i] = { targetChar: v, HangulIndexOf: DB.hanYongKey.koreans.indexOf(v), resultChar: DB.hanYongKey.englishs[DB.hanYongKey.koreans.indexOf(v)], fullSentence: toEng }
              }
            })
            check(toEng, (third) => {
              temp.process['KR-P3'].dialogflow = {
                input: toEng,
                output: third
              }
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
    temp.process['EN-P1'] = { }
    console.log(markup.gray('---------EN-P1'))
    check(query, (first) => {
      temp.process['EN-P1'].dialogflow = {
        input: query,
        output: first
      }
      if (first) {
        cb(true)
      } else {
        temp.process['EN-P2'] = { unicodeCheck: [] }
        console.log(markup.gray('---------EN-P2'))
        let onlyEnglish = ''
        query.split('').forEach((v, i) => {
          if (isAlphabet(v)) {
            onlyEnglish += v
          }
          temp.process['EN-P2'].unicodeCheck[i] = { character: v, isAlphabet: isAlphabet(v), fullSentence: onlyEnglish }
        })
        check(onlyEnglish, (second) => {
          temp.process['EN-P2'].dialogflow = {
            input: onlyEnglish,
            output: second
          }
          if (second) {
            cb(true)
          } else {
            temp.process['EN-P3'] = { hanYongKey: [] }
            console.log(markup.gray('---------EN-P3'))
            let toKor = ''
            onlyEnglish.split('').forEach((v, i) => {
              if (DB.hanYongKey.englishs.includes(v)) {
                toKor +=  DB.hanYongKey.koreans[DB.hanYongKey.englishs.indexOf(v)]
                temp.process['EN-P3'].hanYongKey[i] = { targetChar: v, AlphabetIndexOf: DB.hanYongKey.englishs.indexOf(v), resultChar: DB.hanYongKey.koreans[DB.hanYongKey.englishs.indexOf(v)], fullSentence: toKor }
              } else {
                temp.process['EN-P3'].hanYongKey[i] = 'Not Registered'
              }
            })
            toKor = hangul.assemble(toKor)
            check(toKor, (third) => {
              temp.process['EN-P3'].dialogflow = {
                input: toKor,
                output: third
              }
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
