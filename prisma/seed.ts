// prisma/seed.ts
// Run with: npm run db:seed
// This populates your database with a starter exercise library

import { PrismaClient, MuscleGroup, Equipment } from '@prisma/client'

const prisma = new PrismaClient()

const exercises = [
  // CHEST
  { name: 'Bench Press',          muscleGroup: MuscleGroup.CHEST,     equipment: Equipment.BARBELL },
  { name: 'Incline Bench Press',  muscleGroup: MuscleGroup.CHEST,     equipment: Equipment.BARBELL },
  { name: 'Dumbbell Fly',         muscleGroup: MuscleGroup.CHEST,     equipment: Equipment.DUMBBELL },
  { name: 'Cable Crossover',      muscleGroup: MuscleGroup.CHEST,     equipment: Equipment.CABLE },
  { name: 'Push Up',              muscleGroup: MuscleGroup.CHEST,     equipment: Equipment.BODYWEIGHT },
  // BACK
  { name: 'Deadlift',             muscleGroup: MuscleGroup.BACK,      equipment: Equipment.BARBELL },
  { name: 'Barbell Row',          muscleGroup: MuscleGroup.BACK,      equipment: Equipment.BARBELL },
  { name: 'Pull Up',              muscleGroup: MuscleGroup.BACK,      equipment: Equipment.BODYWEIGHT },
  { name: 'Lat Pulldown',         muscleGroup: MuscleGroup.BACK,      equipment: Equipment.CABLE },
  { name: 'Seated Cable Row',     muscleGroup: MuscleGroup.BACK,      equipment: Equipment.CABLE },
  { name: 'Dumbbell Row',         muscleGroup: MuscleGroup.BACK,      equipment: Equipment.DUMBBELL },
  // LEGS
  { name: 'Squat',                muscleGroup: MuscleGroup.LEGS,      equipment: Equipment.BARBELL },
  { name: 'Leg Press',            muscleGroup: MuscleGroup.LEGS,      equipment: Equipment.MACHINE },
  { name: 'Romanian Deadlift',    muscleGroup: MuscleGroup.LEGS,      equipment: Equipment.BARBELL },
  { name: 'Leg Curl',             muscleGroup: MuscleGroup.LEGS,      equipment: Equipment.MACHINE },
  { name: 'Leg Extension',        muscleGroup: MuscleGroup.LEGS,      equipment: Equipment.MACHINE },
  { name: 'Lunges',               muscleGroup: MuscleGroup.LEGS,      equipment: Equipment.DUMBBELL },
  // SHOULDERS
  { name: 'Overhead Press',       muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.BARBELL },
  { name: 'Dumbbell Lateral Raise', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.DUMBBELL },
  { name: 'Face Pull',            muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.CABLE },
  // ARMS
  { name: 'Barbell Curl',         muscleGroup: MuscleGroup.ARMS,      equipment: Equipment.BARBELL },
  { name: 'Tricep Pushdown',      muscleGroup: MuscleGroup.ARMS,      equipment: Equipment.CABLE },
  { name: 'Hammer Curl',          muscleGroup: MuscleGroup.ARMS,      equipment: Equipment.DUMBBELL },
  { name: 'Skull Crusher',        muscleGroup: MuscleGroup.ARMS,      equipment: Equipment.BARBELL },
  // CORE
  { name: 'Plank',                muscleGroup: MuscleGroup.CORE,      equipment: Equipment.BODYWEIGHT },
  { name: 'Cable Crunch',         muscleGroup: MuscleGroup.CORE,      equipment: Equipment.CABLE },
  { name: 'Ab Rollout',           muscleGroup: MuscleGroup.CORE,      equipment: Equipment.OTHER },
]

async function main() {
  console.log('🌱 Seeding exercises...')

  for (const exercise of exercises) {
    // upsert = insert if not exists, update if exists
    // This means you can safely run seed multiple times
    await prisma.exercise.upsert({
      where: { name: exercise.name },
      update: {},
      create: exercise,
    })
  }

  console.log(`✅ Seeded ${exercises.length} exercises`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
