/**
 * @name BadWordTrainer
 * @description 욕설 트레이닝을 위해 디스코드 봇을 제작하였습니다
 */

'use strict' // 엄격모드 적용

/** Discord Module */
const discord = require('discord.js')

/** Rest Request Module */
const superagent = require('superagent')

/** Discord Bot Client */
const bwt = new discord.Client()

bwt.login(process.env.bwtToken)

bwt.on('ready', () => {
  bwt.user.setActivity('YOUR MESSAGES', {type: 'WATCHING'})
})

bwt.on('message', (msg) => {
  if (msg.author.id === bwt.user.id) return
  if (msg.channel.id === '587089174331523075' || !msg.guild) {
    if (msg.content.startsWith('#')) return
    if (msg.content.endsWith('#욕설로추가')) {
      let query = encodeURI(msg.content.split('#욕설로추가').join(''))
      if (!query) return msg.channel.send('#욕설로추가 사용법\n욕설을 띄워쓰기로 나눠 적은뒤 뒤에 \'#욕설로추가\' 만 입력하세요\nex) ㅅㅂ ㅅ1ㅂ ㅄ ㅂㅅ ㅂ1ㅅ#욕설로추가')
      superagent.get('http://pmh.dps0340.xyz:8080/add/badword/' + query).then((res) => {
        if (res.body === 'OK') msg.channel.send('패치완료!')
        else msg.channel.send('오류 발생! : ' + JSON.stringify(res.body))
      })
    } else if (msg.content.endsWith('#욕설이아님')) {
      let query = encodeURI(msg.content.split('#욕설이아님').join(''))
      if (!query) return msg.channel.send('#욕설이아님 사용법\n욕설을 띄워쓰기로 나눠 적은뒤 뒤에 \'#욕설이아님\' 만 입력하세요\nex) 안녕하세요 안녕 반가워요#욕설이아님')
      superagent.get('http://pmh.dps0340.xyz:8080/add/fineword/' + query).then((res) => {
        if (res.body === 'OK') msg.channel.send('패치완료!')
        else msg.channel.send('오류 발생! : ' + JSON.stringify(res.body))
      })
    } else if (msg.content.endsWith('#detail') || msg.content.endsWith('#더보기')) {
      let query = encodeURI(msg.content)
      superagent.get('http://pmh.dps0340.xyz:8080/check/' + query).then((res) => {
        msg.channel.send('입력된 원본 문장은 **' + res.body.query + '** 입니다\n\n이 문장은 **' + (res.body.process.preProcess.isHangul ? '한글** 이기 때문에 KR-P를 사용합니다' : '영어** 이기 때문에 EN-P를 사용합니다'))
        if (res.body.process.preProcess.isHangul) {
          // 한글
          msg.channel.send('KR-P1:---------------\n입력된 원본 문장 **' + res.body.process['KR-P1'].dialogflow.input + '**를 Dialogflow에 전송하였습니다...\n응답이 ' + (res.body.process['KR-P1'].dialogflow.output ? '**true** 이므로 작업을 종료합니다' : '**false** 이므로 다음 작업(KR-P2)을 실행합니다'))
          if (res.body.process['KR-P2']) {
            let temp = 'KR-P2:---------------\n입력된 원본 문장 중...\n-\n'
            res.body.process['KR-P2'].unicodeCheck.forEach((v, i) => {
              temp += (i + 1) + '번째 글자 "' + v.character + '" 는 ' + (v.isHangul ? '**한글**이므로 보류합니다' : '**한글이 아니**므로 제거합니다') + '\n'
            })
            msg.channel.send(temp)
            msg.channel.send('-\n이 작업으로 만들어진 문장(**' + res.body.process['KR-P2'].dialogflow.input + '**)를 Dialogflow에 전송하였습니다...\n응답이 ' + (res.body.process['KR-P2'].dialogflow.output ? '**true** 이므로 작업을 종료합니다' : '**false** 이므로 다음 작업(KR-P3)을 실행합니다'))
          }

          if (res.body.process['KR-P3']) {
            let temp = 'KR-P3:---------------\nKR-P2로 만들어진 문장을 초성, 중성, 종성으로 분리하면, **"' + res.body.process['KR-P3'].disassembleHangul.join(', ') + '"** 입니다. 이 배열 중...\n-\n'
            res.body.process['KR-P3'].hanYongKey.forEach((v, i) => {
              temp += (i + 1) + '번째 글자 "' + v.targetChar + '" 는 한글 자판의 ' + v.HangulIndexOf + '번째 이고, 한영키를 누르면 **'  + v.resultChar + '**입니다\n'
            })
            msg.channel.send(temp)
            msg.channel.send('-\n이 작업으로 만들어진 문장(**' + res.body.process['KR-P3'].dialogflow.input + '**)를 Dialogflow에 전송하였습니다...\n응답은 **' + res.body.process['KR-P3'].dialogflow.output + '**입니다 모든 작업이 완료되었으므로 종료합니다')
          }
        } else {
          // 영어
          msg.channel.send('EN-P1:---------------\n입력된 원본 문장 **' + res.body.process['EN-P1'].dialogflow.input + '**를 Dialogflow에 전송하였습니다...\n응답이 ' + (res.body.process['EN-P1'].dialogflow.output ? '**true** 이므로 작업을 종료합니다' : '**false** 이므로 다음 작업(EN-P2)을 실행합니다'))
          if (res.body.process['EN-P2']) {
            let temp = 'EN-P2:---------------\n입력된 원본 문장 중...\n-\n'
            res.body.process['EN-P2'].unicodeCheck.forEach((v, i) => {
              temp += (i + 1) + '번째 글자 "' + v.character + '" 는 ' + (v.isAlphabet ? '**알파벳**이므로 보류합니다' : '**알파벳이 아니**므로 제거합니다') + '\n'
            })
            msg.channel.send(temp)
            msg.channel.send('-\n이 작업으로 만들어진 문장(**' + res.body.process['EN-P2'].dialogflow.input + '**)를 Dialogflow에 전송하였습니다...\n응답이 ' + (res.body.process['EN-P2'].dialogflow.output ? '**true** 이므로 작업을 종료합니다' : '**false** 이므로 다음 작업(EN-P3)을 실행합니다'))
          }

          if (res.body.process['EN-P3']) {
            let temp = 'EN-P3:---------------\nEN-P2로 만들어진 문장 중...\n-\n'
            res.body.process['EN-P3'].hanYongKey.forEach((v, i) => {
              if (v === 'Not Registered') {
                temp += (i + 1) + '번째 글자는 처리할 필요가 없으므로 제거합니다\n'
              } else {
                temp += (i + 1) + '번째 글자 "' + v.targetChar + '" 는 한글 자판의 ' + v.AlphabetIndexOf + '번째 이고, 한영키를 누르면 **'  + v.resultChar + '**입니다\n'
              }
            })
            msg.channel.send(temp)
            msg.channel.send('-\n이 작업으로 만들어진 문장(**' + res.body.process['EN-P3'].dialogflow.input + '**)를 Dialogflow에 전송하였습니다...\n응답은 **' + res.body.process['EN-P3'].dialogflow.output + '**입니다 모든 작업이 완료되었으므로 종료합니다')
          }
        }
        msg.channel.send(new discord.RichEmbed().setAuthor(msg.author.username, msg.author.displayAvatarURL).setColor(res.body.result ? 0xff0000: 0x00ff00).setTitle(res.body.query + ', 욕설여부: ' + (res.body.result ? '예' : '아니오')).setDescription('만약, 이 봇이 틀렸다면 PMH Studio / PMH#7086 를 불러주세요, 아직 배우는 단계라 잘 모를꺼에요'))
      })
    } else {
      let query = encodeURI(msg.content)
      superagent.get('http://pmh.dps0340.xyz:8080/check/' + query).then((res) => {
        let emb = new discord.RichEmbed()
          .setAuthor(msg.author.username, msg.author.displayAvatarURL)
          .setColor(res.body.result ? 0xff0000: 0x00ff00)
          .setTitle(msg.content + ', 욕설여부: ' + (res.body.result ? '예' : '아니오'))
          .setDescription('만약, 이 봇이 틀렸다면 PMH Studio / PMH#7086 를 불러주세요, 아직 배우는 단계라 잘 모를꺼에요')
        msg.channel.send(emb)
      }).catch((err) => console.error(err))
    }
  }
})

