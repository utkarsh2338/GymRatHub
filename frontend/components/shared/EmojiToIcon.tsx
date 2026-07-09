import React from "react";
import {
  Swords,
  Flame,
  Droplets,
  Activity,
  Dumbbell,
  Moon,
  Lock,
  Trophy,
  Target,
  Award,
  Sparkles,
  Timer,
  Scale
} from "lucide-react";

export const emojiToIconMap: Record<string, React.ComponentType<any>> = {
  "⚔️": Swords,
  "🔥": Flame,
  "💧": Droplets,
  "🏃": Activity,
  "💪": Dumbbell,
  "🌙": Moon,
  "🔒": Lock,
  "🏆": Trophy,
  "👟": Activity,
  "🎯": Target,
  "👑": Award,
  "✨": Sparkles,
  "⚖️": Scale,
  "⏱️": Timer,
  "👥": Trophy
};

interface EmojiToIconProps {
  emoji: string;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
  className?: string;
}

export default function EmojiToIcon({ emoji, size = 20, color, style, className }: EmojiToIconProps) {
  const IconComponent = emojiToIconMap[emoji] || Target;
  return <IconComponent size={size} color={color} style={style} className={className} />;
}
