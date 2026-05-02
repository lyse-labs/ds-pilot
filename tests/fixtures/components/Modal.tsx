import React from "react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div>
      <h2>{title}</h2>
      <button onClick={onClose}>Close</button>
      {children}
    </div>
  );
};
