import { buildExercise, type ExerciseDef } from "../build";

const defs: ExerciseDef[] = [
  {
    name: "Clean and Press",
    category: "Full Body",
    muscleGroups: ["Quadriceps", "Glutes", "Deltoids", "Traps"],
    difficulty: "Advanced",
    equipment: ["Barbell", "Dumbbells"],
    instructions: [
      "Start like a deadlift, explosively extend hips to pull weight to shoulders.",
      "Catch in front rack with elbows high.",
      "Press overhead to lockout.",
      "Lower bar to floor or hang position between reps as appropriate.",
    ],
    tips: [
      "Learn power clean before adding the press.",
      "Use bumpers and proper platform for drops.",
    ],
    commonMistakes: [
      "Arm pulling before hip extension.",
      "Pressing with elbows low in a risky front rack.",
    ],
  },
  {
    name: "Kettlebell Swing",
    category: "Full Body",
    muscleGroups: ["Glutes", "Hamstrings", "Lower Back"],
    difficulty: "Intermediate",
    equipment: ["Kettlebell"],
    instructions: [
      "Hinge with kettlebell between legs, flat back.",
      "Snap hips forward to float bell to chest height (Russian swing).",
      "Let bell fall back into hinge—arms stay relaxed.",
    ],
    tips: [
      "Power is from hips, not a front raise with shoulders.",
      "American swings overhead require more shoulder mobility.",
    ],
    commonMistakes: [
      "Squatting the bell up instead of hinging.",
      "Hyperextending back at the top.",
    ],
  },
  {
    name: "Thruster",
    category: "Full Body",
    muscleGroups: ["Quadriceps", "Glutes", "Deltoids"],
    difficulty: "Intermediate",
    equipment: ["Barbell", "Dumbbells"],
    instructions: [
      "Front rack position, squat to depth.",
      "Drive up and use leg momentum to press weight overhead.",
      "Lower to rack and repeat fluidly.",
    ],
    tips: [
      "One continuous motion—don't pause between squat and press.",
      "Popular in CrossFit and conditioning blocks.",
    ],
    commonMistakes: [
      "Pressing too early before legs extend.",
      "Losing front rack and dumping weight forward.",
    ],
  },
  {
    name: "Farmer's Walk",
    category: "Full Body",
    muscleGroups: ["Traps", "Biceps", "Abs"],
    difficulty: "Beginner",
    equipment: ["Dumbbells", "Trap Bar"],
    instructions: [
      "Pick up heavy weights at your sides with packed shoulders.",
      "Walk tall with short quick steps for distance or time.",
      "Set down with a hip hinge, not rounded back.",
    ],
    tips: [
      "Grip often fails first—builds real-world strength.",
      "Keep ribs stacked over pelvis.",
    ],
    commonMistakes: [
      "Shrugging traps up to ears while walking.",
      "Leaning to one side with uneven loads.",
    ],
  },
  {
    name: "Turkish Get-Up",
    category: "Full Body",
    muscleGroups: ["Deltoids", "Abs", "Glutes"],
    difficulty: "Advanced",
    equipment: ["Kettlebell", "Dumbbell"],
    instructions: [
      "Lie holding weight overhead in one arm, same-side knee bent.",
      "Roll to elbow, then hand, bridge hips, sweep leg to kneel.",
      "Stand up keeping arm vertical, reverse steps to floor.",
    ],
    tips: [
      "Learn unweighted pattern first—10 reps each side.",
      "Eyes on the bell throughout.",
    ],
    commonMistakes: [
      "Rushing steps and losing shoulder stability.",
      "Bent arm with heavy weight overhead.",
    ],
  },
  {
    name: "Medicine Ball Slam",
    category: "Full Body",
    muscleGroups: ["Abs", "Lats", "Deltoids"],
    difficulty: "Beginner",
    equipment: ["Medicine Ball"],
    instructions: [
      "Raise ball overhead, rise onto toes slightly.",
      "Slam ball down between feet by crunching abs and hinging.",
      "Pick up or catch rebound and repeat.",
    ],
    tips: [
      "Use rubber slam balls—not wall balls—for floor slams.",
      "Exhale hard on the slam.",
    ],
    commonMistakes: [
      "Rounding back only with arms, no core snap.",
      "Using balls that bounce into face on rebound.",
    ],
  },
  {
    name: "Man Maker",
    category: "Full Body",
    muscleGroups: ["Pectorals", "Deltoids", "Quadriceps", "Lats"],
    difficulty: "Advanced",
    equipment: ["Dumbbells"],
    instructions: [
      "Push-up on dumbbells, row each side, jump feet to hands.",
      "Clean dumbbells to shoulders, squat, then press overhead.",
      "Reverse or lower for next rep.",
    ],
    tips: [
      "Use lighter weight than you think—full-body fatigue adds up.",
      "Break into segments when learning the flow.",
    ],
    commonMistakes: [
      "Hips sagging during push-up phase.",
      "Rushing rows with torso rotation.",
    ],
  },
  {
    name: "Sled Push",
    category: "Full Body",
    muscleGroups: ["Quadriceps", "Glutes", "Calves"],
    difficulty: "Intermediate",
    equipment: ["Prowler Sled"],
    instructions: [
      "Lean into sled at ~45°, arms extended on handles.",
      "Drive through balls of feet with short powerful steps.",
      "Keep core tight for distance or timed sets.",
    ],
    tips: [
      "Low handles = more quad; high handles = more total body.",
      "Great finisher with low joint stress.",
    ],
    commonMistakes: [
      "Standing too upright and pushing with arms only.",
      "Heels dragging instead of driving forward.",
    ],
  },
];

export const fullBodyExercises = defs.map(buildExercise);
