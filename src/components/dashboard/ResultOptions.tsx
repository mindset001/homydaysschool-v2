import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { memo, useEffect, useMemo, useState } from "react";
import { getSubjects } from "../../services/api/calls/getApis";
import Loader from "../../shared/Loader";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import {
  generateTemplate,
  uploadResult,
} from "../../services/api/calls/postApis";
import { getAccessToken } from "../../utils/authTokens";
// import { Link, useNavigate } from "react-router-dom";
interface subjectDataI {
  description: string;
  id: number;
  name: string;
}

interface selectedSubjectsDataI {
  subjects: string[];
  class_id: number | string;
}
const ResultOptions: React.FC<{
  optionsToggle: boolean;
  setOptionsToggle: React.Dispatch<React.SetStateAction<boolean>>;
  classActiveID: number | string;
  setFilePreview: React.Dispatch<React.SetStateAction<[]>>;
  setFilePreviewToggle: React.Dispatch<React.SetStateAction<boolean>>;
  fileName: string;
  setFileName: React.Dispatch<React.SetStateAction<string>>;
}> = ({
  optionsToggle,
  setOptionsToggle,
  classActiveID,
  setFilePreview,
  setFilePreviewToggle,
  fileName,
  setFileName,
}) => {
  const [selectedFile, setSelectedFile] = useState<{
    file: File | null;
    stu_class: number | string;
  }>({
    file: null,
    stu_class: 0,
  });

  const [subjectToggle, setSubjectToggle] = useState<boolean>(false);
  const [subjectDataArr, setSubjectDataArr] = useState<subjectDataI[]>([]);
  const [selectedSubjectsData, setSelectedSubjectsData] =
    useState<selectedSubjectsDataI>({
      subjects: [],
      class_id: classActiveID,
    });
  const [downloadTemplate, setDownloadTemplate] = useState("");
  const [selectedTerm, setSelectedTerm] = useState<string>("First Term");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>("2026/2027");
  
  // Handle template download with proper authentication
  const handleDownloadTemplate = async () => {
    console.log('=== Download Template Started ===');
    console.log('downloadTemplate value:', downloadTemplate);
    
    if (!downloadTemplate) {
      toast.error('No template to download');
      console.error('No download template URL available');
      return;
    }
    
    try {
      // Get authentication credentials from cookies (not localStorage)
      const token = getAccessToken(); // This gets the token from cookies
      const apiKey = import.meta.env.VITE_REACT_APP_API_KEY;
      
      console.log('Token exists:', !!token);
      console.log('Token value:', token ? `${token.substring(0, 20)}...` : 'null');
      console.log('API Key:', apiKey);
      
      if (!token) {
        toast.error('Authentication required. Please log in.');
        console.error('No access token found in cookies');
        return;
      }
      
      if (!apiKey) {
        toast.error('API configuration error');
        console.error('No API key found in environment');
        return;
      }
      
      // Build the full URL
      const baseURL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:5000/api';
      const fullUrl = downloadTemplate.startsWith('http') 
        ? downloadTemplate 
        : `${baseURL.replace('/api', '')}${downloadTemplate}`;
      
      console.log('Download URL:', fullUrl);
      console.log('Base URL:', baseURL);
      
      // Show loading toast
      const loadingToast = toast.loading('Downloading template...');
      
      // Fetch the file with authentication headers
      console.log('Starting fetch request...');
      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-API-Key': apiKey
        },
        mode: 'cors',
        credentials: 'include'
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Download error response:', errorText);
        toast.dismiss(loadingToast);
        
        if (response.status === 403) {
          toast.error('Access denied. Please check your permissions or log in again.');
        } else if (response.status === 404) {
          toast.error('Template file not found.');
        } else if (response.status === 401) {
          toast.error('Session expired. Please log in again.');
        } else {
          toast.error(`Download failed: ${response.statusText}`);
        }
        return;
      }
      
      // Get the blob from response
      console.log('Getting blob from response...');
      const blob = await response.blob();
      console.log('Downloaded blob size:', blob.size, 'bytes');
      console.log('Downloaded blob type:', blob.type);
      
      if (blob.size === 0) {
        toast.dismiss(loadingToast);
        toast.error('Downloaded file is empty');
        console.error('Empty blob received');
        return;
      }
      
      // Create object URL from blob
      const url = window.URL.createObjectURL(blob);
      console.log('Created object URL:', url);
      
      // Create temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.style.display = 'none';
      
      // Extract filename from download_link or use default
      const filename = downloadTemplate.split('/').pop() || 'result_template.xlsx';
      link.download = filename;
      console.log('Downloading as:', filename);
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Clean up after a short delay
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        console.log('Cleanup completed');
      }, 100);
      
      // Show success and close modal
      toast.dismiss(loadingToast);
      toast.success('Template downloaded successfully!');
      console.log('=== Download Template Completed Successfully ===');
      setOptionsToggle(false);
      
    } catch (error: any) {
      console.error('=== Download Template Error ===');
      console.error('Error details:', error);
      console.error('Error stack:', error.stack);
      toast.error(`Failed to download template: ${error.message}`);
    }
  };
  
  useEffect(() => {
    console.log("Selected Subjects", selectedSubjectsData);
  }, [selectedSubjectsData]);
  // GETTING CLASS Data
  const {
    data: subject,
    isError: isSubjectError,
    // error: subjectError,
    isLoading: isSubjectLoading,
  } = useQuery({
    queryKey: ["subject"],
    queryFn: () => getSubjects(),
  });

  const subjectData: subjectDataI[] = useMemo(() => {
    return (subject && subject?.data?.data) || [];
  }, [subject]);

  useEffect(() => {
    // console.log("Subjectsss", subjectData);
    subjectData && setSubjectDataArr(subjectData);
  }, [subjectData]);

  const handleCheckboxChange = (subjectName: string) => {
    setSelectedSubjectsData((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subjectName)
        ? prev.subjects.filter((name) => name !== subjectName)
        : [...prev.subjects, subjectName],
    }));
  };

  // ///////////////////////
  // Submit Subject POST Request
  const queryClient = useQueryClient();
  const useGenerateTemplate = useMutation({
    mutationFn: generateTemplate,
  });
  const { mutate: mutateTemp, isPending: isSubmittingSubject } =
    useGenerateTemplate;
  const handleSubmitSelectedSubject = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    
    if (!selectedTerm || !selectedAcademicYear) {
      toast.error("Please select term and academic year");
      return;
    }
    
    const templateData = {
      ...selectedSubjectsData,
      term: selectedTerm,
      academicYear: selectedAcademicYear,
    };
    
    mutateTemp(templateData, {
      onSuccess: (response: { data: { data: { download_link: string } } }) => {
        queryClient.invalidateQueries({ queryKey: ["subject"] });
        const generatedTemp = response.data.data.download_link;
        generatedTemp && setDownloadTemplate(generatedTemp);
        toast.success("Result Template generated successfully!");
        setSubjectToggle(false);
      },
      onError: (error: { message: string }) => {
        console.error("Error generating template: ", error);
        toast.error("Error generating template: " + error.message);
      },
    });
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFileChange = (event: { target: any }) => {
    const fileData = event.target.files[0];
    if (
      fileData &&
      fileData?.name?.split(".")[fileData?.name?.split(".").length - 1] !==
        "xlsx"
    ) {
      toast.error("Only Spreadsheet (.xlsx) file is allowed!");
      return;
    }
    // const fileLength =
    //   fileData.name.length > 10
    //     ? `${fileData.name.split(".")[0].slice(0, 10)}...${fileData.name
    //         .split(".")
    //         .pop()}`
    //     : fileData.name;
    setSelectedFile((prev) => ({
      ...prev,
      file: fileData,
      stu_class: classActiveID,
    }));
    setFileName(fileData ? fileData.name : "No file selected");

    console.log("xlsx file", fileData + ",,," + selectedFile.file?.name);
    if (fileData) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event?.target?.result;
        if (result && typeof result !== "string") {
          const data = new Uint8Array(result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const jsonData: any = XLSX.utils.sheet_to_json(sheet);
          setFilePreview(jsonData);
        }
      };
      reader.readAsArrayBuffer(fileData);
    }
  };

  // ///////////////////////
  // Submit/Upload File .xlsx data POST Request

  const useUploadResult = useMutation({
    mutationFn: uploadResult,
  });
  const { mutate: mutateResult, isPending: isUploadingResult } =
    useUploadResult;
  const handleUploadResult = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    
    if (!selectedTerm || !selectedAcademicYear) {
      toast.error("Please select term and academic year");
      return;
    }
    
    const data = new FormData();
    if (selectedFile.file) {
      data.append("file", selectedFile.file);
      data.append("class_id", selectedFile.stu_class as unknown as string);
      data.append("term", selectedTerm);
      data.append("academicYear", selectedAcademicYear);
    }
    console.log("Testing formData()", data);
    mutateResult(data, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["subject"] });
        // const resultResponse = response.data.data.download_link;
        // generatedTemp && setDownloadTemplate(generatedTemp);
        // console.log("Result response", resultResponse);
        toast.success("Result uploaded successfully!");
        setOptionsToggle(false);
      },
      onError: (error: { message: string }) => {
        console.error("Error uploading result: ", error);
        toast.error("Error uploading result: " + error.message);
      },
    });
  };

  useEffect(() => {
    console.log("Temp", downloadTemplate.replace("http", "https"));
  }, [downloadTemplate]);
  //   const navigate = useNavigate();

  return (
    <div
      className={`results-options ${optionsToggle ? "flex" : "hidden md:flex"}`}
    >
      <div className="border bg-white relative md:static">
        <button
          className="w-full flex flex-row gap-1 justify-center"
          onClick={() => setSubjectToggle((prev) => !prev)}
        >
          <div>Select Subject</div>
          <div
            className={`ml-3 text-[12px] ${
              subjectToggle
                ? "rotate-180 duration-300"
                : "rotate-0 duration-300"
            }
                `}
          >
            &#9660;
          </div>
        </button>
        <form
          onSubmit={handleSubmitSelectedSubject}
          className={`md:mt-2  absolute md:static z-20 bg-white border-b-2  w-full ${
            subjectToggle ? "block" : "hidden"
          }`}
        >
          <div className="max-h-[200px] overflow-y-auto">
            {isSubjectLoading ? (
              <div className=" font-Lora text-center w-full min-h-[152px] flex flex-row justify-center items-center">
                <Loader />
              </div>
            ) : isSubjectError ? (
              <div className=" font-Lora text-center w-full min-h-[152px] font-bold flex flex-row justify-center items-center">
                <span>Error fetching data</span>
              </div>
            ) : (
              subjectDataArr?.map((subjects, index) => {
                return (
                  <div
                    key={index}
                    onClick={() => handleCheckboxChange(subjects.name)}
                    className="flex flex-row gap-2 px-2 py-[3px] md:py-[4px] border hover:bg-slate-300 cursor-pointer text-base md:text-sm xl:text-base "
                  >
                    <input
                      type="checkbox"
                      id={subjects.name}
                      name={subjects.name}
                      value={subjects.name}
                      onChange={() => {}}
                      checked={selectedSubjectsData.subjects.includes(
                        subjects.name
                      )}
                      className="  checked:bg-black accent-[#05878F] appearance-auto hover:accent-[#05878F] border-[#05878F] cursor-pointer"
                    />
                    <span>
                      {subjects.name.length > 17
                        ? subjects.name.slice(0, 17) + ".."
                        : subjects.name}
                    </span>
                    <br />
                  </div>
                );
              })
            )}
          </div>
          <button
            type="submit"
            disabled={
              isSubmittingSubject || selectedSubjectsData.subjects.length <= 0
            }
            className={`w-full ${
              selectedSubjectsData.subjects.length <= 0 || isSubmittingSubject
                ? "cursor-not-allowed bg-[#c2cacf] hover:bg-[#c2cacf] text-slate-400"
                : "cursor-pointer bg-[#05878F] hover:bg-[#05878F]/70 text-white"
            }`}
          >
            {isSubmittingSubject
              ? "Submitting..."
              : `Submit Subject (${selectedSubjectsData.subjects.length})`}
          </button>
        </form>
      </div>
      <button
        onClick={handleDownloadTemplate}
        disabled={!downloadTemplate}
        className={` w-full ${
          !downloadTemplate
            ? "cursor-not-allowed bg-[#c2cacf] hover:bg-[#c2cacf] text-slate-400"
            : "cursor-pointer bg-[#05878F] hover:bg-[#05878F]/70 text-white"
        }`}
      >
        Download Template
      </button>
      
      {/* Term Selection */}
      <div className="border bg-white">
        <label className="text-sm font-medium block px-2 py-1 text-gray-700">
          Select Term
        </label>
        <select
          value={selectedTerm}
          onChange={(e) => setSelectedTerm(e.target.value)}
          className="w-full px-2 py-2 border-t bg-white focus:outline-none focus:ring-2 focus:ring-[#05878F] cursor-pointer"
        >
          <option value="First Term">First Term</option>
          <option value="Second Term">Second Term</option>
          <option value="Third Term">Third Term</option>
        </select>
      </div>
      
      {/* Academic Year Selection */}
      <div className="border bg-white">
        <label className="text-sm font-medium block px-2 py-1 text-gray-700">
          Academic Year
        </label>
        <select
          value={selectedAcademicYear}
          onChange={(e) => setSelectedAcademicYear(e.target.value)}
          className="w-full px-2 py-2 border-t bg-white focus:outline-none focus:ring-2 focus:ring-[#05878F] cursor-pointer"
        >
          <option value="2025/2026">2025/2026</option>
          <option value="2026/2027">2026/2027</option>
          <option value="2027/2028">2027/2028</option>
          <option value="2028/2029">2028/2029</option>
          <option value="2029/2030">2029/2030</option>
        </select>
      </div>
      
      <div className="file-upload text-base md:text-sm lg:text-base relative">
        <label
          //   htmlFor="file-input"
          onClick={() => {}}
          className="custom-file-label text-base md:text-sm lg:text-base w-full"
        >
          Select File Field (xlsx)
        </label>
        <div className="flex flex-col justify-center items-center">
          <input
            type="file"
            id="file-input"
            className="custom-file-input w-[100px] md:w-[100px] lg:w-[100px] cursor-pointer mt-2"
            onChange={handleFileChange}
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          />
          <span id="file-name" className="truncate px-3">
            {fileName !== "No file selected" && fileName.length > 10
              ? `${fileName.split(".")[0].slice(0, 10)}...${fileName
                  .split(".")
                  .pop()}`
              : fileName}
          </span>
        </div>
      </div>
      {/* <div key={selectedFile.file?.name || "no-file"}>
        <input type="file" id="filee" onChange={handleFileChange} />
        <br /><br /> <br />
        <label htmlFor="filee" className="my-9 border">Selected File: {selectedFile.file?.name || "None"}</label>
        <button
          disabled={!selectedFile.file}
          onClick={() => console.log("Uploading:", selectedFile.file)}
        >
          Upload
        </button>
      </div> */}
      <button
        disabled={!selectedFile.file}
        onClick={() => setFilePreviewToggle(true)}
        // type="submit"
        className={
          !selectedFile.file
            ? "cursor-not-allowed bg-[#c2cacf] hover:bg-[#c2cacf] text-slate-400"
            : "cursor-pointer bg-[#05878F] hover:bg-[#05878F]/70 text-white"
        }
      >
        {"Preview File"}
      </button>
      <button
        disabled={!selectedFile.file}
        onClick={handleUploadResult}
        // type="submit"
        className={
          !selectedFile.file
            ? "cursor-not-allowed bg-[#c2cacf] hover:bg-[#c2cacf] text-slate-400"
            : "cursor-pointer bg-[#05878F] hover:bg-[#05878F]/70 text-white"
        }
      >
        {isUploadingResult ? "Uploading..." : "Upload Result"}
      </button>

      {/* {selectedFile.file && (
        <ul className="fixed top-96 left-96 right-10 bottom-10 bg-white z-[99999] text-[12px]">
          {filePreview.map((row, index) => (
            <li key={index}>{JSON.stringify(row)}</li>
          ))}
        </ul>
      )} */}
    </div>
  );
};

export default memo(ResultOptions);
