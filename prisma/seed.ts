// prisma/seed.ts
// Run with: npm run db:seed
// Creates the exercise library + a demo user with sample data

import { PrismaClient, MuscleGroup, Equipment, Goal, Level } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// ─── EXERCISES ────────────────────────────────────────────────────────────────

const exercises = [
  { name: 'Bench Press',            muscleGroup: MuscleGroup.CHEST,     equipment: Equipment.BARBELL },
  { name: 'Incline Bench Press',    muscleGroup: MuscleGroup.CHEST,     equipment: Equipment.BARBELL },
  { name: 'Dumbbell Fly',           muscleGroup: MuscleGroup.CHEST,     equipment: Equipment.DUMBBELL },
  { name: 'Cable Crossover',        muscleGroup: MuscleGroup.CHEST,     equipment: Equipment.CABLE },
  { name: 'Push Up',                muscleGroup: MuscleGroup.CHEST,     equipment: Equipment.BODYWEIGHT },
  { name: 'Deadlift',               muscleGroup: MuscleGroup.BACK,      equipment: Equipment.BARBELL },
  { name: 'Barbell Row',            muscleGroup: MuscleGroup.BACK,      equipment: Equipment.BARBELL },
  { name: 'Pull Up',                muscleGroup: MuscleGroup.BACK,      equipment: Equipment.BODYWEIGHT },
  { name: 'Lat Pulldown',           muscleGroup: MuscleGroup.BACK,      equipment: Equipment.CABLE },
  { name: 'Seated Cable Row',       muscleGroup: MuscleGroup.BACK,      equipment: Equipment.CABLE },
  { name: 'Dumbbell Row',           muscleGroup: MuscleGroup.BACK,      equipment: Equipment.DUMBBELL },
  { name: 'Squat',                  muscleGroup: MuscleGroup.LEGS,      equipment: Equipment.BARBELL },
  { name: 'Leg Press',              muscleGroup: MuscleGroup.LEGS,      equipment: Equipment.MACHINE },
  { name: 'Romanian Deadlift',      muscleGroup: MuscleGroup.LEGS,      equipment: Equipment.BARBELL },
  { name: 'Leg Curl',               muscleGroup: MuscleGroup.LEGS,      equipment: Equipment.MACHINE },
  { name: 'Leg Extension',          muscleGroup: MuscleGroup.LEGS,      equipment: Equipment.MACHINE },
  { name: 'Lunges',                 muscleGroup: MuscleGroup.LEGS,      equipment: Equipment.DUMBBELL },
  { name: 'Overhead Press',         muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.BARBELL },
  { name: 'Dumbbell Lateral Raise', muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.DUMBBELL },
  { name: 'Face Pull',              muscleGroup: MuscleGroup.SHOULDERS, equipment: Equipment.CABLE },
  { name: 'Barbell Curl',           muscleGroup: MuscleGroup.ARMS,      equipment: Equipment.BARBELL },
  { name: 'Tricep Pushdown',        muscleGroup: MuscleGroup.ARMS,      equipment: Equipment.CABLE },
  { name: 'Hammer Curl',            muscleGroup: MuscleGroup.ARMS,      equipment: Equipment.DUMBBELL },
  { name: 'Skull Crusher',          muscleGroup: MuscleGroup.ARMS,      equipment: Equipment.BARBELL },
  { name: 'Plank',                  muscleGroup: MuscleGroup.CORE,      equipment: Equipment.BODYWEIGHT },
  { name: 'Cable Crunch',           muscleGroup: MuscleGroup.CORE,      equipment: Equipment.CABLE },
  { name: 'Ab Rollout',             muscleGroup: MuscleGroup.CORE,      equipment: Equipment.OTHER },
]

// ─── DEMO WORKOUT DATA ────────────────────────────────────────────────────────
// 8 weeks of realistic progressive overload data
// Bench: 70 → 90kg, Squat: 80 → 100kg, Deadlift: 100 → 125kg

function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  d.setHours(10, 0, 0, 0)
  return d
}

