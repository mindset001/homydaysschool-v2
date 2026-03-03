import React, { useMemo, useState } from "react";
import { Add } from "../../assets/images/dashboard/students";
import Pagination from "../../shared/Pagination";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Loader from "../../shared/Loader";
import SlidePanel from "../../shared/SlidePanel";
import { getRole } from "../../utils/authTokens";
import { showErrorToast, showSuccessToast } from "../../shared/ToastNotification";
import { getSubjects } from "../../services/api/calls/getApis";
import { createSubject } from "../../services/api/calls/postApis";
import { deleteSubject, updateSubject } from "../../services/api/calls/updateApis";

interface SubjectData {
  id: string;
  name: string;
  description: string;
  code: string;
}

interface SubjectFormData {
  name: string;
  description: string;
  code: string;
}

const Subjects: React.FC = () => {
  const queryClient = useQueryClient();
  const role = getRole();
  
  const { data, isError, error, isLoading } = useQuery({
    queryKey: ["subjects"],
    queryFn: () => getSubjects(),
  });
  
  const subjects: SubjectData[] = useMemo(() => {
    if (!data || !data.data) {
      return [];
    }
    
    const subjectList = data.data.data;
    if (!Array.isArray(subjectList)) {
      return [];
    }
    
    return subjectList.map((subject: any) => ({
      id: subject.id || subject._id,
      name: subject.name || '',
      description: subject.description || '',
      code: subject.code || '',
    }));
  }, [data]);
  
  isError && console.log('Error fetching subjects:', error);
  
  const [isSliderOpen, setIsSliderOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [selectedSubject, setSelectedSubject] = useState<SubjectData | null>(null);
  const [formData, setFormData] = useState<SubjectFormData>({
    name: "",
    description: "",
    code: "",
  });
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const itemsPerPage = 10;
  
  const filteredSubjects = useMemo(() => {
    if (!searchTerm) return subjects;
    return subjects.filter(subject =>
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subject.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [subjects, searchTerm]);
  
  const paginatedSubjects = useMemo(() => {
    const startIndex = currentPage * itemsPerPage;
    return filteredSubjects.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSubjects, currentPage]);
  
  const createSubjectMutation = useMutation({
    mutationFn: createSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      showSuccessToast("Subject created successfully!");
      handleCloseSlider();
    },
    onError: (error: any) => {
      showErrorToast(error.response?.data?.message || "Error creating subject");
    },
  });
  
  const updateSubjectMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: SubjectFormData }) => 
      updateSubject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      showSuccessToast("Subject updated successfully!");
      handleCloseSlider();
    },
    onError: (error: any) => {
      showErrorToast(error.response?.data?.message || "Error updating subject");
    },
  });
  
  const deleteSubjectMutation = useMutation({
    mutationFn: deleteSubject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      showSuccessToast("Subject deleted successfully!");
    },
    onError: (error: any) => {
      showErrorToast(error.response?.data?.message || "Error deleting subject");
    },
  });
  
  const handleOpenAddSlider = () => {
    setIsEditMode(false);
    setSelectedSubject(null);
    setFormData({
      name: "",
      description: "",
      code: "",
    });
    setIsSliderOpen(true);
  };
  
  const handleOpenEditSlider = (subject: SubjectData) => {
    setIsEditMode(true);
    setSelectedSubject(subject);
    setFormData({
      name: subject.name,
      description: subject.description,
      code: subject.code,
    });
    setIsSliderOpen(true);
  };
  
  const handleCloseSlider = () => {
    setIsSliderOpen(false);
    setIsEditMode(false);
    setSelectedSubject(null);
    setFormData({
      name: "",
      description: "",
      code: "",
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showErrorToast("Subject name is required");
      return;
    }
    
    if (isEditMode && selectedSubject) {
      updateSubjectMutation.mutate({ id: selectedSubject.id, data: formData });
    } else {
      createSubjectMutation.mutate(formData);
    }
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this subject?")) {
      deleteSubjectMutation.mutate(id);
    }
  };
  
  const handleNext = () => {
    if ((currentPage + 1) * itemsPerPage < filteredSubjects.length) {
      setCurrentPage(prev => prev + 1);
    }
  };
  
  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };
  
  if (isLoading) {
    return <Loader />;
  }
  
  return (
    <>
      <div className="staff">
        <div className="staff-header">Subjects</div>
        <div className="staff-sub-header">
          <p>Subjects Database</p>
        </div>

        <div className="staff-container">
          <div className="staffs">
            <div className="staffs-header">
              <h1 className="staff-heading">All Subjects</h1>
              {filteredSubjects.length > 0 && (
                <h2 className="total">
                  TOTAL :- <span>{filteredSubjects.length}</span>
                </h2>
              )}
              <div className="flex items-center gap-[20px]">
                {(role === "admin" || role === "staff") && (
                  <button
                    className="add-btn flex items-center"
                    onClick={handleOpenAddSlider}
                  >
                    <img
                      src={Add}
                      alt="add"
                      className="object-contain object-center size-full max-w-[15px] h-auto mr-[5px]"
                    />
                    <div className="font-Lora font-bold text-[15px] leading-[19.2px]">
                      Add
                    </div>
                  </button>
                )}
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="mb-4 px-4">
              <input
                type="text"
                placeholder="Search subjects by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05878F]"
              />
            </div>
            
            {filteredSubjects.length ? (
              <>
                <div className="px-4 overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-3 text-left font-Lora font-bold">Code</th>
                        <th className="border p-3 text-left font-Lora font-bold">Subject Name</th>
                        <th className="border p-3 text-left font-Lora font-bold">Description</th>
                        {(role === "admin" || role === "staff") && (
                          <th className="border p-3 text-center font-Lora font-bold">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedSubjects.map((subject) => (
                        <tr key={subject.id} className="hover:bg-gray-50">
                          <td className="border p-3 font-Poppins font-medium text-[#05878F]">
                            {subject.code}
                          </td>
                          <td className="border p-3 font-Poppins">{subject.name}</td>
                          <td className="border p-3 font-Poppins text-sm text-gray-600">
                            {subject.description || '-'}
                          </td>
                          {(role === "admin" || role === "staff") && (
                            <td className="border p-3">
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() => handleOpenEditSlider(subject)}
                                  className="px-3 py-1 bg-[#05878F] text-white rounded hover:bg-[#046a72] transition-colors text-sm"
                                >
                                  Edit
                                </button>
                                {role === "admin" && (
                                  <button
                                    onClick={() => handleDelete(subject.id)}
                                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="staffs-pagination">
                  <Pagination next={handleNext} prev={handlePrev} />
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-10">
                <p className="font-Lora text-gray-500 text-lg">
                  {searchTerm ? "No subjects found matching your search" : "No subjects available"}
                </p>
                {!searchTerm && (role === "admin" || role === "staff") && (
                  <button
                    onClick={handleOpenAddSlider}
                    className="mt-4 px-6 py-2 bg-[#05878F] text-white rounded hover:bg-[#046a72] transition-colors"
                  >
                    Add First Subject
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Subject Slider */}
      <SlidePanel isOpen={isSliderOpen} onClose={handleCloseSlider}>
        <div className="p-6">
          <h2 className="text-2xl font-Lora font-bold mb-6 text-[#05878F]">
            {isEditMode ? "Edit Subject" : "Add New Subject"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-Poppins font-medium mb-2">
                Subject Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05878F]"
                placeholder="e.g., MTH, ENG"
                maxLength={10}
              />
            </div>
            
            <div>
              <label className="block font-Poppins font-medium mb-2">
                Subject Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05878F]"
                placeholder="e.g., Mathematics"
                required
              />
            </div>
            
            <div>
              <label className="block font-Poppins font-medium mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#05878F]"
                placeholder="Brief description of the subject"
                rows={3}
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={createSubjectMutation.isPending || updateSubjectMutation.isPending}
                className="flex-1 px-6 py-3 bg-[#05878F] text-white rounded-lg hover:bg-[#046a72] transition-colors font-Poppins font-medium disabled:opacity-50"
              >
                {(createSubjectMutation.isPending || updateSubjectMutation.isPending) 
                  ? "Saving..." 
                  : isEditMode ? "Update Subject" : "Add Subject"}
              </button>
              <button
                type="button"
                onClick={handleCloseSlider}
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-Poppins font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </SlidePanel>
    </>
  );
};

export default Subjects;
