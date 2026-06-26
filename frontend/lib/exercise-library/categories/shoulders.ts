import { buildExercise, type ExerciseDef } from "../build";

const defs: ExerciseDef[] = [
  {
    name: "Overhead Barbell Press",
    category: "Shoulders",
    muscleGroups: ["Deltoids", "Triceps", "Traps"],
    difficulty: "Intermediate",
    equipment: ["Barbell", "Rack"],
    instructions: [
      "Bar at collarbone height, grip just outside shoulders.",
      "Brace core and glutes; press bar straight up, moving head back slightly.",
      "Lock out overhead with biceps near ears.",
      "Lower to clavicle under control.",
    ],
    tips: [
      "Squeeze glutes to avoid excessive lower-back arch.",
      "Push your head through the window at the top for a vertical bar path.",
    ],
    commonMistakes: [
      "Pressing in front of the body in a J-curve that stresses shoulders.",
      "Overarching the lumbar spine under heavy loads.",
    ],
  },
  {
    name: "Dumbbell Shoulder Press",
    category: "Shoulders",
    muscleGroups: ["Deltoids", "Triceps"],
    difficulty: "Beginner",
    equipment: ["Dumbbells", "Bench"],
    instructions: [
      "Seated or standing, dumbbells at shoulder height, palms forward.",
      "Press up until arms extend without banging dumbbells.",
      "Lower to ear level or slightly below.",
    ],
    tips: [
      "Seated removes leg drive; standing allows more weight with core work.",
      "Neutral grip (palms in) can feel easier on shoulders.",
    ],
    commonMistakes: [
      "Pressing too far forward—bar path should stay over mid-foot when standing.",
      "Incomplete range at the bottom.",
    ],
  },
  {
    name: "Arnold Press",
    category: "Shoulders",
    muscleGroups: ["Deltoids", "Triceps"],
    difficulty: "Intermediate",
    equipment: ["Dumbbells"],
    instructions: [
      "Start with palms facing you at chin height.",
      "Rotate palms forward as you press overhead.",
      "Reverse the rotation on the way down.",
    ],
    tips: [
      "Longer time under tension—use moderate weight.",
      "Control the rotation—don't whip the wrists.",
    ],
    commonMistakes: [
      "Going too heavy and losing rotation control.",
      "Shrugging traps at lockout.",
    ],
  },
  {
    name: "Lateral Raise",
    category: "Shoulders",
    muscleGroups: ["Deltoids"],
    difficulty: "Beginner",
    equipment: ["Dumbbells", "Cable"],
    instructions: [
      "Stand with dumbbells at sides, slight elbow bend.",
      "Raise arms out to the sides until parallel to the floor.",
      "Lead with elbows, pinkies slightly higher than thumbs.",
      "Lower slowly without swinging.",
    ],
    tips: [
      "Lean slightly forward for more medial delt stimulus.",
      "Use 2–3 second negatives for growth with light weight.",
    ],
    commonMistakes: [
      "Shrugging weight up with traps.",
      "Raising above shoulder height without benefit.",
    ],
  },
  {
    name: "Front Raise",
    category: "Shoulders",
    muscleGroups: ["Deltoids"],
    difficulty: "Beginner",
    equipment: ["Dumbbells", "Plate"],
    instructions: [
      "Hold weight in front of thighs with straight arms.",
      "Raise to shoulder height in front of the body.",
      "Lower with control—alternate arms or both together.",
    ],
    tips: [
      "Often redundant if you press frequently—use as accessory volume.",
      "Keep torso still; no rocking.",
    ],
    commonMistakes: [
      "Using momentum from the hips.",
      "Raising above 90° and stressing the joint.",
    ],
  },
  {
    name: "Reverse Fly",
    category: "Shoulders",
    muscleGroups: ["Deltoids", "Rhomboids"],
    difficulty: "Beginner",
    equipment: ["Dumbbells", "Cable", "Machine"],
    instructions: [
      "Hinge forward with flat back, arms hanging.",
      "Raise arms out to the sides squeezing rear delts.",
      "Pause at the top, lower slowly.",
    ],
    tips: [
      "Critical for balanced shoulders and posture.",
      "Use cables for constant tension.",
    ],
    commonMistakes: [
      "Bending elbows too much into a row pattern.",
      "Standing upright and losing rear-delt isolation.",
    ],
  },
  {
    name: "Upright Row",
    category: "Shoulders",
    muscleGroups: ["Deltoids", "Traps"],
    difficulty: "Intermediate",
    equipment: ["Barbell", "Dumbbells", "Cable"],
    instructions: [
      "Grip inside shoulder width on a bar at thighs.",
      "Pull elbows up and out until upper arms are parallel to the floor.",
      "Lower under control.",
    ],
    tips: [
      "Wide grip may reduce impingement risk for some lifters.",
      "Stop at parallel if shoulders feel pinchy.",
    ],
    commonMistakes: [
      "Pulling elbows above shoulders with heavy weight.",
      "Shrugging excessively at the top.",
    ],
  },
  {
    name: "Cable Lateral Raise",
    category: "Shoulders",
    muscleGroups: ["Deltoids"],
    difficulty: "Beginner",
    equipment: ["Cable Machine"],
    instructions: [
      "Stand sideways to a low pulley, handle in outside hand.",
      "Raise arm to shoulder height across your body line.",
      "Lower with constant cable tension.",
    ],
    tips: [
      "Tension at the bottom where dumbbells feel easy.",
      "Great drop-set finisher.",
    ],
    commonMistakes: [
      "Rotating torso to cheat the weight up.",
      "Setting pulley too high and changing the angle.",
    ],
  },
  {
    name: "Machine Shoulder Press",
    category: "Shoulders",
    muscleGroups: ["Deltoids", "Triceps"],
    difficulty: "Beginner",
    equipment: ["Shoulder Press Machine"],
    instructions: [
      "Adjust seat so handles start near shoulder height.",
      "Press overhead without locking out violently.",
      "Return until elbows are at ~90°.",
    ],
    tips: [
      "Stable path for beginners or high-rep burnout sets.",
      "Keep lower back against pad.",
    ],
    commonMistakes: [
      "Seat too low causing shoulder pain.",
      "Partial reps at the top.",
    ],
  },
  {
    name: "Landmine Shoulder Press",
    category: "Shoulders",
    muscleGroups: ["Deltoids", "Triceps"],
    difficulty: "Intermediate",
    equipment: ["Barbell", "Landmine"],
    instructions: [
      "Half-kneel or stand holding the end of the bar at shoulder.",
      "Press up and slightly forward following the landmine arc.",
      "Lower to shoulder with control.",
    ],
    tips: [
      "Joint-friendly angle for those who struggle with strict OHP.",
      "Single-arm version trains anti-lateral flexion.",
    ],
    commonMistakes: [
      "Excessive back lean in standing version.",
      "Rushing the eccentric.",
    ],
  },
];

export const shoulderExercises = defs.map(buildExercise);
