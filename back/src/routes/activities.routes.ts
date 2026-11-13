import { Router } from 'express'
import { env } from '../config/env.js'

const activitiesRouter = Router()
const manifestCache = new Map<string, { expiresAt: number, activities: Activity[] }>()
const cacheLifetime = 60 * 60 * 1000

type Activity = {
  id: number
  name: string
  category: string
  difficulties: string[]
}

type ManifestResponse = {
  Response?: {
    jsonWorldComponentContentPaths?: {
      fr?: {
        DestinyActivityDefinition?: string
        DestinyActivityTypeDefinition?: string
      }
      en?: {
        DestinyActivityDefinition?: string
        DestinyActivityTypeDefinition?: string
      }
    }
  }
}

type ActivityDefinition = {
  displayProperties?: { name?: string }
  activityTypeHash?: number
  activityTypeHashes?: number[]
  activityModeHashes?: number[]
  isPlaylist?: boolean
}

type ActivityTypeDefinition = {
  displayProperties?: { name?: string }
}

function getCategory(
  definition: ActivityDefinition,
  activityTypes: Record<string, ActivityTypeDefinition>,
) {
  for (const activityType of [
    definition.activityTypeHash,
    ...(definition.activityTypeHashes ?? []),
  ]) {
    const category = activityType === undefined
      ? undefined
      : activityTypes[String(activityType)]?.displayProperties?.name?.trim()
    if (category) return category
  }
  return 'Autres'
}

function getActivityKey(category: string, name: string) {
  const normalize = (value: string) => value
    .normalize('NFKC')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase('fr-FR')
  return `${normalize(category)}\u0000${normalize(name)}`
}

function splitActivityName(name: string) {
  const difficultyPattern = /(?:\s*:\s*|\s*\(\s*)(Normal|Standard|Ma[iî]trise|L[ée]gende|L[ée]gendaire|Expert|H[ée]ro[iï]que|Grand[- ]ma[iî]tre|Grandmaster|Master|Legendary|Legend|Nightfall)\s*\)?$/i
  const match = name.match(difficultyPattern)
  if (!match || match.index === undefined) return { name, difficulty: null }
  return {
    name: name.slice(0, match.index).trim(),
    difficulty: match[1] ?? null,
  }
}

async function getManifestActivities() {
  const cached = manifestCache.get('fr')
  if (cached && cached.expiresAt > Date.now()) return cached.activities

  const manifestResponse = await fetch(`${env.BUNGIE_API_BASE_URL}/Destiny2/Manifest/`, {
    headers: { 'X-API-Key': env.BUNGIE_API_KEY },
  })
  if (!manifestResponse.ok) {
    throw new Error(`Bungie manifest request failed with status ${manifestResponse.status}`)
  }
  const manifest = await manifestResponse.json() as ManifestResponse
  const componentPaths = manifest.Response?.jsonWorldComponentContentPaths?.fr
    ?? manifest.Response?.jsonWorldComponentContentPaths?.en
  const activityPath = componentPaths?.DestinyActivityDefinition
  const activityTypePath = componentPaths?.DestinyActivityTypeDefinition
  if (!activityPath || !activityTypePath) {
    throw new Error('Bungie manifest does not provide activity component paths')
  }

  const [definitionsResponse, activityTypesResponse] = await Promise.all([
    fetch(`https://www.bungie.net${activityPath}`, {
      headers: { 'X-API-Key': env.BUNGIE_API_KEY },
    }),
    fetch(`https://www.bungie.net${activityTypePath}`, {
      headers: { 'X-API-Key': env.BUNGIE_API_KEY },
    }),
  ])
  if (!definitionsResponse.ok) {
    throw new Error(`Bungie activity definitions request failed with status ${definitionsResponse.status}`)
  }
  if (!activityTypesResponse.ok) {
    throw new Error(`Bungie activity type definitions request failed with status ${activityTypesResponse.status}`)
  }
  const definitions = await definitionsResponse.json() as Record<string, ActivityDefinition>
  const activityTypes = await activityTypesResponse.json() as Record<string, ActivityTypeDefinition>
  const definitionsByName = new Map<string, Activity>()
  Object.entries(definitions)
    .map(([id, definition]) => {
      const activityName = splitActivityName(definition.displayProperties?.name?.trim() ?? '')
      return {
        id: Number(id),
        name: activityName.name,
        category: getCategory(definition, activityTypes),
        difficulties: activityName.difficulty ? [activityName.difficulty] : [],
      }
    })
    .filter((activity) => Number.isSafeInteger(activity.id) && activity.name.length > 0)
    .forEach((activity) => {
      const key = getActivityKey(activity.category, activity.name)
      const current = definitionsByName.get(key)
      if (!current) {
        definitionsByName.set(key, activity)
        return
      }
      current.difficulties = [...new Set([...current.difficulties, ...activity.difficulties])]
    })
  const activities = [...definitionsByName.values()]
    .sort((left, right) => left.category.localeCompare(right.category) || left.name.localeCompare(right.name))

  manifestCache.set('fr', { expiresAt: Date.now() + cacheLifetime, activities })
  return activities
}

activitiesRouter.get('/', async (_request, response, next) => {
  try {
    const activities = await getManifestActivities()
    const categories = activities.reduce<Record<string, Activity[]>>((grouped, activity) => {
      const categoryActivities = grouped[activity.category] ?? []
      categoryActivities.push(activity)
      grouped[activity.category] = categoryActivities
      return grouped
    }, {})
    response.json({ categories })
  } catch (error) {
    next(error)
  }
})

export default activitiesRouter
