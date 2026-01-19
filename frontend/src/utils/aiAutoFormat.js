/**
 * 🤖 AI Auto Format Detection
 * 
 * Detects file format from binary content using magic bytes
 * and content analysis.
 */

import { generateAIId } from './aiIndex';

/**
 * Magic bytes signatures for file formats
 */
export const FILE_SIGNATURES = {
  // PDF
  pdf: {
    signatures: ['%PDF-', '25 50 44 46'],
    mimeTypes: ['application/pdf'],
    extensions: ['.pdf'],
  },
  
  // Images
  jpg: {
    signatures: ['FF D8 FF', 'FF D8 FF E0', 'FF D8 FF E1', 'FF D8 FF DB'],
    mimeTypes: ['image/jpeg', 'image/jpg'],
    extensions: ['.jpg', '.jpeg'],
  },
  png: {
    signatures: ['89 50 4E 47 0D 0A 1A 0A'],
    mimeTypes: ['image/png'],
    extensions: ['.png'],
  },
  gif: {
    signatures: ['47 49 46 38 37 61', '47 49 46 38 39 61', 'GIF87a', 'GIF89a'],
    mimeTypes: ['image/gif'],
    extensions: ['.gif'],
  },
  webp: {
    signatures: ['52 49 46 46', '57 45 42 50'],
    mimeTypes: ['image/webp'],
    extensions: ['.webp'],
  },
  bmp: {
    signatures: ['42 4D', 'BM'],
    mimeTypes: ['image/bmp'],
    extensions: ['.bmp'],
  },
  tiff: {
    signatures: ['49 49 2A 00', '4D 4D 00 2A', '49 20 49'],
    mimeTypes: ['image/tiff', 'image/x-tiff'],
    extensions: ['.tiff', '.tif'],
  },
  ico: {
    signatures: ['00 00 01 00', '00 00 02 00'],
    mimeTypes: ['image/x-icon', 'image/vnd.microsoft.icon'],
    extensions: ['.ico'],
  },
  svg: {
    signatures: ['3C 73 76 67', '3C 3F 78 6D'],
    mimeTypes: ['image/svg+xml'],
    extensions: ['.svg'],
  },
  heic: {
    signatures: ['66 74 79 70 68', '66 74 79 70 6D'],
    mimeTypes: ['image/heic', 'image/heif'],
    extensions: ['.heic', '.heif'],
  },
  
  // Documents
  docx: {
    signatures: ['50 4B 03 04'],
    mimeTypes: [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip',
    ],
    extensions: ['.docx'],
    checkInternal: true,
    internalPath: 'word/document.xml',
  },
  doc: {
    signatures: ['D0 CF 11 E0 A1 B1 1A E1'],
    mimeTypes: ['application/msword'],
    extensions: ['.doc'],
  },
  xlsx: {
    signatures: ['50 4B 03 04'],
    mimeTypes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    extensions: ['.xlsx'],
    checkInternal: true,
    internalPath: 'xl/workbook.xml',
  },
  xls: {
    signatures: ['D0 CF 11 E0 A1 B1 1A E1'],
    mimeTypes: ['application/vnd.ms-excel'],
    extensions: ['.xls'],
  },
  pptx: {
    signatures: ['50 4B 03 04'],
    mimeTypes: ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
    extensions: ['.pptx'],
    checkInternal: true,
    internalPath: 'ppt/presentation.xml',
  },
  ppt: {
    signatures: ['D0 CF 11 E0 A1 B1 1A E1'],
    mimeTypes: ['application/vnd.ms-powerpoint'],
    extensions: ['.ppt'],
  },
  odt: {
    signatures: ['50 4B 03 04'],
    mimeTypes: ['application/vnd.oasis.opendocument.text'],
    extensions: ['.odt'],
    checkInternal: true,
    internalPath: 'content.xml',
  },
  
  // Archives
  zip: {
    signatures: ['50 4B 03 04', '50 4B 05 06', '50 4B 07 08'],
    mimeTypes: ['application/zip', 'application/x-zip-compressed'],
    extensions: ['.zip'],
  },
  gzip: {
    signatures: ['1F 8B'],
    mimeTypes: ['application/gzip', 'application/x-gzip'],
    extensions: ['.gz', '.gzip'],
  },
  tar: {
    signatures: [''], // Hard to detect, use other methods
    mimeTypes: ['application/x-tar'],
    extensions: ['.tar'],
  },
  
  // Text
  txt: {
    signatures: [''],
    mimeTypes: ['text/plain'],
    extensions: ['.txt'],
    detectByContent: true,
  },
  
  // HTML
  html: {
    signatures: ['3C 21 64 6F', '3C 68 74 6D', '3C 3F 78 6D'],
    mimeTypes: ['text/html', 'application/xhtml+xml'],
    extensions: ['.html', '.htm', '.xhtml'],
  },
  
  // XML
  xml: {
    signatures: ['3C 3F 78 6D', '3C 21 64 6F'],
    mimeTypes: ['application/xml', 'text/xml'],
    extensions: ['.xml'],
  },
  
  // JSON
  json: {
    signatures: ['7B 0D 0A', '5B 0D 0A'],
    mimeTypes: ['application/json'],
    extensions: ['.json'],
    detectByContent: true,
  },
  
  // Markdown
  markdown: {
    signatures: [''],
    mimeTypes: ['text/markdown'],
    extensions: ['.md', '.markdown'],
    detectByContent: true,
  },
  
  // Audio
  mp3: {
    signatures: ['FF FB', 'FF F3', 'FF F2', '49 44 33'],
    mimeTypes: ['audio/mpeg', 'audio/mp3'],
    extensions: ['.mp3'],
  },
  wav: {
    signatures: ['52 49 46 46'],
    mimeTypes: ['audio/wav', 'audio/wave', 'audio/x-wav'],
    extensions: ['.wav'],
  },
  ogg: {
    signatures: ['4F 67 67 53'],
    mimeTypes: ['audio/ogg', 'application/ogg'],
    extensions: ['.ogg'],
  },
  
  // Video
  mp4: {
    signatures: ['00 00 00 18 66 74 79 70', '00 00 00 20 66 74 79 70'],
    mimeTypes: ['video/mp4'],
    extensions: ['.mp4'],
  },
  avi: {
    signatures: ['52 49 46 46'],
    mimeTypes: ['video/x-msvideo'],
    extensions: ['.avi'],
  },
  mov: {
    signatures: ['00 00 00', '6D 6F 6F 76'],
    mimeTypes: ['video/quicktime'],
    extensions: ['.mov'],
  },
};

