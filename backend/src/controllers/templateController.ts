import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { Student } from '../models/Student.js';
import { Class } from '../models/Class.js';

export const generateTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    console.log('Generating result template with data:', req.body);
    
    const { subjects, className, class_id, term, academicYear } = req.body;
    
    // Validate required fields
    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      res.status(400).json({ message: 'Subjects array is required and must not be empty' });
      return;
    }
    
    // Fetch actual students from the database
    let students: any[] = [];
    let classInfo: any = null;
    
    if (class_id) {
      console.log(`Fetching students for class ID: ${class_id}`);
      
      // Get class information
      classInfo = await Class.findById(class_id);
      
      if (classInfo) {
        console.log(`Found class: ${classInfo.name}`);
        // Get students from this class and populate user data to get firstName and lastName
        students = await Student.find({ class: classInfo.name })
          .populate('userId', 'firstName lastName')
          .select('userId studentId admissionNumber')
          .sort({ 'userId.firstName': 1 })
          .lean();
        
        console.log(`Found ${students.length} students for class ${classInfo.name}`);
      } else {
        console.log(`No class found with ID: ${class_id}`);
      }
    } else if (className) {
      console.log(`Fetching students for class name: ${className}`);
      students = await Student.find({ class: className })
        .populate('userId', 'firstName lastName')
        .select('userId studentId admissionNumber')
        .sort({ 'userId.firstName': 1 })
        .lean();
      
      console.log(`Found ${students.length} students for class ${className}`);
    }
    
    // Create template data structure with clear headers for each column
    const templateData: any[] = [];
    
    // Build header row 1 (Subject names with Test/Exam/Total subheaders)
    const headerRow1: any = {
      'S/N': 'S/N',
      'Student Name': 'Student Name',
      'Student ID': 'Student ID',
    };
    
    // Build header row 2 (Sub-headers)
    const headerRow2: any = {
      'S/N': '',
      'Student Name': '',
      'Student ID': '',
    };
    
    // Add columns for each subject with Test, Exam, Total
    subjects.forEach((subject: string) => {
      // Use unique column names for each subject's test, exam, and total
      headerRow1[`${subject} - Test`] = subject;
      headerRow1[`${subject} - Exam`] = '';
      headerRow1[`${subject} - Total`] = '';
      
      headerRow2[`${subject} - Test`] = 'Test';
      headerRow2[`${subject} - Exam`] = 'Exam';
      headerRow2[`${subject} - Total`] = 'Total';
    });
    
    // Add summary columns
    headerRow1['Overall Total'] = 'Total';
    headerRow1['Average'] = 'Average';
    headerRow1['Grade'] = 'Grade';
    headerRow1['Position'] = 'Position';
    headerRow1['Remarks'] = 'Remarks';
    
    headerRow2['Overall Total'] = '';
    headerRow2['Average'] = '';
    headerRow2['Grade'] = '';
    headerRow2['Position'] = '';
    headerRow2['Remarks'] = '';
    
    // Add both header rows
    templateData.push(headerRow1);
    templateData.push(headerRow2);
    
    // Add actual student rows or sample rows if no students found
    if (students.length > 0) {
      students.forEach((student: any, index) => {
        const user = student.userId;
        const studentRow: any = {
          'S/N': index + 1,
          'Student Name': user ? `${user.firstName} ${user.lastName}` : 'Unknown Student',
          'Student ID': student.studentId || student.admissionNumber || '',
        };
        
        // Add empty cells for each subject - Test, Exam, Total for each
        subjects.forEach((subject: string) => {
          studentRow[`${subject} - Test`] = '';
          studentRow[`${subject} - Exam`] = '';
          studentRow[`${subject} - Total`] = '';
        });
        
        // Add empty cells for calculated fields
        studentRow['Overall Total'] = '';
        studentRow['Average'] = '';
        studentRow['Grade'] = '';
        studentRow['Position'] = '';
        studentRow['Remarks'] = '';
        
        templateData.push(studentRow);
      });
      
      console.log(`Template populated with ${students.length} actual students`);
    } else {
      // Add sample rows if no students found
      console.log('No students found, adding sample data');
      for (let i = 1; i <= 5; i++) {
        const sampleRow: any = {
          'S/N': i,
          'Student Name': `Sample Student ${i}`,
          'Student ID': `STU000${i}`,
        };
        
        // Add empty cells for each subject
        subjects.forEach((subject: string) => {
          sampleRow[`${subject} - Test`] = '';
          sampleRow[`${subject} - Exam`] = '';
          sampleRow[`${subject} - Total`] = '';
        });
        
        // Add empty cells for calculated fields
        sampleRow['Overall Total'] = '';
        sampleRow['Average'] = '';
        sampleRow['Grade'] = '';
        sampleRow['Position'] = '';
        sampleRow['Remarks'] = '';
        
        templateData.push(sampleRow);
      }
    }
    
    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(templateData, { skipHeader: false });
    
    // Set column widths for better formatting
    const columnWidths: any = {
      'S/N': { wch: 8 },
      'Student Name': { wch: 25 },
      'Student ID': { wch: 15 },
    };
    
    // Add width for each subject column (Test, Exam, Total = 3 columns per subject)
    subjects.forEach((subject: string) => {
      columnWidths[`${subject} - Test`] = { wch: 10 };
      columnWidths[`${subject} - Exam`] = { wch: 10 };
      columnWidths[`${subject} - Total`] = { wch: 10 };
    });
    
    // Add widths for summary columns
    columnWidths['Overall Total'] = { wch: 10 };
    columnWidths['Average'] = { wch: 12 };
    columnWidths['Grade'] = { wch: 8 };
    columnWidths['Position'] = { wch: 10 };
    columnWidths['Remarks'] = { wch: 20 };
    
    // Convert columnWidths object to array for worksheet
    const colArray: any[] = [];
    Object.keys(headerRow1).forEach((key) => {
      colArray.push(columnWidths[key] || { wch: 10 });
    });
    
    worksheet['!cols'] = colArray;
    
    // Add the worksheet to workbook with class name    worksheet['!cols'] = columnWidths;
    
    // Add the worksheet to workbook with class name
    const actualClassName = classInfo?.name || className || 'Unknown Class';
    const sheetName = `${actualClassName} Results`;
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Generate unique filename with class name
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const classNameForFile = actualClassName.replace(/\s+/g, '_');
    const fileName = `${classNameForFile}_results_${timestamp}.xlsx`;
    
    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'uploads', 'templates');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Save file
    const filePath = path.join(uploadsDir, fileName);
    XLSX.writeFile(workbook, filePath);
    
    // Generate download link (you may need to adjust this based on your file serving setup)
    const downloadLink = `/api/templates/download/${fileName}`;
    
    console.log('Template generated successfully:', filePath);
    console.log(`Template contains ${students.length} students from class ${actualClassName}`);
    
    res.json({
      message: 'Result template generated successfully',
      data: {
        download_link: downloadLink,
        filename: fileName,
        subjects: subjects,
        className: actualClassName,
        studentCount: students.length,
        term: term || 'Current Term',
        academicYear: academicYear || '2026/2027'
      }
    });
  } catch (error: any) {
    console.error('Error generating template:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const downloadTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { filename } = req.params;
    
    console.log(`Download request from user: ${req.user?.email}, role: ${req.user?.role}, filename: ${filename}`);
    
    // Validate filename parameter
    if (!filename) {
      res.status(400).json({ message: 'Filename is required' });
      return;
    }
    
    // Security: Validate filename to prevent directory traversal attacks
    const sanitizedFilename = path.basename(filename);
    if (sanitizedFilename !== filename || filename.includes('..') || !/^[\w\-. ]+\.xlsx$/i.test(filename)) {
      res.status(400).json({ message: 'Invalid filename format' });
      return;
    }
    
    const templatesDir = path.join(process.cwd(), 'uploads', 'templates');
    const filePath = path.join(templatesDir, sanitizedFilename);
    
    // Check if file exists and get file stats
    let fileStats;
    try {
      fileStats = fs.statSync(filePath);
      if (!fileStats.isFile()) {
        res.status(404).json({ message: 'File not found' });
        return;
      }
    } catch (statError) {
      console.log('File not found:', filePath);
      res.status(404).json({ message: 'Template file not found' });
      return;
    }
    
    // Check file age (optional cleanup - files older than 24 hours)
    const fileAge = Date.now() - fileStats.mtime.getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    if (fileAge > maxAge) {
      console.log('Warning: Template file is older than 24 hours:', filename);
      // Still allow download but log the warning
    }
    
    console.log(`Downloading template: ${filename} (${fileStats.size} bytes) by user: ${req.user?.email || 'unknown'}`);
    
    // Set appropriate headers for Excel file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizedFilename}"`);
    res.setHeader('Content-Length', fileStats.size.toString());
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Handle range requests for large files (optional but good for large Excel files)
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileStats.size - 1;
      
      if (start >= fileStats.size || end >= fileStats.size) {
        res.status(416).json({ message: 'Range not satisfiable' });
        return;
      }
      
      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${fileStats.size}`);
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Content-Length', (end - start + 1).toString());
      
      const fileStream = fs.createReadStream(filePath, { start, end });
      fileStream.pipe(res);
    } else {
      // Stream the entire file
      const fileStream = fs.createReadStream(filePath);
      
      // Handle stream errors
      fileStream.on('error', (streamError) => {
        console.error('File stream error:', streamError);
        if (!res.headersSent) {
          res.status(500).json({ message: 'Error reading file' });
        }
      });
      
      // Handle successful completion
      fileStream.on('end', () => {
        console.log(`Template download completed: ${filename}`);
      });
      
      fileStream.pipe(res);
    }
    
  } catch (error: any) {
    console.error('Error downloading template:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};

// List all available templates
export const listTemplates = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const templatesDir = path.join(process.cwd(), 'uploads', 'templates');
    
    // Ensure templates directory exists
    if (!fs.existsSync(templatesDir)) {
      res.json({ message: 'No templates available', data: { templates: [] } });
      return;
    }
    
    const files = fs.readdirSync(templatesDir);
    const templates = await Promise.all(
      files
        .filter(file => file.endsWith('.xlsx'))
        .map(async (file) => {
          const filePath = path.join(templatesDir, file);
          const stats = fs.statSync(filePath);
          
          return {
            filename: file,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            downloadUrl: `/api/templates/download/${file}`,
            ageInHours: Math.round((Date.now() - stats.birthtime.getTime()) / (1000 * 60 * 60))
          };
        })
    );
    
    // Sort by creation date (newest first)
    templates.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
    
    console.log(`Listed ${templates.length} templates for user: ${req.user?.email || 'unknown'}`);
    
    res.json({
      message: 'Templates retrieved successfully',
      data: {
        templates,
        totalCount: templates.length,
        totalSize: templates.reduce((sum, t) => sum + t.size, 0)
      }
    });
    
  } catch (error: any) {
    console.error('Error listing templates:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Clean up old template files
export const cleanupTemplates = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { maxAgeHours = 24, dryRun = false } = req.query;
    const maxAge = Number(maxAgeHours) * 60 * 60 * 1000; // Convert hours to milliseconds
    
    const templatesDir = path.join(process.cwd(), 'uploads', 'templates');
    
    if (!fs.existsSync(templatesDir)) {
      res.json({ message: 'Templates directory not found', data: { deletedFiles: [] } });
      return;
    }
    
    const files = fs.readdirSync(templatesDir);
    const oldFiles = [];
    const deletedFiles = [];
    
    for (const file of files) {
      if (!file.endsWith('.xlsx')) continue;
      
      const filePath = path.join(templatesDir, file);
      const stats = fs.statSync(filePath);
      const fileAge = Date.now() - stats.birthtime.getTime();
      
      if (fileAge > maxAge) {
        oldFiles.push({
          filename: file,
          ageInHours: Math.round(fileAge / (1000 * 60 * 60)),
          size: stats.size
        });
        
        if (!dryRun) {
          try {
            fs.unlinkSync(filePath);
            deletedFiles.push(file);
            console.log(`Deleted old template: ${file}`);
          } catch (deleteError) {
            console.error(`Error deleting file ${file}:`, deleteError);
          }
        }
      }
    }
    
    console.log(`Template cleanup completed by user: ${req.user?.email || 'unknown'}. Found ${oldFiles.length} old files, deleted ${deletedFiles.length}.`);
    
    res.json({
      message: `Template cleanup ${dryRun ? 'simulation' : 'completed'}`,
      data: {
        oldFiles,
        deletedFiles: dryRun ? [] : deletedFiles,
        maxAgeHours: Number(maxAgeHours),
        dryRun: Boolean(dryRun)
      }
    });
    
  } catch (error: any) {
    console.error('Error during template cleanup:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};