"use client";

import { useState, useRef, MouseEvent, TouchEvent } from "react";
import { MoveHorizontal } from "lucide-react";

interface Props {
  beforeUrl: string;
  afterUrl: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export default function ProgressPhotoSlider({
  beforeUrl,
  afterUrl,
  beforeLabel = "Before",
  afterLabel = "After",
}: Props) {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage (0-100)
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (e.buttons === 1) {
      handleMove(e.clientX);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    handleMove(e.clientX);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onMouseDown={handleMouseDown}
      className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border border-[#2a2a2a] select-none cursor-ew-resize bg-black"
    >
      {/* Before Image (Background) */}
      <img
        src={beforeUrl}
        alt="Before progress"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />
      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-[#2a2a2a] px-3 py-1 rounded-full text-[10px] font-bold text-gray-300 pointer-events-none">
        {beforeLabel}
      </div>

      {/* After Image (Overlay, clipped based on sliderPosition) */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)` }}
      >
        <img
          src={afterUrl}
          alt="After progress"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
        <div className="absolute top-4 right-4 bg-[#39E609]/20 backdrop-blur-md border border-[#39E609]/30 px-3 py-1 rounded-full text-[10px] font-bold text-[#39E609]">
          {afterLabel}
        </div>
      </div>

      {/* Slider Bar & Handle */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white pointer-events-none"
        style={{ left: `${sliderPosition}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border border-[#2a2a2a] shadow-lg flex items-center justify-center text-black">
          <MoveHorizontal className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
