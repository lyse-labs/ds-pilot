import React from "react";

interface CardProps {
  title: string;
  children: React.ReactNode;
  elevated?: boolean;
}

export default function Card({ title, children, elevated = false }: CardProps) {
  return (
    <div>
      <h3>{title}</h3>
      {children}
    </div>
  );
}
