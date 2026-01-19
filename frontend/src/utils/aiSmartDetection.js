/**
 * 🤖 AI Smart Operation Detection
 * 
 * Analyzes file content and suggests the best operation
 * based on file type, structure, and content analysis.
 */

import { debounce, generateAIId, AI_STATUS } from './aiIndex';

/**
 * File type signatures (magic bytes)
 */
const FILE_SIGNATURES = {
  pdf: ['%PDF-', '25 50 44 46'],
  jpg: ['FF D8 FF', 'FF D8 FF E0', 'FF D8 FF E1'],
  jpeg: ['FF D8 FF', 'FF D8 FF E0', 'FF D8 FF E1'],
  png: ['89 50 4E 47 0D 0A 1A 0A'],
  gif: ['47 49 46 38', 'GIF87a', 'GIF89a'],
  webp: ['52 49 46 46', 'WEBP'],
  bmp: ['42 4D', 'BM'],
  docx: ['50 4B 03 04', 'PK'],
  doc: ['D0 CF 11 E0', 'MSO'],
  xlsx: ['50 4B 03 04', 'PK'],
  pptx: ['50 4B 03 04', 'PK'],
  zip: ['50 4B 03 04', 'PK'],
  tiff: ['49 49 2A 00', '4D 4D 00 2A'],
  heic: ['66 74 79 70 68', 'ftypheic'],
  svg: ['3C 73 76 67', '<svg'],
  txt: ['text/', 'plain'],
};

/**
 * Operation keywords for pattern matching
 */
const OPERATION_KEYWORDS = {
  pdfToDocx: ['pdf', 'document', 'report', 'article', 'paper', 'contract'],
  pdfToExcel: ['table', 'spreadsheet', 'data', 'numbers', 'financial', 'report'],
  pdfToPpt: ['presentation', 'slides', 'deck', 'slideshow'],
  ocr: ['scanned', 'image', 'photo', 'screenshot', 'handwritten', 'ocr'],
  merge: ['combine', 'merge', 'join', 'unite', 'multiple'],
  split: ['split', 'separate', 'extract', 'pages', 'sections'],
  lock: ['secure', 'protect', 'password', 'lock', 'encrypt'],
  watermark: ['watermark', 'stamp', 'brand', 'confidential'],
  compress: ['compress', 'reduce', 'size', 'optimize'],
  convert: ['convert', 'transform', 'change', 'export'],
};

/**
 * Detect file type from binary content
 * @param {File|Blob} file - File or Blob object
 * @returns {Promise<Object>} - Detection result
 */
export async function detectFileType(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target.result;
      const bytes = new Uint8Array(result);
      const hexSignature = Array.from(bytes.slice(0, 16))
        .map(b => b.toString(16).padStart(2, '0').toUpperCase())
        .join(' ');
      
      const asciiPrefix = String.fromCharCode(...bytes.slice(0, 20))
        .replace(/[^\x20-\x7E]/g, '');
      
      // Check against known signatures
      let detectedType = 'unknown';
      let confidence = 0;
      let details = {};
      
      for (const [type, signatures] of Object.entries(FILE_SIGNATURES)) {
        for (const sig of signatures) {
          const sigHex = sig.replace(/\s+/g, '').toUpperCase();
          const sigBytes = sigHex.match(/.{1,2}/g)?.map(b => parseInt(b, 16)) || [];
          
          if (bytes.length >= sigBytes.length) {
            const match = sigBytes.every((b, i) => b === bytes[i] || sig.includes(' '));
            if (match || asciiPrefix.includes(sig.replace(/[\s0-9]/g, ''))) {
              detectedType = type;
              confidence = 0.95;
              break;
            }
          }
        }
        if (detectedType !== 'unknown') break;
      }
      
      // Additional checks
      if (detectedType === 'unknown') {
        // Check file extension as fallback
        if (file.name) {
          const ext = file.name.split('.').pop().toLowerCase();
          if (FILE_SIGNATURES[ext]) {
            detectedType = ext;
            confidence = 0.7;
          }
        }
      }
      
      // MIME type check
      const mimeType = file.type || '';
      if (mimeType.includes('pdf')) detectedType = 'pdf';
      else if (mimeType.includes('image')) {
        if (mimeType.includes('png')) detectedType = 'png';
        else if (mimeType.includes('jpg') || mimeType.includes('jpeg')) detectedType = 'jpg';
        else if (mimeType.includes('webp')) detectedType = 'webp';
        else if (mimeType.includes('gif')) detectedType = 'gif';
        else if (mimeType.includes('bmp')) detectedType = 'bmp';
      }
      else if (mimeType.includes('word')) detectedType = 'docx';
      else if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) detectedType = 'xlsx';
      else if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) detectedType = 'pptx';
      else if (mimeType.includes('zip') || mimeType.includes('compressed')) detectedType = 'zip';
      
      details = {
        hexSignature: hexSignature.slice(0, 60),
        asciiPrefix: asciiPrefix.slice(0, 20),
        mimeType,
        size: file.size,
        name: file.name || 'unnamed',
      };
      
      resolve({
        type: detectedType,
        confidence,
        details,
        isValid: detectedType !== 'unknown',
      });
    };
    
    reader.onerror = () => {
      resolve({
        type: 'unknown',
        confidence: 0,
        error: 'Failed to read file',
        isValid: false,
      });
    };
    
    // Read first 16 bytes for signature detection
    reader.readAsArrayBuffer(file.slice(0, 16));
  });
}

