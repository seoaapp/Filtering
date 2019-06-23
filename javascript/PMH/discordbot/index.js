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
    if (msg.content.endsWith('#detail')) {
      let query = encodeURI(msg.content)
      superagent.get('http://pmh.dps0340.xyz:8080/check/' + query).then((res) => {
        let emb = new discord.RichEmbed()
          .setAuthor(msg.author.username, msg.author.displayAvatarURL)
          .setColor(res.body.result ? 0xff0000: 0x00ff00)
          .setTitle(msg.content + ', 욕설여부: ' + (res.body.result ? '예' : '아니오'))
          .addBlankField()
          .addField('Request Query', res.body.query)
          .addField('Pre-Process', JSON.stringify(res.body.preProcess))
          .addField(!res.body.process['KR-P1'] ? 'EN-P1': 'KR-P1', !res.body.process['KR-P1'] ? JSON.stringify(res.body.process['EN-P1']) : JSON.stringify(res.body.process['KR-P1']))
          if (res.body.process['KR-P2'] || res.body.process['EN-P2']) emb.addField(!res.body.process['KR-P2'] ? 'EN-P2': 'KR-P2', !res.body.process['KR-P2'] ? JSON.stringify(res.body.process['EN-P2']) : JSON.stringify(res.body.process['KR-P2']))
          if (res.body.process['KR-P3'] || res.body.process['EN-P3']) emb.addField(!res.body.process['KR-P3'] ? 'EN-P3': 'KR-P3', !res.body.process['KR-P3'] ? JSON.stringify(res.body.process['EN-P3']) : JSON.stringify(res.body.process['KR-P3']))
        msg.channel.send(emb)
      }).catch((err) => console.error(err))
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
    if (nu.content.endsWith('#detail')) {
      let query = encodeURI(nu.content)
      superagent.get('http://pmh.dps0340.xyz:8080/check/' + query).then((res) => {
        let emb = new discord.RichEmbed()
          .setAuthor(nu.author.username, nu.author.displayAvatarURL)
          .setColor(res.body.result ? 0xff0000: 0x00ff00)
          .setTitle(nu.content + ', 욕설여부: ' + (res.body.result ? '예' : '아니오'))
          .addBlankField()
          .addField('Request Query', res.body.query)
          .addField('Pre-Process', JSON.stringify(res.body.preProcess))
          .addField(!res.body.process['KR-P1'] ? 'EN-P1': 'KR-P1', !res.body.process['KR-P1'] ? JSON.stringify(res.body.process['EN-P1']) : JSON.stringify(res.body.process['KR-P1']))
          if (res.body.process['KR-P2'] || res.body.process['EN-P2']) emb.addField(!res.body.process['KR-P2'] ? 'EN-P2': 'KR-P2', !res.body.process['KR-P2'] ? JSON.stringify(res.body.process['EN-P2']) : JSON.stringify(res.body.process['KR-P2']))
          if (res.body.process['KR-P3'] || res.body.process['EN-P3']) emb.addField(!res.body.process['KR-P3'] ? 'EN-P3': 'KR-P3', !res.body.process['KR-P3'] ? JSON.stringify(res.body.process['EN-P3']) : JSON.stringify(res.body.process['KR-P3']))
        nu.channel.send(emb)
      }).catch((err) => console.error(err))
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