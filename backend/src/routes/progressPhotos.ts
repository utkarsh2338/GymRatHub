import { Router, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { requireAuth, AuthenticatedRequest } from "../middleware/auth";
import ProgressPhotoModel from "../models/ProgressPhoto";

const router = Router();

// Ensure upload directory exists
const UPLOAD_DIR = path.join(__dirname, "../../../uploads/progress-photos");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer disk storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `photo-${uniqueSuffix}${ext}`);
  },
});

// File filter (images only)
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// 1. Upload photo
router.post("/", requireAuth, upload.single("image"), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    if (!req.file) {
      return res.status(400).json({ error: "Please upload an image file." });
    }

    const { date, weightKg } = req.body;
    if (!date) {
      // Cleanup uploaded file if date is missing
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Date is required." });
    }

    // Save image URL relative to backend host
    const relativeUrl = `/uploads/progress-photos/${req.file.filename}`;

    const newPhoto = await ProgressPhotoModel.create({
      clerkId,
      imageUrl: relativeUrl,
      date,
      weightKg: weightKg ? Number(weightKg) : null,
    });

    return res.status(201).json(newPhoto);
  } catch (error: any) {
    console.error("Upload progress photo error:", error);
    return res.status(500).json({ error: error.message || "Internal server error." });
  }
});

// 2. Fetch all photos
router.get("/", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    const photos = await ProgressPhotoModel.find({ clerkId }).sort({ date: -1 });
    return res.json(photos);
  } catch (error) {
    console.error("GET progress photos error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

// 3. Delete photo
router.delete("/:id", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const clerkId = req.auth?.userId;
    const photo = await ProgressPhotoModel.findOne({ _id: req.params.id, clerkId });
    if (!photo) {
      return res.status(404).json({ error: "Progress photo not found." });
    }

    // Try to delete file from disk
    const filename = path.basename(photo.imageUrl);
    const filepath = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }

    await ProgressPhotoModel.deleteOne({ _id: req.params.id, clerkId });
    return res.json({ success: true });
  } catch (error) {
    console.error("DELETE progress photo error:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
