import { buildExercise, type ExerciseDef } from "../build";

const defs: ExerciseDef[] = [
  {
    name: "Barbell Curl",
    category: "Arms",
    muscleGroups: ["Biceps"],
    difficulty: "Beginner",
    equipment: ["Barbell"],
    instructions: [
      "Stand with shoulder-width grip, elbows at your sides.",
      "Curl the bar up without moving elbows forward.",
      "Squeeze at the top, lower for a full extension.",
    ],
    tips: [
      "Keep wrists straight—don't curl with the wrists.",
      "Slight forward lean can prevent cheating at strict form limits.",
    ],
    commonMistakes: [
      "Swinging hips and back to start the rep.",
      "Cutting range short at the bottom.",
    ],
  },
  {
    name: "Dumbbell Bicep Curl",
    category: "Arms",
    muscleGroups: ["Biceps"],
    difficulty: "Beginner",
    equipment: ["Dumbbells"],
    instructions: [
      "Stand or sit, dumbbells at sides, palms forward.",
      "Curl one or both arms keeping elbows pinned.",
      "Rotate palms up through the rep if using supination.",
    ],
    tips: [
      "Alternate arms for longer set density.",
      "Incline curls stretch the long head more.",
    ],
    commonMistakes: [
      "Elbows drifting forward away from the torso.",
      "Using shoulders to lift the weight.",
    ],
  },
  {
    name: "Hammer Curl",
    category: "Arms",
    muscleGroups: ["Biceps"],
    difficulty: "Beginner",
    equipment: ["Dumbbells"],
    instructions: [
      "Neutral grip (palms facing each other) at your sides.",
      "Curl up keeping palms facing in.",
      "Lower under control.",
    ],
    tips: [
      "Targets brachialis and forearms for arm thickness.",
      "Can be done across-body for variety.",
    ],
    commonMistakes: [
      "Rotating into a standard curl mid-rep unintentionally.",
      "Rocking the torso.",
    ],
  },
  {
    name: "Preacher Curl",
    category: "Arms",
    muscleGroups: ["Biceps"],
    difficulty: "Intermediate",
    equipment: ["Preacher Bench", "EZ Bar", "Dumbbell"],
    instructions: [
      "Sit at preacher bench, upper arms flat on the pad.",
      "Curl weight up, squeeze biceps at the top.",
      "Lower until elbows are nearly extended—not hyperextended.",
    ],
    tips: [
      "Eliminates momentum—strict isolation.",
      "EZ bar reduces wrist strain.",
    ],
    commonMistakes: [
      "Hyperextending elbows hard into the pad at the bottom.",
      "Lifting elbows off the pad.",
    ],
  },
  {
    name: "Concentration Curl",
    category: "Arms",
    muscleGroups: ["Biceps"],
    difficulty: "Beginner",
    equipment: ["Dumbbell"],
    instructions: [
      "Seated, elbow braced inside knee, arm hanging.",
      "Curl dumbbell toward shoulder without moving elbow.",
      "Lower slowly to full stretch.",
    ],
    tips: [
      "Peak contraction focus—light weight, high quality.",
      "Squeeze 1 second at the top.",
    ],
    commonMistakes: [
      "Swinging the dumbbell from the shoulder.",
      "Rushing the negative.",
    ],
  },
  {
    name: "Cable Curl",
    category: "Arms",
    muscleGroups: ["Biceps"],
    difficulty: "Beginner",
    equipment: ["Cable Machine"],
    instructions: [
      "Low pulley with straight or EZ attachment.",
      "Curl toward shoulders keeping elbows back.",
      "Control the return—don't let stack pull you.",
    ],
    tips: [
      "Constant tension through the range.",
      "Face-away curls change the strength curve.",
    ],
    commonMistakes: [
      "Stepping too far from stack and losing tension.",
      "Incomplete extension.",
    ],
  },
  {
    name: "Close-Grip Bench Press",
    category: "Arms",
    muscleGroups: ["Triceps", "Pectorals"],
    difficulty: "Intermediate",
    equipment: ["Barbell", "Bench"],
    instructions: [
      "Grip inside shoulder width on flat bench.",
      "Lower bar to lower chest with elbows tucked.",
      "Press up focusing on triceps extension.",
    ],
    tips: [
      "One of the best mass builders for triceps.",
      "Wrists straight—don't cock them back.",
    ],
    commonMistakes: [
      "Grip too narrow causing wrist pain.",
      "Flaring elbows wide like a standard bench.",
    ],
  },
  {
    name: "Triceps Pushdown",
    category: "Arms",
    muscleGroups: ["Triceps"],
    difficulty: "Beginner",
    equipment: ["Cable Machine"],
    instructions: [
      "High pulley, elbows at sides, slight forward lean.",
      "Extend arms down until fully straight.",
      "Return until forearms are about 90°—don't let elbows drift.",
    ],
    tips: [
      "Try rope, straight bar, and v-bar for comfort.",
      "Spread rope at the bottom for extra contraction.",
    ],
    commonMistakes: [
      "Moving elbows forward and turning it into a press.",
      "Using whole-body lean to move weight.",
    ],
  },
  {
    name: "Skull Crusher",
    category: "Arms",
    muscleGroups: ["Triceps"],
    difficulty: "Intermediate",
    equipment: ["EZ Bar", "Bench"],
    instructions: [
      "Lie on bench, arms vertical, lower bar toward forehead by bending elbows.",
      "Keep upper arms stationary.",
      "Extend elbows to return to vertical.",
    ],
    tips: [
      "Angle arms slightly back toward head to protect elbows.",
      "Use moderate weight—joint stress adds up.",
    ],
    commonMistakes: [
      "Elbows flaring wide and shifting load to shoulders.",
      "Lowering bar behind head with loose upper arms.",
    ],
  },
  {
    name: "Overhead Triceps Extension",
    category: "Arms",
    muscleGroups: ["Triceps"],
    difficulty: "Beginner",
    equipment: ["Dumbbell", "Cable"],
    instructions: [
      "Hold dumbbell overhead with both hands or one arm.",
      "Lower behind head by bending elbows.",
      "Extend back up without arching the lower back.",
    ],
    tips: [
      "Seated version reduces cheating.",
      "Stretches the long head of the triceps.",
    ],
    commonMistakes: [
      "Excessive lumbar arch in standing version.",
      "Flaring elbows out to the sides.",
    ],
  },
  {
    name: "Dips (Triceps Focus)",
    category: "Arms",
    muscleGroups: ["Triceps", "Pectorals", "Deltoids"],
    difficulty: "Intermediate",
    equipment: ["Dip Bars"],
    instructions: [
      "Upright torso on parallel bars, elbows close.",
      "Lower until upper arms are parallel to the floor.",
      "Press up by extending elbows, minimal forward lean.",
    ],
    tips: [
      "Stay vertical to emphasize triceps over chest.",
      "Add weight when bodyweight exceeds ~12 clean reps.",
    ],
    commonMistakes: [
      "Leaning forward too much (chest dip).",
      "Shoulders rolling forward at the bottom.",
    ],
  },
  {
    name: "Diamond Push-Up",
    category: "Arms",
    muscleGroups: ["Triceps", "Pectorals"],
    difficulty: "Intermediate",
    equipment: ["Bodyweight"],
    instructions: [
      "Hands close together under chest forming a diamond shape.",
      "Lower chest toward hands keeping elbows tight.",
      "Press back to plank position.",
    ],
    tips: [
      "Scale by elevating hands or doing knee variations.",
      "Keep core tight—same as standard push-up.",
    ],
    commonMistakes: [
      "Elbows flaring out wide.",
      "Hips sagging during the set.",
    ],
  },
  {
    name: "Wrist Curl",
    category: "Arms",
    muscleGroups: ["Biceps"],
    difficulty: "Beginner",
    equipment: ["Dumbbell", "Barbell"],
    instructions: [
      "Forearms on thighs, wrists hanging past knees, palms up.",
      "Curl knuckles toward ceiling through wrist flexion.",
      "Lower for a full stretch.",
    ],
    tips: [
      "High reps (15–20) build forearm endurance.",
      "Pair with reverse wrist curls for balance.",
    ],
    commonMistakes: [
      "Using whole arm movement instead of wrists.",
      "Going too heavy and cramping.",
    ],
  },
];

export const armExercises = defs.map(buildExercise);
