import { buildExercise, type ExerciseDef } from "../build";

const defs: ExerciseDef[] = [
  {
    name: "Conventional Deadlift",
    category: "Back",
    muscleGroups: ["Lower Back", "Glutes", "Hamstrings", "Traps", "Lats"],
    difficulty: "Advanced",
    equipment: ["Barbell"],
    sets: 4,
    reps: "3-6",
    rest: "180s",
    instructions: [
      "Stand with mid-foot under the bar, feet hip-width.",
      "Hinge and grip just outside your legs; flatten your back and brace your core.",
      "Drive through the floor, keeping the bar close to your shins and thighs.",
      "Stand tall at lockout—hips and knees extend together without hyperextending.",
      "Lower by hinging hips back first, then bending knees once the bar passes them.",
    ],
    tips: [
      "Think 'push the floor away' rather than yanking with your back.",
      "Chalk or straps only when grip limits training, not as a crutch.",
    ],
    commonMistakes: [
      "Rounding the lower back under load.",
      "Bar drifting forward away from the body.",
      "Jerking the bar off the floor with hips shooting up first.",
    ],
  },
  {
    name: "Barbell Bent-Over Row",
    category: "Back",
    muscleGroups: ["Lats", "Rhomboids", "Traps", "Biceps"],
    difficulty: "Intermediate",
    equipment: ["Barbell"],
    instructions: [
      "Hinge to ~45° with a flat back and knees slightly bent.",
      "Grip shoulder-width, pull the bar to your lower ribs/upper abs.",
      "Squeeze shoulder blades together at the top.",
      "Lower with control without rounding the spine.",
    ],
    tips: [
      "Keep elbows close for lat emphasis; flare slightly for upper back.",
      "Brace like a deadlift—core stiffness protects the lower back.",
    ],
    commonMistakes: [
      "Using momentum and standing up between reps.",
      "Pulling with arms only—initiate from the back.",
    ],
  },
  {
    name: "Pendlay Row",
    category: "Back",
    muscleGroups: ["Lats", "Rhomboids", "Traps"],
    difficulty: "Advanced",
    equipment: ["Barbell"],
    instructions: [
      "Start with the bar on the floor each rep, torso parallel to the floor.",
      "Explosively row to the lower chest and return the bar to the floor.",
      "Reset your brace between reps.",
    ],
    tips: [
      "Strict form builds power off the floor for Olympic lifters and rowers.",
      "Use straps if grip fails before back does.",
    ],
    commonMistakes: [
      "Torso angle creeping up during the set.",
      "Bouncing the bar instead of a dead stop.",
    ],
  },
  {
    name: "Single-Arm Dumbbell Row",
    category: "Back",
    muscleGroups: ["Lats", "Rhomboids", "Biceps"],
    difficulty: "Beginner",
    equipment: ["Dumbbell", "Bench"],
    instructions: [
      "One knee and hand on a bench, back flat, dumbbell hanging straight down.",
      "Row the dumbbell to your hip pocket, elbow close to your side.",
      "Lower fully for a lat stretch without rotating your torso.",
    ],
    tips: [
      "Imagine pulling with your elbow, not your hand.",
      "Keep hips square—don't twist for extra range.",
    ],
    commonMistakes: [
      "Jerking the weight with a rotating torso.",
      "Shrugging the shoulder instead of depressing it at the top.",
    ],
  },
  {
    name: "T-Bar Row",
    category: "Back",
    muscleGroups: ["Lats", "Rhomboids", "Traps"],
    difficulty: "Intermediate",
    equipment: ["T-Bar Row Machine", "Barbell"],
    instructions: [
      "Straddle the bar or use a landmine row setup with a handle.",
      "Hinge chest up slightly, pull handle to your sternum.",
      "Squeeze lats and mid-back at the top.",
      "Lower under control.",
    ],
    tips: [
      "Chest-supported versions reduce lower-back fatigue.",
      "Use a v-handle or wide grip to vary emphasis.",
    ],
    commonMistakes: [
      "Standing too upright and turning it into a shrug.",
      "Short range of motion at the top.",
    ],
  },
  {
    name: "Seated Cable Row",
    category: "Back",
    muscleGroups: ["Rhomboids", "Lats", "Traps", "Biceps"],
    difficulty: "Beginner",
    equipment: ["Cable Machine"],
    instructions: [
      "Sit with feet on platform, slight knee bend, neutral spine.",
      "Pull handle to your lower ribs while squeezing shoulder blades.",
      "Extend arms forward without rounding the lower back.",
    ],
    tips: [
      "Pause 1 second at peak contraction for hypertrophy.",
      "Try wide vs close grips to shift upper vs mid-back focus.",
    ],
    commonMistakes: [
      "Leaning far back and using body swing.",
      "Shrugging at the finish instead of scapular retraction.",
    ],
  },
  {
    name: "Lat Pulldown",
    category: "Back",
    muscleGroups: ["Lats", "Biceps"],
    difficulty: "Beginner",
    equipment: ["Cable Machine"],
    instructions: [
      "Grip bar wider than shoulders, thighs secured under pads.",
      "Pull the bar to upper chest by driving elbows down and back.",
      "Control the ascent until arms are nearly straight.",
    ],
    tips: [
      "Lean back slightly (~15°) for a strong lat line of pull.",
      "Underhand grip adds biceps but still hits lats.",
    ],
    commonMistakes: [
      "Pulling behind the neck—prefer front pulldowns for safety.",
      "Using momentum and lifting off the seat.",
    ],
  },
  {
    name: "Pull-Up",
    category: "Back",
    muscleGroups: ["Lats", "Biceps", "Rhomboids"],
    difficulty: "Intermediate",
    equipment: ["Pull-up Bar"],
    instructions: [
      "Hang with arms extended, shoulders engaged (not fully relaxed).",
      "Pull chest toward the bar by driving elbows down.",
      "Chin clears the bar or chest touches depending on goal.",
      "Lower with control to full hang or just before dead hang.",
    ],
    tips: [
      "Use bands or negatives to build toward full reps.",
      "Squeeze glutes lightly to reduce swinging.",
    ],
    commonMistakes: [
      "Kipping excessively when training for strength.",
      "Half reps without full extension at the bottom.",
    ],
  },
  {
    name: "Chin-Up",
    category: "Back",
    muscleGroups: ["Lats", "Biceps"],
    difficulty: "Intermediate",
    equipment: ["Pull-up Bar"],
    instructions: [
      "Supinated (palms facing you) grip at shoulder width.",
      "Pull until chin is over the bar, elbows tracking down.",
      "Lower slowly to a dead hang.",
    ],
    tips: [
      "Often easier than pull-ups for beginners due to biceps help.",
      "Keep ribs down—don't over-arch at the top.",
    ],
    commonMistakes: [
      "Incomplete range at the bottom.",
      "Craning neck forward instead of clearing with the chin.",
    ],
  },
  {
    name: "Face Pull",
    category: "Back",
    muscleGroups: ["Rhomboids", "Traps", "Deltoids"],
    difficulty: "Beginner",
    equipment: ["Cable Machine", "Rope Attachment"],
    instructions: [
      "Set cable at face height with a rope attachment.",
      "Pull rope toward your face, elbows high and wide.",
      "Externally rotate at the end—hands beside ears.",
      "Return with control.",
    ],
    tips: [
      "Use light weight and high reps for shoulder health.",
      "Great between pressing days for posture.",
    ],
    commonMistakes: [
      "Pulling too low toward the chest.",
      "Using heavy weight and losing external rotation.",
    ],
  },
  {
    name: "Barbell Shrug",
    category: "Back",
    muscleGroups: ["Traps"],
    difficulty: "Beginner",
    equipment: ["Barbell", "Dumbbells"],
    instructions: [
      "Hold weight at your sides or in front with straight arms.",
      "Elevate shoulders straight up toward ears.",
      "Pause at the top, lower without rolling shoulders.",
    ],
    tips: [
      "Rolling shrugs don't add benefit and can irritate shoulders.",
      "Hold peak contraction 1–2 seconds for hypertrophy.",
    ],
    commonMistakes: [
      "Bending elbows and turning it into a partial row.",
      "Using momentum from the legs.",
    ],
  },
  {
    name: "Back Extension",
    category: "Back",
    muscleGroups: ["Lower Back", "Glutes", "Hamstrings"],
    difficulty: "Beginner",
    equipment: ["Hyperextension Bench"],
    instructions: [
      "Position hips on the pad, ankles secured, torso free to hinge.",
      "Fold at the hips lowering torso toward the floor.",
      "Raise until body is in line with legs—avoid hyperextending.",
    ],
    tips: [
      "Hold a plate to progress; squeeze glutes at the top.",
      "Keep neck neutral with the spine.",
    ],
    commonMistakes: [
      "Hyperextending past a straight line at the top.",
      "Using a fast bounce at the bottom.",
    ],
  },
  {
    name: "Chest-Supported Row",
    category: "Back",
    muscleGroups: ["Rhomboids", "Lats", "Traps"],
    difficulty: "Beginner",
    equipment: ["Incline Bench", "Dumbbells"],
    instructions: [
      "Set bench to ~30–45° and lie chest-down with dumbbells hanging.",
      "Row weights to your sides, squeezing shoulder blades.",
      "Lower until arms are extended without losing chest contact.",
    ],
    tips: [
      "Eliminates cheating—pure back isolation.",
      "Palms face each other or forward based on comfort.",
    ],
    commonMistakes: [
      "Lifting chest off the pad to shorten range.",
      "Dropping head and losing neck alignment.",
    ],
  },
  {
    name: "Straight-Arm Pulldown",
    category: "Back",
    muscleGroups: ["Lats"],
    difficulty: "Beginner",
    equipment: ["Cable Machine"],
    instructions: [
      "Stand facing a high pulley, arms straight, slight forward lean.",
      "Pull the bar down in an arc to your thighs using lats only.",
      "Keep elbows locked; return slowly overhead.",
    ],
    tips: [
      "Excellent lat isolation before or after compounds.",
      "Think 'show your armpits to the mirror' at the bottom.",
    ],
    commonMistakes: [
      "Bending elbows and turning it into a triceps pushdown.",
      "Using hip drive to move the weight.",
    ],
  },
];

export const backExercises = defs.map(buildExercise);
