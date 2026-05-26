import { neon } from '@neondatabase/serverless'
import { getDatabaseUrl } from './load-env.mjs'

const url = getDatabaseUrl()
if (!url) {
  console.error('DATABASE_URL required in .env.local')
  process.exit(1)
}

const sql = neon(url)

const exercises = [
  {
    slug: 'bench-press',
    name: 'Bench Press',
    primaryMuscle: 'Chest',
    equipment: 'Barbell',
    level: 'Intermediate',
    instructions: [
      'Lie on a flat bench with feet flat on the floor.',
      'Grip the bar slightly wider than shoulder width.',
      'Lower the bar to mid-chest with control, then press up to lockout.',
    ],
    tips: ['Keep shoulder blades retracted', 'Maintain a slight arch in the lower back'],
  },
  {
    slug: 'squat',
    name: 'Squat',
    primaryMuscle: 'Quads',
    equipment: 'Barbell',
    level: 'Intermediate',
    instructions: [
      'Set the bar on your upper traps and brace your core.',
      'Sit back and down until thighs are at least parallel to the floor.',
      'Drive through mid-foot to stand up.',
    ],
    tips: ['Knees track over toes', 'Keep chest up throughout the rep'],
  },
  {
    slug: 'deadlift',
    name: 'Deadlift',
    primaryMuscle: 'Back',
    equipment: 'Barbell',
    level: 'Intermediate',
    instructions: [
      'Stand with the bar over mid-foot, hinge to grip the bar.',
      'Brace, pull slack out of the bar, then drive the floor away.',
      'Lock out hips and knees together at the top.',
    ],
    tips: ['Keep the bar close to your legs', 'Do not round your lower back'],
  },
  {
    slug: 'overhead-press',
    name: 'Overhead Press',
    primaryMuscle: 'Shoulders',
    equipment: 'Barbell',
    level: 'Intermediate',
    instructions: [
      'Start with the bar at upper chest, elbows slightly in front of the bar.',
      'Press straight up, moving your head back to clear the bar path.',
      'Lock out overhead with biceps near your ears.',
    ],
    tips: ['Squeeze glutes for stability', 'Avoid excessive lower-back lean'],
  },
  {
    slug: 'barbell-row',
    name: 'Barbell Row',
    primaryMuscle: 'Back',
    equipment: 'Barbell',
    level: 'Intermediate',
    instructions: [
      'Hinge forward with a flat back, knees slightly bent.',
      'Pull the bar to your lower chest or upper abdomen.',
      'Lower with control without losing torso position.',
    ],
    tips: ['Lead with your elbows', 'Keep the bar path close to your body'],
  },
  {
    slug: 'pull-ups',
    name: 'Pull-ups',
    primaryMuscle: 'Back',
    equipment: 'Bodyweight',
    level: 'Intermediate',
    instructions: [
      'Hang from the bar with hands slightly wider than shoulders.',
      'Pull until your chin clears the bar.',
      'Lower under control to a full hang.',
    ],
    tips: ['Initiate by depressing your shoulder blades', 'Avoid kipping unless training for it'],
  },
]

for (const ex of exercises) {
  await sql`
    INSERT INTO exercise_catalog (
      slug, name, primary_muscle, equipment, level,
      instructions, tips, published
    ) VALUES (
      ${ex.slug},
      ${ex.name},
      ${ex.primaryMuscle},
      ${ex.equipment},
      ${ex.level},
      ${JSON.stringify(ex.instructions)}::jsonb,
      ${JSON.stringify(ex.tips)}::jsonb,
      true
    )
    ON CONFLICT (slug) DO NOTHING
  `
  console.log(`Seeded: ${ex.name}`)
}

console.log('Catalog seed complete.')