/**
 * Analyze file content for operation suggestions
 * @param {File|Blob} file - File to analyze
 * @param {string} fileType - Detected file type
 * @returns {Promise<Object>} - Content analysis result
 */
export async function analyzeFileContent(file, fileType) {
  const analysis = {
    hasText: false,
    hasImages: false,
    hasTables: false,
    isScanned: false,
    isPasswordProtected: false,
    pageCount: null,
    language: null,
    confidence: 0,
    patterns: [],
  };
  
  try {
    if (fileType === 'pdf') {
      // Read more bytes for PDF analysis
      const reader = new FileReader();
      await new Promise((resolve, reject) => {
        reader.onload = (e) => {
          const content = e.target.result;
          const bytes = new Uint8Array(content);
          
          // Check for encrypted PDFs
          if (content.includes('Encrypt') || content.includes('Password')) {
            analysis.isPasswordProtected = true;
            analysis.patterns.push('encrypted');
          }
          
          // Check for image-only PDFs (scanned)
          const textContent = String.fromCharCode(...bytes.slice(0, 5000));
          if (textContent.length < 100) {
            analysis.isScanned = true;
            analysis.patterns.push('scanned_document');
          } else {
            analysis.hasText = true;
            analysis.patterns.push('text_content');
          }
          
          // Look for table patterns
          if (/table|row|cell|data/i.test(textContent)) {
            analysis.hasTables = true;
            analysis.patterns.push('table_data');
          }
          
          // Look for image patterns
          if (/image|jpg|png|stream\/image/i.test(textContent)) {
            analysis.hasImages = true;
            analysis.patterns.push('embedded_images');
          }
          
          analysis.confidence = 0.85;
          resolve();
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file.slice(0, 5000));
      });
    }
    else if (fileType === 'docx' || fileType === 'xlsx' || fileType === 'pptx') {
      // Office documents
      analysis.hasText = true;
      analysis.confidence = 0.9;
      
      if (fileType === 'xlsx') {
        analysis.hasTables = true;
        analysis.patterns.push('spreadsheet');
      }
    }
    else if (['jpg', 'jpeg', 'png', 'webp', 'bmp', 'gif'].includes(fileType)) {
      // Image files
      analysis.hasImages = true;
      analysis.confidence = 0.95;
      
      // Get image dimensions
      await new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          analysis.imageDimensions = {
            width: img.width,
            height: img.height,
            aspectRatio: img.width / img.height,
          };
          analysis.patterns.push(`image_${img.width}x${img.height}`);
          resolve();
        };
        img.onerror = () => resolve();
        img.src = URL.createObjectURL(file);
      });
    }
    else if (fileType === 'zip') {
      analysis.patterns.push('archive');
      analysis.confidence = 0.9;
    }
  } catch (error) {
    console.error('Content analysis error:', error);
    analysis.error = error.message;
    analysis.confidence = 0.5;
  }
  
  return analysis;
}

