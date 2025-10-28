import { extractEmails, type EmailExtractionOptions, type EmailExtractionResult } from './emailUtils';

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

    // For now, we'll use a client-side approach that works reliably
    // Future enhancement: integrate with a PDF.js based solution
    const arrayBuffer = await file.arrayBuffer();
    
    // Try to extract text using a simple approach
    // This is a fallback until we can properly integrate PDF parsing
    let extractedText = '';
    
    try {
      // Convert to text representation for basic email extraction
      const uint8Array = new Uint8Array(arrayBuffer);
      const textDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: false });
      const rawText = textDecoder.decode(uint8Array);
      
      // Extract readable text from PDF stream (basic approach)
      // This will catch emails that are stored as plain text in the PDF
      const textMatches = rawText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
      if (textMatches) {
        extractedText = textMatches.join('\n');
      }
      
      // If no emails found in raw text, provide a helpful message
      if (!extractedText) {
        extractedText = `No emails found in this PDF file.

This could be because:
- The PDF contains scanned images rather than text
- The emails are embedded in complex layouts
- The PDF uses non-standard encoding

Please try a different PDF file or ensure your PDF contains searchable text.`;
      }
    } catch (error) {
      extractedText = `Error processing PDF: ${error instanceof Error ? error.message : 'Unknown error'}

Please ensure you've uploaded a valid PDF file.`;
    }
    
    const processingTime = Date.now() - startTime;
    
    return {
      text: extractedText,
      pageCount: 1, // Fallback since we can't determine actual page count
      fileSize: file.size,
      processingTime,
      metadata: {
        title: file.name,
        author: 'Unknown',
        subject: 'PDF Email Extraction',
        creator: 'PDF Email Extractor Tool',
        producer: 'Basic PDF Parser',
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

    // Basic PDF info extraction (fallback approach)
    return {
      pageCount: 1, // Fallback since we can't determine actual page count
      fileSize: file.size,
      metadata: {
        title: file.name,
        author: 'Unknown',
        subject: 'PDF Email Extraction',
        creator: 'PDF Email Extractor Tool',
        producer: 'Basic PDF Parser',
        creationDate: new Date().toISOString(),
        modificationDate: new Date().toISOString(),
      }
    };
  } catch (error) {
    throw error;
  }
}