const demoWorkouts = [
  // ── WEEK 8 (most recent) ───────────────────────────────────────────────────
  {
    date: daysAgo(1),
    notes: 'Great session, hit a new squat PR!',
    sets: [
      { exercise: 'Squat',            sets: [{ reps: 5, kg: 100 }, { reps: 5, kg: 100 }, { reps: 4, kg: 100 }] },
      { exercise: 'Leg Press',        sets: [{ reps: 10, kg: 140 }, { reps: 10, kg: 140 }, { reps: 8, kg: 140 }] },
      { exercise: 'Romanian Deadlift',sets: [{ reps: 8, kg: 80 }, { reps: 8, kg: 80 }, { reps: 8, kg: 80 }] },
      { exercise: 'Leg Curl',         sets: [{ reps: 12, kg: 45 }, { reps: 12, kg: 45 }, { reps: 10, kg: 45 }] },
    ],
  },
  {
    date: daysAgo(3),
    notes: 'Chest day, bench felt strong',
    sets: [
      { exercise: 'Bench Press',       sets: [{ reps: 5, kg: 90 }, { reps: 5, kg: 90 }, { reps: 4, kg: 90 }] },
      { exercise: 'Incline Bench Press',sets: [{ reps: 8, kg: 70 }, { reps: 8, kg: 70 }, { reps: 7, kg: 70 }] },
      { exercise: 'Cable Crossover',   sets: [{ reps: 12, kg: 20 }, { reps: 12, kg: 20 }, { reps: 12, kg: 20 }] },
      { exercise: 'Tricep Pushdown',   sets: [{ reps: 12, kg: 35 }, { reps: 12, kg: 35 }, { reps: 10, kg: 35 }] },
    ],
  },
  {
    date: daysAgo(5),
    notes: 'Pull day, deadlift PR',
    sets: [
      { exercise: 'Deadlift',          sets: [{ reps: 3, kg: 125 }, { reps: 3, kg: 125 }, { reps: 2, kg: 125 }] },
      { exercise: 'Barbell Row',       sets: [{ reps: 8, kg: 80 }, { reps: 8, kg: 80 }, { reps: 8, kg: 80 }] },
      { exercise: 'Lat Pulldown',      sets: [{ reps: 10, kg: 70 }, { reps: 10, kg: 70 }, { reps: 10, kg: 70 }] },
      { exercise: 'Barbell Curl',      sets: [{ reps: 10, kg: 40 }, { reps: 10, kg: 40 }, { reps: 8, kg: 40 }] },
    ],
  },
  // ── WEEK 7 ────────────────────────────────────────────────────────────────
  {
    date: daysAgo(8),
    notes: 'Solid leg session',
    sets: [
      { exercise: 'Squat',            sets: [{ reps: 5, kg: 95 }, { reps: 5, kg: 95 }, { reps: 5, kg: 95 }] },
      { exercise: 'Leg Press',        sets: [{ reps: 10, kg: 130 }, { reps: 10, kg: 130 }, { reps: 10, kg: 130 }] },
      { exercise: 'Romanian Deadlift',sets: [{ reps: 8, kg: 75 }, { reps: 8, kg: 75 }, { reps: 8, kg: 75 }] },
    ],
  },
  {
    date: daysAgo(10),
    sets: [
      { exercise: 'Bench Press',       sets: [{ reps: 5, kg: 87.5 }, { reps: 5, kg: 87.5 }, { reps: 5, kg: 87.5 }] },
      { exercise: 'Overhead Press',    sets: [{ reps: 8, kg: 55 }, { reps: 8, kg: 55 }, { reps: 7, kg: 55 }] },
      { exercise: 'Dumbbell Lateral Raise', sets: [{ reps: 15, kg: 12 }, { reps: 15, kg: 12 }, { reps: 15, kg: 12 }] },
      { exercise: 'Tricep Pushdown',   sets: [{ reps: 12, kg: 32.5 }, { reps: 12, kg: 32.5 }, { reps: 12, kg: 32.5 }] },
    ],
  },
  {
    date: daysAgo(12),
    sets: [
      { exercise: 'Deadlift',          sets: [{ reps: 3, kg: 120 }, { reps: 3, kg: 120 }, { reps: 3, kg: 120 }] },
      { exercise: 'Barbell Row',       sets: [{ reps: 8, kg: 77.5 }, { reps: 8, kg: 77.5 }, { reps: 8, kg: 77.5 }] },
      { exercise: 'Pull Up',           sets: [{ reps: 8, kg: 0 }, { reps: 7, kg: 0 }, { reps: 6, kg: 0 }] },
      { exercise: 'Hammer Curl',       sets: [{ reps: 12, kg: 18 }, { reps: 12, kg: 18 }, { reps: 10, kg: 18 }] },
    ],
  },
  // ── WEEK 6 ────────────────────────────────────────────────────────────────
  {
    date: daysAgo(15),
    sets: [
      { exercise: 'Squat',            sets: [{ reps: 5, kg: 92.5 }, { reps: 5, kg: 92.5 }, { reps: 5, kg: 92.5 }] },
      { exercise: 'Leg Extension',    sets: [{ reps: 12, kg: 60 }, { reps: 12, kg: 60 }, { reps: 12, kg: 60 }] },
      { exercise: 'Leg Curl',         sets: [{ reps: 12, kg: 42.5 }, { reps: 12, kg: 42.5 }, { reps: 10, kg: 42.5 }] },
      { exercise: 'Plank',            sets: [{ reps: 60, kg: 0 }, { reps: 60, kg: 0 }, { reps: 60, kg: 0 }] },
    ],
  },
  {
    date: daysAgo(17),
    notes: 'Good push session',
    sets: [
      { exercise: 'Bench Press',       sets: [{ reps: 5, kg: 85 }, { reps: 5, kg: 85 }, { reps: 5, kg: 85 }] },
      { exercise: 'Incline Bench Press',sets: [{ reps: 8, kg: 65 }, { reps: 8, kg: 65 }, { reps: 8, kg: 65 }] },
      { exercise: 'Overhead Press',    sets: [{ reps: 8, kg: 52.5 }, { reps: 8, kg: 52.5 }, { reps: 8, kg: 52.5 }] },
    ],
  },
  {
    date: daysAgo(19),
    sets: [
      { exercise: 'Deadlift',          sets: [{ reps: 4, kg: 115 }, { reps: 4, kg: 115 }, { reps: 4, kg: 115 }] },
      { exercise: 'Seated Cable Row',  sets: [{ reps: 10, kg: 65 }, { reps: 10, kg: 65 }, { reps: 10, kg: 65 }] },
      { exercise: 'Lat Pulldown',      sets: [{ reps: 10, kg: 67.5 }, { reps: 10, kg: 67.5 }, { reps: 10, kg: 67.5 }] },
    ],
  },
  // ── WEEK 5 ────────────────────────────────────────────────────────────────
  {
    date: daysAgo(22),
    sets: [
      { exercise: 'Squat',            sets: [{ reps: 5, kg: 90 }, { reps: 5, kg: 90 }, { reps: 5, kg: 90 }] },
      { exercise: 'Romanian Deadlift',sets: [{ reps: 8, kg: 70 }, { reps: 8, kg: 70 }, { reps: 8, kg: 70 }] },
      { exercise: 'Leg Press',        sets: [{ reps: 10, kg: 120 }, { reps: 10, kg: 120 }, { reps: 10, kg: 120 }] },
    ],
  },
  {
    date: daysAgo(24),
    sets: [
      { exercise: 'Bench Press',       sets: [{ reps: 6, kg: 82.5 }, { reps: 6, kg: 82.5 }, { reps: 5, kg: 82.5 }] },
      { exercise: 'Cable Crossover',   sets: [{ reps: 12, kg: 17.5 }, { reps: 12, kg: 17.5 }, { reps: 12, kg: 17.5 }] },
      { exercise: 'Tricep Pushdown',   sets: [{ reps: 12, kg: 30 }, { reps: 12, kg: 30 }, { reps: 12, kg: 30 }] },
    ],
  },
  {
    date: daysAgo(26),
    sets: [
      { exercise: 'Deadlift',          sets: [{ reps: 4, kg: 110 }, { reps: 4, kg: 110 }, { reps: 4, kg: 110 }] },
      { exercise: 'Barbell Row',       sets: [{ reps: 8, kg: 75 }, { reps: 8, kg: 75 }, { reps: 8, kg: 75 }] },
      { exercise: 'Barbell Curl',      sets: [{ reps: 10, kg: 37.5 }, { reps: 10, kg: 37.5 }, { reps: 10, kg: 37.5 }] },
    ],
  },
  // ── WEEKS 1–4 (lighter, earlier progress) ─────────────────────────────────
  {
    date: daysAgo(33),
    sets: [
      { exercise: 'Squat',      sets: [{ reps: 5, kg: 85 }, { reps: 5, kg: 85 }, { reps: 5, kg: 85 }] },
      { exercise: 'Bench Press',sets: [{ reps: 5, kg: 80 }, { reps: 5, kg: 80 }, { reps: 5, kg: 80 }] },
    ],
  },
  {
    date: daysAgo(40),
    sets: [
      { exercise: 'Deadlift',   sets: [{ reps: 5, kg: 105 }, { reps: 5, kg: 105 }, { reps: 5, kg: 105 }] },
      { exercise: 'Squat',      sets: [{ reps: 5, kg: 82.5 }, { reps: 5, kg: 82.5 }, { reps: 5, kg: 82.5 }] },
    ],
  },
  {
    date: daysAgo(47),
    sets: [
      { exercise: 'Bench Press',sets: [{ reps: 5, kg: 77.5 }, { reps: 5, kg: 77.5 }, { reps: 5, kg: 77.5 }] },
      { exercise: 'Overhead Press', sets: [{ reps: 8, kg: 50 }, { reps: 8, kg: 50 }, { reps: 7, kg: 50 }] },
    ],
  },
  {
    date: daysAgo(54),
    sets: [
      { exercise: 'Squat',      sets: [{ reps: 5, kg: 80 }, { reps: 5, kg: 80 }, { reps: 5, kg: 80 }] },
      { exercise: 'Deadlift',   sets: [{ reps: 5, kg: 100 }, { reps: 5, kg: 100 }, { reps: 5, kg: 100 }] },
    ],
  },
]

