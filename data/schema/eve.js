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
  lastAttackAlert: { type: Date }
})

const Structure = mongoose.model('Structure', structureSchema)

exports.Structure = Structure