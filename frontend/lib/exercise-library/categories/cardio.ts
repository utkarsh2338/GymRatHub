import { buildExercise, type ExerciseDef } from "../build";

const defs: ExerciseDef[] = [
  {
    name: "Treadmill Run",
    category: "Cardio",
    muscleGroups: ["Quadriceps", "Hamstrings", "Calves"],
    difficulty: "Beginner",
    equipment: ["Treadmill"],
    instructions: [
      "Warm up 5 minutes at easy pace.",
      "Maintain upright posture, mid-foot strike.",
      "Use incline for intensity without excessive speed.",
      "Cool down 3–5 minutes walking.",
    ],
    tips: [
      "Don't hold handrails during running—it alters gait.",
      "Increase weekly mileage by no more than ~10%.",
    ],
    commonMistakes: [
      "Overstriding with heel strike far in front of body.",
      "Skipping warm-up on high-intensity intervals.",
    ],
  },
  {
    name: "Stationary Bike",
    category: "Cardio",
    muscleGroups: ["Quadriceps", "Hamstrings", "Calves"],
    difficulty: "Beginner",
    equipment: ["Exercise Bike"],
    instructions: [
      "Adjust seat so knee has slight bend at bottom pedal.",
      "Pedal smooth circles—push down and pull up.",
      "Set resistance for target heart rate zone.",
    ],
    tips: [
      "Low impact—good for recovery and knee-friendly cardio.",
      "HIIT: 30s hard / 60s easy repeats.",
    ],
    commonMistakes: [
      "Seat too low causing knee pain.",
      "Only pushing down, not engaging full stroke.",
    ],
  },
  {
    name: "Rowing Machine",
    category: "Cardio",
    muscleGroups: ["Lats", "Quadriceps", "Hamstrings"],
    difficulty: "Intermediate",
    equipment: ["Rowing Erg"],
    instructions: [
      "Catch: arms straight, shins vertical, shoulders forward.",
      "Drive: legs first, then lean back, then pull handle to ribs.",
      "Recovery: arms away, hinge forward, bend knees.",
    ],
    tips: [
      "Ratio often 1:2 drive to recovery for steady state.",
      "Power comes from legs (~60%), not arms.",
    ],
    commonMistakes: [
      "Arms pulling before legs finish driving.",
      "Rounding lower back at the catch.",
    ],
  },
  {
    name: "Jump Rope",
    category: "Cardio",
    muscleGroups: ["Calves", "Quadriceps"],
    difficulty: "Intermediate",
    equipment: ["Jump Rope"],
    instructions: [
      "Elbows at sides, rotate from wrists not shoulders.",
      "Small hops on balls of feet—just enough to clear rope.",
      "Start with 20–30s intervals, rest, repeat.",
    ],
    tips: [
      "Use a rope that reaches armpits when standing on center.",
      "Great for footwork and conditioning between lifts.",
    ],
    commonMistakes: [
      "Jumping too high and wasting energy.",
      "Swinging arms in big circles.",
    ],
  },
  {
    name: "Burpee",
    category: "Cardio",
    muscleGroups: ["Quadriceps", "Pectorals", "Deltoids"],
    difficulty: "Intermediate",
    equipment: ["Bodyweight"],
    instructions: [
      "Drop to squat, hands on floor, jump feet to plank.",
      "Optional push-up, then jump feet to hands.",
      "Explosive jump up with hands overhead.",
    ],
    tips: [
      "Step-back version reduces impact for beginners.",
      "Pace for sustained work vs max power intervals.",
    ],
    commonMistakes: [
      "Worming hips up before feet jump in sloppy form.",
      "Landing hard with locked knees on the jump.",
    ],
  },
  {
    name: "Battle Ropes",
    category: "Cardio",
    muscleGroups: ["Deltoids", "Abs", "Biceps"],
    difficulty: "Intermediate",
    equipment: ["Battle Ropes"],
    instructions: [
      "Hold rope ends, athletic stance, slight knee bend.",
      "Create waves with alternating or simultaneous arm slams.",
      "Keep core braced for 20–40s intervals.",
    ],
    tips: [
      "Move ropes with speed, not just arm strength.",
      "Pair with squats or lunges for full-body circuits.",
    ],
    commonMistakes: [
      "Standing too upright and stressing lower back.",
      "Shrugging shoulders throughout.",
    ],
  },
  {
    name: "Stair Climber",
    category: "Cardio",
    muscleGroups: ["Glutes", "Quadriceps", "Calves"],
    difficulty: "Beginner",
    equipment: ["Stair Machine"],
    instructions: [
      "Stand tall, light hand contact on rails for balance only.",
      "Drive through full foot each step.",
      "Maintain steady cadence for time or intervals.",
    ],
    tips: [
      "Don't lean heavily on rails—it reduces calorie burn.",
      "Great glute pump with full steps.",
    ],
    commonMistakes: [
      "Short choppy steps on toes only.",
      "Hunching forward onto handles.",
    ],
  },
  {
    name: "Elliptical Trainer",
    category: "Cardio",
    muscleGroups: ["Quadriceps", "Glutes"],
    difficulty: "Beginner",
    equipment: ["Elliptical"],
    instructions: [
      "Stand tall, grip handles lightly if using moving arms.",
      "Drive through heels with smooth elliptical path.",
      "Use resistance and incline to vary intensity.",
    ],
    tips: [
      "Low impact alternative when joints need relief.",
      "Reverse stride hits hamstrings differently.",
    ],
    commonMistakes: [
      "Slouching on console with minimal leg drive.",
      "Zero resistance spinning fast without benefit.",
    ],
  },
];

export const cardioExercises = defs.map(buildExercise);
