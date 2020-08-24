/**
 * Copyright (c) Max Tsero. All rights reserved.
 * Licensed under the MIT License.
 */
const got = require('got')
const env = require('env-var')
const typeIDURL = env.get('TYPEIDURL').asString()
const _ = require('underscore')
const sdeTypes = require('../sde/types.json')

/**
 * Retrieves information on specified type name.
 * @param {string} typeName - The name of a type to search for.
 * @return {object} - A JSON object describing the type.
 */
async function getTypebyName (typeName) {
  let fullURL = `${typeIDURL}?typename=${typeName}`
  try {
    const response = await got.post(fullURL, {
      responseType: 'json'
    })
    return response.body
  } catch (error) {
    console.log(error.response.body)
  }
}

async function getTypebyID (typeID) {
  var typeInfo = await _.find(sdeTypes, function (typesData) { return typesData.typeID === typeID })
  return typeInfo
}

exports.getTypebyName = getTypebyName
exports.getTypebyID = getTypebyID
