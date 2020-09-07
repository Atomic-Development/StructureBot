/**
 * Copyright (c) Max Tsero. All rights reserved.
 * Licensed under the MIT License.
 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const structureSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  location: { type: Number, required: true },
  lastFuelAlert: { type: Date },
  lastAttackAlert: { type: Date },
  character: { type: mongoose.Schema.Types.ObjectId, ref: 'Character' },
  corporation: { type: mongoose.Schema.Types.ObjectId, ref: 'Corporation' },
  createdOn: { type: Date, default: Date.now() }
})

const Structure = mongoose.model('Structure', structureSchema)

const corporationSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  characters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Character' }],
})

const Corporation = mongoose.model('Corporation', corporationSchema)

exports.Structure = Structure
exports.Corporation = Corporation