/**
 * Suggest operations based on file analysis
 * @param {string} fileType - File type
 * @param {Object} analysis - Content analysis
 * @returns {Array} - Suggested operations with confidence
 */
export function suggestOperations(fileType, analysis) {
  const suggestions = [];
  const { isScanned, hasTables, hasImages, isPasswordProtected, imageDimensions } = analysis;
  
  // Define operation rules based on file type and analysis
  const operationRules = {
    pdf: [
      {
        operation: 'ocr',
        condition: isScanned,
        baseConfidence: 0.95,
        reason: 'Scanned document detected - OCR needed',
      },
      {
        operation: 'pdfToDocx',
        condition: !isPasswordProtected && !isScanned,
        baseConfidence: 0.9,
        reason: 'Text-based PDF - editable Word conversion recommended',
      },
      {
        operation: 'pdfToExcel',
        condition: hasTables && !isPasswordProtected && !isScanned,
        baseConfidence: 0.85,
        reason: 'Table data detected - Excel extraction recommended',
      },
      {
        operation: 'pdfToPpt',
        condition: hasImages && !isPasswordProtected,
        baseConfidence: 0.7,
        reason: 'Image content - PowerPoint conversion possible',
      },
      {
        operation: 'search',
        condition: !isPasswordProtected,
        baseConfidence: 0.6,
        reason: 'Search within document available',
      },
      {
        operation: 'compress',
        condition: true,
        baseConfidence: 0.5,
        reason: 'Compression can reduce file size',
      },
    ],
    image: [
      {
        operation: 'ocr',
        condition: true,
        baseConfidence: 0.8,
        reason: 'Text extraction available from image',
      },
      {
        operation: 'convertImages',
        condition: true,
        baseConfidence: imageDimensions?.width > 2000,
        reason: 'Format conversion available',
      },
      {
        operation: 'resizeImage',
        condition: imageDimensions?.width > 1920 || imageDimensions?.height > 1080,
        baseConfidence: 0.75,
        reason: 'Large image - resize recommended',
      },
      {
        operation: 'imageToPdf',
        condition: true,
        baseConfidence: 0.7,
        reason: 'Convert to PDF for sharing',
      },
    ],
    docx: [
      {
        operation: 'docxToPdf',
        condition: true,
        baseConfidence: 0.95,
        reason: 'Convert to PDF for universal compatibility',
      },
      {
        operation: 'compress',
        condition: true,
        baseConfidence: 0.5,
        reason: 'Compression can reduce file size',
      },
    ],
    doc: [
      {
        operation: 'docToDocx',
        condition: true,
        baseConfidence: 0.95,
        reason: 'Legacy DOC - convert to modern DOCX format',
      },
    ],
    xlsx: [
      {
        operation: 'excelToPdf',
        condition: true,
        baseConfidence: 0.9,
        reason: 'Convert to PDF for sharing',
      },
    ],
    pptx: [
      {
        operation: 'pptxToPdf',
        condition: true,
        baseConfidence: 0.95,
        reason: 'Convert to PDF for easy viewing',
      },
    ],
    zip: [
      {
        operation: 'unzip',
        condition: true,
        baseConfidence: 0.95,
        reason: 'Extract archive contents',
      },
    ],
  };
  
  const rules = operationRules[fileType] || [];
  
  for (const rule of rules) {
    if (rule.condition) {
      suggestions.push({
        id: generateAIId(),
        operation: rule.operation,
        confidence: rule.baseConfidence,
        reason: rule.reason,
        priority: rule.baseConfidence >= 0.9 ? 'high' : rule.baseConfidence >= 0.7 ? 'medium' : 'low',
      });
    }
  }
  
  // Sort by confidence descending
  suggestions.sort((a, b) => b.confidence - a.confidence);
  
  return suggestions;
}

