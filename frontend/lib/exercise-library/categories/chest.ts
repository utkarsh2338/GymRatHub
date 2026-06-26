import { buildExercise, type ExerciseDef } from "../build";

const defs: ExerciseDef[] = [
  {
    name: "Barbell Bench Press",
    category: "Chest",
    muscleGroups: ["Pectorals", "Triceps", "Deltoids"],
    difficulty: "Intermediate",
    equipment: ["Barbell", "Bench", "Rack"],
    sets: 4,
    reps: "6-10",
    rest: "90-120s",
    instructions: [
      "Lie on a flat bench with eyes under the bar; feet flat and glutes on the bench.",
      "Grip slightly wider than shoulder-width, wrists stacked over elbows.",
      "Unrack, lower the bar to mid-chest with elbows at ~45° from your torso.",
      "Press up by driving through your chest while keeping shoulder blades pinched.",
      "Lock out without losing shoulder position or lifting your hips.",
    ],
    tips: [
      "Retract and depress your shoulder blades before unracking for a stable base.",
      "Keep a slight arch in the upper back; avoid lifting your glutes off the bench.",
      "Control the eccentric—2–3 seconds down builds strength and protects shoulders.",
    ],
    commonMistakes: [
      "Flaring elbows to 90° increases shoulder strain.",
      "Bouncing the bar off the chest instead of controlled touch.",
      "Feet off the floor or hips rising during the press.",
    ],
  },
  {
    name: "Incline Barbell Bench Press",
    category: "Chest",
    muscleGroups: ["Pectorals", "Deltoids", "Triceps"],
    difficulty: "Intermediate",
    equipment: ["Barbell", "Incline Bench", "Rack"],
    instructions: [
      "Set the bench to 30–45° and position yourself with eyes under the bar.",
      "Grip at shoulder width or slightly wider; pinch shoulder blades together.",
      "Lower the bar to the upper chest/clavicle area with controlled elbows.",
      "Press up and slightly back toward the rack path.",
      "Stop just short of lockout if you want more tension on the upper chest.",
    ],
    tips: [
      "A 30° incline emphasizes upper chest; steeper angles shift load to shoulders.",
      "Use a spotter or safeties when training heavy on incline.",
    ],
    commonMistakes: [
      "Setting the bench too steep turns it into a shoulder press.",
      "Lowering the bar to the belly instead of upper chest.",
      "Losing scapular retraction at the bottom.",
    ],
  },
  {
    name: "Decline Barbell Bench Press",
    category: "Chest",
    muscleGroups: ["Pectorals", "Triceps"],
    difficulty: "Intermediate",
    equipment: ["Barbell", "Decline Bench", "Rack"],
    instructions: [
      "Secure your legs in the decline pad; eyes under the bar.",
      "Grip slightly wider than shoulders and unrack with tight lats.",
      "Lower to the lower sternum with elbows at ~45°.",
      "Press up in a straight line over the lower chest.",
      "Re-rack carefully—have a spotter when fatigued.",
    ],
    tips: [
      "Great for emphasizing the lower pec fibers when flat bench stalls.",
      "Start lighter than flat bench until you learn the groove.",
    ],
    commonMistakes: [
      "Letting the bar drift toward the neck.",
      "Loosening leg hooks and sliding on the pad.",
    ],
  },
  {
    name: "Dumbbell Bench Press",
    category: "Chest",
    muscleGroups: ["Pectorals", "Triceps", "Deltoids"],
    difficulty: "Beginner",
    equipment: ["Dumbbells", "Bench"],
    instructions: [
      "Sit on the bench with dumbbells on thighs; kick up one at a time to shoulders.",
      "Lie back with dumbbells at chest level, palms forward or slightly angled.",
      "Press up until arms are extended without smashing dumbbells together.",
      "Lower with elbows at ~45° until upper arms are parallel to the floor.",
      "Repeat with equal range on both sides.",
    ],
    tips: [
      "Dumbbells allow a natural arc and fix left-right imbalances.",
      "Squeeze the chest at the top without excessive shoulder roll.",
    ],
    commonMistakes: [
      "Dropping elbows too low past the bench line.",
      "Using momentum from the legs to start the rep.",
    ],
  },
  {
    name: "Incline Dumbbell Press",
    category: "Chest",
    muscleGroups: ["Pectorals", "Deltoids"],
    difficulty: "Intermediate",
    equipment: ["Dumbbells", "Incline Bench"],
    instructions: [
      "Set bench to 30–45°; bring dumbbells to shoulder height.",
      "Press up and slightly inward over the upper chest.",
      "Lower until you feel a stretch in the upper pecs.",
      "Keep wrists neutral and core braced.",
    ],
    tips: [
      "Rotate palms slightly inward at the top for a stronger pec contraction.",
      "Use a controlled tempo—don't rush the bottom stretch.",
    ],
    commonMistakes: [
      "Arching the lower back excessively off the pad.",
      "Pressing too vertically and overloading the front delts.",
    ],
  },
  {
    name: "Dumbbell Fly",
    category: "Chest",
    muscleGroups: ["Pectorals"],
    difficulty: "Beginner",
    equipment: ["Dumbbells", "Bench"],
    instructions: [
      "Lie flat with dumbbells above the chest, slight bend in elbows.",
      "Open arms in a wide arc until you feel a chest stretch.",
      "Squeeze the pecs to bring dumbbells back together above the chest.",
      "Maintain the same elbow angle throughout—think hugging a barrel.",
    ],
    tips: [
      "Use lighter weight than pressing; this is an isolation movement.",
      "Stop when upper arms are parallel to the floor to protect shoulders.",
    ],
    commonMistakes: [
      "Bending and extending elbows—turning it into a press.",
      "Lowering weights too deep behind the shoulder line.",
    ],
  },
  {
    name: "Cable Crossover",
    category: "Chest",
    muscleGroups: ["Pectorals"],
    difficulty: "Beginner",
    equipment: ["Cable Machine"],
    instructions: [
      "Set pulleys slightly above shoulder height; grab handles and step forward.",
      "Lean slightly forward with a soft knee bend and braced core.",
      "Bring handles together in an arc in front of the chest.",
      "Control the return until you feel a stretch—don't let stacks slam.",
    ],
    tips: [
      "Squeeze for 1–2 seconds at peak contraction.",
      "Try high-to-low and low-to-high angles to hit different pec fibers.",
    ],
    commonMistakes: [
      "Using too much body swing and momentum.",
      "Shrugging shoulders up during the squeeze.",
    ],
  },
  {
    name: "Pec Deck Machine",
    category: "Chest",
    muscleGroups: ["Pectorals"],
    difficulty: "Beginner",
    equipment: ["Pec Deck Machine"],
    instructions: [
      "Adjust seat so handles are at mid-chest height.",
      "Place forearms on pads or grip handles with elbows at shoulder height.",
      "Bring pads together in front of the chest with a controlled squeeze.",
      "Return slowly until you feel a mild stretch.",
    ],
    tips: [
      "Ideal finisher after compound presses when fatigued.",
      "Keep shoulders down—don't elevate traps at the end range.",
    ],
    commonMistakes: [
      "Seat too high or low, shifting tension to shoulders.",
      "Rushing reps and losing tension at the stretch.",
    ],
  },
  {
    name: "Push-Up",
    category: "Chest",
    muscleGroups: ["Pectorals", "Triceps", "Deltoids"],
    difficulty: "Beginner",
    equipment: ["Bodyweight"],
    instructions: [
      "Hands slightly wider than shoulders, body in a straight line head to heels.",
      "Lower chest toward the floor keeping elbows at ~45°.",
      "Press back up without sagging hips or piking up.",
      "Breathe in on the way down, out on the press.",
    ],
    tips: [
      "Elevate hands to regress; elevate feet to progress difficulty.",
      "Grip the floor to engage lats and stabilize shoulders.",
    ],
    commonMistakes: [
      "Hips sagging or piking—breaks spinal alignment.",
      "Half reps without chest nearing the floor.",
    ],
  },
  {
    name: "Chest Dip",
    category: "Chest",
    muscleGroups: ["Pectorals", "Triceps", "Deltoids"],
    difficulty: "Intermediate",
    equipment: ["Dip Bars"],
    instructions: [
      "Mount parallel bars and lean torso forward ~20–30° for chest emphasis.",
      "Lower until upper arms are parallel to the floor or slightly below.",
      "Press up by driving through the hands and squeezing the chest.",
      "Keep shoulders down away from ears at the top.",
    ],
    tips: [
      "Wider grip and forward lean target chest; upright torso targets triceps.",
      "Add weight with a belt only when bodyweight reps are clean.",
    ],
    commonMistakes: [
      "Staying too upright and turning it into a triceps-only dip.",
      "Dropping shoulders into painful internal rotation at the bottom.",
    ],
  },
  {
    name: "Machine Chest Press",
    category: "Chest",
    muscleGroups: ["Pectorals", "Triceps"],
    difficulty: "Beginner",
    equipment: ["Chest Press Machine"],
    instructions: [
      "Adjust seat so handles align with mid-chest.",
      "Grip handles, feet flat, back against the pad.",
      "Press forward without locking elbows violently.",
      "Return until elbows are just behind the torso line.",
    ],
    tips: [
      "Great for learning pressing path or training to failure safely.",
      "Match handle path to your natural pressing angle.",
    ],
    commonMistakes: [
      "Seat too low causing shoulder impingement.",
      "Partial reps without full controlled range.",
    ],
  },
  {
    name: "Landmine Press",
    category: "Chest",
    muscleGroups: ["Pectorals", "Deltoids", "Triceps"],
    difficulty: "Intermediate",
    equipment: ["Barbell", "Landmine Attachment"],
    instructions: [
      "Load one end of the bar in a corner or landmine base.",
      "Stand or half-kneel, hold the free end at upper chest.",
      "Press up and forward in an arc until arms extend.",
      "Lower with control to the starting position.",
    ],
    tips: [
      "Shoulder-friendly pressing option with a natural arc.",
      "Half-kneeling variation challenges core anti-rotation.",
    ],
    commonMistakes: [
      "Overarching the lower back in standing variations.",
      "Using only arms without engaging chest and core.",
    ],
  },
  {
    name: "Svend Press",
    category: "Chest",
    muscleGroups: ["Pectorals"],
    difficulty: "Beginner",
    equipment: ["Weight Plate"],
    instructions: [
      "Hold a plate between palms at chest height, elbows out.",
      "Press palms together hard while extending arms forward.",
      "Bring plate back to the chest maintaining constant squeeze.",
      "Keep shoulders down throughout.",
    ],
    tips: [
      "Use as activation before bench work—constant tension on pecs.",
      "Start with a light plate to learn the squeeze.",
    ],
    commonMistakes: [
      "Shrugging shoulders up during the press-out.",
      "Going too heavy and losing the chest squeeze.",
    ],
  },
  {
    name: "Floor Press",
    category: "Chest",
    muscleGroups: ["Pectorals", "Triceps"],
    difficulty: "Intermediate",
    equipment: ["Barbell", "Dumbbells"],
    instructions: [
      "Lie on the floor with bar or dumbbells at chest level.",
      "Press up until arms lock; elbows touch the floor each rep.",
      "Pause briefly on the floor to kill momentum.",
      "Lower under control to the same contact point.",
    ],
    tips: [
      "Limits range—good for triceps strength and shoulder-friendly pressing.",
      "Pair with chains or bands for advanced overload.",
    ],
    commonMistakes: [
      "Bouncing elbows off the floor aggressively.",
      "Uneven bar path with dumbbells.",
    ],
  },
];

export const chestExercises = defs.map(buildExercise);
