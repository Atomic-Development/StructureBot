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
// Require Mongoose.
const mongoose = require('mongoose')
// Require UUID generator.
const UUID = require('uuid')
// Require custom services/libraries.
const { getEVEImageURL } = require('./eveimage')
// Load environment variables.
const CLIENTID = env.get('CLIENT_ID').asString()
const SECRETKEY = env.get('SECRET_KEY').asString()
const CALLBACKURI = env.get('CALLBACK_URI').asString()
const PORT = env.get('PORT').asString() || 3000
const MONGODBSSO = env.get('MONGODB_SSO').asString()

// Initialise envionment.
mongoose.connect(MONGODBSSO, {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true
})
const provider = new MongoProvider()
const structureBotSSO = new SingleSignOn(
  CLIENTID,
  SECRETKEY,
  CALLBACKURI,
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
let requestToken = UUID.v4()

router.get('/:guildID/:memberID', async ctx => {
  const redirectUrl = ssoClient.getRedirectUrl(`${ctx.params.guildID}.${ctx.params.memberID}}`)
  return ctx.render('./pages/authenticate', {
    redirectUrl: redirectUrl
  })
})

router.get('/legal', async ctx => {
  return ctx.render('./pages/legal')
})

router.get('/sso', async ctx => {
  const code = ctx.query.code
  const { character } = await ssoClient.register(code)
  ctx.rest.sta

  ctx.res.statusCode = 302
  ctx.res.setHeader('Location', `/welcome/${character.characterId}`)
})

router.get('/welcome/:characterId', async ctx => {
  const characterId = Number(ctx.params.characterId)
  const charPortrait = getEVEImageURL(characterId, 'characters')
  const character = await provider.getCharacter(characterId)
  const token = await provider.getToken(characterId, 'esi-skills.read_skills.v1')

  let body = `<p class="margin: 10px; font-size: 18px;">Welcome, ${character.characterName}!</p>`

  const response = await ssoClient.request(
    `/characters/${characterId}/skills/`,
    null,
    null,
    { token }
  )

  const skills = await response.json()

  body += `<p>You have ${skills.total_sp} total skill points.</p><ul>`

  for (const skill of skills.skills) {
    body += `<li>${skill.skill_id}: ${skill.active_skill_level}</li>`
  }

  body += '</ul>'

  ctx.body = body  
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