import { randomBytes, randomUUID, timingSafeEqual } from 'node:crypto'
import { Router, type Request } from 'express'
import { parse } from 'cookie'
import { env } from '../config/env.js'
import { ensureBungieUser } from '../database.js'

const bungieAuthRouter = Router()
const sessions = new Map<string, BungieSession>()
const stateCookieName = 'bungie_oauth_state'
const sessionCookieName = 'braytech_session'
const oauthStateLifetime = 10 * 60 * 1000

export type BungieSession = {
  accessToken: string
  refreshToken?: string
  expiresAt: number
  userId: number
  membershipId: string
  membershipType: number
  memberships: unknown
  profile: BungieProfile | null
  appProfile: AppProfile
}

type BungieProfile = {
  displayName: string
  profilePictureUrl: string | null
}

type AppProfile = {
  level: number
  xp: number
  xpToNextLevel: number
}

type BungieTokenResponse = {
  access_token: string
  refresh_token?: string
  expires_in: number
}

type BungieMembershipsResponse = {
  bungieNetUser?: {
    displayName?: string
    profilePicturePath?: string
  }
  destinyMemberships?: Array<{
    membershipId?: string
    membershipType?: number
  }>
  primaryMembershipId?: string
}

type BungieCharacter = {
  classType?: number
  light?: number
  emblemPath?: string
  dateLastPlayed?: string
}

type DestinyProfilePayload = {
  Response?: {
    characters?: { data?: Record<string, BungieCharacter> }
    profileProgression?: { data?: { seasonProgressions?: Record<string, { level?: number }> } }
    seasonPass?: { data?: { seasonPasses?: Record<string, { level?: number }> } }
  }
}

function getCookies(request: Request) {
  return parse(request.headers.cookie ?? '')
}

function buildAuthorizationUrl(state: string) {
  const authorizationUrl = new URL(env.BUNGIE_OAUTH_AUTHORIZE_URL)
  authorizationUrl.searchParams.set('client_id', String(env.BUNGIE_CLIENT_ID))
  authorizationUrl.searchParams.set('response_type', 'code')
  authorizationUrl.searchParams.set('state', state)
  return authorizationUrl
}

async function exchangeCodeForToken(code: string) {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: String(env.BUNGIE_CLIENT_ID),
    client_secret: env.BUNGIE_CLIENT_SECRET,
  })
  const response = await fetch('https://www.bungie.net/Platform/App/OAuth/Token/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!response.ok) throw new Error(`Bungie token exchange failed with status ${response.status}`)
  return response.json() as Promise<BungieTokenResponse>
}

async function getMemberships(accessToken: string) {
  const response = await fetch(`${env.BUNGIE_API_BASE_URL}/User/GetMembershipsForCurrentUser/`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'X-API-Key': env.BUNGIE_API_KEY,
    },
  })

  if (!response.ok) throw new Error(`Bungie profile request failed with status ${response.status}`)
  const payload = await response.json() as { Response?: BungieMembershipsResponse }
  return payload.Response ?? null
}

function getBungieProfile(memberships: BungieMembershipsResponse | null): BungieProfile | null {
  if (!memberships?.bungieNetUser) return null
  const profilePicturePath = memberships?.bungieNetUser?.profilePicturePath

  return {
    displayName: memberships?.bungieNetUser?.displayName ?? 'Gardien Braytech',
    profilePictureUrl: profilePicturePath
      ? profilePicturePath.startsWith('http') ? profilePicturePath : `https://www.bungie.net${profilePicturePath}`
      : null,
  }
}

function isValidState(receivedState: string | undefined, expectedState: string | undefined) {
  if (!receivedState || !expectedState) return false
  const received = Buffer.from(receivedState)
  const expected = Buffer.from(expectedState)
  return received.length === expected.length && timingSafeEqual(received, expected)
}

bungieAuthRouter.get('/start', (_request, response) => {
  const state = randomBytes(32).toString('hex')
  response.cookie(stateCookieName, state, {
    httpOnly: true,
    maxAge: oauthStateLifetime,
    path: '/',
    sameSite: 'lax',
    secure: true,
  })
  response.redirect(buildAuthorizationUrl(state).toString())
})

