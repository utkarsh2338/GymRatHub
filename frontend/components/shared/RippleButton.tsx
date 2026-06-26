"use client";

import { useRef } from "react";
import { motion } from "framer-motion";

interface RippleButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  magnetic?: boolean;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export default function RippleButton({
  children,
  variant = "primary",
  size = "md",
  magnetic = false,
  className = "",
  onClick,
  disabled,
  type = "button",
}: RippleButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  const createRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = document.createElement("span");
    ripple.style.cssText = `
      position:absolute;width:${size}px;height:${size}px;
      left:${x}px;top:${y}px;
      border-radius:50%;background:rgba(255,255,255,0.2);
      transform:scale(0);animation:ripple 0.6s linear forwards;
      pointer-events:none;
    `;
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);

    onClick?.(e);
  };

  const variantClasses = {
    primary: "btn-neon",
    secondary: "bg-[#1c1c1c] border border-[#2a2a2a] text-white hover:border-[#39E609]/50 hover:bg-[#222]",
    ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-white/5",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <motion.button
      ref={buttonRef}
      type={type}
      disabled={disabled}
      whileHover={magnetic ? { scale: 1.03 } : { scale: 1.01 }}
      whileTap={{ scale: 0.97 }}
      onClick={createRipple}
      className={`relative overflow-hidden rounded-lg font-semibold transition-all duration-200 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </motion.button>
  );
}