/**
 * Convert bytes to hex string
 */
function bytesToHex(bytes) {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0').toUpperCase())
    .join(' ');
}

/**
 * Check if bytes match a signature
 */
function matchesSignature(bytes, signature) {
  if (!signature) return false;
  
  const sigBytes = signature.replace(/\s+/g, '').toUpperCase();
  const sigParts = sigBytes.match(/.{1,2}/g);
  
  if (!sigParts) return false;
  
  return sigParts.every((part, i) => {
    if (part === 'XX') return true; // Wildcard
    const byteValue = parseInt(part, 16);
    return bytes[i] === byteValue;
  });
}

/**
 * Detect file format from bytes
 */
export function detectFormatFromBytes(bytes) {
  const hexSignature = bytesToHex(bytes.slice(0, 16));
  const asciiPrefix = String.fromCharCode(...bytes.slice(0, 20))
    .replace(/[^\x20-\x7E]/g, '');
  
  // Check each format
  for (const [format, info] of Object.entries(FILE_SIGNATURES)) {
    // Check magic bytes
    for (const signature of info.signatures) {
      if (signature && matchesSignature(bytes, signature)) {
        return {
          format,
          confidence: 0.95,
          method: 'magic_bytes',
          details: {
            hexSignature,
            asciiPrefix,
            mimeTypes: info.mimeTypes,
            extensions: info.extensions,
          },
        };
      }
    }
  }
  
  return {
    format: 'unknown',
    confidence: 0,
    method: 'none',
    details: { hexSignature, asciiPrefix },
  };
}

/**
 * Validate file extension
 */