/**
 * Smart operation detection - main function
 * @param {File|Blob} file - File to analyze
 * @param {Object} options - Detection options
 * @returns {Promise<Object>} - Complete detection result
 */
export async function detectSmartOperation(file, options = {}) {
  const startTime = Date.now();
  const result = {
    id: generateAIId(),
    timestamp: new Date().toISOString(),
    processingTime: 0,
    status: AI_STATUS.IDLE,
    fileInfo: {
      name: file.name || 'unnamed',
      size: file.size,
      type: file.type || 'unknown',
    },
    detection: null,
    analysis: null,
    suggestions: [],
    recommendedOperation: null,
    error: null,
  };
  
  try {
    result.status = AI_STATUS.ANALYZING;
    
    // Step 1: Detect file type
    const typeResult = await detectFileType(file);
    result.detection = typeResult;
    
    if (!typeResult.isValid) {
      result.status = AI_STATUS.ERROR;
      result.error = 'Unable to detect file type';
      return result;
    }
    
    // Step 2: Analyze content
    const analysisResult = await analyzeFileContent(file, typeResult.type);
    result.analysis = analysisResult;
    
    // Step 3: Generate suggestions
    const suggestions = suggestOperations(typeResult.type, analysisResult);
    result.suggestions = suggestions;
    
    // Step 4: Get top recommendation
    if (suggestions.length > 0) {
      result.recommendedOperation = suggestions[0];
    }
    
    result.status = AI_STATUS.COMPLETED;
    result.processingTime = Date.now() - startTime;
    
  } catch (error) {
    result.status = AI_STATUS.ERROR;
    result.error = error.message;
    console.error('Smart detection error:', error);
  }
  
  return result;
}

/**
 * Batch detect multiple files
 * @param {Array<File>} files - Array of files
 * @param {Object} options - Detection options
 * @returns {Promise<Array>} - Array of detection results
 */
export async function batchDetectOperations(files, options = {}) {
  const results = await Promise.all(
    files.map(file => detectSmartOperation(file, options))
  );
  
  return results;
}

/**
 * Get operation display name
 */
export function getOperationDisplayName(operation) {
  const displayNames = {
    pdfToDocx: 'Convert to Word',
    pdfToExcel: 'Extract to Excel',
    pdfToPpt: 'Convert to PowerPoint',
    docxToPdf: 'Convert to PDF',
    docToDocx: 'Upgrade to DOCX',
    excelToPdf: 'Convert to PDF',
    pptxToPdf: 'Convert to PDF',
    imageToPdf: 'Convert to PDF',
    ocr: 'Extract Text (OCR)',
    merge: 'Merge PDFs',
    split: 'Split PDF',
    lock: 'Lock PDF',
    unlock: 'Unlock PDF',
    watermark: 'Add Watermark',
    compress: 'Compress File',
    convertImages: 'Convert Image',
    resizeImage: 'Resize Image',
    search: 'Search in PDF',
    unzip: 'Extract Archive',
  };
  
  return displayNames[operation] || operation;
}

/**
 * Get operation icon
 */
export function getOperationIcon(operation) {
  const icons = {
    pdfToDocx: '📝',
    pdfToExcel: '📊',
    pdfToPpt: '📽️',
    docxToPdf: '📄',
    docToDocx: '🔄',
    excelToPdf: '📈',
    pptxToPdf: '📽️',
    imageToPdf: '🖼️',
    ocr: '🔍',
    merge: '📑',
    split: '✂️',
    lock: '🔒',
    unlock: '🔓',
    watermark: '✍️',
    compress: '📦',
    convertImages: '🎨',
    resizeImage: '📐',
    search: '🔎',
    unzip: '📁',
  };
  
  return icons[operation] || '⚙️';
}

// Debounced version for real-time use
export const debouncedDetect = debounce(detectSmartOperation, 300);

export default {
  detectFileType,
  analyzeFileContent,
  suggestOperations,
  detectSmartOperation,
  batchDetectOperations,
  getOperationDisplayName,
  getOperationIcon,
  debouncedDetect,
};

