"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, Loader2, AlertCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useApiClient } from "@/lib/api-client";
import type { YouTubeVideo } from "@/lib/types";

interface Props {
  exerciseName: string;
  fallbackThumbnail?: string;
}

const DEFAULT_THUMBNAIL =
  "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80";

export default function YouTubeTutorialPlayer({ exerciseName, fallbackThumbnail }: Props) {
  const api = useApiClient();
  const [showModal, setShowModal] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  const { data: videos, isLoading, isError } = useQuery<YouTubeVideo[]>({
    queryKey: ["exerciseTutorial", exerciseName],
    queryFn: () => api(`/exercises/tutorial?name=${encodeURIComponent(exerciseName)}`),
    staleTime: 60 * 60 * 1000,
  });

  const primaryVideo = videos?.[0];
  const thumbnail =
    primaryVideo?.thumbnail || fallbackThumbnail || DEFAULT_THUMBNAIL;

  useEffect(() => {
    if (videos?.length) {
      setActiveVideoId((prev) => prev ?? videos[0].videoId);
    }
  }, [videos]);

  const closeModal = useCallback(() => setShowModal(false), []);

  useEffect(() => {
    if (!showModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [showModal, closeModal]);

  const openPlayer = () => {
    if (!videos?.length) return;
    setActiveVideoId(videos[0].videoId);
    setShowModal(true);
  };

  const activeVideo = videos?.find((v) => v.videoId === activeVideoId) ?? primaryVideo;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative aspect-video bg-[#111] rounded-xl overflow-hidden group border border-[#2a2a2a]"
      >
        <img
          src={thumbnail}
          alt={`${exerciseName} tutorial`}
          className="w-full h-full object-cover"
        />

        {isLoading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#39E609] animate-spin" />
          </div>
        )}

        {!isLoading && (
          <button
            type="button"
            onClick={openPlayer}
            disabled={!primaryVideo || isError}
            className="absolute inset-0 bg-black/40 flex items-center justify-center disabled:cursor-not-allowed"
            aria-label={`Play ${exerciseName} tutorial`}
          >
            {isError || !primaryVideo ? (
              <div className="flex flex-col items-center gap-2 text-gray-400 px-4 text-center">
                <AlertCircle className="w-8 h-8" />
                <span className="text-sm">Tutorial unavailable</span>
              </div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-16 h-16 bg-[#39E609] rounded-full flex items-center justify-center shadow-neon-md pointer-events-none"
              >
                <Play className="w-7 h-7 text-black fill-black ml-1" />
              </motion.div>
            )}
          </button>
        )}

        {primaryVideo && !isLoading && (
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent pointer-events-none">
            <p className="text-white text-xs font-semibold line-clamp-1">{primaryVideo.title}</p>
            <p className="text-gray-400 text-[10px]">{primaryVideo.channelTitle}</p>
          </div>
        )}
      </motion.div>

      {videos && videos.length > 1 && !showModal && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {videos.map((video) => (
            <button
              key={video.videoId}
              type="button"
              onClick={() => {
                setActiveVideoId(video.videoId);
                setShowModal(true);
              }}
              className={`shrink-0 text-left rounded-lg border overflow-hidden transition-all ${
                activeVideoId === video.videoId
                  ? "border-[#39E609]/60 ring-1 ring-[#39E609]/30"
                  : "border-[#2a2a2a] hover:border-[#39E609]/30"
              }`}
              style={{ width: 140 }}
            >
              <img
                src={video.thumbnail}
                alt=""
                className="w-full h-16 object-cover"
              />
              <p className="text-[10px] text-gray-400 px-2 py-1.5 line-clamp-2">{video.title}</p>
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && activeVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
            onClick={closeModal}
            role="dialog"
            aria-modal="true"
            aria-label="Exercise tutorial video"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-4xl bg-[#1c1c1c] border border-[#2a2a2a] rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4 p-4 border-b border-[#2a2a2a]">
                <div className="min-w-0">
                  <h3 className="text-white font-semibold text-sm line-clamp-2">{activeVideo.title}</h3>
                  <p className="text-gray-500 text-xs mt-0.5">{activeVideo.channelTitle}</p>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="shrink-0 w-9 h-9 rounded-lg bg-[#111] border border-[#2a2a2a] flex items-center justify-center hover:border-[#39E609]/40 transition-colors"
                  aria-label="Close video"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              <div className="relative aspect-video bg-black">
                <iframe
                  key={activeVideo.videoId}
                  src={`https://www.youtube-nocookie.com/embed/${activeVideo.videoId}?autoplay=1&rel=0&modestbranding=1`}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border-0"
                />
              </div>

              {videos && videos.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto border-t border-[#2a2a2a]">
                  {videos.map((video) => (
                    <button
                      key={video.videoId}
                      type="button"
                      onClick={() => setActiveVideoId(video.videoId)}
                      className={`shrink-0 rounded-lg border px-3 py-2 text-xs transition-all ${
                        activeVideoId === video.videoId
                          ? "border-[#39E609] text-[#39E609] bg-[#39E609]/10"
                          : "border-[#2a2a2a] text-gray-400 hover:text-white"
                      }`}
                    >
                      <span className="line-clamp-1 max-w-[160px]">{video.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
