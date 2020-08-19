/**
 * Copyright (c) Max Tsero. All rights reserved.
 * Licensed under the MIT License.
 */
// Require Environment Variable processor.
const env = require('env-var')
// Require ESI client libraries.
const esiClient = require('eve-esi-client')
const sso = require('eve-sso')
// Require storage provider.
const MemoryProvider = esiClient.MemoryProvider
// Require koa middleware.
const Koa = require('koa')
const Router = require('koa-router')
// Require UUID generator.
const UUID = require('uuid')
// Load environment variables.
const CLIENTID = env.get('CLIENT_ID')
const SECRETKEY = env.get('SECRET_KEY')
const CALLBACKURI = env.get('CALLBACK_URI')

// Initialise environment.
const provider = new MemoryProvider()
const structureBotSSO = new sso.SingleSignOn(
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
const ssoClient = new esiClient.ESI({
  provider,
  sso
})

const http = new Koa()
const router = new Router()
let requestToken = UUID.v4()

router.get('/', async ctx => {
  const redirectURI = eveSSO.getRedirectUrl(`${requestToken}`)

  ctx.body = `<a href="${redirectUrl}">Log in using EVE Online</a>`
})

router.get('/sso', async ctx => {
  const code = ctx.query.code
  const { character } = await esiClient.register(code)

  ctx.res.statusCode = 302
  ctx.res.setHeader('Location', `/welcome/${character.characterId}`)
})

router.get('/welcome/:characterId', async ctx => {
  const characterId = Number(ctx.params.characterId)
  const character = await provider.getCharacter(characterId)
  const token = await provider.getToken(characterId, 'esi-skills.read_skills.v1')

  let body = `<p class="margin: 10px; font-size: 18px;">Welcome, ${character.characterName}!</p>`

  const response = await esi.request(
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