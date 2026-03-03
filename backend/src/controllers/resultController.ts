import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { Student } from '../models/Student.js';
import { Class } from '../models/Class.js';

// Helper function to calculate grade from average score
const calculateGrade = (average: number): string => {
  if (average >= 80) return 'A';
  if (average >= 70) return 'B';
  if (average >= 60) return 'C';
  if (average >= 50) return 'D';
  if (average >= 40) return 'E';
  return 'F';
};

export const uploadResult = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('Upload result request received');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    // Check if file was uploaded
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }

    const { term, academicYear, className, class_id } = req.body;

    // Validate required fields
    if (!term || !academicYear) {
      res.status(400).json({ message: 'Term and academic year are required' });
      return;
    }

    // Read the uploaded Excel file
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert worksheet to JSON
    const data: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    console.log('Excel data rows:', data.length);
    console.log('First few rows:', data.slice(0, 5));

    if (data.length < 3) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      res.status(400).json({ message: 'Invalid file format: insufficient data' });
      return;
    }

    // Get headers from rows 1 and 2
    const headerRow1 = data[0];
    const headerRow2 = data[1];

    // Parse headers to identify subject columns
    const subjectColumns: { [key: string]: { testCol: number; examCol: number; totalCol: number } } = {};
    
    let currentSubject = '';
    for (let i = 3; i < headerRow1.length; i++) {
      const header1 = headerRow1[i];
      const header2 = headerRow2[i];

      // If header1 has a value, it's a new subject
      if (header1 && header1 !== '') {
        currentSubject = header1.toString().trim();
        if (!subjectColumns[currentSubject]) {
          subjectColumns[currentSubject] = { testCol: -1, examCol: -1, totalCol: -1 };
        }
      }

      // Check header2 for Test, Exam, Total
      if (currentSubject && header2) {
        const subHeader = header2.toString().trim().toLowerCase();
        if (subHeader === 'test') {
          subjectColumns[currentSubject].testCol = i;
        } else if (subHeader === 'exam') {
          subjectColumns[currentSubject].examCol = i;
        } else if (subHeader === 'total') {
          subjectColumns[currentSubject].totalCol = i;
        }
      }
    }

    console.log('Parsed subject columns:', subjectColumns);

    // Get class info
    let classInfo: any = null;
    if (class_id) {
      classInfo = await Class.findById(class_id);
    } else if (className) {
      classInfo = await Class.findOne({ name: className });
    }

    if (!classInfo) {
      fs.unlinkSync(req.file.path);
      res.status(400).json({ message: 'Class not found' });
      return;
    }

    // Process student rows (starting from row 3, index 2)
    const uploadedResults: any[] = [];
    const errors: any[] = [];

    for (let i = 2; i < data.length; i++) {
      const row = data[i];
      
      // Skip empty rows
      if (!row || row.length === 0 || !row[1]) {
        continue;
      }

      const studentName = row[1]?.toString().trim();
      const studentId = row[2]?.toString().trim();

      if (!studentName || !studentId) {
        errors.push({ row: i + 1, message: 'Missing student name or ID' });
        continue;
      }

      try {
        // Find student by studentId and class
        const student = await Student.findOne({
          studentId: studentId,
          class: classInfo.name
        }).populate('userId', 'firstName lastName');

        if (!student) {
          errors.push({ row: i + 1, studentId, message: 'Student not found' });
          continue;
        }

        // Extract scores for each subject
        const results: { subject: string; test: number; exam: number; score: number; grade: string }[] = [];
        let totalScore = 0;
        let subjectCount = 0;

        for (const [subject, cols] of Object.entries(subjectColumns)) {
          const testScore = parseFloat(row[cols.testCol]) || 0;
          const examScore = parseFloat(row[cols.examCol]) || 0;
          const total = testScore + examScore;

          if (testScore > 0 || examScore > 0) {
            const grade = calculateGrade(total);
            results.push({
              subject,
              test: testScore,
              exam: examScore,
              score: total,
              grade
            });

            totalScore += total;
            subjectCount++;
          }
        }

        const average = subjectCount > 0 ? totalScore / subjectCount : 0;

        // Update or create academic record for this term
        const existingRecordIndex = student.academicRecords?.findIndex(
          (record) => record.term === term && record.year === parseInt(academicYear)
        );

        const academicRecord = {
          term,
          year: parseInt(academicYear),
          results: results.map(r => ({
            subject: r.subject,
            score: r.score,
            grade: r.grade
          }))
        };

        if (existingRecordIndex !== undefined && existingRecordIndex >= 0 && student.academicRecords) {
          // Update existing record
          student.academicRecords[existingRecordIndex] = academicRecord as any;
        } else {
          // Add new record
          if (!student.academicRecords) {
            student.academicRecords = [];
          }
          student.academicRecords.push(academicRecord as any);
        }

        await student.save();

        uploadedResults.push({
          studentId,
          studentName,
          subjectCount,
          totalScore,
          average: average.toFixed(2),
          grade: calculateGrade(average)
        });

      } catch (error: any) {
        errors.push({
          row: i + 1,
          studentId,
          message: error.message || 'Error processing student'
        });
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    console.log(`Successfully uploaded results for ${uploadedResults.length} students`);
    console.log(`Errors: ${errors.length}`);

    res.json({
      message: 'Results uploaded successfully',
      data: {
        className: classInfo.name,
        term,
        academicYear,
        successCount: uploadedResults.length,
        errorCount: errors.length,
        results: uploadedResults,
        errors: errors.length > 0 ? errors.slice(0, 10) : [] // Return first 10 errors
      }
    });

  } catch (error: any) {
    console.error('Error uploading results:', error);
    
    // Clean up uploaded file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get student results by student ID
export const getStudentResults = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    console.log('Fetching results for student ID:', id);

    // Find student by ID and populate user data
    const student = await Student.findById(id).populate('userId', 'firstName lastName');

    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }

    // Format the response data
    const responseData = {
      id: student._id,
      studentId: student.studentId,
      first_name: (student.userId as any)?.firstName || '',
      middle_name: '', // Middle name not stored in User model
      last_name: (student.userId as any)?.lastName || '',
      gender: (student.userId as any)?.gender || student.gender || '',
      class: student.class,
      academicRecords: student.academicRecords || [],
      termReports: student.termReports || [],
      // For backward compatibility, also include latest results
      results: student.academicRecords && student.academicRecords.length > 0
        ? student.academicRecords[student.academicRecords.length - 1].results.map((r: any) => ({
            subject: r.subject,
            test_score: r.test || 0,
            exam_score: r.exam || 0,
            total: r.score || 0,
            grade: r.grade || ''
          }))
        : []
    };

    res.json({
      message: 'Student results retrieved successfully',
      data: [responseData] // Wrapped in array for compatibility with existing frontend code
    });

  } catch (error: any) {
    console.error('Error fetching student results:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const saveStudentTermReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { term, year, reportData } = req.body;

    console.log('Saving term report for student ID:', id);
    console.log('Term:', term, 'Year:', year);

    // Validate required fields
    if (!term || !year) {
      res.status(400).json({ message: 'Term and year are required' });
      return;
    }

    // Find student by ID
    const student = await Student.findById(id);

    if (!student) {
      res.status(404).json({ message: 'Student not found' });
      return;
    }

    // Prepare term report data
    const termReport = {
      term,
      year: parseInt(year),
      attendance: {
        schoolOpened: reportData.attendance?.schoolOpened ? parseInt(reportData.attendance.schoolOpened) : undefined,
        timesPresent: reportData.attendance?.timesPresent ? parseInt(reportData.attendance.timesPresent) : undefined,
        timesAbsent: reportData.attendance?.timesAbsent ? parseInt(reportData.attendance.timesAbsent) : undefined,
      },
      position: reportData.position || '',
      psychomotorSkills: {
        handwriting: reportData.psychomotorSkills?.handwriting || '',
        verbalFluency: reportData.psychomotorSkills?.verbalFluency || '',
        game: reportData.psychomotorSkills?.game || '',
        sports: reportData.psychomotorSkills?.sports || '',
        handlingTools: reportData.psychomotorSkills?.handlingTools || '',
        drawingPainting: reportData.psychomotorSkills?.drawingPainting || '',
        musicSkills: reportData.psychomotorSkills?.musicSkills || '',
      },
      affectiveArea: {
        punctuality: reportData.affectiveArea?.punctuality || '',
        neatness: reportData.affectiveArea?.neatness || '',
        honesty: reportData.affectiveArea?.honesty || '',
        cooperation: reportData.affectiveArea?.cooperation || '',
        leadership: reportData.affectiveArea?.leadership || '',
        helpingOthers: reportData.affectiveArea?.helpingOthers || '',
      },
      comments: {
        teacherComment: reportData.comments?.teacherComment || '',
        teacherSignature: reportData.comments?.teacherSignature || '',
        headmasterComment: reportData.comments?.headmasterComment || '',
        headmasterSignature: reportData.comments?.headmasterSignature || '',
      },
    };

    // Check if term report already exists for this term/year
    if (!student.termReports) {
      student.termReports = [];
    }

    const existingReportIndex = student.termReports.findIndex(
      (report: any) => report.term === term && report.year === parseInt(year)
    );

    if (existingReportIndex >= 0) {
      // Update existing report
      student.termReports[existingReportIndex] = termReport as any;
    } else {
      // Add new report
      student.termReports.push(termReport as any);
    }

    await student.save();

    console.log('Term report saved successfully');

    res.json({
      message: 'Term report saved successfully',
      data: termReport
    });

  } catch (error: any) {
    console.error('Error saving term report:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
