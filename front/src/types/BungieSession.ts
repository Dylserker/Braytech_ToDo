export type BungieSession = {
  authenticated: boolean
  profile?: {
    displayName: string
    profilePictureUrl: string | null
  } | null
  appProfile?: {
    level: number
    xp: number
    xpToNextLevel: number
  }
  memberships?: {
    bungieNetUser?: { displayName?: string }
    destinyMemberships?: Array<{ displayName?: string }>
  }
}