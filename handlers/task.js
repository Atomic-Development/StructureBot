/**
 * Copyright (c) Max Tsero. All rights reserved.
 * Licensed under the MIT License.
 */
const Discord = require('discord.js')
const env = require('env-var')
const tasks = env.get('TASKS').asJsonArray()
const _ = require('underscore')

module.exports = {
  startTasks(client) {
    client.tasks.forEach(task => {
      this.runTask(client, task)
    })
  },
  async runTask(client, task) {
    if (!task) return
    var intervalResult = await intervalCheck(task)
    if (typeof intervalResult !== 'object' || intervalResult.status === 'clear') {
      task.run(client)
      var delay = (task.interval || 300) * 1000
      setTimeout(() => this.runTask(client, task), delay)
    } else {
      console.log('Task is ', intervalResult.status)
    }
  },
  /**
   * Checks if the specified task exists in the tasks config array.
   * @param {string} taskName - The tasks name.
   * @return {boolean} - True or false depending on the input config value.
   */
  checkTask (taskName) {
    if (_.isEmpty(tasks)) {
      return false
    } else {
      if (_.includes(tasks, taskName)) {
        return true
      } else {
        return false
      }
    }
  }
}

async function intervalCheck (task) {
  var intervals = global.intervals
  let reply
  if (!intervals.has(task.name)) {
    intervals.set(task.name, new Discord.Collection())
  }

  var now = Date.now()
  var timestamps = intervals.get(task.name)
  var intervalAmount = (task.interval || 3) * 1000

  if (!timestamps.has(task.name)) {
    var expirationTime = timestamps.get(task.name) + intervalAmount

    if (now < expirationTime) {
      return { 'status': 'throttled' }
    }
  } else {
    timestamps.set(task.name, now)
    setTimeout(() => timestamps.delete(task.name), intervalAmount)
    return { 'status': 'clear' }
  }
}
