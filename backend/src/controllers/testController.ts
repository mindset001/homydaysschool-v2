import { Request, Response } from 'express';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

// Create a test template for testing download functionality (no authentication required)
export const createTestTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('Creating test template...');
    
    // Create simple test data
    const testData = [
      { 'S/N': 1, 'Student Name': 'Test Student 1', 'Student ID': 'TST001', 'Mathematics': '', 'English': '', 'Total': '', 'Average': '', 'Grade': '', 'Position': '', 'Remarks': '' },
      { 'S/N': 2, 'Student Name': 'Test Student 2', 'Student ID': 'TST002', 'Mathematics': '', 'English': '', 'Total': '', 'Average': '', 'Grade': '', 'Position': '', 'Remarks': '' },
      { 'S/N': 3, 'Student Name': 'Test Student 3', 'Student ID': 'TST003', 'Mathematics': '', 'English': '', 'Total': '', 'Average': '', 'Grade': '', 'Position': '', 'Remarks': '' }
    ];
    
    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(testData);
    
    // Set column widths
    const columnWidths = [
      { wch: 8 },  // S/N
      { wch: 25 }, // Student Name
      { wch: 15 }, // Student ID
      { wch: 12 }, // Mathematics
      { wch: 12 }, // English
      { wch: 10 }, // Total
      { wch: 12 }, // Average
      { wch: 8 },  // Grade
      { wch: 10 }, // Position
      { wch: 20 }  // Remarks
    ];
    
    worksheet['!cols'] = columnWidths;
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Test Results Template');
    
    // Create filename
    const fileName = `test_template_${Date.now()}.xlsx`;
    
    // Ensure templates directory exists
    const templatesDir = path.join(process.cwd(), 'uploads', 'templates');
    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir, { recursive: true });
    }
    
    // Save file
    const filePath = path.join(templatesDir, fileName);
    XLSX.writeFile(workbook, filePath);
    
    console.log(`Test template created: ${filePath}`);
    
    res.json({
      message: 'Test template created successfully',
      data: {
        filename: fileName,
        downloadUrl: `/api/test/download/${fileName}`,
        filePath: filePath,
        size: fs.statSync(filePath).size
      }
    });
    
  } catch (error: any) {
    console.error('Error creating test template:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Download test template (no authentication required)
export const downloadTestTemplate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { filename } = req.params;
    
    if (!filename) {
      res.status(400).json({ message: 'Filename is required' });
      return;
    }
    
    // Security: Validate filename
    const sanitizedFilename = path.basename(filename);
    if (sanitizedFilename !== filename || filename.includes('..') || !/^[\w\-. ]+\.xlsx$/i.test(filename)) {
      res.status(400).json({ message: 'Invalid filename format' });
      return;
    }
    
    const templatesDir = path.join(process.cwd(), 'uploads', 'templates');
    const filePath = path.join(templatesDir, sanitizedFilename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ message: 'Test template file not found' });
      return;
    }
    
    const fileStats = fs.statSync(filePath);
    
    console.log(`Downloading test template: ${filename} (${fileStats.size} bytes)`);
    
    // Set headers for Excel download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizedFilename}"`);
    res.setHeader('Content-Length', fileStats.size.toString());
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    
    fileStream.on('error', (streamError) => {
      console.error('File stream error:', streamError);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error reading file' });
      }
    });
    
    fileStream.on('end', () => {
      console.log(`Test template download completed: ${filename}`);
    });
    
    fileStream.pipe(res);
    
  } catch (error: any) {
    console.error('Error downloading test template:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
};