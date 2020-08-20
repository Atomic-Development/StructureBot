/**
 * Copyright (c) Max Tsero. All rights reserved.
 * Licensed under the MIT License.
 */
const env = require('env-var')
const botURL = env.get('BOT_URL')
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
    const memberID = message.member.id
    console.log(`Member ${message.member.name} (ID: ${message.member.id}) authenticated to StructureBot on Server ${message.guild.name}`)
    console.log(botURL)
    message.reply(`Please use this link ${botURL} and sign in with your EVE Online account.`)
  }
}
