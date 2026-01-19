/**
 * 🤖 AI Document AI
 * 
 * Document analysis, summarization, and intelligent
 * content extraction.
 */

import { generateAIId } from './aiIndex';

/**
 * Document structure patterns
 */
export const DOCUMENT_STRUCTURES = {
  letter: {
    name: 'Letter',
    patterns: [
      { type: 'header', pattern: /^(?:Dear|Mr\.|Mrs\.|Ms\.|Dr\.)/ },
      { type: 'body', pattern: /^[A-Z][^.!?]+[.!?]\s*$/ },
      { type: 'closing', pattern: /^(?:Sincerely|Best regards|Yours truly|Regards),/ },
      { type: 'signature', pattern: /^[A-Z][a-z]+ [A-Z][a-z]+$/ },
    ],
    sections: ['opening', 'body', 'closing', 'signature'],
  },
  report: {
    name: 'Report',
    patterns: [
      { type: 'title', pattern: /^(?:#{1,6}\s+|title:|heading:).+$/i },
      { type: 'section', pattern: /^(?:\d+\.|[A-Z][a-z]+:)/ },
      { type: 'table', pattern: /^\|.+\|.*$/ },
      { type: 'figure', pattern: /^(?:Figure|Fig\.)\s*\d+:/i },
    ],
    sections: ['title', 'abstract', 'introduction', 'body', 'conclusion', 'references'],
  },
  invoice: {
    name: 'Invoice',
    patterns: [
      { type: 'header', pattern: /^(?:Invoice|Bill|Statement)/i },
      { type: 'line_item', pattern: /^\d+\s+.+\s+\$\d+\.?\d*$/ },
      { type: 'total', pattern: /^(?:Total|Amount Due|Balance Due):\s*\$[\d,]+\.?\d*$/i },
    ],
    sections: ['header', 'items', 'totals', 'payment_info'],
  },
  contract: {
    name: 'Contract',
    patterns: [
      { type: 'parties', pattern: /^(?:Party|Party A|Party B|Between).+$/i },
      { type: 'clause', pattern: /^(?:\d+\.?\s*)?[A-Z][a-z]+[:\s]/ },
      { type: 'signature', pattern: /^(?:Signed|Executed|Dated):/i },
    ],
    sections: ['parties', 'recitals', 'terms', 'conditions', 'signatures'],
  },
  email: {
    name: 'Email',
    patterns: [
      { type: 'subject', pattern: /^Subject:/i },
      { type: 'from', pattern: /^From:/i },
      { type: 'to', pattern: /^To:/i },
      { type: 'greeting', pattern: /^Hi|Hello|Dear /i },
    ],
    sections: ['header', 'greeting', 'body', 'closing', 'signature'],
  },
  article: {
    name: 'Article',
    patterns: [
      { type: 'headline', pattern: /^[A-Z][^.!?]+[.!?]?$/ },
      { type: 'byline', pattern: /^(?:By|Author):/i },
      { type: 'paragraph', pattern: /^[A-Z][^.!?]+[.!?]$/ },
    ],
    sections: ['headline', 'byline', 'body', 'conclusion'],
  },
};

/**
 * Extract document structure
 */
export function extractDocumentStructure(text) {
  const lines = text.split('\n').filter(l => l.trim());
  const structure = [];
  let currentSection = null;
  let currentContent = [];
  
  for (const line of lines) {
    let matchedSection = null;
    
    // Check against all structure patterns
    for (const [docType, docInfo] of Object.entries(DOCUMENT_STRUCTURES)) {
      for (const pattern of docInfo.patterns) {
        if (pattern.pattern.test(line)) {
          matchedSection = {
            type: pattern.type,
            documentType: docType,
          };
          break;
        }
      }
      if (matchedSection) break;
    }
    
    if (matchedSection) {
      // Save previous section
      if (currentSection) {
        structure.push({
          ...currentSection,
          content: currentContent.join('\n'),
          lineCount: currentContent.length,
        });
      }
      
      currentSection = matchedSection;
      currentContent = [line];
    } else {
      if (currentSection) {
        currentContent.push(line);
      }
    }
  }
  
  // Save last section
  if (currentSection) {
    structure.push({
      ...currentSection,
      content: currentContent.join('\n'),
      lineCount: currentContent.length,
    });
  }
  
  return {
    structure,
    documentType: structure[0]?.documentType || 'unknown',
  };
}

/**
 * Extract key phrases from document
 */
export function extractKeyPhrases(text, options = {}) {
  const { maxPhrases = 10, minWordLength = 3 } = options;
  
  // Common stop words to filter out
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
    'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need',
    'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them',
    'we', 'us', 'our', 'you', 'your', 'i', 'me', 'my', 'he', 'she',
    'what', 'which', 'who', 'whom', 'when', 'where', 'why', 'how',
    'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other',
    'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
    'than', 'too', 'very', 'just', 'also', 'now', 'here', 'there',
  ]);
  
  // Extract n-grams (2-3 words)
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length >= minWordLength && !stopWords.has(w));
  
  const phraseCounts = {};
  
  // Extract 2-word phrases
  for (let i = 0; i < words.length - 1; i++) {
    const phrase = words[i] + ' ' + words[i + 1];
    phraseCounts[phrase] = (phraseCounts[phrase] || 0) + 1;
  }
  
  // Extract 3-word phrases
  for (let i = 0; i < words.length - 2; i++) {
    const phrase = words[i] + ' ' + words[i + 1] + ' ' + words[i + 2];
    phraseCounts[phrase] = (phraseCounts[phrase] || 0) + 1;
  }
  
  // Sort by frequency and return top phrases
  const phrases = Object.entries(phraseCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxPhrases)
    .map(([phrase, count]) => ({
      phrase,
      count,
      importance: count / words.length,
    }));
  
  return phrases;
}

