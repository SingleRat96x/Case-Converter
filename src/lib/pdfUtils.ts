import { extractEmails, type EmailExtractionOptions, type EmailExtractionResult } from './emailUtils';

// Dynamic import for PDF.js to avoid SSR issues
let pdfjsLib: typeof import('pdfjs-dist') | null = null;

// Initialize PDF.js only on client side
const initPdfJs = async () => {
  if (typeof window !== 'undefined' && !pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
  }
  return pdfjsLib;
};

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
 * Extract text content from PDF file using PDF.js
 */
export async function extractTextFromPdf(file: File): Promise<PdfProcessingResult> {
  const startTime = Date.now();
  
  try {
    // Initialize PDF.js
    const pdfjs = await initPdfJs();
    if (!pdfjs) {
      throw new Error('PDF.js failed to initialize');
    }

    // Validate file first
    const validation = validatePdfFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Convert file to ArrayBuffer for PDF.js
    const arrayBuffer = await file.arrayBuffer();
    
    // Load PDF document using PDF.js
    const loadingTask = pdfjs.getDocument({
      data: arrayBuffer,
      useSystemFonts: true,
      standardFontDataUrl: '/standard_fonts/',
    });
    
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    const pageCount = pdf.numPages;
    
    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Combine all text items from the page
      const pageText = textContent.items
        .map((item) => {
          // PDF.js TextItem has a 'str' property
          return 'str' in item ? item.str : '';
        })
        .join(' ');
      
      fullText += pageText + '\n';
    }
    
    // Clean up the extracted text
    fullText = fullText
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/\n\s*\n/g, '\n') // Remove empty lines
      .trim();
    
    // If no text was extracted, provide a helpful message
    if (!fullText) {
      fullText = `No text content found in this PDF file.

This could be because:
- The PDF contains only images or scanned content
- The PDF is password protected
- The PDF uses unsupported encoding
- The PDF file is corrupted

Please try a different PDF file with searchable text content.`;
    }
    
    const processingTime = Date.now() - startTime;
    
    // Get PDF metadata
    const metadata = await pdf.getMetadata();
    const info = metadata.info as Record<string, string> | null;
    
    return {
      text: fullText,
      pageCount,
      fileSize: file.size,
      processingTime,
      metadata: {
        title: info?.Title || file.name,
        author: info?.Author || 'Unknown',
        subject: info?.Subject || '',
        creator: info?.Creator || '',
        producer: info?.Producer || '',
        creationDate: info?.CreationDate || new Date().toISOString(),
        modificationDate: info?.ModDate || new Date().toISOString(),
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
    // Initialize PDF.js
    const pdfjs = await initPdfJs();
    if (!pdfjs) {
      throw new Error('PDF.js failed to initialize');
    }

    const validation = validatePdfFile(file);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Convert file to ArrayBuffer for PDF.js
    const arrayBuffer = await file.arrayBuffer();
    
    // Load PDF document using PDF.js (just for info)
    const loadingTask = pdfjs.getDocument({
      data: arrayBuffer,
      useSystemFonts: true,
    });
    
    const pdf = await loadingTask.promise;
    const metadata = await pdf.getMetadata();
    const info = metadata.info as Record<string, string> | null;
    
    return {
      pageCount: pdf.numPages,
      fileSize: file.size,
      metadata: {
        title: info?.Title || file.name,
        author: info?.Author || 'Unknown',
        subject: info?.Subject || '',
        creator: info?.Creator || '',
        producer: info?.Producer || '',
        creationDate: info?.CreationDate || new Date().toISOString(),
        modificationDate: info?.ModDate || new Date().toISOString(),
      }
    };
  } catch (error) {
    throw error;
  }
}