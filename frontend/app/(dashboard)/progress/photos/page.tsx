"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, Trash2, Calendar, Scale, Sparkles } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useApiClient, useIsApiReady } from "@/lib/api-client";
import ProgressPhotoSlider from "@/components/progress/ProgressPhotoSlider";

interface ProgressPhoto {
  _id: string;
  imageUrl: string;
  date: string;
  weightKg: number | null;
}

export default function ProgressPhotosPage() {
  const api = useApiClient();
  const isApiReady = useIsApiReady();
  const queryClient = useQueryClient();

  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [weight, setWeight] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Before/after selector states
  const [beforeId, setBeforeId] = useState<string>("");
  const [afterId, setAfterId] = useState<string>("");

  const { data: photos = [], isLoading } = useQuery<ProgressPhoto[]>({
    queryKey: ["progressPhotos"],
    queryFn: () => api("/progress-photos"),
    enabled: isApiReady,
  });

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) =>
      api("/progress-photos", {
        method: "POST",
        body: formData, // fetcher parses FormData correctly without setting JSON headers if passed as Body Init
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progressPhotos"] });
      toast.success("Progress photo uploaded successfully!");
      setSelectedFile(null);
      setWeight("");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to upload photo.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/progress-photos/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progressPhotos"] });
      toast.success("Photo deleted.");
      if (beforeId) setBeforeId("");
      if (afterId) setAfterId("");
    },
    onError: () => toast.error("Failed to delete photo."),
  });

  const getFullImageUrl = (url: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const host = baseUrl.replace(/\/api\/?$/, ""); // strip /api
    return `${host}${url}`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select a photo to upload.");
      return;
    }
    if (!date) {
      toast.error("Please pick a date.");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("date", date);
    if (weight) {
      formData.append("weightKg", weight);
    }

    uploadMutation.mutate(formData);
  };

  // Find selected before and after photos
  const beforePhoto = photos.find((p) => p._id === beforeId);
  const afterPhoto = photos.find((p) => p._id === afterId);

  return (
    <div className="dashboard-page-tight flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Link
          href="/progress"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#39E609]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Progress
        </Link>
        <h1 className="font-display font-black text-xl lg:text-2xl text-white">
          Progress Photos
        </h1>
      </div>

      <div className="grid lg:grid-cols-[1fr_350px] gap-6">
        {/* Left Column: Slider and Gallery */}
        <div className="space-y-6">
          {/* Compare Section */}
          {photos.length >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-[#2a2a2a] bg-[#1c1c1c] p-6 space-y-4"
            >
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#39E609]" />
                    Visual Compare
                  </h2>
                  <p className="text-xs text-gray-500">Select two dates to compare progress side-by-side</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={beforeId}
                    onChange={(e) => setBeforeId(e.target.value)}
                    className="bg-[#111] border border-[#2a2a2a] rounded-lg px-2 py-1 text-xs text-white"
                  >
                    <option value="">Select Before Date</option>
                    {photos.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.date} {p.weightKg ? `(${p.weightKg} kg)` : ""}
                      </option>
                    ))}
                  </select>
                  <span className="text-gray-600 text-xs">vs</span>
                  <select
                    value={afterId}
                    onChange={(e) => setAfterId(e.target.value)}
                    className="bg-[#111] border border-[#2a2a2a] rounded-lg px-2 py-1 text-xs text-white"
                  >
                    <option value="">Select After Date</option>
                    {photos.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.date} {p.weightKg ? `(${p.weightKg} kg)` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {beforePhoto && afterPhoto ? (
                <div className="max-w-xl mx-auto">
                  <ProgressPhotoSlider
                    beforeUrl={getFullImageUrl(beforePhoto.imageUrl)}
                    afterUrl={getFullImageUrl(afterPhoto.imageUrl)}
                    beforeLabel={`Before (${beforePhoto.date})`}
                    afterLabel={`After (${afterPhoto.date})`}
                  />
                </div>
              ) : (
                <div className="h-48 border border-dashed border-[#2a2a2a] rounded-xl flex items-center justify-center text-xs text-gray-500">
                  Select before and after dates above to see the comparison slider
                </div>
              )}
            </motion.div>
          )}

          {/* Photo Gallery */}
          <div className="rounded-2xl border border-[#2a2a2a] bg-[#1c1c1c] p-6 space-y-4">
            <h2 className="text-lg font-bold text-white">Log Gallery</h2>
            {isLoading ? (
              <p className="text-sm text-gray-500">Loading gallery...</p>
            ) : photos.length === 0 ? (
              <p className="text-sm text-gray-500">No photos logged yet. Add your first photo using the sidebar panel.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {photos.map((photo) => (
                  <div
                    key={photo._id}
                    className="group relative aspect-[3/4] rounded-xl border border-[#2a2a2a] overflow-hidden bg-black flex flex-col justify-end"
                  >
                    <img
                      src={getFullImageUrl(photo.imageUrl)}
                      alt={`Logged on ${photo.date}`}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/30 pointer-events-none" />
                    
                    {/* Overlay delete button */}
                    <button
                      type="button"
                      onClick={() => deleteMutation.mutate(photo._id)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="relative p-3">
                      <p className="text-xs font-bold text-white flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#39E609]" />
                        {photo.date}
                      </p>
                      {photo.weightKg && (
                        <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <Scale className="w-2.5 h-2.5" />
                          {photo.weightKg} kg
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Upload panel */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#2a2a2a] bg-[#1c1c1c] p-6 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-[#39E609]" />
              Add Photo
            </h2>
            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* File picker */}
              <div className="relative border-2 border-dashed border-[#2a2a2a] hover:border-[#39E609]/40 rounded-xl p-4 text-center cursor-pointer transition-colors bg-[#111]">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Camera className="w-6 h-6 text-gray-500 mx-auto mb-2" />
                <p className="text-xs font-semibold text-gray-300">
                  {selectedFile ? selectedFile.name : "Select progress image"}
                </p>
                <p className="text-[10px] text-gray-500 mt-1">JPEG, PNG up to 5MB</p>
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                  Log Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>

              {/* Weight */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                  Bodyweight (kg, optional)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 78.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>

              <button
                type="submit"
                disabled={uploadMutation.isPending}
                className="btn-neon w-full py-3 text-sm font-bold flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {uploadMutation.isPending ? "Uploading..." : "Upload Photo"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