export function validateExtension(filename, detectedFormat) {
  const info = FILE_SIGNATURES[detectedFormat];
  if (!info) return { valid: true, suggested: null };
  
  const ext = '.' + filename.split('.').pop().toLowerCase();
  const isValid = info.extensions.some(e => e.toLowerCase() === ext.toLowerCase());
  
  return {
    valid: isValid,
    suggested: info.extensions[0],
  };
}

/**
 * Auto-detect format - main function
 */
export async function autoDetectFormat(file) {
  const result = {
    id: generateAIId(),
    timestamp: new Date().toISOString(),
    fileInfo: {
      name: file.name,
      size: file.size,
      type: file.type || 'unknown',
    },
    detection: null,
    validation: null,
    error: null,
  };
  
  try {
    // Read first 32 bytes for signature detection
    const bytes = new Uint8Array(await file.slice(0, 32).arrayBuffer());
    
    // Detect format
    result.detection = detectFormatFromBytes(bytes);
    
    // Validate extension
    result.validation = validateExtension(file.name, result.detection.format);
    
    // Add warnings for mismatched formats
    if (file.type && result.detection.format !== 'unknown') {
      const info = FILE_SIGNATURES[result.detection.format];
      if (info && !info.mimeTypes.includes(file.type)) {
        result.warnings = [
          `MIME type mismatch: File has MIME type "${file.type}" but content suggests "${info.mimeTypes[0]}"`,
        ];
      }
    }
    
    // Suggest correction if extension is wrong
    if (!result.validation.valid && result.validation.suggested) {
      result.suggestions = [
        `File extension should be "${result.validation.suggested}" instead of ".${file.name.split('.').pop()}"`,
      ];
    }
    
  } catch (error) {
    result.error = error.message;
    console.error('Format detection error:', error);
  }
  
  return result;
}

/**
 * Batch detect formats for multiple files
 */
export async function batchDetectFormats(files) {
  return Promise.all(files.map(file => autoDetectFormat(file)));
}

/**
 * Get all supported formats
 */
export function getSupportedFormats() {
  return Object.entries(FILE_SIGNATURES).map(([format, info]) => ({
    format,
    mimeTypes: info.mimeTypes,
    extensions: info.extensions,
    detectable: info.signatures.some(s => s.length > 0) || info.detectByContent,
  }));
}

/**
 * Get format info by MIME type
 */
export function getFormatByMimeType(mimeType) {
  for (const [format, info] of Object.entries(FILE_SIGNATURES)) {
    if (info.mimeTypes.includes(mimeType)) {
      return {
        format,
        ...info,
      };
    }
  }
  return null;
}

/**
 * Get format info by extension
 */
export function getFormatByExtension(extension) {
  const ext = extension.toLowerCase().startsWith('.') ? extension : '.' + extension;
  
  for (const [format, info] of Object.entries(FILE_SIGNATURES)) {
    if (info.extensions.some(e => e.toLowerCase() === ext.toLowerCase())) {
      return {
        format,
        ...info,
      };
    }
  }
  return null;
}

/**
 * Check if file is an image
 */
export function isImage(file) {
  const detected = detectFormatFromBytes(new Uint8Array(file.slice(0, 16)));
  return ['jpg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'svg', 'heic'].includes(detected.format);
}

/**
 * Check if file is a document
 */
export function isDocument(file) {
  const detected = detectFormatFromBytes(new Uint8Array(file.slice(0, 16)));
  return ['pdf', 'docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt', 'odt', 'txt', 'html', 'markdown'].includes(detected.format);
}

/**
 * Check if file is an archive
 */
export function isArchive(file) {
  const detected = detectFormatFromBytes(new Uint8Array(file.slice(0, 16)));
  return ['zip', 'gzip', 'tar'].includes(detected.format);
}

export default {
  FILE_SIGNATURES,
  detectFormatFromBytes,
  validateExtension,
  autoDetectFormat,
  batchDetectFormats,
  getSupportedFormats,
  getFormatByMimeType,
  getFormatByExtension,
  isImage,
  isDocument,
  isArchive,
};

