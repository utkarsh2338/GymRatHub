import { buildExercise, type ExerciseDef } from "../build";

const defs: ExerciseDef[] = [
  {
    name: "Barbell Back Squat",
    category: "Legs",
    muscleGroups: ["Quadriceps", "Glutes", "Hamstrings"],
    difficulty: "Advanced",
    equipment: ["Barbell", "Squat Rack"],
    sets: 4,
    reps: "5-8",
    rest: "120-180s",
    instructions: [
      "Bar on upper traps, feet shoulder-width, toes slightly out.",
      "Brace core, break at hips and knees together.",
      "Descend until hip crease is at or below knee line.",
      "Drive through mid-foot to stand, knees tracking over toes.",
    ],
    tips: [
      "Wedge breathing at the top increases intra-abdominal pressure.",
      "Depth depends on mobility—work ankle and hip drills.",
    ],
    commonMistakes: [
      "Knees caving inward (valgus collapse).",
      "Good-morning squat—hips rising faster than chest.",
      "Heels lifting off the floor.",
    ],
  },
  {
    name: "Front Squat",
    category: "Legs",
    muscleGroups: ["Quadriceps", "Glutes"],
    difficulty: "Advanced",
    equipment: ["Barbell", "Squat Rack"],
    instructions: [
      "Bar in front rack on shoulders, elbows high.",
      "Squat down keeping torso upright.",
      "Drive up through quads without elbows dropping.",
    ],
    tips: [
      "Cross-arm or clean grip based on wrist mobility.",
      "More quad-dominant than back squat for most lifters.",
    ],
    commonMistakes: [
      "Elbows dropping causing bar to roll forward.",
      "Leaning forward excessively.",
    ],
  },
  {
    name: "Goblet Squat",
    category: "Legs",
    muscleGroups: ["Quadriceps", "Glutes"],
    difficulty: "Beginner",
    equipment: ["Dumbbell", "Kettlebell"],
    instructions: [
      "Hold weight at chest, elbows inside knees at the bottom.",
      "Squat between hips with upright torso.",
      "Push knees out lightly at the bottom.",
    ],
    tips: [
      "Excellent for learning squat pattern and depth.",
      "Pulse at bottom for mobility work.",
    ],
    commonMistakes: [
      "Rounding upper back and losing elbow position.",
      "Rising onto toes.",
    ],
  },
  {
    name: "Leg Press",
    category: "Legs",
    muscleGroups: ["Quadriceps", "Glutes"],
    difficulty: "Beginner",
    equipment: ["Leg Press Machine"],
    instructions: [
      "Feet shoulder-width on platform, lower back flat on pad.",
      "Lower sled until knees reach ~90° without butt lifting.",
      "Press through full foot without locking knees harshly.",
    ],
    tips: [
      "High foot placement hits glutes/hams; low hits quads.",
      "Don't let lower back peel off the seat at depth.",
    ],
    commonMistakes: [
      "Locking knees at top with heavy weight.",
      "Partial range half-reps.",
    ],
  },
  {
    name: "Romanian Deadlift",
    category: "Legs",
    muscleGroups: ["Hamstrings", "Glutes", "Lower Back"],
    difficulty: "Intermediate",
    equipment: ["Barbell", "Dumbbells"],
    instructions: [
      "Start standing with slight knee bend, bar at hips.",
      "Hinge hips back, sliding bar down thighs.",
      "Stop when hamstrings stretch—shins stay vertical.",
      "Drive hips forward to stand, squeeze glutes.",
    ],
    tips: [
      "Feel tension in hamstrings, not lower back burning.",
      "3–4 second lowering builds flexibility and strength.",
    ],
    commonMistakes: [
      "Turning it into a stiff-leg deadlift with rounded back.",
      "Bending knees too much into a conventional deadlift.",
    ],
  },
  {
    name: "Walking Lunge",
    category: "Legs",
    muscleGroups: ["Quadriceps", "Glutes", "Hamstrings"],
    difficulty: "Beginner",
    equipment: ["Dumbbells", "Bodyweight"],
    instructions: [
      "Step forward into a lunge, back knee toward floor.",
      "Front knee stays over mid-foot, torso upright.",
      "Push through front foot to step into the next lunge.",
    ],
    tips: [
      "Long steps hit glutes; shorter steps hit quads.",
      "Keep balance by looking forward, not down.",
    ],
    commonMistakes: [
      "Front knee collapsing inward.",
      "Torso pitching forward excessively.",
    ],
  },
  {
    name: "Bulgarian Split Squat",
    category: "Legs",
    muscleGroups: ["Quadriceps", "Glutes"],
    difficulty: "Intermediate",
    equipment: ["Dumbbells", "Bench"],
    instructions: [
      "Rear foot elevated on bench, front foot far enough for balance.",
      "Lower straight down until rear knee nears floor.",
      "Drive through front heel to stand.",
    ],
    tips: [
      "Lean slightly forward for glute bias; upright for quads.",
      "Use a pad under rear knee for comfort.",
    ],
    commonMistakes: [
      "Front foot too close—knee over toes excessively.",
      "Pushing off back leg instead of front leg drive.",
    ],
  },
  {
    name: "Leg Extension",
    category: "Legs",
    muscleGroups: ["Quadriceps"],
    difficulty: "Beginner",
    equipment: ["Leg Extension Machine"],
    instructions: [
      "Adjust pad above ankles, back flat on seat.",
      "Extend legs until straight, squeeze quads.",
      "Lower with control without letting stack slam.",
    ],
    tips: [
      "Point toes up slightly for vastus medialis emphasis.",
      "Use as pre-exhaust or finisher—not only leg exercise.",
    ],
    commonMistakes: [
      "Swinging weight with momentum.",
      "Hyperextending knees aggressively at lockout.",
    ],
  },
  {
    name: "Lying Leg Curl",
    category: "Legs",
    muscleGroups: ["Hamstrings"],
    difficulty: "Beginner",
    equipment: ["Leg Curl Machine"],
    instructions: [
      "Lie face down, pad on lower calves/ankles.",
      "Curl heels toward glutes without lifting hips.",
      "Lower under control to full extension.",
    ],
    tips: [
      "Dorsiflex feet (toes to shins) for more hamstring recruitment.",
      "Pause at peak contraction.",
    ],
    commonMistakes: [
      "Hips rising off the bench to shorten range.",
      "Using too much weight and shortening reps.",
    ],
  },
  {
    name: "Seated Leg Curl",
    category: "Legs",
    muscleGroups: ["Hamstrings"],
    difficulty: "Beginner",
    equipment: ["Seated Leg Curl Machine"],
    instructions: [
      "Sit with pad on lower shins, back against pad.",
      "Curl legs down and back under the seat.",
      "Return slowly without letting weight stack drop.",
    ],
    tips: [
      "Often allows heavier load than lying version.",
      "Keep hips glued to the seat.",
    ],
    commonMistakes: [
      "Leaning forward off the back pad.",
      "Partial reps at the contracted position.",
    ],
  },
  {
    name: "Hip Thrust",
    category: "Legs",
    muscleGroups: ["Glutes", "Hamstrings"],
    difficulty: "Intermediate",
    equipment: ["Barbell", "Bench"],
    instructions: [
      "Upper back on bench, bar over hips with pad.",
      "Feet flat, knees at ~90° at the top.",
      "Drive hips up until torso is parallel to floor, squeeze glutes.",
      "Lower without losing rib position.",
    ],
    tips: [
      "Chin tucked—look forward not up at the ceiling.",
      "Pause 2 seconds at top for max glute activation.",
    ],
    commonMistakes: [
      "Hyperextending lumbar spine at lockout.",
      "Feet too far forward reducing glute tension.",
    ],
  },
  {
    name: "Standing Calf Raise",
    category: "Legs",
    muscleGroups: ["Calves"],
    difficulty: "Beginner",
    equipment: ["Calf Raise Machine", "Smith Machine"],
    instructions: [
      "Balls of feet on edge, heels hanging.",
      "Rise onto toes as high as possible.",
      "Lower for a full stretch at the bottom.",
    ],
    tips: [
      "Straight knee hits gastrocnemius; bent knee hits soleus.",
      "Train calves 2–3x per week—they recover fast.",
    ],
    commonMistakes: [
      "Bouncing at the bottom without control.",
      "Incomplete range at the top.",
    ],
  },
  {
    name: "Seated Calf Raise",
    category: "Legs",
    muscleGroups: ["Calves"],
    difficulty: "Beginner",
    equipment: ["Seated Calf Machine"],
    instructions: [
      "Knees bent at 90°, pad on lower thighs.",
      "Raise heels maximally, squeeze calves.",
      "Lower slowly to full stretch.",
    ],
    tips: [
      "Targets soleus for complete calf development.",
      "Hold top position 1–2 seconds.",
    ],
    commonMistakes: [
      "Using too much weight with tiny range.",
      "Rushing reps.",
    ],
  },
  {
    name: "Hack Squat",
    category: "Legs",
    muscleGroups: ["Quadriceps", "Glutes"],
    difficulty: "Intermediate",
    equipment: ["Hack Squat Machine"],
    instructions: [
      "Shoulders under pads, feet mid-platform.",
      "Lower until thighs are parallel or below.",
      "Press up through full foot.",
    ],
    tips: [
      "Great quad overload with less spinal loading than back squat.",
      "Keep lower back against pad entire rep.",
    ],
    commonMistakes: [
      "Locking knees aggressively at top.",
      "Heels rising at depth.",
    ],
  },
  {
    name: "Step-Up",
    category: "Legs",
    muscleGroups: ["Quadriceps", "Glutes"],
    difficulty: "Beginner",
    equipment: ["Box", "Dumbbells"],
    instructions: [
      "One foot fully on box, drive through that heel to stand on box.",
      "Step down with control—same leg or alternate.",
      "Keep torso tall; don't push off back foot.",
    ],
    tips: [
      "Box height at or below knee for most strength work.",
      "Hold dumbbells at sides for load.",
    ],
    commonMistakes: [
      "Pushing off the trailing leg excessively.",
      "Knee caving on the working leg.",
    ],
  },
];

export const legExercises = defs.map(buildExercise);
