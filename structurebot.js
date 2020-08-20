// Core setup/requirements.
const Discord = require('discord.js')
const client = new Discord.Client()
client.commands = new Discord.Collection()
client.tasks = new Discord.Collection()
global.cooldowns = new Discord.Collection()
global.intervals = new Discord.Collection()
// Configuration.
require('dotenv').config()
const env = require('env-var')
const token = env.get('TOKEN').asString()
// Third party modules.
const fs = require('fs')
// Utils
const system = require('./utils/system')
const taskHandler = require('./handlers/task')
const evesso = require('./services/evesso')

// Command handlers.
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
  const command = require(`./commands/${file}`)
  if (system.checkCommand(command.name)) {
    client.commands.set(command.name, command)
    console.log(`Loaded command ${command.name} from ${file}`)
  } else {
    console.log(`Skipped loading command ${command.name} from ${file} due to config.`)
  }
}

// Task handlers.
const taskFiles = fs.readdirSync('./tasks').filter(file => file.endsWith('.js'))
for (const file of taskFiles) {
  const task = require(`./tasks/${file}`)
  if (taskHandler.checkTask(task.name)) {
    client.tasks.set(task.name, task)
    console.log(`Loaded task ${task.name} from ${file}`)
  } else {
    console.log(`Skipped loading task ${task.name} from ${file} due to config.`)
  }
}

taskHandler.startTasks(client)

// Event handlers.
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'))
for (const file of eventFiles) {
  const event = require(`./events/${file}`)
  let eventName = event.name
  client.on(eventName, event.listen.bind(null, client))
  delete require.cache[require.resolve(`./events/${file}`)]
}

evesso.startHTTP()
client.login(token)
