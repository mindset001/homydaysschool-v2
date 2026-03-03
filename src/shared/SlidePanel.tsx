import React from "react";

interface SlidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const SlidePanel: React.FC<SlidePanelProps> = ({
  isOpen,
  onClose,
  children,
}) => {
  return (
    <div
      className={`fixed top-0 right-0 overflow-y-scroll w-auto h-full bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="relative p-6">
        <button
          className="absolute top-2 right-2 text-white bg-red-500 rounded-full px-2 hover:bg-red-600 focus:outline-none"
          onClick={onClose}
        >
          X
        </button>
        {children}
      </div>
    </div>
  );
};

export default SlidePanel;
