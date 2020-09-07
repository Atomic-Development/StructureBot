/**
 * Copyright (c) Max Tsero. All rights reserved.
 * Licensed under the MIT License.
 */
// Require Environment Variable processor.
const env = require('env-var')
// Require ESI client libraries.
const esiClient = require('eve-esi-client').default
const SingleSignOn = require('eve-sso').default
// Require storage provider.
const MemoryProvider = require('eve-esi-client/dist/providers/memory').default
const MongoProvider = require('eve-esi-client-mongo-provider').default
// Require koa.
const Koa = require('koa')
const Router = require('koa-router')
const static = require('koa-static')
const views = require('koa-views')
// Require custom services/libraries.
const { getEVEImageURL } = require('./eveimage')
const { Guild, Member } = require('../data/schema/discord')
// Load environment variables.
const CLIENTID = env.get('CLIENT_ID').asString()
const SECRETKEY = env.get('SECRET_KEY').asString()
const CALLBACKURL = env.get('CALLBACK_URL').asString()
const PORT = env.get('PORT').asString() || 3000
// Initialise envionment.
const provider = new MongoProvider()
const structureBotSSO = new SingleSignOn(
  CLIENTID,
  SECRETKEY,
  CALLBACKURL,
  {
    scopes: [
      'esi-search.search_structures.v1',
      'esi-universe.read_structures.v1',
      'esi-corporations.read_structures.v1',
      'esi-characters.read_notifications.v1',
      'esi-skills.read_skills.v1'
    ],
    userAgent: 'ATODE/StructureBot'
  }
)
const ssoClient = new esiClient({
  provider,
  sso: structureBotSSO
})

const http = new Koa()
const router = new Router()

router.get('/legal', async ctx => {
  return ctx.render('./pages/legal')
})

router.get('/credits', async ctx => {
  return ctx.render('./pages/credits')
})

router.get('/sso', async ctx => {
  const code = ctx.query.code
  const state = ctx.query.state
  let stateArr = state.split(".")
  const guildID = stateArr[0]
  const memberID = stateArr[1]
  const { character, account } = await ssoClient.register(code)
  let member = {}
  let guild = {}
  guildQuery = { id: guildID }
  memberQuery = { id: memberID}

  await Member.findOneAndUpdate(memberQuery, { id: memberID, completedEveAuth: true, $addToSet: { characters: character._id, accounts: account._id } }, { new: true, upsert: true } ,function(error, document) {
    if (error) throw error
    console.log(`Member ${document.id} completed auth.`)
    member = document._id
  })
  console.log('Member ID:', member._id)
  await Guild.findOneAndUpdate(guildQuery, { id: guildID, $addToSet: { members: member._id, characters: character._id } }, { new: true, upsert: true }, function (error, document) {
    if (error) throw error
    console.log(`Added/updated guild ${document.id}`)
    guild = document._id
  })

  await Member.findOneAndUpdate(memberQuery, { guild: guild._id }, { upsert: true } ,function(error, document) {
    if (error) throw error
    console.log(`Member ${document.id} linked to guild auth ${Guild.id}.`)
  })

  ctx.res.statusCode = 302
  ctx.res.setHeader('Location', `/success/${character.characterId}`)
})

router.get('/success/:characterId', async ctx => {
  const characterId = Number(ctx.params.characterId)
  const characterPortrait = await getEVEImageURL(characterId, 'characters')
  const character = await provider.getCharacter(characterId)
  return ctx.render('./pages/success', {
    character: character,
    character_portrait: characterPortrait,
    params: ctx.params
  })
})

router.get('/:guild_id?/:member_id?', async ctx => {
  const authUrl = ssoClient.getRedirectUrl(`${ctx.params.guild_id}.${ctx.params.member_id}`)
  return ctx.render('./pages/authenticate', {
    auth_url: authUrl,
    params: ctx.params
  })
})

async function startHTTP () {
  http.use(static('./public'))
  http.use(views('./views', {
    extension: 'nunjucks',
    map: {
      nunjucks: 'nunjucks'
    }
  }))
  http.use(router.routes())
  http.use(router.allowedMethods())
  const listener = http.listen(PORT, () => {
    console.log(`- Server Listening on port ${listener.address().port}`)
  })
}

exports.startHTTP = startHTTP