bwt.on('messageUpdate', (old, nu) => {
  if (old.content === nu.content) return
  if (nu.author.id === bwt.user.id) return
  if (nu.channel.id === '587089174331523075' || !nu.guild) {
    if (nu.content.endsWith('#detail') || nu.content.endsWith('#더보기')) {
      let query = encodeURI(nu.content)
      superagent.get('http://pmh.dps0340.xyz:8080/check/' + query).then((res) => {
        nu.channel.send('입력된 원본 문장은 **' + res.body.query + '** 입니다\n\n이 문장은 **' + (res.body.process.preProcess.isHangul ? '한글** 이기 때문에 KR-P를 사용합니다' : '영어** 이기 때문에 EN-P를 사용합니다'))
        if (res.body.process.preProcess.isHangul) {
          // 한글
          nu.channel.send('KR-P1:---------------\n입력된 원본 문장 **' + res.body.process['KR-P1'].dialogflow.input + '**를 Dialogflow에 전송하였습니다...\n응답이 ' + (res.body.process['KR-P1'].dialogflow.output ? '**true** 이므로 작업을 종료합니다' : '**false** 이므로 다음 작업(KR-P2)을 실행합니다'))
          if (res.body.process['KR-P2']) {
            let temp = 'KR-P2:---------------\n입력된 원본 문장 중...\n-\n'
            res.body.process['KR-P2'].unicodeCheck.forEach((v, i) => {
              temp += (i + 1) + '번째 글자 "' + v.character + '" 는 ' + (v.isHangul ? '**한글**이므로 보류합니다' : '**한글이 아니**므로 제거합니다') + '\n'
            })
            nu.channel.send(temp)
            nu.channel.send('-\n이 작업으로 만들어진 문장(**' + res.body.process['KR-P2'].dialogflow.input + '**)를 Dialogflow에 전송하였습니다...\n응답이 ' + (res.body.process['KR-P2'].dialogflow.output ? '**true** 이므로 작업을 종료합니다' : '**false** 이므로 다음 작업(KR-P3)을 실행합니다'))
          }

          if (res.body.process['KR-P3']) {
            let temp = 'KR-P3:---------------\nKR-P2로 만들어진 문장을 초성, 중성, 종성으로 분리하면, **"' + res.body.process['KR-P3'].disassembleHangul.join(', ') + '"** 입니다. 이 배열 중...\n-\n'
            res.body.process['KR-P3'].hanYongKey.forEach((v, i) => {
              temp += (i + 1) + '번째 글자 "' + v.targetChar + '" 는 한글 자판의 ' + v.HangulIndexOf + '번째 이고, 한영키를 누르면 **'  + v.resultChar + '**입니다\n'
            })
            nu.channel.send(temp)
            nu.channel.send('-\n이 작업으로 만들어진 문장(**' + res.body.process['KR-P3'].dialogflow.input + '**)를 Dialogflow에 전송하였습니다...\n응답은 **' + res.body.process['KR-P3'].dialogflow.output + '**입니다 모든 작업이 완료되었으므로 종료합니다')
          }
        } else {
          // 영어
          nu.channel.send('EN-P1:---------------\n입력된 원본 문장 **' + res.body.process['EN-P1'].dialogflow.input + '**를 Dialogflow에 전송하였습니다...\n응답이 ' + (res.body.process['EN-P1'].dialogflow.output ? '**true** 이므로 작업을 종료합니다' : '**false** 이므로 다음 작업(EN-P2)을 실행합니다'))
          if (res.body.process['EN-P2']) {
            let temp = 'EN-P2:---------------\n입력된 원본 문장 중...\n-\n'
            res.body.process['EN-P2'].unicodeCheck.forEach((v, i) => {
              temp += (i + 1) + '번째 글자 "' + v.character + '" 는 ' + (v.isAlphabet ? '**알파벳**이므로 보류합니다' : '**알파벳이 아니**므로 제거합니다') + '\n'
            })
            nu.channel.send(temp)
            nu.channel.send('-\n이 작업으로 만들어진 문장(**' + res.body.process['EN-P2'].dialogflow.input + '**)를 Dialogflow에 전송하였습니다...\n응답이 ' + (res.body.process['EN-P2'].dialogflow.output ? '**true** 이므로 작업을 종료합니다' : '**false** 이므로 다음 작업(EN-P3)을 실행합니다'))
          }

          if (res.body.process['EN-P3']) {
            let temp = 'EN-P3:---------------\nEN-P2로 만들어진 문장 중...\n-\n'
            res.body.process['EN-P3'].hanYongKey.forEach((v, i) => {
              if (v === 'Not Registered') {
                temp += (i + 1) + '번째 글자는 처리할 필요가 없으므로 제거합니다\n'
              } else {
                temp += (i + 1) + '번째 글자 "' + v.targetChar + '" 는 한글 자판의 ' + v.AlphabetIndexOf + '번째 이고, 한영키를 누르면 **'  + v.resultChar + '**입니다\n'
              }
            })
            nu.channel.send(temp)
            nu.channel.send('-\n이 작업으로 만들어진 문장(**' + res.body.process['EN-P3'].dialogflow.input + '**)를 Dialogflow에 전송하였습니다...\n응답은 **' + res.body.process['EN-P3'].dialogflow.output + '**입니다 모든 작업이 완료되었으므로 종료합니다')
          }
        }
        nu.channel.send(new discord.RichEmbed().setAuthor(nu.author.username, nu.author.displayAvatarURL).setColor(res.body.result ? 0xff0000: 0x00ff00).setTitle(res.body.query + ', 욕설여부: ' + (res.body.result ? '예' : '아니오')).setDescription('만약, 이 봇이 틀렸다면 PMH Studio / PMH#7086 를 불러주세요, 아직 배우는 단계라 잘 모를꺼에요'))
      })
    } else {
      let query = encodeURI(nu.content)
      superagent.get('http://pmh.dps0340.xyz:8080/check/' + query).then((res) => {
        let emb = new discord.RichEmbed()
          .setAuthor(nu.author.username, nu.author.displayAvatarURL)
          .setColor(res.body.result ? 0xff0000: 0x00ff00)
          .setTitle(nu.content + ', 욕설여부: ' + (res.body.result ? '예' : '아니오'))
          .setDescription('만약, 이 봇이 틀렸다면 PMH Studio / PMH#7086 를 불러주세요, 아직 배우는 단계라 잘 모를꺼에요')
        nu.channel.send(emb)
      }).catch((err) => console.error(err))
    }
  }
})