bungieAuthRouter.get('/callback', async (request, response) => {
  const frontendErrorUrl = `${env.FRONTEND_URL}/login?bungie=error`
  const { code, state, error } = request.query
  const expectedState = getCookies(request)[stateCookieName]

  response.clearCookie(stateCookieName, { path: '/' })

  if (error || typeof code !== 'string' || !isValidState(typeof state === 'string' ? state : undefined, expectedState)) {
    response.redirect(frontendErrorUrl)
    return
  }

  try {
    const token = await exchangeCodeForToken(code)
    const memberships = await getMemberships(token.access_token)
    const profile = getBungieProfile(memberships)
    const primaryMembership = memberships?.destinyMemberships?.find(
      (membership) => membership.membershipId === memberships.primaryMembershipId,
    ) ?? memberships?.destinyMemberships?.[0]
    if (!primaryMembership?.membershipId || primaryMembership.membershipType === undefined) {
      throw new Error('Bungie account has no usable Destiny membership')
    }
    const userId = await ensureBungieUser(
      primaryMembership.membershipId,
      primaryMembership.membershipType,
      profile?.displayName ?? 'Gardien Braytech',
      profile?.profilePictureUrl ?? null,
    )
    const sessionId = randomUUID()
    sessions.set(sessionId, {
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      expiresAt: Date.now() + token.expires_in * 1000,
      userId,
      membershipId: primaryMembership.membershipId,
      membershipType: primaryMembership.membershipType,
      memberships,
      profile,
      appProfile: { level: 1, xp: 0, xpToNextLevel: 1000 },
    })

    response.cookie(sessionCookieName, sessionId, {
      httpOnly: true,
      maxAge: token.expires_in * 1000,
      path: '/',
      sameSite: 'lax',
      secure: true,
    })
    response.redirect(`${env.FRONTEND_URL}/?bungie=connected`)
  } catch (requestError) {
    console.error(requestError)
    response.redirect(frontendErrorUrl)
  }
})

bungieAuthRouter.get('/characters', async (request, response, next) => {
  const session = getAuthenticatedSession(request)
  if (!session) {
    response.status(401).json({ error: 'Authentication required' })
    return
  }

  try {
    const profileUrl = new URL(
      `${env.BUNGIE_API_BASE_URL}/Destiny2/${session.membershipType}/Profile/${session.membershipId}/`,
    )
    profileUrl.searchParams.set('components', '100,200,202,500')
    const profileResponse = await fetch(profileUrl, {
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        'X-API-Key': env.BUNGIE_API_KEY,
      },
    })
    if (!profileResponse.ok) {
      throw new Error(`Bungie character profile request failed with status ${profileResponse.status}`)
    }
    const payload = await profileResponse.json() as DestinyProfilePayload
    const characters = Object.values(payload.Response?.characters?.data ?? {})
      .sort((left, right) => (right.dateLastPlayed ?? '').localeCompare(left.dateLastPlayed ?? ''))
      .slice(0, 3)
      .map((character) => ({
        classType: character.classType ?? null,
        light: character.light ?? null,
        emblemUrl: character.emblemPath
          ? `https://www.bungie.net${character.emblemPath}`
          : null,
      }))
    const seasonProgressions = Object.values(
      payload.Response?.profileProgression?.data?.seasonProgressions ?? {},
    )
    const seasonPasses = Object.values(payload.Response?.seasonPass?.data?.seasonPasses ?? {})
    const seasonRank = [...seasonProgressions, ...seasonPasses]
      .map((progression) => progression.level)
      .find((level): level is number => typeof level === 'number')
      ?? null
    response.json({ characters, seasonRank })
  } catch (error) {
    next(error)
  }
})

export function getAuthenticatedSession(request: Request) {
  const sessionId = getCookies(request)[sessionCookieName]
  const session = sessionId ? sessions.get(sessionId) : undefined
  if (!session || session.expiresAt <= Date.now()) {
    if (sessionId) sessions.delete(sessionId)
    return null
  }
  return session
}

bungieAuthRouter.get('/session', (request, response) => {
  const session = getAuthenticatedSession(request)
  if (!session) {
    response.status(401).json({ authenticated: false })
    return
  }

  response.json({
    authenticated: true,
    memberships: session.memberships,
    profile: session.profile,
    appProfile: session.appProfile,
  })
})

bungieAuthRouter.post('/logout', (request, response) => {
  const sessionId = getCookies(request)[sessionCookieName]
  if (sessionId) sessions.delete(sessionId)
  response.clearCookie(sessionCookieName, { path: '/' })
  response.status(204).send()
})

export default bungieAuthRouter
