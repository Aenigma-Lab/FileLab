/**
 * 🤖 AI OCR Enhancement
 * 
 * Context-aware OCR enhancement with smart corrections
 * and document structure preservation.
 */

import { generateAIId } from './aiIndex';

/**
 * Common OCR error patterns and corrections
 */
export const OCR_CORRECTIONS = {
  // Character substitutions
  '0': ['O', 'D', 'Q'],
  '1': ['I', 'l', '|', 'T'],
  '5': ['S'],
  '8': ['B'],
  'rn': ['m'],
  'cl': ['d'],
  'vv': ['w'],
  'II': ['U'],
  'lI': ['H'],
  'vv': ['W'],
  
  // Word-level corrections
  'the': ['tbe', 'tbe', 'tbe'],
  'and': ['an d', 'arid'],
  'for': ['for', 'for', 'for'],
  'with': ['witb', 'witb'],
  'that': ['tbat', 'tbat'],
  'have': ['bave', 'bave'],
  'from': ['from', 'from', 'from'],
  'this': ['tbis', 'tbis'],
  'document': ['docurnent', 'documerrt'],
  'page': ['paqe', 'paqe'],
  'text': ['text', 'text', 'text'],
  'image': ['irnage', 'irn age'],
  'pdf': ['pdf', 'pdf', 'pdf'],
  'file': ['file', 'file', 'file'],
};

/**
 * Document structure patterns
 */
