import { buildExercise, type ExerciseDef } from "../build";

const defs: ExerciseDef[] = [
  {
    name: "Plank",
    category: "Core",
    muscleGroups: ["Abs", "Obliques"],
    difficulty: "Beginner",
    equipment: ["Bodyweight"],
    instructions: [
      "Forearms and toes on floor, body in a straight line.",
      "Brace abs and glutes; don't let hips sag or pike.",
      "Breathe steadily while holding position.",
    ],
    tips: [
      "Pull elbows toward toes to increase tension.",
      "Progress to RKC plank by tensing entire body harder.",
    ],
    commonMistakes: [
      "Hips sagging toward the floor.",
      "Holding breath and getting dizzy.",
    ],
  },
  {
    name: "Hanging Leg Raise",
    category: "Core",
    muscleGroups: ["Abs"],
    difficulty: "Intermediate",
    equipment: ["Pull-up Bar"],
    instructions: [
      "Hang from bar with shoulders engaged.",
      "Raise legs by curling pelvis—knees to chest or legs straight.",
      "Lower without swinging.",
    ],
    tips: [
      "Posterior pelvic tilt at top maximizes lower ab work.",
      "Bent knees regress difficulty.",
    ],
    commonMistakes: [
      "Swinging using hip flexors only.",
      "Only lifting knees without posterior tilt.",
    ],
  },
  {
    name: "Cable Crunch",
    category: "Core",
    muscleGroups: ["Abs"],
    difficulty: "Beginner",
    equipment: ["Cable Machine", "Rope"],
    instructions: [
      "Kneel facing high pulley, rope behind head.",
      "Crunch down by flexing spine, not just hinging at hips.",
      "Return with control.",
    ],
    tips: [
      "Hold contraction 1 second.",
      "Load progressively like any muscle group.",
    ],
    commonMistakes: [
      "Hip hinging only—arms stay static while hips move.",
      "Pulling with arms instead of abs.",
    ],
  },
  {
    name: "Russian Twist",
    category: "Core",
    muscleGroups: ["Obliques", "Abs"],
    difficulty: "Beginner",
    equipment: ["Medicine Ball", "Bodyweight"],
    instructions: [
      "Seated, torso leaned back, feet lifted or anchored.",
      "Rotate torso side to side touching weight to floor.",
      "Keep chest up and movement from the ribs, not arms only.",
    ],
    tips: [
      "Feet on floor to regress; add weight to progress.",
      "Exhale on each twist.",
    ],
    commonMistakes: [
      "Rotating only arms without thoracic movement.",
      "Rounding lower back excessively.",
    ],
  },
  {
    name: "Ab Wheel Rollout",
    category: "Core",
    muscleGroups: ["Abs", "Lower Back"],
    difficulty: "Advanced",
    equipment: ["Ab Wheel"],
    instructions: [
      "Kneel gripping wheel, roll forward extending body.",
      "Stop before lower back arches; pull back with abs.",
      "Keep core braced entire rep.",
    ],
    tips: [
      "Start from wall to limit range.",
      "Standing rollouts are elite progression.",
    ],
    commonMistakes: [
      "Leading with hips and sagging lumbar spine.",
      "Short range not challenging the abs.",
    ],
  },
  {
    name: "Dead Bug",
    category: "Core",
    muscleGroups: ["Abs", "Lower Back"],
    difficulty: "Beginner",
    equipment: ["Bodyweight"],
    instructions: [
      "Lie on back, arms up, knees at 90°.",
      "Extend opposite arm and leg while pressing low back to floor.",
      "Return and alternate sides.",
    ],
    tips: [
      "Exhale as limbs extend—great for bracing practice.",
      "Move slowly; quality over speed.",
    ],
    commonMistakes: [
      "Lower back arching off the floor.",
      "Rushing and losing coordination.",
    ],
  },
  {
    name: "Side Plank",
    category: "Core",
    muscleGroups: ["Obliques", "Abs"],
    difficulty: "Beginner",
    equipment: ["Bodyweight"],
    instructions: [
      "Forearm on floor, body stacked feet to shoulders.",
      "Lift hips to a straight line, top arm on hip or raised.",
      "Hold without letting hips drop.",
    ],
    tips: [
      "Squeeze glutes for stability.",
      "Add hip dips or top-leg raise to progress.",
    ],
    commonMistakes: [
      "Rotating chest toward floor.",
      "Hips sagging toward ground.",
    ],
  },
  {
    name: "Bicycle Crunch",
    category: "Core",
    muscleGroups: ["Abs", "Obliques"],
    difficulty: "Beginner",
    equipment: ["Bodyweight"],
    instructions: [
      "Lie on back, hands behind head lightly.",
      "Bring opposite elbow toward knee while extending other leg.",
      "Alternate in a controlled pedaling motion.",
    ],
    tips: [
      "Focus on rotation, not pulling the neck.",
      "Slow reps beat fast sloppy ones.",
    ],
    commonMistakes: [
      "Yanking on the neck.",
      "Only moving elbows without rib rotation.",
    ],
  },
  {
    name: "Pallof Press",
    category: "Core",
    muscleGroups: ["Obliques", "Abs"],
    difficulty: "Beginner",
    equipment: ["Cable Machine", "Band"],
    instructions: [
      "Stand sideways to cable at chest height, hold handle at chest.",
      "Press arms straight out resisting rotation.",
      "Hold extended position, return to chest.",
    ],
    tips: [
      "Anti-rotation gold standard for athletic core.",
      "Use bands when traveling.",
    ],
    commonMistakes: [
      "Allowing torso to rotate toward the stack.",
      "Shrugging shoulders during the press.",
    ],
  },
  {
    name: "Mountain Climber",
    category: "Core",
    muscleGroups: ["Abs", "Obliques"],
    difficulty: "Beginner",
    equipment: ["Bodyweight"],
    instructions: [
      "High plank position, drive knees toward chest alternately.",
      "Keep shoulders over wrists and hips level.",
      "Increase speed for conditioning or slow for control.",
    ],
    tips: [
      "Cross-body knee drives hit obliques more.",
      "Great finisher in circuits.",
    ],
    commonMistakes: [
      "Hips bouncing up and down.",
      "Hands creeping forward out of alignment.",
    ],
  },
];

export const coreExercises = defs.map(buildExercise);
