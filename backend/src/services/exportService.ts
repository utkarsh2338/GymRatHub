import PDFDocument from "pdfkit";
import WorkoutSessionModel from "../models/WorkoutSession";
import UserModel from "../models/User";

// Generate CSV string of user workout history
export async function exportToCSV(clerkId: string): Promise<string> {
  const sessions = await WorkoutSessionModel.find({ clerkId }).sort({ completedAt: -1 });
  
  const headers = ["Date", "Workout Name", "Status", "Duration (mins)", "Total Volume (kg)", "Exercises Logged"];
  const rows = sessions.map((s) => {
    const date = s.completedAt ? new Date(s.completedAt).toISOString().split("T")[0] : "N/A";
    const exercisesStr = s.exercises.map((e) => `${e.name} (${e.loggedSets.length} sets)`).join(" | ");
    return [
      date,
      `"${s.planName.replace(/"/g, '""')}"`,
      s.status,
      s.durationMinutes,
      s.totalVolumeKg,
      `"${exercisesStr.replace(/"/g, '""')}"`,
    ];
  });

  const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  return csvContent;
}

// Generate beautiful PDF progress report
export async function exportToPDF(clerkId: string, res: any): Promise<void> {
  const user = await UserModel.findOne({ clerkId });
  const sessions = await WorkoutSessionModel.find({ clerkId, status: "completed" }).sort({ completedAt: -1 });

  const doc = new PDFDocument({ margin: 50 });

  // Pipe the document to response
  doc.pipe(res);

  // 1. Header Section
  doc
    .fillColor("#39E609")
    .fontSize(24)
    .text("GymRat Hub", { align: "left" })
    .fillColor("#ffffff")
    .fontSize(10)
    .text("TRAIN SMARTER. LIVE STRONGER.", { align: "left" })
    .moveDown(1.5);

  // User Profile Summary
  doc
    .fillColor("#ffffff")
    .fontSize(16)
    .text(`Fitness Progress Report: ${user?.name || "Athlete"}`, { underline: true })
    .fontSize(10)
    .fillColor("#a3a3a3")
    .text(`Email: ${user?.email || "N/A"}`)
    .text(`Current Tier: ${user?.plan?.toUpperCase() || "FREE"}`)
    .text(`Joined Date: ${user?.joinedAt || "N/A"}`)
    .moveDown(2);

  // Summary Metrics Card
  const totalWorkouts = user?.stats?.workoutsCompleted || sessions.length;
  const currentStreak = user?.stats?.streak || 0;
  const currentWeight = user?.stats?.weight || "N/A";

  doc
    .fillColor("#ffffff")
    .fontSize(14)
    .font("Helvetica-Bold")
    .text("All-Time Stats")
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#d4d4d4")
    .text(`• Workouts Logged: ${totalWorkouts}`)
    .text(`• Current Streak: ${currentStreak} days`)
    .text(`• Current Bodyweight: ${currentWeight} kg`)
    .moveDown(2);

  // 2. Workout History Table
  doc
    .fillColor("#ffffff")
    .fontSize(14)
    .font("Helvetica-Bold")
    .text("Workout History Details")
    .font("Helvetica")
    .moveDown(0.5);

  // Draw headers
  const tableTop = doc.y;
  doc
    .fontSize(10)
    .fillColor("#39E609")
    .text("Date", 50, tableTop)
    .text("Routine", 130, tableTop)
    .text("Duration", 280, tableTop)
    .text("Volume (kg)", 360, tableTop)
    .text("Exercises", 440, tableTop);

  doc
    .moveTo(50, tableTop + 15)
    .lineTo(550, tableTop + 15)
    .strokeColor("#2a2a2a")
    .stroke();

  let y = tableTop + 25;
  doc.fillColor("#ffffff");

  for (const session of sessions) {
    if (y > 700) {
      doc.addPage();
      y = 50; // reset y on new page
    }

    const dateStr = session.completedAt
      ? new Date(session.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "N/A";
    const exercisesNames = session.exercises.map((e) => e.name).slice(0, 2).join(", ") + (session.exercises.length > 2 ? "..." : "");

    doc
      .fontSize(9)
      .text(dateStr, 50, y)
      .text(session.planName, 130, y, { width: 140, lineBreak: false })
      .text(`${session.durationMinutes} mins`, 280, y)
      .text(`${session.totalVolumeKg.toLocaleString()} kg`, 360, y)
      .text(exercisesNames, 440, y, { width: 110 });

    y += 20;
  }

  // End Document
  doc.end();
}