export const DOCUMENT_PATTERNS = {
  header: {
    patterns: [
      /^(.{1,50})\n-{3,}\n?/m,
      /^(#{1,6}\s+.+)$/m,
      /^(.+)\n={3,}$/m,
    ],
    type: 'header',
  },
  paragraph: {
    patterns: [
      /^[A-Z][^.!?]+[.!?]\s*$/m,
      /^\s{4}.+$/m, // Indented text
    ],
    type: 'paragraph',
  },
  list: {
    patterns: [
      /^\s*[-*•]\s+.+$/m,
      /^\s*\d+[.)]\s+.+$/m,
      /^\s*[a-zA-Z][.)]\s+.+$/m,
    ],
    type: 'list',
  },
  table: {
    patterns: [
      /\|.+\|.*\n\|[-:|]+\|.*\n(\|.+\|.*)+/m,
      /^\s*\t+.+\t+.+$/m,
    ],
    type: 'table',
  },
  code: {
    patterns: [
      /```[\s\S]+?```/m,
      /`[^`]+`/g,
      /^\s{2,4}[a-zA-Z].+$/m,
    ],
    type: 'code',
  },
  quote: {
    patterns: [
      /^["']{3}.+["']{3}$/m,
      /^>\s+.+$/m,
    ],
    type: 'quote',
  },
};

/**
 * Detect document type from content
 */
export function detectDocumentType(text) {
  const types = {
    receipt: /total|amount|tax|subtotal|cash|credit|debit/i,
    invoice: /invoice|bill|to:|from:|due date|amount due/i,
    id_document: /name|date of birth|id number|passport|license/i,
    contract: /agreement|terms|conditions|parties|signed|date/i,
    report: /report|analysis|findings|conclusion|recommendations/i,
    letter: /dear|sincerely|yours faithfully|regards/i,
    form: /please|fill in|check all that apply|select/i,
    resume: /experience|education|skills|employment|qualifications/i,
  };
  
  const scores = {};
  
  for (const [type, pattern] of Object.entries(types)) {
    const matches = (text.match(pattern) || []).length;
    if (matches > 0) {
      scores[type] = matches;
    }
  }
  
  // Sort by score
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  
  if (sorted.length > 0) {
    return {
      type: sorted[0][0],
      confidence: Math.min(sorted[0][1] / 5, 1),
      allMatches: sorted,
    };
  }
  
  return { type: 'general', confidence: 0.5, allMatches: [] };
}

/**
 * Apply context-aware corrections to OCR text
 */
export function applyOCRCorrections(text, context = {}) {
  let corrected = text;
  
  // Apply character-level corrections
  for (const [correct, errors] of Object.entries(OCR_CORRECTIONS)) {
    if (correct.length === 1) {
      for (const error of errors) {
        if (error.length === 1) {
          const regex = new RegExp(error, 'g');
          corrected = corrected.replace(regex, correct);
        }
      }
    }
  }
  
  // Apply word-level corrections with context
  const words = corrected.split(/\s+/);
  const correctedWords = words.map(word => {
    // Check for common OCR errors
    if (word === 'tbe') return 'the';
    if (word === 'bave') return 'have';
    if (word === 'docurnent') return 'document';
    if (word === 'paqe') return 'page';
    if (word === 'irnage') return 'image';
    if (word === 'witb') return 'with';
    if (word === 'tbat') return 'that';
    if (word === 'an d') return 'and';
    
    // Fix common number-letter confusions
    if (/^[0-9]{1,3}[OIl]{1,3}$/.test(word)) {
      return word.replace(/O/g, '0').replace(/l/g, '1').replace(/I/g, '1');
    }
    
    return word;
  });
  
  corrected = correctedWords.join(' ');
  
  // Fix sentence spacing
  corrected = corrected.replace(/\s+([.,;:!?])/g, '$1');
  corrected = corrected.replace(/([.,;:!?])\s+([.,;:!?])/g, '$1 $2');
  
  return corrected;
}

/**
 * Preserve document structure
 */
export function preserveDocumentStructure(text) {
  const lines = text.split('\n');
  const structured = [];
  
  for (const line of lines) {
    // Detect line type
    let lineType = 'paragraph';
    let content = line;
    
    for (const [name, { patterns, type }] of Object.entries(DOCUMENT_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(line)) {
          lineType = type;
          break;
        }
      }
      if (lineType !== 'paragraph') break;
    }
    
    structured.push({
      type: lineType,
      content: content.trim(),
      originalIndex: structured.length,
    });
  }
  
  return structured;
}

/**
 * Extract structured data from document
 */
export function extractStructuredData(text, documentType) {
  const data = {
    documentType,
    extractedFields: [],
    rawText: text,
  };
  
  const fieldPatterns = {
    date: /\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\b|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* \d{1,2},? \d{4}\b/gi,
    email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    phone: /\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g,
    amount: /\$\s?[\d,]+\.?\d{0,2}|\b[\d,]+\.?\d{0,2}\s?(?:USD|EUR|GBP|CNY|JPY)\b/gi,
    name: /\b([A-Z][a-z]+ [A-Z][a-z]+)\b/g,
    address: /\d+\s+[A-Za-z]+(?:\s+[A-Za-z]+)*\s+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Way|Place|Pl)\.?,?\s*(?:Apt|Suite|Unit|#)?\s*\d*[A-Za-z]?\s*,?\s*(?:[A-Za-z]+,?\s+)?[A-Z]{2}\s+\d{5}/gi,
  };
  
  for (const [field, pattern] of Object.entries(fieldPatterns)) {
    const matches = text.match(pattern) || [];
    if (matches.length > 0) {
      data.extractedFields.push({
        field,
        values: [...new Set(matches)],
        count: matches.length,
      });
    }
  }
  
  return data;
}

/**
 * Format OCR output based on document type
 */
export function formatOCROutput(text, documentType) {
  // Apply corrections
  let formatted = applyOCRCorrections(text);
  
  // Preserve structure
  const structured = preserveDocumentStructure(formatted);
  
  // Extract structured data
  const structuredData = extractStructuredData(formatted, documentType);
  
  return {
    raw: formatted,
    structured,
    structuredData,
    confidence: calculateOCRConfidence(text, formatted),
  };
}

/**
 * Calculate OCR confidence score
 */
function calculateOCRConfidence(original, corrected) {
  // Compare lengths (good OCR preserves length)
  const lengthRatio = Math.min(original.length, corrected.length) / 
                      Math.max(original.length, corrected.length);
  
  // Check for common OCR artifacts
  const artifacts = (original.match(/[|I1]{2,}/g) || []).length;
  const artifactReduction = (original.match(/[|I1]{2,}/g) || []).length - 
                            (corrected.match(/[|I1]{2,}/g) || []).length;
  
  // Base confidence
  let confidence = lengthRatio * 0.7;
  
  // Bonus for artifact correction
  if (artifactReduction > 0) {
    confidence += Math.min(artifactReduction * 0.1, 0.2);
  }
  
  return Math.min(confidence, 1);
}

/**
 * AI-enhanced OCR - main function
 */
export function enhanceOCR(ocrText, options = {}) {
  const { preserveFormatting = true, extractData = true } = options;
  
  const result = {
    id: generateAIId(),
    timestamp: new Date().toISOString(),
    original: ocrText,
    enhanced: null,
    documentType: null,
    structured: null,
    structuredData: null,
    confidence: 0,
    corrections: [],
    error: null,
  };
  
  try {
    // Detect document type
    const docType = detectDocumentType(ocrText);
    result.documentType = docType;
    
    // Apply enhancements
    let enhanced = applyOCRCorrections(ocrText);
    
    // Preserve formatting if requested
    if (preserveFormatting) {
      result.structured = preserveDocumentStructure(enhanced);
    }
    
    // Extract structured data if requested
    if (extractData) {
      result.structuredData = extractStructuredData(enhanced, docType.type);
    }
    
    result.enhanced = enhanced;
    result.confidence = calculateOCRConfidence(ocrText, enhanced);
    
    // Track corrections
    if (ocrText !== enhanced) {
      result.corrections.push('Applied OCR corrections');
    }
    
  } catch (error) {
    result.error = error.message;
    console.error('OCR enhancement error:', error);
  }
  
  return result;
}

/**
 * Batch enhance multiple OCR results
 */
export function batchEnhanceOCR(ocrTexts, options = {}) {
  return ocrTexts.map(text => enhanceOCR(text, options));
}

/**
 * Get document-specific field suggestions
 */
export function getFieldSuggestions(documentType) {
  const fieldSuggestions = {
    receipt: ['total', 'subtotal', 'tax', 'date', 'merchant', 'items'],
    invoice: ['invoice number', 'date', 'due date', 'total amount', 'vendor', 'customer'],
    id_document: ['full name', 'date of birth', 'issue date', 'expiry date', 'id number'],
    contract: ['party names', 'effective date', 'term', 'key terms', 'signatures'],
    report: ['title', 'date', 'author', 'findings', 'conclusions', 'recommendations'],
    letter: ['sender', 'recipient', 'date', 'subject', 'closing'],
    form: ['fields to fill', 'checkboxes', 'selections', 'signature'],
    resume: ['name', 'contact', 'summary', 'experience', 'education', 'skills'],
    general: ['date', 'name', 'amount', 'reference number'],
  };
  
  return fieldSuggestions[documentType] || fieldSuggestions.general;
}

export default {
  OCR_CORRECTIONS,
  DOCUMENT_PATTERNS,
  detectDocumentType,
  applyOCRCorrections,
  preserveDocumentStructure,
  extractStructuredData,
  formatOCROutput,
  enhanceOCR,
  batchEnhanceOCR,
  getFieldSuggestions,
};

