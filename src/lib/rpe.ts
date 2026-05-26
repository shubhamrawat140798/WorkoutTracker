export type RpeGuideRow = {
  level: string
  intensity: string
  description: string
}

/** Reference table for the RPE info sheet. */
export const RPE_GUIDE_ROWS: RpeGuideRow[] = [
  {
    level: '10',
    intensity: 'Max Effort',
    description:
      'Absolute failure. You could not do another repetition or add any more weight.',
  },
  {
    level: '9',
    intensity: 'Extremely Hard',
    description: 'You could have managed exactly 1 more rep.',
  },
  {
    level: '8',
    intensity: 'Very Hard',
    description: 'You could have managed exactly 2 more reps.',
  },
  {
    level: '7',
    intensity: 'Moderate/Hard',
    description:
      'You could have managed exactly 3 more reps (a solid working weight).',
  },
  {
    level: '5 – 6',
    intensity: 'Moderate',
    description: 'The weight moves quickly. Good for speed work or warm-ups.',
  },
  {
    level: '3 – 4',
    intensity: 'Light',
    description: 'Easy effort, typical for active recovery or dynamic stretching.',
  },
  {
    level: '1 – 2',
    intensity: 'Very Light',
    description: 'Little to no effort, like walking at a casual pace.',
  },
]

export const RPE_SELECT_VALUES = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1] as const

const VALUE_HINTS: Record<number, string> = {
  10: 'Max effort',
  9: '1 rep left',
  8: '2 reps left',
  7: '3 reps left',
  6: 'Moderate',
  5: 'Moderate',
  4: 'Light',
  3: 'Light',
  2: 'Very light',
  1: 'Very light',
}

export function getRpeOptionLabel(value: number) {
  const hint = VALUE_HINTS[value]
  return hint ? `${value} — ${hint}` : String(value)
}

export function getRpeGuideForValue(value: number): RpeGuideRow | undefined {
  if (value >= 10) return RPE_GUIDE_ROWS[0]
  if (value === 9) return RPE_GUIDE_ROWS[1]
  if (value === 8) return RPE_GUIDE_ROWS[2]
  if (value === 7) return RPE_GUIDE_ROWS[3]
  if (value >= 5) return RPE_GUIDE_ROWS[4]
  if (value >= 3) return RPE_GUIDE_ROWS[5]
  if (value >= 1) return RPE_GUIDE_ROWS[6]
  return undefined
}
