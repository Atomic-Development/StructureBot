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
      ''
    ]
  userAgent: 'ATODE/StructureBot'
  }
)

)
const ssoClient = new esiClient.ESI({
  provider,
  sso
})

const http = new Koa()
const router = new Router()
let requestToken = UUID.v4()
let scopes = {

}

router.get('/', async ctx => {
  const redirectURI = eveSSO.getRedirectUrl(`${requestToken}`, )
} )