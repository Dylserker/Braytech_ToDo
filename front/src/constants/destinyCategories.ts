export type DestinyMission = {
  name: string
  difficulties?: readonly string[]
}

export const DESTINY_CATEGORIES = {
  'Avant-garde': [
    { name: 'Assaut du Terminus des Insights', difficulties: ['Normal', 'Héroïque'] },
    { name: 'Champ de bataille : Hantise', difficulties: ['Normal', 'Héroïque'] },
    { name: 'Le Trafiquant d’armes', difficulties: ['Nuit noire', 'Grand-maître'] },
  ],
  Gambit: [
    { name: 'Partie de Gambit' },
    { name: 'Gambit : défi hebdomadaire' },
  ],
  Raid: [
    { name: 'Crypte de la pierre' },
    { name: 'La Chute du Roi', difficulties: ['Normal', 'Maîtrise'] },
    { name: 'Le Dernier Souhait', difficulties: ['Normal', 'Maîtrise'] },
  ],
  Donjons: [
    { name: 'Prophétie' },
    { name: 'La Flèche de l’observatrice', difficulties: ['Normal', 'Maîtrise'] },
    { name: 'Les Spectres des profondeurs' },
  ],
  'Épreuves': [
    { name: 'Épreuves d’Osiris' },
    { name: 'Partie compétitive' },
  ],
  'Quêtes': [
    { name: 'Campagne' },
    { name: 'Quête exotique' },
    { name: 'Quête saisonnière' },
  ],
  Collections: [
    { name: 'Armes' },
    { name: 'Armures' },
    { name: 'Triomphes' },
  ],
} as const satisfies Record<string, readonly DestinyMission[]>

export type DestinyCategory = keyof typeof DESTINY_CATEGORIES
