import React, { useState } from "react";
import AddClassButton from "../../components/admin-dashboard/AddClassButton";
import ClassForm from "../../components/admin-dashboard/ClassForm";
import { createClass } from "../../services/api/calls/postApis";
import AssignTeacher from "../../components/admin-dashboard/AssignTeacher";
import useClasses from "../../hooks/useClasses";
import { deleteClass } from "../../services/api/calls/deleteApis";

const ClassesPage: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { classNameData, isClassLoading, isClassError, classError } = useClasses();
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showAssign, setShowAssign] = useState<{ open: boolean; classId?: string | number }>({ open: false });


  const handleDelete = async (id: string | number) => {
    setDeletingId(id);
    setDeleteError(null);
    try {
      await deleteClass(id);
      // Optionally refetch classes here if not auto-refreshed
    } catch (err: any) {
      setDeleteError(err?.response?.data?.message || "Failed to delete class");
    } finally {
      setDeletingId(null);
    }
  };

  const handleAdd = () => setShowForm(true);
  const handleClose = () => setShowForm(false);
  const handleSubmit = async (data: { name: string }) => {
    setLoading(true);
    setError(null);
    try {
      await createClass(data);
      setShowForm(false);
      // Optionally refetch classes here if not auto-refreshed
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create class");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Classes</h1>
        <AddClassButton onAdd={handleAdd} />
      </div>
      {/* List of classes */}
      <div className="mt-8">
        {isClassLoading && <div>Loading classes...</div>}
        {isClassError && <div className="text-red-500">{classError?.message || "Error loading classes"}</div>}
        {!isClassLoading && !isClassError && (
          <ul className="space-y-2">
            {classNameData.length === 0 ? (
              <li className="text-gray-500">No classes found.</li>
            ) : (
              <>
                {classNameData.map((cls) => {
                  const teacherName = cls.teacher?.userId 
                    ? `${cls.teacher.userId.firstName} ${cls.teacher.userId.lastName}` 
                    : null;
                  
                  return (
                  <li key={cls.id} className="border rounded px-4 py-2 bg-white shadow-sm flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{cls.name}</div>
                      {teacherName && <div className="text-sm text-gray-600">Teacher: {teacherName}</div>}
                      {!teacherName && <div className="text-sm text-gray-500 italic">No teacher assigned</div>}
                    </div>
                    <div className="flex items-center">
                      <button
                        className="ml-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        onClick={() => setShowAssign({ open: true, classId: cls.id })}
                      >
                        {teacherName ? "Change Teacher" : "Assign Teacher"}
                      </button>
                      <button
                        className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                        onClick={() => handleDelete(cls.id)}
                        disabled={deletingId === cls.id}
                      >
                        {deletingId === cls.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </li>
                  );
                })}
                {deleteError && <div className="text-red-500 mt-2">{deleteError}</div>}
              </>
            )}
          </ul>
        )}
      </div>
      {showForm && (
        <ClassForm onSubmit={handleSubmit} onClose={handleClose} />
      )}
      {loading && <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-20 z-50">Creating class...</div>}
      {showAssign.open && showAssign.classId && (
        <AssignTeacher
          classId={showAssign.classId}
          onClose={() => setShowAssign({ open: false })}
          onAssigned={() => {
            // Optionally refetch classes or show toast
          }}
        />
      )}
      {error && <div className="text-red-500 mt-4">{error}</div>}
    </div>
  );
};

export default ClassesPage;
