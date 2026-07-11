# File Storage — GymRatHub

## Decision: Cloudinary

GymRatHub uses **Cloudinary** for progress photo storage and any future image uploads.

### Rationale

| Criterion | Cloudinary | AWS S3 |
|---|---|---|
| Free tier | 25 GB storage + 25 GB egress / month (permanent) | 5 GB storage + 15 GB egress (12 months only) |
| Image transforms | Built-in via URL params (resize, crop, format, quality) | Requires Lambda@Edge or CloudFront Functions |
| Next.js integration | Official `next/image` loader in 1 line | Custom loader required |
| Upload flow | Browser → Cloudinary directly → URL stored in DB | Browser → Backend → S3 → URL stored in DB |
| Complexity | Single SDK, unsigned upload preset | SDK + presigned URLs + CDN setup |
| Backend binary handling | None — backend only stores URLs | Backend receives binary; must stream to S3 |

The direct-upload pattern means the backend **never handles image binary data** — it eliminates `multer` entirely for this use case and reduces server memory pressure.

---

## Upload Flow

```
Browser
  │
  ├─ Cloudinary Upload Widget (unsigned preset)
  │     └─ Returns: { public_id, secure_url, format, width, height }
  │
  └─ POST /api/progress-photos { imageUrl: "https://res.cloudinary.com/..." }
        └─ Backend stores URL + metadata in MongoDB (ProgressPhoto model)
```

No binary data ever touches the Express server.

---

## Environment Variables

### Backend (`backend/.env`)
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=gymrathub_progress_photos
```

---

## Cloudinary Setup Steps

1. Create a free account at [cloudinary.com](https://cloudinary.com).
2. In the Cloudinary dashboard → **Settings → Upload → Upload Presets** → Add a new preset:
   - Name: `gymrathub_progress_photos`
   - Signing mode: **Unsigned** (safe for client-side uploads)
   - Folder: `gymrathub/progress-photos`
   - Allowed formats: `jpg, jpeg, png, webp`
   - Max file size: 10 MB
3. Enable the **`res.cloudinary.com`** remote pattern in `next.config.ts` (already done).
4. Add the environment variables above to both `.env` files.

---

## Current State

The current `routes/progressPhotos.ts` uses `multer` to write files to `/uploads` on disk. This works for local development but **does not scale** (no persistence across deploys, no CDN).

### Migration Plan (next increment)
- Add `@cloudinary/url-gen` to `frontend` for the upload widget.
- Remove `multer` from `progressPhotos.ts`; accept `{ imageUrl }` in the POST body instead.
- Add Zod validation for `imageUrl` (must start with `https://res.cloudinary.com/`).
- Delete the local `/uploads` directory from production deployments.

---

## Cost Estimate

| Usage | Free tier capacity |
|---|---|
| Storage | 25 GB (~250,000 progress photos @ ~100 KB each) |
| Bandwidth | 25 GB/month egress |
| Transformations | 25 credits/month (1 credit ≈ 1 transformation) |

At indie/startup scale this is effectively free.
