/**
 * Copyright (c) Max Tsero. All rights reserved.
 * Licensed under the MIT License.
 */
const env = require('env-var')
const mongoose = require('mongoose')
const BOTURL = env.get('BOT_URL').asString()
const MONGODBSSO = env.get('MONGODB_SSO').asString()
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
    console.log(`Member ${memberName} (ID: ${memberID}) asked to authenticate to StructureBot on server ${guildName} (ID: ${guildID})`)
    message.reply(`Please use this link ${authURL} and sign in with your EVE Online account.`)
  }
}