/**
 * Generate document summary
 */
export function generateSummary(text, options = {}) {
  const { maxLength = 200, sentences = 3 } = options;
  
  // Split into sentences
  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 20);
  
  // Score sentences by position and key phrase presence
  const keyPhrases = extractKeyPhrases(text, { maxPhrases: 5 });
  const importantWords = new Set(keyPhrases.map(p => p.phrase.split(' ')[0]));
  
  const scoredSentences = sentences.map((sentence, index) => {
    let score = 0;
    
    // Position score (first sentences are more important)
    if (index < 3) score += (3 - index) * 2;
    
    // Length score (prefer medium-length sentences)
    const wordCount = sentence.split(' ').length;
    if (wordCount >= 10 && wordCount <= 30) score += 2;
    
    // Key phrase presence
    const words = sentence.toLowerCase().split(/\s+/);
    for (const word of words) {
      if (importantWords.has(word)) score += 0.5;
    }
    
    return { sentence, score, index };
  });
  
  // Sort by score and take top sentences
  const topSentences = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, sentences)
    .sort((a, b) => a.index - b.index)
    .map(s => s.sentence);
  
  let summary = topSentences.join('. ');
  
  // Truncate if too long
  if (summary.length > maxLength) {
    summary = summary.substring(0, maxLength).replace(/\s+\S*$/, '') + '...';
  }
  
  return {
    summary,
    originalLength: text.length,
    summaryLength: summary.length,
    reduction: Math.round((1 - summary.length / text.length) * 100),
    sentencesUsed: topSentences.length,
  };
}

/**
 * Detect document type
 */
export function detectDocumentType(text) {
  const structure = extractDocumentStructure(text);
  const type = structure.documentType;
  
  // Calculate confidence based on pattern matches
  const matchCount = structure.structure.length;
  const confidence = Math.min(0.5 + (matchCount * 0.1), 0.95);
  
  return {
    type,
    confidence,
    structure: structure.structure,
  };
}

/**
 * Extract action items from document
 */
export function extractActionItems(text) {
  const actionPatterns = [
    /(?:action required|todo|to-do|task|deadline|due date)[:\s]+(.+)/gi,
    /(?:please|should|must|needs? to|has to)[\s]+(.+)/gi,
    /(?:next steps|action items|follow[- ]up)[:\s]+(.+)/gi,
  ];
  
  const actions = [];
  
  for (const pattern of actionPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      actions.push({
        text: match[1].trim(),
        source: match[0].substring(0, 50),
      });
    }
  }
  
  // Remove duplicates
  const uniqueActions = [...new Map(actions.map(a => [a.text.toLowerCase(), a])).values()];
  
  return uniqueActions.slice(0, 10);
}

/**
 * Extract important dates from document
 */
export function extractDates(text) {
  const datePatterns = [
    /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\b/g,
    /\b((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* \d{1,2},? \d{4})\b/gi,
    /\b(\d{1,2} (?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* \d{4})\b/gi,
    /\b(?:due|deadline|by|until|on)[\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/gi,
  ];
  
  const dates = [];
  
  for (const pattern of datePatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      dates.push({
        date: match[1],
        context: text.substring(Math.max(0, match.index - 20), match.index + match[0].length + 20),
      });
    }
  }
  
  return [...new Map(dates.map(d => [d.date.toLowerCase(), d])).values()];
}

/**
 * Analyze document - main function
 */
export function analyzeDocument(text, options = {}) {
  const result = {
    id: generateAIId(),
    timestamp: new Date().toISOString(),
    textLength: text.length,
    wordCount: text.split(/\s+/).length,
    analysis: null,
    summary: null,
    keyPhrases: [],
    actionItems: [],
    dates: [],
    error: null,
  };
  
  try {
    // Detect document type
    result.analysis = detectDocumentType(text);
    
    // Generate summary
    result.summary = generateSummary(text, options);
    
    // Extract key phrases
    result.keyPhrases = extractKeyPhrases(text, options);
    
    // Extract action items
    result.actionItems = extractActionItems(text);
    
    // Extract dates
    result.dates = extractDates(text);
    
  } catch (error) {
    result.error = error.message;
    console.error('Document analysis error:', error);
  }
  
  return result;
}

/**
 * Batch analyze multiple documents
 */
export function batchAnalyzeDocuments(documents, options = {}) {
  return documents.map(doc => analyzeDocument(doc.text || doc, options));
}

export default {
  DOCUMENT_STRUCTURES,
  extractDocumentStructure,
  extractKeyPhrases,
  generateSummary,
  detectDocumentType,
  extractActionItems,
  extractDates,
  analyzeDocument,
  batchAnalyzeDocuments,
};

