import React, { useState } from "react";

interface AddClassButtonProps {
  onAdd: () => void;
}

const AddClassButton: React.FC<AddClassButtonProps> = ({ onAdd }) => (
  <button
    className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-6 rounded-lg shadow flex items-center gap-2"
    onClick={onAdd}
  >
    <span className="text-xl">+</span> Add Class
  </button>
);

export default AddClassButton;
