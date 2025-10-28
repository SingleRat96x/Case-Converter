import { extractEmails, type EmailExtractionOptions, type EmailExtractionResult } from './emailUtils';

// Note: This is a simplified implementation for demonstration purposes
// In production, you would integrate with a PDF processing library
// that is compatible with Next.js and serverless environments

export interface PdfProcessingResult {
  text: string;
  pageCount: number;
  fileSize: number;
  processingTime: number;
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: string;
    modificationDate?: string;
  };
}

export interface PdfEmailExtractionResult extends EmailExtractionResult {
  pdfInfo: {
    pageCount: number;
    fileSize: number;
    processingTime: number;
    filename: string;
  };
}

export interface PdfValidationResult {
  isValid: boolean;
  error?: string;
  fileSize?: number;
  fileType?: string;
}

// Constants
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const SUPPORTED_MIME_TYPES = ['application/pdf'];
export const PROCESSING_TIMEOUT = 30000; // 30 seconds

/**
 * Validate PDF file before processing
 */
export function validatePdfFile(file: File): PdfValidationResult {
  // Check file type
  if (!SUPPORTED_MIME_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file type. Please upload a PDF file.',
      fileType: file.type
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`,
      fileSize: file.size
    };
  }

  // Check if file is empty
  if (file.size === 0) {
    return {
      isValid: false,
      error: 'File is empty. Please upload a valid PDF file.',
      fileSize: file.size
    };
  }

  return {
    isValid: true,
    fileSize: file.size,
    fileType: file.type
  };
}

/**
 * Extract text content from PDF file
 */
export async function extractTextFromPdf(file: File): Promise<PdfProcessingResult> {
  const startTime = Date.now();
  
  try {
    // Validate file first
    const validation = validatePdfFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    const processingTime = Date.now() - startTime;
    
    // Mock extracted text with sample email addresses for demonstration
    const mockText = `
      Sample PDF Document
      
      Contact Information:
      For support, please email support@example.com or reach out to our sales team at sales@company.org.
      
      Team Members:
      - John Doe: john.doe@example.com
      - Jane Smith: jane.smith@company.org  
      - Bob Johnson: bob.johnson+work@gmail.com
      - Alice Brown: alice@subdomain.example.co.uk
      
      Additional contacts:
      admin@test-site.net
      info@demo.com
      contact@sample-website.org
      
      Invalid entries (should be filtered):
      not-an-email
      @missing.com
      test@
      
      This is a demonstration of the PDF email extraction tool.
      In production, this would use a proper PDF parsing library.
    `;
    
    return {
      text: mockText.trim(),
      pageCount: 2,
      fileSize: file.size,
      processingTime,
      metadata: {
        title: 'Sample PDF Document',
        author: 'Demo User',
        subject: 'Email Extraction Demo',
        creator: 'PDF Email Extractor Tool',
        producer: 'Demo PDF Generator',
        creationDate: new Date().toISOString(),
        modificationDate: new Date().toISOString(),
      }
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`PDF processing failed: ${error.message}`);
    } else {
      throw new Error('PDF processing failed: Unknown error occurred');
    }
  }
}

/**
 * Extract emails from PDF file with processing information
 */
export async function extractEmailsFromPdf(
  file: File, 
  options: EmailExtractionOptions
): Promise<PdfEmailExtractionResult> {
  try {
    // Extract text from PDF
    const pdfResult = await extractTextFromPdf(file);
    
    // Extract emails from the text
    const emailResult = extractEmails(pdfResult.text, options);
    
    return {
      ...emailResult,
      pdfInfo: {
        pageCount: pdfResult.pageCount,
        fileSize: pdfResult.fileSize,
        processingTime: pdfResult.processingTime,
        filename: file.name
      }
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format processing time for display
 */
export function formatProcessingTime(milliseconds: number): string {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  } else {
    return `${(milliseconds / 1000).toFixed(1)}s`;
  }
}

/**
 * Get PDF file information without full text extraction
 */
export async function getPdfInfo(file: File): Promise<{
  pageCount: number;
  fileSize: number;
  metadata?: PdfProcessingResult['metadata'];
}> {
  try {
    const validation = validatePdfFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Mock PDF info for demonstration
    return {
      pageCount: 2,
      fileSize: file.size,
      metadata: {
        title: 'Sample PDF Document',
        author: 'Demo User',
        subject: 'Email Extraction Demo',
        creator: 'PDF Email Extractor Tool',
        producer: 'Demo PDF Generator',
        creationDate: new Date().toISOString(),
        modificationDate: new Date().toISOString(),
      }
    };
  } catch (error) {
    throw error;
  }
}