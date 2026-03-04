import React, { useState } from "react";

interface ClassFormProps {
  onSubmit: (data: { name: string; teacher?: string }) => void;
  onClose: () => void;
}

const ClassForm: React.FC<ClassFormProps> = ({ onSubmit, onClose }) => {
  const [name, setName] = useState("");
  // Optionally add teacher selection here

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create New Class</h2>
        <form
          onSubmit={e => {
            e.preventDefault();
            onSubmit({ name });
          }}
          className="flex flex-col gap-4"
        >
          <label className="font-semibold">Class Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="border rounded px-3 py-2"
            placeholder="e.g. JSS1A"
            required
          />
          <div className="flex gap-2 justify-end mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassForm;
