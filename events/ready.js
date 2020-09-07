/**
 * Copyright (c) Max Tsero. All rights reserved.
 * Licensed under the MIT License.
 */
const { Guild } = require('../data/schema/discord')
module.exports = {
  name: 'ready',
  listen (client) {
    console.log(`Ready to serve in ${client.channels.cache.size} channels on ${client.guilds.cache.size} servers, for a total of ${client.users.cache.size} users.`)
    client.user.setPresence({
      status: 'online'
    })
    if (client.guilds.cache.size >= 1) {
      client.guilds.cache.forEach(guild => {
        let guildQuery = { id: guild.id }
        Guild.findOneAndUpdate(guildQuery, { name: guild.name }, { upsert: true }, function (error, document) {
          if (error) throw error
          if (document) {
            console.log(`Added/updated guild ${document.id}`)
          }
        })
      })
    }
  }
}