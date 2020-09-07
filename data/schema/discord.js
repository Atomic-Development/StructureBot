/**
 * Copyright (c) Max Tsero. All rights reserved.
 * Licensed under the MIT License.
 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const guildSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  characters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Character' }],
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }],
  channels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Channel' }],
  structures: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Structure' }],
  added: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now }
})

const Guild = mongoose.model('Guild', guildSchema)

const memberSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  startedEveAuth: { type: Boolean, default: false },
  completedEveAuth: { type: Boolean, default: false },
  accounts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Account' }],
  characters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Character' }],
  guild: { type: mongoose.Schema.Types.ObjectId, ref: 'Guild' },
  botAdmin: { type: Boolean, default: false },
  botBanned: { type: Boolean, default: false }
})

const Member = mongoose.model('Member', memberSchema)

const channelSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  guild: { type: mongoose.Schema.Types.ObjectId, ref: 'Guild' },
  added: { type: Date, default: Date.now },
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
  notifyAttack: { type: Boolean, default: false },
  notifyFuel: { type: Boolean, default: false }
})

const Channel = mongoose.model('Channel', channelSchema)

exports.Guild = Guild
exports.Member = Member
exports.Channel = Channel