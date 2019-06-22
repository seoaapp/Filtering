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
    let query = encodeURI(msg.content)
    superagent.get('http://pmh.dps0340.xyz:8080/check/' + query).then((res) => {
      let emb = new discord.RichEmbed()
        .setAuthor(msg.author.username, msg.author.displayAvatarURL)
        .setColor(res.body.result ? 0xff0000: 0x00ff00)
        .setTitle('욕설여부: ' + (res.body.result ? '예' : '아니오'))
        .setDescription('만약, 이 봇이 틀렸다면 PMH Studio / PMH#7086 를 불러주세요, 아직 배우는 단계라 잘 모를꺼에요')
      msg.channel.send(emb)
    }).catch((err) => console.error(err))
  }
})