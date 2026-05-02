import React from "react";

interface ButtonProps {
  label: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onClick?: () => void;
}

export function Button({ label, variant = "primary", size = "md", disabled = false, onClick }: ButtonProps) {
  return (
    <button disabled={disabled} onClick={onClick}>
      {label}
    </button>
  );
}
