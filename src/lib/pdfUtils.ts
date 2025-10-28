import * as pdfjsLib from 'pdfjs-dist';
import { extractEmails, type EmailExtractionOptions, type EmailExtractionResult } from './emailUtils';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.269/pdf.worker.min.js`;
}

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

    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load PDF document
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    // Extract metadata
    const metadata = await pdf.getMetadata().catch(() => ({ info: {}, metadata: null }));
    
    let fullText = '';
    const pageCount = pdf.numPages;
    
    // Extract text from each page
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Combine text items from the page
      const pageText = textContent.items
        .map((item: { str: string }) => item.str)
        .join(' ');
      
      fullText += pageText + '\n';
      
      // Cleanup page resources
      page.cleanup();
    }
    
    const processingTime = Date.now() - startTime;
    
    return {
      text: fullText.trim(),
      pageCount,
      fileSize: file.size,
      processingTime,
      metadata: {
        title: metadata.info?.Title,
        author: metadata.info?.Author,
        subject: metadata.info?.Subject,
        creator: metadata.info?.Creator,
        producer: metadata.info?.Producer,
        creationDate: metadata.info?.CreationDate,
        modificationDate: metadata.info?.ModDate,
      }
    };
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const processingTime = Date.now() - startTime;
    
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

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const metadata = await pdf.getMetadata().catch(() => ({ info: {}, metadata: null }));
    
    return {
      pageCount: pdf.numPages,
      fileSize: file.size,
      metadata: {
        title: metadata.info?.Title,
        author: metadata.info?.Author,
        subject: metadata.info?.Subject,
        creator: metadata.info?.Creator,
        producer: metadata.info?.Producer,
        creationDate: metadata.info?.CreationDate,
        modificationDate: metadata.info?.ModDate,
      }
    };
  } catch (error) {
    throw error;
  }
}