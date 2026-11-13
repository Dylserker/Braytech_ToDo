export type Task = {
  id?: number
  title: string
  description: string
  category: string
  difficulty: string
  mission: string
  createdAt: string
  endsAt?: string | null
  activityDefinitionId?: number
  activityHash?: number
  activityVariant?: string | null
}