// ─── DEMO BODY WEIGHT LOGS ────────────────────────────────────────────────────
// Slight downward trend showing body recomp (losing fat, gaining muscle)

const demoWeightLogs = Array.from({ length: 56 }, (_, i) => ({
  daysAgo: 55 - i,
  // Starts at 82kg, gradual drop to ~78kg with realistic daily noise
  weightKg: parseFloat((82 - (i * 0.07) + (Math.sin(i * 0.8) * 0.4)).toFixed(1)),
}))

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Seeding exercises...')
  for (const exercise of exercises) {
    await prisma.exercise.upsert({
      where:  { name: exercise.name },
      update: {},
      create: exercise,
    })
  }
  console.log(`✅ ${exercises.length} exercises seeded`)

  // ── Demo user ──────────────────────────────────────────────────────────────
  console.log('\n👤 Creating demo user...')

  const hashedPassword = await bcrypt.hash('demo1234', 12)

  const demoUser = await prisma.user.upsert({
    where:  { email: 'demo@fitai.app' },
    update: {},
    create: {
      name:         'Almost Natty',
      email:        'demo@fitai.app',
      password:     hashedPassword,
      heightCm:     178,
      goal:         Goal.BUILD_MUSCLE,
      fitnessLevel: Level.INTERMEDIATE,
    },
  })

  console.log(`✅ Demo user: demo@fitai.app / demo1234`)

  // ── Clear old demo data before re-seeding ─────────────────────────────────
  await prisma.workoutSession.deleteMany({ where: { userId: demoUser.id } })
  await prisma.bodyWeightLog.deleteMany({  where: { userId: demoUser.id } })

  // ── Seed workouts ──────────────────────────────────────────────────────────
  console.log('\n🏋️  Seeding demo workouts...')

  for (const workout of demoWorkouts) {
    // Build all sets for this workout
    const allSets = []
    let setCounter = 1

    for (const exerciseBlock of workout.sets) {
      const exercise = await prisma.exercise.findUnique({
        where: { name: exerciseBlock.exercise },
      })
      if (!exercise) continue

      for (const set of exerciseBlock.sets) {
        allSets.push({
          exerciseId: exercise.id,
          setNumber:  setCounter++,
          reps:       set.reps,
          weightKg:   set.kg,
        })
      }
    }

    await prisma.workoutSession.create({
      data: {
        userId: demoUser.id,
        date:   workout.date,
        notes:  (workout as any).notes,
        sets:   { create: allSets },
      },
    })
  }

  console.log(`✅ ${demoWorkouts.length} workouts seeded`)

  // ── Seed body weight logs ─────────────────────────────────────────────────
  console.log('\n⚖️  Seeding body weight logs...')

  for (const log of demoWeightLogs) {
    const date = new Date()
    date.setDate(date.getDate() - log.daysAgo)
    date.setHours(8, 0, 0, 0)

    await prisma.bodyWeightLog.create({
      data: {
        userId:   demoUser.id,
        weightKg: log.weightKg,
        date,
      },
    })
  }

  console.log(`✅ ${demoWeightLogs.length} weight logs seeded`)
  console.log('\n🎉 All done! Demo credentials: demo@fitai.app / demo1234')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })