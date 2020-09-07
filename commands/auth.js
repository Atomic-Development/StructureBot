/**
 * Copyright (c) Max Tsero. All rights reserved.
 * Licensed under the MIT License.
 */
const env = require('env-var')
const BOTURL = env.get('BOT_URL').asString()
const { Guild, Member } = require('../data/schema/discord')
module.exports = {
  name: 'auth',
  description: 'Provides the ability for the bot to authenticate a character and retrive information on structures.',
  usage: '',
  cooldown: 5,
  /**
   * Provides a simple reply to confirm operation.
   * @return {null}
   */
  async run (client, message, args) {
    const memberName = message.member.user.tag
    const memberID = message.member.id
    const guildName = message.guild.name
    const guildID = message.guild.id
    const authURL = `${BOTURL}/${guildID}/${memberID}`
    Guild.find({ id: guildID }, error => {
      if (error) throw error
    })

    memberQuery = { id: memberID }
    Member.findOneAndUpdate(memberQuery, { name: memberName, startedEveAuth: true, guild: Guild._id }, { upsert: true, new: true }, function (error, document) {
      if (error) throw error
      console.log(`Added member via authentication flow.`)
      console.log(document)
      Guild.member = document._id
    })    
    console.log(`Member ${memberName} (ID: ${memberID}) asked to authenticate to StructureBot on server ${guildName} (ID: ${guildID})`)
    return message.author.send(`Please use this link ${authURL} and sign in with your EVE Online account.`)
      .then(() => {
        if (message.channel.type === 'dm') return
        message.reply('I\'ve sent you a DM with instructions on how to complete authentication.')
      })
      .catch(error => {
        console.error(`Could not send auth DM to ${message.author.tag}.`, error)
        message.reply('It seems like I can\'t DM you! Do you have DMs disabled?')
      })
  }
}
