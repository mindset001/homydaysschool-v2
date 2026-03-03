// import React, { useEffect, useMemo } from "react";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getClassStudentResult } from "../../services/api/calls/getApis";
import { saveStudentTermReport } from "../../services/api/calls/updateApis";
import Loader from "../../shared/Loader";
import { toast } from "react-toastify";

const ResultView: React.FC<{
  studentID: number | string;
  className: string;
  resultViewToggle: boolean;
  setResultViewToggle: React.Dispatch<React.SetStateAction<boolean>>;
  totalStudentsInClass?: number;
}> = ({
  studentID,
  className: classByName,
  resultViewToggle,
  setResultViewToggle,
  totalStudentsInClass = 0,
}) => {
  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  // Determine term based on month (adjust as needed for your school calendar)
  const getCurrentTerm = () => {
    if (currentMonth >= 0 && currentMonth <= 3) return "2nd term";
    if (currentMonth >= 4 && currentMonth <= 8) return "1st term";
    return "3rd term";
  };
  
  const [term] = useState(getCurrentTerm());
  const [year] = useState(currentYear);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editableData, setEditableData] = useState({
    schoolOpened: "",
    timesPresent: "",
    timesAbsent: "",
    position: "",
    handwriting: "",
    verbalFluency: "",
    game: "",
    sports: "",
    handlingTools: "",
    drawingPainting: "",
    musicSkills: "",
    punctuality: "",
    neatness: "",
    honesty: "",
    cooperation: "",
    leadership: "",
    helpingOthers: "",
    teacherComment: "",
    teacherSignature: "",
    headmasterComment: "",
    headmasterSignature: "",
  });

  const handlePrint = () => {
    window.print();
  };

  const handleEdit = () => {
    setIsEditMode(!isEditMode);
  };

  // Mutation for saving term report
  const saveReportMutation = useMutation({
    mutationFn: saveStudentTermReport,
    onSuccess: () => {
      toast.success("Term report saved successfully!");
      setIsEditMode(false);
      // Invalidate and refetch student results
      queryClient.invalidateQueries({ queryKey: ["subjectresult", studentID] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to save term report");
    },
  });

  const handleSave = () => {
    // Prepare report data
    const reportData = {
      attendance: {
        schoolOpened: editableData.schoolOpened,
        timesPresent: editableData.timesPresent,
        timesAbsent: editableData.timesAbsent,
      },
      position: editableData.position,
      psychomotorSkills: {
        handwriting: editableData.handwriting,
        verbalFluency: editableData.verbalFluency,
        game: editableData.game,
        sports: editableData.sports,
        handlingTools: editableData.handlingTools,
        drawingPainting: editableData.drawingPainting,
        musicSkills: editableData.musicSkills,
      },
      affectiveArea: {
        punctuality: editableData.punctuality,
        neatness: editableData.neatness,
        honesty: editableData.honesty,
        cooperation: editableData.cooperation,
        leadership: editableData.leadership,
        helpingOthers: editableData.helpingOthers,
      },
      comments: {
        teacherComment: editableData.teacherComment,
        teacherSignature: editableData.teacherSignature,
        headmasterComment: editableData.headmasterComment,
        headmasterSignature: editableData.headmasterSignature,
      },
    };

    // Save to backend
    saveReportMutation.mutate({
      studentId: studentID,
      term,
      year,
      reportData,
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setEditableData(prev => ({ ...prev, [field]: value }));
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any

  // Interface for individual result entries
  interface Result {
    id: number;
    subject: string;
    test_score: number;
    exam_score: number;
    total: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any; // For any additional fields not shown
  }

  // Interface for the main student data
  interface StudentResultData {
    id: string | number;
    first_name: string;
    last_name: string;
    middle_name: string;
    gender: string;
    results: Result[];
  }

  const [studentResultData, setStudentResultData] =
    useState<StudentResultData | null>(null);
  // GETTING Student Data
  const {
    data: studentResultRawData,
    isError: isStudentResultError,
    // error: studentsError,
    isLoading: isStudentResultLoading,
  } = useQuery({
    queryKey: ["subjectresult", studentID],
    queryFn: () => getClassStudentResult(studentID),
    enabled: !!studentID && studentID !== 0,
  });

  useEffect(() => {
    console.log(
      "classStudentResult Data and ID :",
      studentID,
      studentResultData,
      isStudentResultError,
      isStudentResultLoading
    );
    if (studentResultRawData?.data?.data?.[0]) {
      const data = studentResultRawData.data.data[0];
      setStudentResultData(data);
      
      // Load term report data if available
      if (data.termReports && data.termReports.length > 0) {
        // Find report for current term and year
        const currentReport = data.termReports.find(
          (report: any) => report.term === term && report.year === year
        );
        
        if (currentReport) {
          setEditableData({
            schoolOpened: currentReport.attendance?.schoolOpened?.toString() || "",
            timesPresent: currentReport.attendance?.timesPresent?.toString() || "",
            timesAbsent: currentReport.attendance?.timesAbsent?.toString() || "",
            position: currentReport.position || "",
            handwriting: currentReport.psychomotorSkills?.handwriting || "",
            verbalFluency: currentReport.psychomotorSkills?.verbalFluency || "",
            game: currentReport.psychomotorSkills?.game || "",
            sports: currentReport.psychomotorSkills?.sports || "",
            handlingTools: currentReport.psychomotorSkills?.handlingTools || "",
            drawingPainting: currentReport.psychomotorSkills?.drawingPainting || "",
            musicSkills: currentReport.psychomotorSkills?.musicSkills || "",
            punctuality: currentReport.affectiveArea?.punctuality || "",
            neatness: currentReport.affectiveArea?.neatness || "",
            honesty: currentReport.affectiveArea?.honesty || "",
            cooperation: currentReport.affectiveArea?.cooperation || "",
            leadership: currentReport.affectiveArea?.leadership || "",
            helpingOthers: currentReport.affectiveArea?.helpingOthers || "",
            teacherComment: currentReport.comments?.teacherComment || "",
            teacherSignature: currentReport.comments?.teacherSignature || "",
            headmasterComment: currentReport.comments?.headmasterComment || "",
            headmasterSignature: currentReport.comments?.headmasterSignature || "",
          });
        }
      }
    }
  }, [
    studentID,
    isStudentResultError,
    isStudentResultLoading,
    studentResultRawData,
    term,
    year,
  ]);

  return (
    resultViewToggle && (
      <div className="fixed top-0 left-0 right-0 bottom-0 bg-white z-[99999]  p-7 w-full flex flex-col flex-1 font-Lora overflow-x-scroll md:overflow-scroll text-nowrap whitespace-nowrap min-h-screen">
        {isStudentResultLoading ? (
          <div className=" font-Lora text-center min-h-[152px] flex flex-row justify-center items-center w-full">
            <Loader />
          </div>
        ) : isStudentResultError ? (
          <div className=" font-Lora text-center w-full font-bold min-h-[152px] flex flex-row justify-center items-center ">
            <span>Error getting data</span>
          </div>
        ) : (
          <div className="overflow-auto w-full flex flex-col flex-1 min-w-[660px] md:min-w-full">
            <div className="font-semibold  text-center my-4">
              <div className="mb-2 gap-10 flex flex-row justify-between items-center text-nowrap">
                <div></div>
                <div className="font-bold text-lg lg:text-xl">REPORT SHEET</div>
                <div className="">2nd term</div>
              </div>
              {/* <div>
              <span className="mr-2">CLASS:</span>
              <span>{className.toUpperCase()}</span>
            </div> */}
            </div>

            <div className="flex flex-col items-center font-semibold text-base">
              <div className="flex gap-1 w-full">
                <div className="text-nowrap">STUDENT'S NAME:</div>
                <div className="flex-1 flex justify-center">
                  {/* Border-bottom applied directly to mimic a table row */}
                  <div className="border-b-[1px] border-black w-full text-center">
                    {`${studentResultData?.last_name} ${studentResultData?.first_name} ${studentResultData?.middle_name}`}
                  </div>
                </div>
              </div>
              <div className="flex flex-row w-full gap-2">
                <div className="w-[60%] ">
                  <div className="mb-[4px]">1. ATTENDANCE</div>
                  <div className="attendance-table">
                    <table className="w-full">
                      <tbody>
                        <tr>
                          <td>Frequencies</td>
                          <td>School Attendance</td>
                        </tr>
                        <tr>
                          <td>No of times School Opened</td>
                          <td>
                            {isEditMode ? (
                              <input
                                type="number"
                                value={editableData.schoolOpened}
                                onChange={(e) => handleInputChange("schoolOpened", e.target.value)}
                                className="w-full border border-gray-300 px-1"
                              />
                            ) : (
                              editableData.schoolOpened
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td>No of times Present</td>
                          <td>
                            {isEditMode ? (
                              <input
                                type="number"
                                value={editableData.timesPresent}
                                onChange={(e) => handleInputChange("timesPresent", e.target.value)}
                                className="w-full border border-gray-300 px-1"
                              />
                            ) : (
                              editableData.timesPresent
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td>No of times Absent</td>
                          <td>
                            {isEditMode ? (
                              <input
                                type="number"
                                value={editableData.timesAbsent}
                                onChange={(e) => handleInputChange("timesAbsent", e.target.value)}
                                className="w-full border border-gray-300 px-1"
                              />
                            ) : (
                              editableData.timesAbsent
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="w-[40%] text-nowrap">
                  <div className="flex flex-row text-[15px] mb-[4px] w-full gap-1">
                    <div className="flex flex-row w-1/2">
                      <div>Class:</div>
                      <div className="pl-1 flex-1">
                        <div className="border-b-[1px] border-black w-full text-center">
                          {classByName.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-row w-1/2">
                      <div>Date:</div>
                      <div className="pl-1 flex-1">
                        <div className="border-b-[1px] border-black w-full text-center">
                          {new Date().toLocaleDateString("en-US")}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="classDate-table">
                    <table className="w-full">
                      <tbody>
                        <tr>
                          <td>
                            <div className="flex flex-row">
                              <div>No in Class:</div>
                              <div className="pl-1 flex-1">
                                <div className="border-b-[1px] border-black w-full text-center">
                                  {totalStudentsInClass}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <div className="flex flex-row">
                              <div>Position:</div>
                              <div className="pl-1 flex-1">
                                <div className="border-b-[1px] border-black w-full text-center">
                                  {isEditMode ? (
                                    <input
                                      type="text"
                                      value={editableData.position}
                                      onChange={(e) => handleInputChange("position", e.target.value)}
                                      className="w-full text-center border-none outline-none"
                                      placeholder="Position"
                                    />
                                  ) : (
                                    editableData.position || "Nil"
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full font-semibold my-1 break">
              <div className="mb-[4px]">2. COGNITIVE ABILITY</div>
              <div className="cognitive-table">
                <table className="w-full text-[14px]">
                  <tbody>
                    <tr>
                      <td colSpan={9} className="text-base">
                        CONTINUOUS ASSESSMENT
                      </td>
                    </tr>
                    <tr>
                      <td></td>
                      <td className="vertical-text">First Periodic Test</td>
                      <td className="vertical-text">Second Periodic Test</td>
                      <td className="vertical-text">End of Term Exam</td>
                      <td className="vertical-text">Overall for Term</td>
                      <td className="vertical-text">TOTAL</td>
                      <td className="vertical-text">Position</td>
                      <td className="vertical-text">Grading</td>
                      <td className="vertical-text">TEACHER'S REMARK</td>
                    </tr>
                    <tr>
                      <td>
                        <div className="flex justify-between px-2">
                          <span>SUBJECT</span>
                          <span>Mx</span>
                        </div>
                      </td>
                      <td>20</td>
                      <td>20</td>
                      <td>60</td>
                      <td>100%</td>
                      <td>100</td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                    {studentResultData?.results?.map((result) => (
                      <tr key={result.id}>
                        <td className="border px-4 py-2">{result.subject}</td>
                        <td></td>
                        <td className="border px-4 py-2">
                          {result.test_score}
                        </td>
                        <td className="border px-4 py-2">
                          {result.exam_score}
                        </td>
                        <td></td>
                        <td className="border px-4 py-2">{result.total}</td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>
                    ))}
                    <tr>
                      <td>Total</td>
                      <td></td>
                      <td>
                        {studentResultData?.results?.length
                          ? studentResultData.results
                              .map((result) => result.test_score)
                              .reduce((a, b) => a + b, 0)
                          : 0}
                      </td>

                      <td>
                        {studentResultData?.results?.length
                          ? studentResultData.results
                              .map((result) => result.exam_score)
                              .reduce((a, b) => a + b, 0)
                          : 0}
                      </td>
                      <td></td>
                      <td>
                        {studentResultData?.results?.length
                          ? studentResultData.results
                              .map((result) => result.total)
                              .reduce((a, b) => a + b, 0)
                          : 0}
                      </td>

                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                    <tr>
                      <td>PERCENTAGE</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-between my-1 font-semibold">
              <div className="w-[40%] text-sm">
                <div className="attendance-table">
                  <table className="w-full">
                    <tbody>
                      <tr>
                        <td>3. PSYCHOMOTOR SKILLS</td>
                        <td>Grading</td>
                      </tr>
                      <tr>
                        <td>Handwriting</td>
                        <td>
                          {isEditMode ? (
                            <input
                              type="text"
                              value={editableData.handwriting}
                              onChange={(e) => handleInputChange("handwriting", e.target.value)}
                              className="w-full border border-gray-300 px-1"
                            />
                          ) : (
                            editableData.handwriting
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Verbal Fluency/Oral</td>
                        <td>
                          {isEditMode ? (
                            <input
                              type="text"
                              value={editableData.verbalFluency}
                              onChange={(e) => handleInputChange("verbalFluency", e.target.value)}
                              className="w-full border border-gray-300 px-1"
                            />
                          ) : (
                            editableData.verbalFluency
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Game</td>
                        <td>
                          {isEditMode ? (
                            <input
                              type="text"
                              value={editableData.game}
                              onChange={(e) => handleInputChange("game", e.target.value)}
                              className="w-full border border-gray-300 px-1"
                            />
                          ) : (
                            editableData.game
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Sports</td>
                        <td>
                          {isEditMode ? (
                            <input
                              type="text"
                              value={editableData.sports}
                              onChange={(e) => handleInputChange("sports", e.target.value)}
                              className="w-full border border-gray-300 px-1"
                            />
                          ) : (
                            editableData.sports
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Handling Tools</td>
                        <td>
                          {isEditMode ? (
                            <input
                              type="text"
                              value={editableData.handlingTools}
                              onChange={(e) => handleInputChange("handlingTools", e.target.value)}
                              className="w-full border border-gray-300 px-1"
                            />
                          ) : (
                            editableData.handlingTools
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Drawing & Painting</td>
                        <td>
                          {isEditMode ? (
                            <input
                              type="text"
                              value={editableData.drawingPainting}
                              onChange={(e) => handleInputChange("drawingPainting", e.target.value)}
                              className="w-full border border-gray-300 px-1"
                            />
                          ) : (
                            editableData.drawingPainting
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Music Skills</td>
                        <td>
                          {isEditMode ? (
                            <input
                              type="text"
                              value={editableData.musicSkills}
                              onChange={(e) => handleInputChange("musicSkills", e.target.value)}
                              className="w-full border border-gray-300 px-1"
                            />
                          ) : (
                            editableData.musicSkills
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="mt-1">
                  <h3>ANALYSIS OF GRADING</h3>
                  <p>A - Excellent</p>
                  <p>B - Good</p>
                  <p>C - Average</p>
                  <p>D - Below Average</p>
                  <p>E - Poor</p>
                </div>
              </div>
              <div className="w-[40%] text-sm">
                <div className="attendance-table">
                  <table className="w-full">
                    <tbody>
                      <tr>
                        <td>4. AFFECTIVE AREA</td>
                        <td>Grading</td>
                      </tr>
                      <tr>
                        <td>Punctuality</td>
                        <td>
                          {isEditMode ? (
                            <input
                              type="text"
                              value={editableData.punctuality}
                              onChange={(e) => handleInputChange("punctuality", e.target.value)}
                              className="w-full border border-gray-300 px-1"
                            />
                          ) : (
                            editableData.punctuality
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Neatness</td>
                        <td>
                          {isEditMode ? (
                            <input
                              type="text"
                              value={editableData.neatness}
                              onChange={(e) => handleInputChange("neatness", e.target.value)}
                              className="w-full border border-gray-300 px-1"
                            />
                          ) : (
                            editableData.neatness
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Honesty</td>
                        <td>
                          {isEditMode ? (
                            <input
                              type="text"
                              value={editableData.honesty}
                              onChange={(e) => handleInputChange("honesty", e.target.value)}
                              className="w-full border border-gray-300 px-1"
                            />
                          ) : (
                            editableData.honesty
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Cooperation with others</td>
                        <td>
                          {isEditMode ? (
                            <input
                              type="text"
                              value={editableData.cooperation}
                              onChange={(e) => handleInputChange("cooperation", e.target.value)}
                              className="w-full border border-gray-300 px-1"
                            />
                          ) : (
                            editableData.cooperation
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Leadership</td>
                        <td>
                          {isEditMode ? (
                            <input
                              type="text"
                              value={editableData.leadership}
                              onChange={(e) => handleInputChange("leadership", e.target.value)}
                              className="w-full border border-gray-300 px-1"
                            />
                          ) : (
                            editableData.leadership
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Helping Others</td>
                        <td>
                          {isEditMode ? (
                            <input
                              type="text"
                              value={editableData.helpingOthers}
                              onChange={(e) => handleInputChange("helpingOthers", e.target.value)}
                              className="w-full border border-gray-300 px-1"
                            />
                          ) : (
                            editableData.helpingOthers
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td>Emotional Stability</td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>Health</td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>Attitude to school works</td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>Attentiveness</td>
                        <td></td>
                      </tr>
                      <tr>
                        <td>Perseverance</td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="font-semibold my-1">
              <div className="flex">
                <div className="flex w-[75%]">
                  <div>Class Teacher's Comment</div>
                  <div className="pl-1 flex-1">
                    <div className="border-b-[1px] border-black w-full">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={editableData.teacherComment}
                          onChange={(e) => handleInputChange("teacherComment", e.target.value)}
                          className="w-full border-none outline-none"
                          placeholder="Teacher's comment"
                        />
                      ) : (
                        editableData.teacherComment || ":"
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex w-[25%]">
                  <div>Signature</div>
                  <div className="pl-1 flex-1">
                    <div className="border-b-[1px] border-black w-full">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={editableData.teacherSignature}
                          onChange={(e) => handleInputChange("teacherSignature", e.target.value)}
                          className="w-full border-none outline-none"
                          placeholder="Signature"
                        />
                      ) : (
                        editableData.teacherSignature || ":"
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex w-full">
                <div>Headmaster's / Headmistress's Comment</div>
                <div className="pl-1 flex-1">
                  <div className="border-b-[1px] border-black w-full">
                    {isEditMode ? (
                      <input
                        type="text"
                        value={editableData.headmasterComment}
                        onChange={(e) => handleInputChange("headmasterComment", e.target.value)}
                        className="w-full border-none outline-none"
                        placeholder="Headmaster's comment"
                      />
                    ) : (
                      editableData.headmasterComment || ":"
                    )}
                  </div>
                </div>
              </div>
              <div className="flex">
                <div className="flex w-[50%]">
                  <div>Signature ( Date / School Stamp )</div>
                  <div className="pl-1 flex-1">
                    <div className="border-b-[1px] border-black w-full">
                      {isEditMode ? (
                        <input
                          type="text"
                          value={editableData.headmasterSignature}
                          onChange={(e) => handleInputChange("headmasterSignature", e.target.value)}
                          className="w-full border-none outline-none"
                          placeholder="Signature"
                        />
                      ) : (
                        editableData.headmasterSignature || ":"
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex w-[50%]">
                  <div>Parent's Signature and Date</div>
                  <div className="pl-1 flex-1">
                    <div className="border-b-[1px] border-black w-full">
                      {":"}
                    </div>
                  </div>
                </div>
              </div>
              {/* <div></div> */}
            </div>

            {/* <div className={`my-5 font-semibold block`}>
            <span className="font-bold">Note:*</span> If the document exceeds the
            screen size when printing, adjust the print layout to Landscape and/or
            reduce the printing scale in the "More Settings" section to ensure it
            fits on the page.
          </div> */}
            <div className="tablebody-button">
              {isEditMode ? (
                <>
                  <button 
                    onClick={handleSave} 
                    className="bg-green-500 hover:bg-green-600"
                    disabled={saveReportMutation.isPending}
                  >
                    {saveReportMutation.isPending ? "Saving..." : "Save"}
                  </button>
                  <button 
                    onClick={handleEdit} 
                    className="bg-gray-500 hover:bg-gray-600"
                    disabled={saveReportMutation.isPending}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleEdit} className="bg-blue-500 hover:bg-blue-600">Edit</button>
                  <button onClick={handlePrint}>Print</button>
                  <button onClick={() => setResultViewToggle(false)}>Close</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    )
  );
};

export default ResultView;
