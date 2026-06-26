import { buildExercise, type ExerciseDef } from "../build";

const defs: ExerciseDef[] = [
  {
    name: "Standing Hamstring Stretch",
    category: "Flexibility",
    muscleGroups: ["Hamstrings"],
    difficulty: "Beginner",
    equipment: ["Bodyweight"],
    instructions: [
      "Place one heel on a low box or step, toes up.",
      "Hinge forward from hips with flat back until hamstring stretches.",
      "Hold 30–45 seconds, breathe slowly, switch legs.",
    ],
    tips: [
      "Flex toes toward shin to increase stretch.",
      "Don't round back to reach farther—hinge instead.",
    ],
    commonMistakes: [
      "Bouncing aggressively at end range.",
      "Locking the standing knee hyperextended.",
    ],
  },
  {
    name: "Hip Flexor Stretch",
    category: "Flexibility",
    muscleGroups: ["Quadriceps", "Glutes"],
    difficulty: "Beginner",
    equipment: ["Bodyweight"],
    instructions: [
      "Half-kneel, rear knee down, front foot flat.",
      "Tuck pelvis under and lean forward gently.",
      "Raise same-side arm overhead for extra length.",
      "Hold 30+ seconds per side.",
    ],
    tips: [
      "Squeeze glute on back leg to open hip flexors.",
      "Daily practice offsets sitting posture.",
    ],
    commonMistakes: [
      "Arching lower back instead of posterior pelvic tilt.",
      "Front knee passing far over toes with pain.",
    ],
  },
  {
    name: "Child's Pose",
    category: "Flexibility",
    muscleGroups: ["Lower Back", "Lats"],
    difficulty: "Beginner",
    equipment: ["Bodyweight", "Yoga Mat"],
    instructions: [
      "Kneel, sit hips toward heels, arms extended forward.",
      "Forehead toward floor, breathe into back and sides.",
      "Walk hands to each side for lat stretch variation.",
    ],
    tips: [
      "Use between sets or post-workout to down-regulate.",
      "Widen knees for deeper hip opening if comfortable.",
    ],
    commonMistakes: [
      "Forcing hips down with knee pain—use padding.",
      "Holding breath instead of slow exhales.",
    ],
  },
  {
    name: "Cat-Cow",
    category: "Flexibility",
    muscleGroups: ["Lower Back", "Abs"],
    difficulty: "Beginner",
    equipment: ["Bodyweight", "Yoga Mat"],
    instructions: [
      "On all fours, inhale arch back (cow), lift chest and tailbone.",
      "Exhale round spine (cat), tuck chin and pelvis.",
      "Flow slowly for 8–12 cycles.",
    ],
    tips: [
      "Mobilizes spine before lifting sessions.",
      "Move each vertebra segmentally if possible.",
    ],
    commonMistakes: [
      "Rushing through reps without breathing.",
      "Collapsing shoulders in cow pose.",
    ],
  },
  {
    name: "Doorway Chest Stretch",
    category: "Flexibility",
    muscleGroups: ["Pectorals", "Deltoids"],
    difficulty: "Beginner",
    equipment: ["Bodyweight"],
    instructions: [
      "Forearm on door frame at 90°, step through gently.",
      "Feel stretch across chest and front shoulder.",
      "Hold 30 seconds, try high and low arm angles.",
    ],
    tips: [
      "Great after bench-heavy days for posture.",
      "Keep shoulder blade slightly engaged.",
    ],
    commonMistakes: [
      "Twisting torso excessively for fake range.",
      "Shrugging shoulder up into neck.",
    ],
  },
  {
    name: "Pigeon Pose",
    category: "Flexibility",
    muscleGroups: ["Glutes", "Hamstrings"],
    difficulty: "Intermediate",
    equipment: ["Yoga Mat"],
    instructions: [
      "From plank, bring front shin across mat, back leg extended.",
      "Square hips forward, fold over front leg if comfortable.",
      "Hold 45–60 seconds per side.",
    ],
    tips: [
      "Use blocks under front hip if hips are uneven.",
      "Figure-4 stretch on back is a regression.",
    ],
    commonMistakes: [
      "Forcing front shin parallel when hips aren't ready.",
      "Collapsing onto bent knee ligaments.",
    ],
  },
  {
    name: "World's Greatest Stretch",
    category: "Flexibility",
    muscleGroups: ["Hamstrings", "Glutes", "Obliques"],
    difficulty: "Beginner",
    equipment: ["Bodyweight"],
    instructions: [
      "Lunge forward, place opposite hand inside foot.",
      "Rotate and reach same-side arm to ceiling.",
      "Straighten front leg for hamstring moment, repeat flow.",
    ],
    tips: [
      "Ideal dynamic warm-up before leg days.",
      "Move slowly—2–3 reps per side.",
    ],
    commonMistakes: [
      "Front knee caving inward during lunge.",
      "Skipping the rotation and only doing a lunge.",
    ],
  },
];

export const flexibilityExercises = defs.map(buildExercise);
