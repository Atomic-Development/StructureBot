/**
 * Copyright (c) Max Tsero. All rights reserved.
 * Licensed under the MIT License.
 */
const perms = require('../utils/permissions')
const env = require('env-var')
const { Guild, Member, Channel } = require('../data/schema/discord')
const MongoProvider = require('eve-esi-client-mongo-provider').default
module.exports = {
  name: 'addchannel',
  description: 'Adds a channel record to the bot.',
  usage: '[#channel]',
  cooldown: 5,
  /**
   * Provides a simple reply to confirm operation.
   * @return {null}
   */
  async run (client, message, args) {
    if (message.channel.type === 'dm') {
      return message.reply('Sorry, this command must be initated from a channel in your Discord server where the bot is present.')
    }
    const memberID = message.member.id
    let guildID
    let channel
    if (!perms.checkAdministrator(memberID)) {
      message.channel.send('Sorry, only bot administrators can add channels.')
    }
    if (message.mentions.channels.size >= 1) {
      channel = message.mentions.channels.first()
      guildID = channel.guild.id
      response = await message.author.send(`You are adding the channel <#${channel.id}> to StructureBot.`)
      const filter = answer => answer.author.id === message.author.id
      const options = { max: 1, time: 120000 }
      let attackResponse
      let fuelResponse
      response.channel.send(`Should the channel <#${channel.id}> be used for **attack** notifications? Reply with Yes or No.`).then(() => {
        response.channel.awaitMessages(filter, options).then(collected => {
          if (collected.first().content.toLowerCase() === 'yes' || collected.first().content.toLowerCase() === 'y') {
            response.reply(`Okay, we'll use channel <#${channel.id}> for structure **attack** notifications.`)
            attackResponse = true
          } else if (collected.first().content.toLowerCase() === 'no' || collected.first().content.toLowerCase() === 'n') {
            response.reply(`Okay, we won't use <#${channel.id}> for structure **attack** notifications.`)
            attackResponse = false
          } else {
            response.reply('**WHOOPS:** I didn\'t understand your response. You can reply with "Yes" or "No".')
          }
        }).then(() => {
          response.channel.send(`Should the channel <#${channel.id}> be used for **fuel** notifications? Reply with Yes or No.`).then(() => {
            response.channel.awaitMessages(filter, options).then(collected => {
              if (collected.first().content.toLowerCase() === 'yes' || collected.first().content.toLowerCase() === 'y') {
                response.reply(`Okay, we'll use channel <#${channel.id}> for structure **fuel** notifications.`)
                fuelResponse = true
              } else if (collected.first().content.toLowerCase() === 'no' || collected.first().content.toLowerCase() === 'n') {
                response.reply(`Okay, we won't use <#${channel.id}> for structure fuel notifications.`)
                fuelResponse = false
              } else {
                response.reply('**WHOOPS:** I didn\'t understand your response. You can reply with "Yes" or "No".')
              }
            }).then(() => {
              let guildQuery = { id: guildID }
              console.log('Guild Query:', guildQuery)
              let guild
              Guild.findOne(guildQuery, function(error, document) {
                if (error) throw error
                guild = document
              })
              console.log("Guild:", guild)
              channelQuery = { id: channel.id }
              Channel.findOneAndUpdate(channelQuery, { name: channel.name, guild: guild._id, notifyAttack: attackResponse, notifyFuel: fuelResponse }, { upsert: true, new: true }, function (error, document) {
                if (error) throw error
                console.log('Added channel via AddChannel command.')
                Guild.channels = document._id
              })
            })
          })
        })
      })    
    } else {
      message.author.send('**WHOOPS:** The \`addchannel\` command requires you to mention a channel in the format \`#channelname\`.')
    }
  }
}
