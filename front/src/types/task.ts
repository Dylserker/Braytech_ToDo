import type { DestinyCategory } from '../constants/destinyCategories'

export type Task = {
  title: string
  description: string
  category: DestinyCategory
  difficulty: string
  mission: string
  createdAt: string
}
